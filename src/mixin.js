import store from "./store";
import axios from "axios";
import configs from "./javascripts/config";
import Enums from './models/Enums';
import Vue from 'vue'

import router from "@/router";
import createRequester from "@/javascripts/request";
import { ToastProgrammatic as Toast } from "buefy";

const apiRequest = createRequester({
  axios,
  baseURL: () => configs.baseURL,
  token: () => window.storage.getItem("token"),
  loading: value => { store.state.isLoading = value; },
  failed: () => { store.state.loadWholePage = false; },
  unauthorized: () => {
    window.storage.removeItem("token");
    store.state.accountModule.user.token = null;
    if (router.currentRoute.path !== "/login") router.replace("/login").catch(() => {});
  },
  unavailable: () => { Toast.open({ queue: false, message: "خطا در ارتباط با سرور. لطفا دوباره تلاش کنید", type: "is-danger" }); }
});

const mixin = {
  data(){
    return {
      PrinterTemplateTypesEnum: Enums.PrinterTemplateTypesEnum,
      PrinterTypesEnum: Enums.PrinterTypesEnum,
      PrinterPolicies: Enums.PrinterPolicies,
      PrinterWidthEnum: Enums.PrinterWidthEnum
    }
  },
  computed: {
    isAuthenticated(){
      return store.getters['accountModule/isAuthenticated'];
    },
    isMobile(){
      return store.getters['isMobile'];
    },
    closeTableSelected: {
      // getter
      get: function () {
          return store.getters['tableModule/closeTableSelected'];
      },
      // setter
      set: function (newValue) {
          store.commit('tableModule/setCloseTableSelected', newValue);
      }
    },
    token() {
      return store.state.token;
    },
    cafeId() {
      return store.state.cafe.id;
    },
    errors() {
      return store.state.errors;
    },
    isLoading() {
      return store.state.isLoading;
    }
  },
  methods: {
    convertPersian(str) {
      let persianNumbers = [
          /۰/g,
          /۱/g,
          /۲/g,
          /۳/g,
          /۴/g,
          /۵/g,
          /۶/g,
          /۷/g,
          /۸/g,
          /۹/g,
        ],
        arabicNumbers = [
          /٠/g,
          /١/g,
          /٢/g,
          /٣/g,
          /٤/g,
          /٥/g,
          /٦/g,
          /٧/g,
          /٨/g,
          /٩/g,
        ];
      if (typeof str === "string") {
        for (let i = 0; i < 10; i++) {
          str = str.replace(persianNumbers[i], i).replace(arabicNumbers[i], i);
        }
      }
      return str;
    },
    convertToServerFormat(str) {
      let res = str.split("/");
      if (res[1].length == 1) {
        res[1] = "0" + res[1];
      }
      if (res[2].length == 1) {
        res[2] = "0" + res[2];
      }
      return res.join("/");
    },
    printData({ templateType, printerType, data }){
      let cloudPrinters = store.getters["printerModule/cloudPrinters"];
      cloudPrinters
        .filter(printer => printer.the_types.find(t => t.type == printerType) && printer.is_on)
        .forEach(printer => {
              this.generateAndPrint({
                type: templateType,
                width: printer.width,
                data,
                printer
              })
          });
    },
    printOrders({ templateType, ordersToPrint, table, address, deliveryFee }){
      let cloudPrinters = store.getters["printerModule/cloudPrinters"];
      if (cloudPrinters) {

        let cafepayFee = store.state.accountModule.activeCafe.feePayer ? 0 : store.state.accountModule.activeCafe.cafepayFee;

        cloudPrinters
          .filter(printer => printer.the_types.find(t => t.type == templateType) && printer.is_on)
          .forEach(printer => {
            if (printer.policy == Enums.PrinterPolicies.ONE_PAGE) {

              let ordersToPrintFiltered = (printer.groups.length == 0) ?
                Object.assign([], ordersToPrint):
                ordersToPrint.filter(pbr => pbr.product.group && printer.groups.includes(pbr.product.group.pk))

              if(ordersToPrintFiltered.length > 0) {
                this.generateAndPrint({
                  type: templateType,
                  width: printer.width,
                  data: ordersToPrintFiltered,
                  table,
                  group: templateType == Enums.PrinterTemplateTypesEnum.CUSTOMER ?
                    "فاکتور فروش" :
                    "آشپزخانه",
                  cafepayFee,
                  address,
                  deliveryFee,
                  printer
                })
              }
            } else {
              store.state.groupModule.groups.forEach(group => {
                if ((printer.groups.length == 0) || printer.groups.includes(group.pk)) {
                  let groupReadyToSendOrders = [];
                  ordersToPrint.forEach(readyToSendOrder => {
                    if (readyToSendOrder.product.group == null) {
                      if (group.pk == null) {
                        groupReadyToSendOrders.push(readyToSendOrder);
                      }
                    } else if (readyToSendOrder.product.group.pk == group.pk) {
                      groupReadyToSendOrders.push(readyToSendOrder);
                    }
                  });
                  if (groupReadyToSendOrders.length > 0) {
                    this.generateAndPrint({
                      type: templateType,
                      width: printer.width,
                      data: groupReadyToSendOrders,
                      table,
                      group: group.pk ? group.title : (
                        templateType == Enums.PrinterTemplateTypesEnum.CUSTOMER ?
                        "فاکتور فروش" :
                        "آشپزخانه"
                      ),
                      cafepayFee,
                      address,
                      deliveryFee,
                      printer
                    })
                  }
                }
              });
            }
          });
      }
    },

    /** printTemplateData is like {
        type: this.PrinterTemplateTypesEnum.KITCHEN,
        width: printer.width,
        data: readyToSendOrders,
        table,
        group: 'سفارشات',
        cafepayFee // if CUSTOMER
        printer
    } **/
    generateAndPrint(printTemplateData) {
      function uuidv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
      }
      printTemplateData = {
        uuid: uuidv4(),
        ...printTemplateData
      }

      store.commit('printerModule/addPrintTemplateData', printTemplateData)
      Vue.nextTick(() => {
        let data = this.getPrintTemplateHeader(printTemplateData);
        data += this.getPrintTemplateBody(printTemplateData);
  
        this.sendToPrinter({
          isCloud: false,
          printer: printTemplateData.printer,
          raw_data: data,
          description: '',
        });
        store.commit('printerModule/removePrintTemplateData', printTemplateData)
      })
    },
    getPrintTemplateBody(printTemplateData){
      let string = printTemplateData.width == Enums.PrinterWidthEnum.SIX_CM ? 
        '<body style="margin: 0; width: 5cm;">' : (printTemplateData.width == Enums.PrinterWidthEnum.SEVEN_CM ?
        `<body style="margin: 0; width: 6cm;">` :
        '<body style="margin: 0; width: 7cm;">')

      string += document.getElementById('printer-template-' + printTemplateData.uuid).innerHTML
      
      string += `
      </body>
      </html>`
      return string
    },
    getPrintTemplateHeader(printTemplateData){
      return `<!DOCTYPE html>
      <html>
          <head>
              <title>print</title>
              <meta charset="UTF-8">
              <style>
                  table {
                    width: 100%
                  }
                  td, th {
                      border: 1px solid black;
                      padding: 2px;
                      text-align: center;
                  }
                  td:first-child ,th:first-child {
                      border-color: black;
                      border-style: solid;
                      border-width: 1px 0px 1px 0px;
                      text-align: right;
                  }
                  td:last-child ,th:last-child {
                      border-color: black;
                      border-style: solid;
                      border-width: 1px 0px 1px 0px;
                  }
                  @page {
                      margin: 0;
                      padding: 0;
                  }
                  body {
                      font-family: Tahoma;
                      font-size: 14px;
                      border: 1.5px solid black;
                      margin: 0;
                      padding: 0;
                  }
              </style>
          </head>`
    },
    sendToPrinter(jobPrint) {
      if(jobPrint.isCloud) {
        this.request({
          url: "api/v1/printer/" + jobPrint.printer.pk + "/job/create/",
          method: "POST",
          data: {
            raw_data: jobPrint.raw_data,
            description: jobPrint.description
          }
        });
      } else {
        store.dispatch("printerModule/handlePrintJobs", [jobPrint]);
      }
    },
    baseRequest(config) {
      return apiRequest(config, false);
    },

    request(config) {
      return apiRequest(config);
    },
    
    checkAuth() {}

    // deleteDropFile(index) {
    //   this.dropFiles.splice(index, 1);
    // }
  }
};

export default mixin;
