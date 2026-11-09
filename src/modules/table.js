/** VUEX module for table management in cafe management app

 * at this document properties with 'r' prefix are raw data
 * and properties with 'p' prefix are processed data           **/

import mixin from "../mixin";
import Table from "../models/TableClass";
import Order from "../models/OrderClass";
import { ToastProgrammatic as Toast } from "buefy";
import Customer from "../models/CustomerClass";

export default {
  namespaced: true,
  // -----------------------------------------------------------------
  state: {
    tables: null,
    tablesChanged: false, // ture: new data from socket, false: new data processed
    selectedTable: null,

    cafeTableTokens: [],

    isTableModalActive: false,
    isLoading: false,

    isTableTokenModalActive: false,
    isPayInvoiceModalActive: false,
    isTableCloseInvoiceModalActive: false,
    invoiceClosing: false,
    isCloseInvoiceModalActive: false,
    activeProductChangeModal: false,
    isDiscountModalActive: false,
    isDiscountRefundModalActive: false,

    localLoading: false,

    isRefundModalActive: false,
    refundTable: null,

    tableJoinDetail: null,

    tableLoading: false,

    tableToken: null,

    closeTableSelected: null,
  },

  // -----------------------------------------------------------------
  getters: {
    closeTableSelected: (state) => state.closeTableSelected,
    activeInvoices(state) {
      if (!state.tables) {
        return [];
      }
      let activeInvoices = [];

      state.tables.forEach((table) => {
        if (table.tableType == "fill") {
          activeInvoices.push({
            table: table,
            tableProducts: table.getTableProducts(),
          });
        }
      });

      let tables = [];

      activeInvoices.forEach((table) => {
        if (!table.tableProducts.length) {
          tables.push({
            joinId: table.table.joinId,
            table: table.table,
            state: 0, // ready to send
            products: [],
          });
        } else {
          let tableProductSent = [];
          let tableProductReadyToSend = [];

          table.tableProducts.forEach((product) => {
            if (product.sentToKitchen) {
              tableProductSent.push(product);
            } else {
              tableProductReadyToSend.push(product);
            }
          });

          if (tableProductSent.length) {
            tables.push({
              joinId: table.table.joinId,
              table: table.table,
              state: 1, // sent
              products: tableProductSent,
            });
          }
          if (tableProductReadyToSend.length) {
            tables.push({
              joinId: table.table.joinId,
              table: table.table,
              state: 0, // ready to send
              products: tableProductReadyToSend,
            });
          }
        }
      });

      tables.forEach((table) => {
        let paymentInfo = {
          name: "",
          netAmount: 0,
          number: 0,
          payed: 0,
          pbrId: [],
          price: 0,
        };
        table.products.forEach((product) => {
          paymentInfo.name += product.name + " (" + product.number + ") - ";
          paymentInfo.netAmount += product.netAmount;
          paymentInfo.number += product.number;
          paymentInfo.payed += product.payed;
          paymentInfo.pbrId.push(product.pbrId);
          paymentInfo.price += product.price;
        });
        (paymentInfo.name = paymentInfo.name.slice(
          0,
          paymentInfo.name.length - 3
        )),
          (table.paymentInfo = paymentInfo);
      });
      return tables;
    },
  },

  // -----------------------------------------------------------------
  mutations: {
    setCloseTableSelected(state, newTable) {
      state.closeTableSelected = newTable;
    },
    setTables(state, tablesData) {
      let tables = [];
      tablesData.forEach((table) => {
        if (!(table.is_preorder || table.is_manualInvoice)) {
          tables.push(new Table(table));
        }
      });

      tables = tables.sort((a, b) => a.id - b.id);
      state.tables = tables;
    },
    setEachTableToken(state, payload) {
      state.tables.forEach((table) => {
        table.token = null;
      });
      payload.forEach((tableToken) => {
        if (tableToken.status == "0") {
          let relatedTable = state.tables.find(
            (table) => table.id == tableToken.table.pk
          );
          if (relatedTable) {
            relatedTable.token = tableToken.token;
            relatedTable.isMenuOnly = tableToken.menu_only;
          }
        }
      });
    },
    setCafeTableTokens(state, payload) {
      state.cafeTableTokens = payload;
    },
    /* ---------------- Tables Socket Date Mutations ---------------- */
    setTableAggregateData(state, payload) {
      let tableId = payload.source.match(/(\d)+/g)[0];

      let table = (state.tables || []).find((table) => table.id == tableId);

      if (!table) return;
      if (!payload.data.pk) {
        table.setAggregateData(payload.data, true);
      } else {
        table.setAggregateData(payload.data);
      }
    },
    setTableDetailData(state, payload) {
      let tableId = payload.source.match(/(\d)+/g)[0];

      let table = (state.tables || []).find((table) => table.id == tableId);

      if (!table) return;
      table.setDetailDate(payload.data);
      state.tableLoading = false;
    },
    watchTableDetailData(state, payload) {
      let table = (state.tables || []).find((table) => table.id == payload.id);
      if (!table) return;
      state.tableLoading = true;
      table.watchTableDetailData();
    },
    setTableJoinDetail(state, payload) {
      state.tableJoinDetail = payload;
    },
    setSelectedTable(state, payload) {
      state.selectedTable = payload;
    }
  },
  // -----------------------------------------------------------------
  actions: {
    mergeTable: (context, payload) => {
      let tableId = payload[0];
      let tablesMergeStatus = payload[1];

      tablesMergeStatus.forEach((table) => {
        if (table.merge != table["pre-merge-state"]) {
          if (table.merge == true) {
            mixin.methods
              .request({
                method: "post",
                url:
                  "api/v1/table/" +
                  tableId +
                  "/join/table/" +
                  table.table +
                  "/",
              })
              .then((res) => {})
              .catch((err) => {
                //console.log(err);
              });
          } else {
            mixin.methods
              .request({
                method: "post",
                url: "api/v1/table/" + table.table + "/separate/",
              })
              .then((res) => {})
              .catch((err) => {
                //console.log(err);
              });
          }
        }
      });
    },
    separateTable(context, tableId) {
      mixin.methods
        .request({
          method: "post",
          url: "api/v1/table/" + tableId + "/separate/",
        })
        .then((res) => {})
        .catch((err) => {
          //console.log(err);
        });
    },
    transferTable(context, payload) {
      let from = payload[0];
      let to = payload[1];

      mixin.methods
        .request({
          method: "post",
          url: "api/v1/table/" + from + "/transfer/table/" + to + "/",
        })
        .then((res) => {})
        .catch((err) => {
          //console.log(err);
        });
    },
    /* ---------------- Tables Socket Date Actions ---------------- */
    setTableAggregateData(context, payload) {
      context.commit("setTableAggregateData", payload);
    },
    setTableDetailData(context, payload) {
      context.commit("setTableDetailData", payload);
    },
    watchTableDetailData(context, payload) {
      context.commit("watchTableDetailData", payload);
    },
    /* ---------------- Tables CRUD ---------------- */
    /* get tables */
    getTables: (context) => {
      mixin.methods
        .request({
          method: "GET",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/tables/",
        })
        .then((res) => {
          context.commit("setTables", res.data);
        })
        .catch(() => {});
    },
    /* edit table */
    editTable: (context, payload) => {
      context.state.isLoading = true;
      let table = context.state.tables.find((table) => table.id == payload.id);
      table.localUpdateTable(payload);

      mixin.methods
        .request({
          method: "PUT",
          url: "api/v1/table/" + payload.id + "/",
          data: payload,
        })
        .then((res) => {
          context.state.isLoading = false;
          context.state.isTableModalActive = false;
          delete context.rootState.errors.tableName;
          Toast.open({
            queue: false,
            message: "میز با موفقیت ویرایش شد",
            type: "is-success",
          });
        })
        .catch((err) => {
          context.state.isLoading = false;
          context.rootState.errors.tableName = err.response.data.number;

          Toast.open({
            queue: false,
            message: "مشکلی در ویرایش میز به وجود آمد",
            type: "is-danger",
          });
          table.drawbackLocalUpdate();
        });
    },
    /* create table */
    createTable: (context, payload) => {
      context.state.tables.push(new Table(payload));

      mixin.methods
        .request({
          method: "POST",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/table/add/",
          data: payload,
        })
        .then((res) => {
          delete context.rootState.errors.tableName;
          context.state.tables.pop();
          context.state.tables.push(new Table(res.data));
          Toast.open({
            queue: false,
            message: "میز با موفقیت ساخته شد",
            type: "is-success",
          });
        })
        .catch((err) => {
          context.rootState.errors.tableName = err.response.data.number;
          Toast.open({
            queue: false,
            message: "مشکلی در ساخت میز به وجود آمد",
            type: "is-danger",
          });
          context.state.tables.pop();
        });
    },
    /* create tables */
    deleteTable: (context, payload) => {
      context.state.isLoading = true;
      let table = context.state.tables.find((table) => table.id == payload.id);
      let index = context.state.tables.findIndex(
        (table) => table.id == payload.id
      );

      context.state.tables = context.state.tables.filter(
        (tbl) => tbl.id != payload.id
      );

      mixin.methods
        .request({
          method: "DELETE",
          url: "api/v1/table/" + payload.id + "/",
          data: payload,
        })
        .then((res) => {
          context.state.isLoading = false;
          Toast.open({
            queue: false,
            message: "میز با موفقیت پاک شد",
            type: "is-success",
          });
        })
        .catch((err) => {
          context.state.isLoading = false;
          Toast.open({
            queue: false,
            duration: 3000,
            message:
              "مشکلی در حذف میز به وجود آمد، از بسته بودن صورتحساب میز اطمینان حاصل فرمایید",
            type: "is-danger",
          });
          context.state.tables.splice(index, 0, table);
        });
    },
    payInvoice(context, payload) {
      return mixin.methods
        .request({
          method: "POST",
          url:
            "api/v1/pbr/session/" +
            context.rootState.accountModule.activeCafe.id +
            "/create/",
          data: payload,
        })
        .then((res) => {
          context.state.isCloseInvoiceModalActive = false;
          context.state.isPayInvoiceModalActive = false;
          Toast.open({
            queue: false,
            message: " پرداخت با موفقیت انجام شد",
            type: "is-success",
          });
          return true;
        })
        .catch((err) => {
          Toast.open({
            queue: false,
            message: "مشکلی در پرداخت به وجود آمد",
            type: "is-danger",
          });
          return false;
        });
    },
    addBulkProduct(context, { table, changes }) {
      let table_products = { table_products: changes };

      mixin.methods
        .request({
          method: "POST",
          url: "api/v1/table/" + table + "/products/bulk/post/staff/",
          data: table_products,
        })
        .then((res) => {
          context.state.activeProductChangeModal--;
          context.state.localLoading--;
        })
        .catch((err) => {
          context.state.activeProductChangeModal--;
          context.state.localLoading--;
          Toast.open({
            queue: false,
            duration: 3000,
            message: err.response.data,
            type: "is-danger",
          });
        });
    },
    removeBulkProduct(context, { table, changes }) {
      let table_products = { table_products: changes };

      mixin.methods
        .request({
          method: "POST",
          url: "api/v1/table/" + table + "/products/bulk/delete/staff/",
          data: table_products,
        })
        .then((res) => {
          context.state.activeProductChangeModal--;
          context.state.localLoading--;
        })
        .catch((err) => {
          context.state.activeProductChangeModal--;
          context.state.localLoading--;
          Toast.open({
            queue: false,
            duration: 3000,
            message: err.response.data,
            type: "is-danger",
          });
        });
    },
    sendOrderKitchenAndPayInvoice(context, { joinId, pbr }) {
      mixin.methods
        .request({
          method: "POST",
          url:
            "api/v1/pbr/session/" +
            context.rootState.accountModule.activeCafe.id +
            "/create/",
          data: pbr,
        })
        .then((res) => {
          Toast.open({
            queue: false,
            message: "صورتحساب میز با موفقیت پرداخت شد",
            type: "is-success",
          });

          context.dispatch("sendOrderKitchen", joinId);
        })
        .catch((err) => {
          Toast.open({
            queue: false,
            message: "مشکلی در پرداخت صورتحساب میز به وجود آمد",
            type: "is-danger",
          });
          //console.log(err);
        });
    },
    async settleAndCloseInvoice(context, { table, method }) {
      if (context.state.invoiceClosing || !table.joinId) return false;
      context.state.invoiceClosing = true;
      try {
        if (Number(method) !== 0) {
          const payments = [];
          table.customers.forEach(customer => {
            customer.orders.forEach(order => {
              if (order.paymentInfo.net_amount > 0) {
                payments.push({ pbr: order.id, amount: order.paymentInfo.net_amount });
              }
            });
          });
          if (payments.length) {
            const paid = await context.dispatch("payInvoice", { payments, method });
            if (!paid) return false;
          }
        }
        return await context.dispatch("closeInvoice", {
          table: table.joinId,
          forceClose: true,
          sent: false,
        });
      } finally {
        context.state.invoiceClosing = false;
      }
    },
    closeInvoice(context, { table, forceClose, sent }) {
      return mixin.methods
        .request({
          method: "PUT",
          url: "api/v1/join/send/" + table + "/",
          data: {
            force_close: forceClose,
            sent: sent,
          },
        })
        .then((res) => {
          context.state.isTableCloseInvoiceModalActive = false;
          Toast.open({
            queue: false,
            message: "صورتحساب با موفقیت بسته شد",
            type: "is-success",
          });
          return true;
        })
        .catch((err) => {
          Toast.open({
            queue: false,
            message: "مشکلی در بستن صورتحساب به وجود آمد",
            type: "is-danger",
          });
          return false;
        });
    },
    sendOrderKitchen(context, payload) {
      mixin.methods
        .request({
          method: "PUT",
          url: "api/v1/pbr/" + payload + "/send-to-kitchen/",
          data: {
            pk: payload,
            sent_to_kitchen: true,
          },
        })
        .then((res) => {})
        .catch((err) => {
          Toast.open({
            queue: false,
            message: "مشکلی در ارسال محصولات به آشپزخانه به وجود آمد",
            type: "is-danger",
          });
        });
    },
    getCafeTableTokens(context) {
      mixin.methods
        .request({
          method: "GET",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/table-token/list/",
        })
        .then((res) => {
          context.commit("setEachTableToken", res.data);
          context.commit("setCafeTableTokens", res.data);
        })
        .catch(() => {});
    },
    changeTableToken(context, { token, table }) {
      mixin.methods
        .request({
          method: "PUT",
          url: "api/v1/table-token/" + token + "/activate/",
          data: {
            table: table,
          },
        })
        .then((res) => {
          context.state.isTableTokenModalActive = false;
          context.dispatch("getCafeTableTokens");
          Toast.open({
            queue: false,
            message: "کد میز با موفقیت تغییر کرد",
            type: "is-success",
          });
        })
        .catch((err) => {
          Toast.open({
            queue: false,
            message: "مشکلی در تغییر کد به وجود آمد",
            type: "is-danger",
          });
        });
    },
    getTableJoinDetail(context, payload) {
      mixin.methods
        .request({
          method: "GET",
          url: "api/v1/join/detailed/" + payload.joinId + "/",
        })
        .then((res) => {
          context.commit("setTableJoinDetail", res.data);
        })
        .catch((err) => {
          console.error("Table request failed", err.response && err.response.status);
        });
    },
    refundPbr(context, payload) {
      mixin.methods
        .request({
          method: "POST",
          url:
            "api/v1/pbr/" +
            context.rootState.accountModule.activeCafe.id +
            "/refund/",
          data: payload,
        })
        .then((res) => {
          context.state.isRefundModalActive = false;
          context.state.isDiscountRefundModalActive = false;

          Toast.open({
            queue: false,
            message: "مبلغ با موفقیت به کیف پول کافه پی کاربر انتقال یافت",
            type: "is-success",
          });
        })
        .catch((err) => {
          console.error("Table request failed", err.response && err.response.status);
        });
    },
    internalRefundPbr(context, payload) {
      mixin.methods
        .request({
          method: "POST",
          url:
            "api/v1/pbr/" +
            context.rootState.accountModule.activeCafe.id +
            "/internal/refund/",
          data: payload,
        })
        .then((res) => {
          context.state.isRefundModalActive = false;
          context.state.isDiscountRefundModalActive = false;

          Toast.open({
            queue: false,
            message: "بازپرداخت انجام شد",
            type: "is-success",
          });
        })
        .catch((err) => {
          console.error("Table request failed", err.response && err.response.status);
        });
    },
    // createRefundOnPbr(context, payload) {
    //   return mixin.methods
    //     .request({
    //       method: "POST",
    //       url: "api/v1/pbr//internal/refund/",
    //       data: payload
    //     })
    // }
  },
};
