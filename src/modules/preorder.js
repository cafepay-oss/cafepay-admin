import Table from "../models/TableClass";
import mixin from "../mixin";
import moment from "moment";

import { ToastProgrammatic as Toast } from "buefy";
import i18n from "@/i18n.js";

export default {
  namespaced: true,
  /* -------------------------------- state --------------------------------- */
  state: {
    preorderTables: [],

    isPreorderModalActive: false,
  },

  /* -------------------------------- getters --------------------------------- */
  getters: {
    getPreordersV2(state) {
      let receiptPreorders = [];
      let payedPreorders = [];
      let notPayedPreorders = [];

      state.preorderTables.forEach((preorderTable) => {
        if (preorderTable.customers != null) {
          if (preorderTable.customers[0] != null) {
            if (preorderTable.customers[0].orders != null) {
              // preorder products string
              let products_str = "";
              let products_list = [];
              preorderTable.customers[0].orders.forEach((order) => {
                products_str +=
                  order.product.name + " (" + order.count + ") - ";
                products_list.push(
                  order.product.name + " (" + order.count + ")"
                );
              });

              preorderTable.products_str = products_str.slice(0, -3);
              preorderTable.products_list = products_list;

              preorderTable.localReadyTime = "";

              if (preorderTable.cardTransfer && preorderTable.cardTransfer.status === 'submitted') {
                receiptPreorders.push(preorderTable);
              } else if (preorderTable.paymentInfo.net_amount == 0) {
                payedPreorders.push(preorderTable);
              } else {
                notPayedPreorders.push(preorderTable);
              }
            }
          }
        }
      });

      return {
        receiptPreorders,
        payedPreorders: payedPreorders,
        notPayedPreorders: notPayedPreorders,
      };
    },
    getPreorders(state) {
      let notAcceptedPreorders = [];
      let passedPreorders = [];
      let todayPreorders = [];
      let tomarrowPreorders = [];
      let laterPreorders = [];

      state.preorderTables.forEach((preorderTable) => {
        if (preorderTable.customers != null) {
          if (preorderTable.customers[0] != null) {
            if (preorderTable.customers[0].orders != null) {
              // preorder products string
              let products_str = "";
              preorderTable.customers[0].orders.forEach((order) => {
                products_str +=
                  order.product.name + " (" + order.count + ") - ";
              });

              preorderTable.products_str = products_str.slice(0, -3);

              preorderTable.localReadyTime = "";

              if (preorderTable.customers[0].orders[0].accepted) {
                // check the preorder pickup time
                let readyTime = preorderTable.customers[0].orders[0].readyTime
                  ? preorderTable.customers[0].orders[0].readyTime
                  : preorderTable.customers[0].orders[0].time;
                let preorderTime = moment(readyTime);
                let today = moment();
                let extraDays = 0;

                if (preorderTime.year() > today.year()) {
                  extraDays = 365 * (preorderTime.year() - today.year());
                }

                if (today.dayOfYear() > preorderTime.dayOfYear() + extraDays) {
                  passedPreorders.push(preorderTable);
                } else if (
                  today.dayOfYear() ==
                  preorderTime.dayOfYear() + extraDays
                ) {
                  todayPreorders.push(preorderTable);
                } else if (
                  today.dayOfYear() ==
                  preorderTime.dayOfYear() + extraDays - 1
                ) {
                  tomarrowPreorders.push(preorderTable);
                } else {
                  laterPreorders.push(preorderTable);
                }
              } else {
                notAcceptedPreorders.push(preorderTable);
              }
            }
          }
        }
      });

      return {
        notAcceptedPreorders: notAcceptedPreorders,
        passedPreorders: passedPreorders,
        todayPreorders: todayPreorders,
        tomarrowPreorders: tomarrowPreorders,
        laterPreorders: laterPreorders,
      };
    },
  },

  /* -------------------------------- mutations --------------------------------- */
  mutations: {
    setPreorderData(state, payload) {
      // update preorders
      payload.forEach((preorder) => {
        let relatedPreorderTable = state.preorderTables.find(
          (preorderTable) => preorderTable.id == preorder.tables[0].pk
        );
        preorder.is_preorder = true;
        if (relatedPreorderTable) {
          relatedPreorderTable.setDetailDate(preorder);
        } else {
          let preorderTable = new Table(preorder);
          preorderTable.id = preorder.tables[0].pk;
          preorderTable.joinId = preorder.pk;
          state.preorderTables.push(preorderTable);
          preorderTable.setDetailDate(preorder);
        }
      });

      // filter closed preorders
      state.preorderTables.forEach((preorderTable) => {
        let relatedPreorder = payload.find(
          (preorder) => preorder.tables[0].pk == preorderTable.id
        );

        if (!relatedPreorder) {
          state.preorderTables = state.preorderTables.filter(
            (prodrtbl) => preorderTable.id != prodrtbl.id
          );
        }
      });
    },
  },

  /* -------------------------------- actions --------------------------------- */
  actions: {
    setPreorderData(context, payload) {
      context.commit("setPreorderData", payload);
    },
    acceptPreorder(context, payload) {
      mixin.methods
        .request({
          method: "PUT",
          url: "api/v1/pbr/" + payload + "/accept/",
          data: {
            pk: payload,
            is_accepted: true,
          },
        })
        .then((res) => {})
        .catch((err) => {
          Toast.open({
            queue: false,
            message: "لطفا مجددا درخواست را ارسال کنید",
            type: "is-danger",
          });
        });
    },
    changePreorderStatus(context, { pbrs, preorder }) {
      mixin.methods
        .request({
          method: "POST",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/pbr/status/",
          data: pbrs,
        })
        .then((res) => {
          let accepted = false;
          let ready = false;
          let delivered = false;
          let sentToKitchen = false;
          let status = parseInt(pbrs.pbrs[0].status);

          if (status > 0) {
            accepted = true;
          }
          if (status > 1) {
            sentToKitchen = true;
          }
          if (status > 2) {
            ready = true;
          }
          if (status > 3) {
            delivered = true;
          }

          preorder.customers[0].orders.forEach((order) => {
            order.accepted = accepted;
            order.sentToKitchen = sentToKitchen;
            order.isReady = ready;
            order.isDelivered = delivered;
          });
        })
        .catch((err) => {
          Toast.open({
            queue: false,
            message: "لطفا مجددا درخواست را ارسال کنید",
            type: "is-danger",
          });
        });
    },
    submitPreorder(context, payload) {
      mixin.methods
        .request({
          method: "POST",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/table/add/",
          data: {
            number: "پیش سفارش",
            is_preorder: true,
          },
        })
        .then((res) => {
          payload.table = new Table(res.data);
          context.dispatch("getPreorderUserOrCreate", payload);
        })
        .catch((err) => {
          Toast.open({
            queue: false,
            message: "لطفا مجددا درخواست را ارسال کنید",
            type: "is-danger",
          });
        });
    },
    getPreorderUserOrCreate(context, payload) {
      mixin.methods
        .request({
          method: "POST",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/user-profile/get-or-create/",
          data: {
            phone_number: payload.preorderForm.phone_number,
          },
        })
        .then((res) => {
          payload.user_profile = res.data;
          payload.preorders.forEach((preorder) => {
            preorder.user_profile = res.data.pk;
            preorder.pickup_time = payload.preorderForm.pickup_time;
          });
          context.dispatch("setPreorderProducts", payload);
        })
        .catch((err) => {
          Toast.open({
            queue: false,
            message: "لطفا مجددا درخواست را ارسال کنید",
            type: "is-danger",
          });
        });
    },
    setPreorderProducts(context, payload) {
      let table_products = { table_products: payload.preorders };
      mixin.methods
        .request({
          method: "POST",
          url:
            "api/v1/table/" + payload.table.id + "/products/bulk/post/staff/",
          data: table_products,
        })
        .then((res) => {
          context.state.isPreorderModalActive = false;
          Toast.open({
            queue: false,
            duration: 3000,
            message: i18n.t("preorders.pickupOrderSubmitedSuccessfully"),
            type: "is-success",
          });
        })
        .catch((err) => {
          Toast.open({
            queue: false,
            duration: 3000,
            message: "لطفا مجددا درخواست را ارسال کنید",
            type: "is-danger",
          });
        });
    },
    setReadyTime(context, payload) {
      return mixin.methods
        .request({
          method: "PUT",
          url: "api/v1/join/" + payload.joinId + "/set/ready-time/",
          data: { duration: payload.localReadyTime + ":00" },
        })
        .then((res) => {})
        .catch((err) => {
          Toast.open({
            queue: false,
            duration: 3000,
            message: "لطفا مجددا درخواست را ارسال کنید",
            type: "is-danger",
          });
        });
    },
  },
};
