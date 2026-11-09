import Table from "../models/TableClass";
import mixin from "../mixin";
import moment from "moment"

import { ToastProgrammatic as Toast } from "buefy";
import i18n from '@/i18n.js'
import Enums from '@/models/Enums'
export default {
  namespaced: true,
  /* -------------------------------- state --------------------------------- */
  state: {
    manualInvoiceTables: [],

    isManualInvoiceModalActive: false,
  },

  /* -------------------------------- getters --------------------------------- */
  getters: {
    getManualInvoicesV2(state) {
      let payedManualInvoices = []
      let notPayedManualInvoices = []
  
      state.manualInvoiceTables.forEach(manualInvoiceTable => {
        if (manualInvoiceTable.customers != null) {
          if (manualInvoiceTable.customers[0] != null) {
            if (manualInvoiceTable.customers[0].orders != null) {

              // manualInvoice products string
              let products_str = ''
              let products_list = []
              manualInvoiceTable.customers[0].orders.forEach(order => {
                products_str += order.product.name + ' (' + order.count + ') - '
                products_list.push(order.product.name + ' (' + order.count + ')')
              });

              manualInvoiceTable.products_str = products_str.slice(0, -3);
              manualInvoiceTable.products_list = products_list;

              manualInvoiceTable.localReadyTime = ''

              if (manualInvoiceTable.paymentInfo.net_amount == 0) {
                payedManualInvoices.push(manualInvoiceTable)
              } else {
                notPayedManualInvoices.push(manualInvoiceTable)
              }

            }
          }
        }
      });

      return {
        "payedManualInvoices": payedManualInvoices,
        "notPayedManualInvoices": notPayedManualInvoices
      }
    },
    getManualInvoices(state) {
      let notAcceptedManualInvoices = []
      let passedManualInvoices = []
      let todayManualInvoices = []
      let tomarrowManualInvoices = []
      let laterManualInvoices = []

      state.manualInvoiceTables.forEach(manualInvoiceTable => {
        if (manualInvoiceTable.customers != null) {
          if (manualInvoiceTable.customers[0] != null) {
            if (manualInvoiceTable.customers[0].orders != null) {

              // manualInvoice products string
              let products_str = ''
              manualInvoiceTable.customers[0].orders.forEach(order => {
                products_str += order.product.name + ' (' + order.count + ') - '
              });

              manualInvoiceTable.products_str = products_str.slice(0, -3)

              manualInvoiceTable.localReadyTime = ''

              if (manualInvoiceTable.customers[0].orders[0].accepted) {

                // check the manualInvoice pickup time 
                let readyTime = (manualInvoiceTable.customers[0].orders[0].readyTime) ?
                  manualInvoiceTable.customers[0].orders[0].readyTime :
                  manualInvoiceTable.customers[0].orders[0].time;
                let manualInvoiceTime = moment(readyTime)
                let today = moment()
                let extraDays = 0

                if (manualInvoiceTime.year() > today.year()) {
                  extraDays = 365 * (manualInvoiceTime.year() - today.year())
                }

                if (today.dayOfYear() > (manualInvoiceTime.dayOfYear() + extraDays)) {
                  passedManualInvoices.push(manualInvoiceTable)
                } else if (today.dayOfYear() == (manualInvoiceTime.dayOfYear() + extraDays)) {
                  todayManualInvoices.push(manualInvoiceTable)
                } else if (today.dayOfYear() == (manualInvoiceTime.dayOfYear() + extraDays - 1)) {
                  tomarrowManualInvoices.push(manualInvoiceTable)
                } else {
                  laterManualInvoices.push(manualInvoiceTable)
                }

              } else {
                notAcceptedManualInvoices.push(manualInvoiceTable)
              }

            }
          }
        }
      });

      return {
        "notAcceptedManualInvoices": notAcceptedManualInvoices,
        "passedManualInvoices": passedManualInvoices,
        "todayManualInvoices": todayManualInvoices,
        "tomarrowManualInvoices": tomarrowManualInvoices,
        "laterManualInvoices": laterManualInvoices
      }
    }
  },

  /* -------------------------------- mutations --------------------------------- */
  mutations: {
    setManualInvoiceData(state, payload) {

      // update manualInvoices
      payload.forEach(manualInvoice => {
        let relatedManualInvoiceTable = state.manualInvoiceTables.find(manualInvoiceTable => manualInvoiceTable.id == manualInvoice.tables[0].pk)
        manualInvoice.is_manualInvoice = true
        if (relatedManualInvoiceTable) {
          relatedManualInvoiceTable.setAggregateData(manualInvoice)
          setTimeout(() => {
            relatedManualInvoiceTable.setDetailDate(manualInvoice)
          }, 500);
        } else {
          let manualInvoiceTable = new Table(manualInvoice)
          manualInvoiceTable.id = manualInvoice.tables[0].pk
          state.manualInvoiceTables.push(manualInvoiceTable)
          manualInvoiceTable.setAggregateData(manualInvoice)
          manualInvoiceTable.setDetailDate(manualInvoice)
        }

      });

      // filter closed manualInvoices
      state.manualInvoiceTables.forEach(manualInvoiceTable => {
        let relatedManualInvoice = payload.find(manualInvoice => manualInvoice.tables[0].pk == manualInvoiceTable.id)

        if (!relatedManualInvoice) {
          state.manualInvoiceTables = state.manualInvoiceTables.filter(prodrtbl => manualInvoiceTable.id != prodrtbl.id)
        }
      });
    }
  },

  /* -------------------------------- actions --------------------------------- */
  actions: {
    setManualInvoiceData(context, payload) {
      context.commit('setManualInvoiceData', payload)
    },
    acceptManualInvoice(context, payload) {
      mixin.methods
        .request({
          method: "PUT",
          url: "api/v1/pbr/" + payload + "/accept/",
          data: {
            "pk": payload,
            "is_accepted": true
          }
        })
        .then(res => {

        })
        .catch(err => {
          Toast.open({
            queue: false,
            message: "لطفا مجددا درخواست را ارسال کنید",
            type: "is-danger"
          });
        });
    },
    changeManualInvoiceStatus(context, {pbrs, manualInvoice}) {
      mixin.methods
        .request({
          method: "POST",
          url: "api/v1/cafe/" + context.rootState.accountModule.activeCafe.id + "/pbr/status/",
          data: pbrs
        })
        .then(res => {
          let accepted = false
          let ready = false
          let delivered = false
          let sentToKitchen = false
          let status = parseInt(pbrs.pbrs[0].status)

          if (status > 0) {
            accepted = true;
          } if (status > 1) {
            sentToKitchen = true
          } if (status > 2) {
            ready = true
          } if (status > 3) {
            delivered = true
          }

          manualInvoice.customers[0].orders.forEach((order => {
            order.accepted = accepted
            order.sentToKitchen = sentToKitchen
            order.isReady = ready
            order.isDelivered = delivered
          }))
        })
        .catch(err => {
          Toast.open({
            queue: false,
            message: "لطفا مجددا درخواست را ارسال کنید",
            type: "is-danger"
          });
        });
    },
    submitManualInvoice(context, payload) {
      mixin.methods
        .request({
          method: "POST",
          url: "api/v1/cafe/" + context.rootState.accountModule.activeCafe.id + "/table/add/",
          data: {
            "number": "فاکتور فروش",
            "table_type": Enums.TableTokenTypes.PAYMENT_ONLY
          }
        })
        .then(res => {
          payload.table = new Table(res.data)
          context.dispatch('getManualInvoiceUserOrCreate', payload)
        })
        .catch(err => {
          Toast.open({
            queue: false,
            message: "لطفا مجددا درخواست را ارسال کنید",
            type: "is-danger"
          });
        });

    },
    getManualInvoiceUserOrCreate(context, payload) {
      mixin.methods
        .request({
          method: "POST",
          url: "api/v1/cafe/" + context.rootState.accountModule.activeCafe.id + "/user-profile/get-or-create/",
          data: {
            "phone_number": payload.manualInvoiceForm.phone_number,
          }
        })
        .then(res => {
          payload.user_profile = res.data
          payload.manualInvoices.forEach(manualInvoice => {
            manualInvoice.user_profile = res.data.pk
            manualInvoice.pickup_time = payload.manualInvoiceForm.pickup_time
          });
          context.dispatch("setManualInvoiceProducts", payload)
        })
        .catch(err => {
          Toast.open({
            queue: false,
            message: "لطفا مجددا درخواست را ارسال کنید",
            type: "is-danger"
          });
        });
    },
    setManualInvoiceProducts(context, payload) {
      let table_products = { table_products: payload.manualInvoices };
      mixin.methods
        .request({
          method: "POST",
          url: "api/v1/table/" + payload.table.id + "/products/bulk/post/staff/",
          data: table_products
        })
        .then(res => {
          context.state.isManualInvoiceModalActive = false
          Toast.open({
            queue: false,
            duration: 3000,
            message: i18n.t('manualInvoices.pickupOrderSubmitedSuccessfully'),
            type: "is-success"
          });
        })
        .catch(err => {
          Toast.open({
            queue: false,
            duration: 3000,
            message: "لطفا مجددا درخواست را ارسال کنید",
            type: "is-danger"
          });
        });
    },
    setReadyTime(context, payload) {
      return mixin.methods
        .request({
          method: "PUT",
          url: "api/v1/join/" + payload.joinId + "/set/ready-time/",
          data: { duration: payload.localReadyTime + ":00" }
        })
        .then(res => {
          
        })
        .catch(err => {
          Toast.open({
            queue: false,
            duration: 3000,
            message: "لطفا مجددا درخواست را ارسال کنید",
            type: "is-danger"
          });
        });
    }
  }
};