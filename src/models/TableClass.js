import store from "../store";
import Vue from "vue";
import mixin from "../mixin";

import Customer from "./CustomerClass";
import Order from "./OrderClass";
import Preorder from "./PreorderClass";

import configs from "../javascripts/config";
import i18n from "@/i18n.js";
import Enums from "./Enums";

var hash = require("object-hash");

export default class Table {
  constructor(rawData = {}) {
    this.cardTransfer = rawData.card_transfer || null;
    this.id = rawData.pk;
    this.position = rawData.pk;
    this.name = rawData.number;
    this.staff = rawData.staff;
    this.isPreorder = rawData.is_preorder;
    this.address = rawData.address;
    this.isManualInvoice =
      rawData.table_type == Enums.TableTokenTypes.PAYMENT_ONLY;
    this.readyTime = rawData.ready_time;

    this.isMenuOnly = null;
    this.token = null;

    this.paymentInfo = null;
    this.description = null;
    this.isClosed = null;
    this.forceClose = null;
    this.sent = null;
    this.time = null;
    this.tableType = null;
    this.mergedTablesId = [];
    this.mergedTables = [];

    this.customers = [];
    this.scanned = [];
    this.joinId = null;

    // timer properties
    this.playNotPause = true;
    this.timerInterval = null;
    this.hourlyPrice = 0;
    this.sec = 0;
    this.min = 0;
    this.hour = 0;

    this.joinNumber = 0;

    this.lastUpdate = null;
    this.lastUpdateTimeHandler = null;
    this.that = {};

    this.diffObj = {};
    this.init = false;
  }

  addMergeTablesId(tableId) {
    this.mergedTablesId.push(tableId);
  }

  /* set table type method */
  setTableType() {
    const ids = this.mergedTablesId || [];
    if (!ids.length) this.tableType = "free";
    else if (ids.length === 1 || Math.min(...ids.map(table => Number(table.pk))) === Number(this.id)) this.tableType = "fill";
    else this.tableType = "merged";
  }

  /* merged tables methods */
  setMergedTablesId(tablesId) {
    this.mergedTablesId = tablesId;
  }

  findMergedTables() {
    const tables = store.state.tableModule.tables || [];
    this.mergedTables = (this.mergedTablesId || [])
      .map(merged => tables.find(table => table.id == merged.pk))
      .filter(Boolean).sort((left, right) => left.id - right.id);
  }

  /* socket massages */
  watchTableAggregate() {
    let request = {
      request: {
        endpoint: "table/" + this.id + "/aggregate/",
        data: {},
        headers: {
          Authorization: "Token " + store.state.accountModule.user.token,
        },
        method: "WATCH",
      },
    };

    let request_str = JSON.stringify(request);

    const socket = Vue.prototype.$socket;
    if (socket && socket.readyState === 1) socket.send(request_str);
  }

  setCardTransfer(transfer) {
    const previous = this.cardTransfer;
    this.cardTransfer = transfer || null;
    if (this.init && this.isPreorder && transfer && transfer.status === 'submitted' &&
        (!previous || previous.uuid !== transfer.uuid || previous.status !== 'submitted')) {
      this.notificationHandler('card_transfer', { type: 'changed' });
    }
  }

  setAggregateData(payload, free = false) {
    if (!free) this.setCardTransfer(payload.card_transfer);
    if (free) {
      this.cardTransfer = null;
      this.paymentInfo = null;
      this.description = null;
      this.address = null;
      this.isClosed = null;
      this.forceClose = null;
      this.sent = null;
      this.time = null;
      this.tableType = null;
      this.mergedTablesId = [];
      this.mergedTables = [];

      this.customers = [];
      this.scanned = [];
      this.joinId = null;

      this.playNotPause = true;
      this.timerInterval = null;
      this.hourlyPrice = 0;
      this.sec = 0;
      this.min = 0;
      this.hour = 0;

      this.init = true;

      this.that = {};

      this.setTableType();
    } else {
      if (this.init) {
        if (!this.isMenuOnly) {
          this.diff(
            this.paymentInfo ? this.paymentInfo : {},
            payload.payment_info
          );
          if (payload.description != this.description) {
            this.notificationHandler("description", {
              currValue: this.description,
              newValue: payload.description,
              type: "changed",
            });
          }
        }
      } else {
        this.init = true;
      }

      this.paymentInfo = payload.payment_info;
      this.description = payload.description;
      this.address = payload.address;
      this.isClosed = payload.is_closed;
      this.forceClose = payload.force_close;
      this.sent = payload.sent;
      this.time = new Date(payload.datetime);
      this.mergedTablesId = payload.tables;

      this.setTableType();
    }
  }

  setDetailDate(payload) {
    this.setCardTransfer(payload.card_transfer);
    if (this.init) {
      if (!this.isMenuOnly) {
        this.diff(
          this.paymentInfo ? this.paymentInfo : {},
          payload.payment_info
        );
        if (payload.description != this.description) {
          this.notificationHandler("description", {
            currValue: this.description,
            newValue: payload.description,
            type: "changed",
          });
        }
      }
    } else {
      this.init = true;
    }

    this.paymentInfo = payload.payment_info;
    this.description = payload.description;
    this.address = payload.address;
    this.isClosed = payload.is_closed;
    this.forceClose = payload.force_close;
    this.sent = payload.sent;
    this.time = new Date(payload.datetime);
    this.mergedTablesId = payload.tables;
    this.findMergedTables();
    this.setTableType();

    this.setAndResetTimer();
    this.scanned = payload.scanned;
    let newCustomers = [];
    this.joinId = payload.pk;
    this.joinNumber = payload.join_number;
    this.readyTime = payload.ready_time;
    (payload.bill_products || []).forEach(rawOrder => {
      const productId = typeof rawOrder.product === "object" ? rawOrder.product.id : rawOrder.product;
      const product = store.state.productModule.products.find(item => item.id == productId)
        || { id: productId, name: "محصول حذف‌شده", available: false, original_price: rawOrder.original_price, group: [], images: [] };
      const bill_product = { ...rawOrder, product };
      if (bill_product.user_profile == null) {
        bill_product.user_profile = {
          pk: store.state.accountModule.user.id,
          full_name: store.state.accountModule.user.fullName,
          user_profile: {
            email: null,
            first_name: store.state.accountModule.user.fullName,
            full_name: store.state.accountModule.user.fullName,
            last_name: "",
            pk: store.state.accountModule.user.id,
          },
          email: store.state.accountModule.user.email,
        };
      }
      let relatedCustomer = newCustomers.find(
        (cus) => cus.id == bill_product.user_profile.pk
      );
      if (relatedCustomer) {
        if (this.isPreorder) {
          relatedCustomer.orders.push(new Preorder(bill_product));
        } else {
          relatedCustomer.orders.push(new Order(bill_product));
        }
      } else {
        let newCustomer = new Customer(bill_product);
        newCustomers.push(newCustomer);
        if (this.isPreorder) {
          newCustomer.phoneNumber = bill_product.user_profile.phone_number;
          newCustomer.orders.push(new Preorder(bill_product));
        } else {
          newCustomer.orders.push(new Order(bill_product));
        }
      }
    });
    this.customers = newCustomers;
  }

  diff(currObj = {}, newObj = {}) {
    currObj = currObj || {};
    newObj = newObj || {};
    const keys = new Set([...Object.keys(currObj), ...Object.keys(newObj)]);
    keys.forEach(key => {
      if (currObj[key] === newObj[key] || (currObj[key] !== undefined && newObj[key] !== undefined
        && hash(currObj[key]) === hash(newObj[key]))) return;
      if (currObj[key] && newObj[key] && typeof currObj[key] === "object" && typeof newObj[key] === "object") {
        this.diff(currObj[key], newObj[key]);
      } else {
        this.notificationHandler(key, {
          currValue: currObj[key], newValue: newObj[key],
          type: !Object.prototype.hasOwnProperty.call(newObj, key) ? "deleted"
            : !Object.prototype.hasOwnProperty.call(currObj, key) ? "added" : "changed"
        });
      }
    });
  }

  setAndResetTimer() {
    clearTimeout(this.lastUpdateTimeHandler);
    this.lastUpdate = new Date();
    if (!this.isPreorder) {
      this.lastUpdateTimeHandler = setTimeout(() => {
        this.sendOrdersToKitchen();
      }, 30000);
    }
  }

  sendOrdersToKitchen() {
    this.print();
    this.customers.forEach((customer) => {
      customer.orders.forEach((order) => {
        if (
          !order.sentToKitchen &&
          order.paymentInfo.net_amount == 0 &&
          order.paymentInfo.payed_amount > 0
        ) {
          store.dispatch("tableModule/sendOrderKitchen", order.id);
        }
      });
    });
  }

  print() {
    let orders = this.getTableProducts();
    let readyToSendOrders = [];
    orders.forEach((order) => {
      if (!order.sentToKitchen && order.netAmount == 0 && order.payed > 0) {
        readyToSendOrders.push(order);
      }
    });

    if (readyToSendOrders.length > 0) {
      mixin.methods.printOrders({
        templateType: Enums.PrinterTemplateTypesEnum.KITCHEN,
        ordersToPrint: readyToSendOrders,
        table: this,
      });
    }
  }

  notificationHandler(key, change) {
    let notification = {
      message: "",
      type: ""
    }

    if (key === "card_transfer") {
      notification.type = Enums.NotificationsTypeEnum.PRE_ORDER;
      notification.message = 'سفارش جدید با رسید ثبت شد؛ آماده‌سازی می‌تواند شروع شود.';
    } else if (key == "description") {
      notification.type = Enums.NotificationsTypeEnum.CHANGE_ORDER
      notification.message = `${i18n.t("notifications.description")}
      ${i18n.tc(
        "notifications.productAddedToTable",
        change.newValue - change.currValue
      )} ${this.isPreorder ? 'پیش سفارش' : this.name} ${i18n.t("notifications.added")}`;
    } else if (key == "total_count") {
      if (this.isPreorder) {
      } else {
        if (change.type == "changed" || change.type == "added") {
          if (change.newValue - change.currValue > 0) {
            notification.type = Enums.NotificationsTypeEnum.CHANGE_ORDER
            notification.message = `${i18n.t("notifications.count")} ${
              change.newValue - change.currValue
            } ${i18n.tc(
              "notifications.productAddedToTable",
              change.newValue - change.currValue
            )} ${this.name} ${i18n.t("notifications.added")}`;
          } else if (change.newValue - change.currValue < 0) {
            notification.type = Enums.NotificationsTypeEnum.CHANGE_ORDER
            notification.message = `${i18n.t("notifications.count")} ${
              change.currValue - change.newValue
            } ${i18n.tc(
              "notifications.productRemovedFromTable",
              change.newValue - change.currValue
            )} ${this.name} ${i18n.t("notifications.removed")}`;
          } else {
            notification.type = Enums.NotificationsTypeEnum.NEW_CUSTOMER
            notification.message = `${i18n.t("notifications.newPersonOnTable")} ${
              this.name
            } ${i18n.t("notifications.added")}`;
          }
        }
      }
    } else if (key == "net_amount") {
      if (this.isPreorder) {
        if (change.newValue == 0 && change.currValue != 0 && !(this.cardTransfer && this.cardTransfer.status === 'confirmed')) {
          notification.type = Enums.NotificationsTypeEnum.PRE_ORDER
          notification.message = `یک پیش سفارش آماده بررسی میباشد`;
        }
      } else {
        if (
          change.newValue == 0 &&
          change.currValue != 0 &&
          change.type == "changed"
        ) {
          notification.type = Enums.NotificationsTypeEnum.FULL_PAYMENT
          notification.message = `${i18n.t("notifications.invoiceOfTable")} ${
            this.name
          } ${i18n.t("notifications.isFullyPayed")}`;
        } else if (change.newValue == 0 && change.currValue == 0) {
          notification.type = Enums.NotificationsTypeEnum.NEW_CUSTOMER
          notification.message = `${i18n.t("notifications.newPersonOnTable")} ${
            this.name
          } ${i18n.t("notifications.added")}`;
        }
      }
    }

    if (notification.message != "") {
      if (window.isElectron) {
        window.onCafePayNotification();
      }

      store.commit('notificationModule/addNewNotification', {
        ...notification,
        table: this
      })

    }
  }

  watchTableDetailData() {
    let request = {
      request: {
        endpoint: "table/" + this.id + "/join/simple/by-id/",
        data: {},
        headers: {
          Authorization: "Token " + store.state.accountModule.user.token,
        },
        method: "WATCH",
      },
    };

    let request_str = JSON.stringify(request);

    //console.log(request);
    const socket = Vue.prototype.$socket;
    if (socket && socket.readyState === 1) socket.send(request_str);
  }

  addProductToTable(payload) {
    let request = {
      request: {
        endpoint: "table/" + this.id + "/product/" + payload.id + "/staff/",
        data: {},
        headers: {
          Authorization: "Token " + store.state.accountModule.user.token,
        },
        method: "POST",
      },
    };

    let request_str = JSON.stringify(request);

    //console.log(request);
    const socket = Vue.prototype.$socket;
    if (socket && socket.readyState === 1) socket.send(request_str);
  }

  deleteProductFromTable(payload) {
    let request = {
      request: {
        endpoint: "table/" + this.id + "/product/" + payload.id + "/staff/",
        data: {},
        headers: {
          Authorization: "Token " + store.state.accountModule.user.token,
        },
        method: "DELETE",
      },
    };

    let request_str = JSON.stringify(request);

    //console.log(request);
    const socket = Vue.prototype.$socket;
    if (socket && socket.readyState === 1) socket.send(request_str);
  }

  // Table Actions
  mergeTable(payload) {
    let request = {
      request: {
        endpoint: "table/" + this.id + "/join/" + payload.id + "/",
        data: {},
        headers: {
          Authorization: "Token " + store.state.accountModule.user.token,
        },
        method: "PUT",
      },
    };

    let request_str = JSON.stringify(request);

    //console.log(request);
    const socket = Vue.prototype.$socket;
    if (socket && socket.readyState === 1) socket.send(request_str);
  }

  separateTable(payload) {
    let request = {
      request: {
        endpoint: "table/" + payload.id + "/separate/",
        data: {},
        headers: {
          Authorization: "Token " + store.state.accountModule.user.token,
        },
        method: "PUT",
      },
    };

    let request_str = JSON.stringify(request);

    //console.log(request);
    const socket = Vue.prototype.$socket;
    if (socket && socket.readyState === 1) socket.send(request_str);
  }

  transferTable(payload) {
    let request = {
      request: {
        endpoint: "table/" + this.id + "/transfer/" + payload.id + "/",
        data: {},
        headers: {
          Authorization: "Token " + store.state.accountModule.user.token,
        },
        method: "PUT",
      },
    };

    let request_str = JSON.stringify(request);

    //console.log(request);
    const socket = Vue.prototype.$socket;
    if (socket && socket.readyState === 1) socket.send(request_str);
  }

  // Get table product-customer data
  getTableProducts() {
    let tableProducts = [];
    let seenProducts = [];

    this.customers.forEach((customer) => {
      customer.orders.forEach((order) => {
        let relatedSeenProduct = seenProducts.find(
          (relatedSeenProduct) =>
            relatedSeenProduct.product == order.product.id &&
            relatedSeenProduct.sentToKitchen == order.sentToKitchen
        );

        if (!relatedSeenProduct) {
          seenProducts.push({
            product: order.product.id,
            sentToKitchen: order.sentToKitchen,
            pbrId: order.pbrId,
          });

          tableProducts.push({
            id: order.product.id,
            product: order.product,
            name: order.product.name,
            number: order.count,
            price: order.paymentInfo.total_amount,
            payed: order.paymentInfo.net_payed_amount,
            discount: order.discount,
            netAmount: order.paymentInfo.net_amount,
            sentToKitchen: order.sentToKitchen,
            pbrId: order.id,
            preferredPaymentMethods: [order.preferredPaymentMethod],
            items: [
              {
                id: customer.id,
                name: customer.fullName,
                number: order.count,
                price: order.paymentInfo.total_amount,
                discount: order.discount,
                payed: order.paymentInfo.net_payed_amount,
                netAmount: order.paymentInfo.net_amount,
                pbrs: [{ pbrId: order.id, payment: order.paymentInfo }],
                pbrId: order.id,
                preferredPaymentMethod: order.preferredPaymentMethod,
                lastUpdate: order.lastUpdate,
              },
            ],
          });
        } else {
          // seen product
          let seenProduct = tableProducts.find(
            (item) =>
              item.id == order.product.id &&
              item.sentToKitchen == order.sentToKitchen
          );
          seenProduct.number += order.count;
          seenProduct.price += order.paymentInfo.total_amount;
          seenProduct.payed += order.paymentInfo.net_payed_amount;
          seenProduct.netAmount += order.paymentInfo.net_amount;
          seenProduct.preferredPaymentMethods.push(
            order.preferredPaymentMethod
          );

          let seenCustomer = seenProduct.items.find(
            (item) => item.id == customer.id
          );

          if (seenCustomer) {
            seenCustomer.number += order.count;
            seenCustomer.price += order.paymentInfo.total_amount;
            seenCustomer.netAmount += order.paymentInfo.net_amount;
            seenCustomer.payed += order.paymentInfo.net_payed_amount;
            seenCustomer.pbrs.push({
              pbrId: order.id,
              payment: order.paymentInfo,
            });
          } else {
            seenProduct.items.push({
              id: customer.id,
              name: customer.fullName,
              number: order.count,
              discount: order.discount,
              price: order.paymentInfo.total_amount,
              payed: order.paymentInfo.net_payed_amount,
              netAmount: order.paymentInfo.net_amount,
              pbrs: [{ pbrId: order.id, payment: order.paymentInfo }],
              pbrId: order.id,
              preferredPaymentMethod: order.preferredPaymentMethod,
              lastUpdate: order.lastUpdate,
            });
          }
        }
      });
    });

    return tableProducts;
  }

  /* Table Timer */
  startTimer() {
    this.playNotPause = false;
    this.timerInterval = setInterval(() => {
      this.sec++;
      if (this.sec == 60) {
        this.sec = 0;
        this.min++;
        if (this.min == 60) {
          this.min = 0;
          this.hour++;
        }
      }
    }, 1000);
  }

  stopTimer() {
    this.playNotPause = true;
    clearInterval(this.timerInterval);
  }

  resetTimer() {
    this.playNotPause = true;
    clearInterval(this.timerInterval);
    this.sec = 0;
    this.min = 0;
    this.hour = 0;
  }

  getHourlyPrice() {
    return Math.floor(
      this.hourlyPrice * ((this.sec + this.min * 60 + this.hour * 3600) / 3600)
    );
  }

  getTimer() {
    let second = "0" + this.sec;
    let minutes = "0" + this.min;

    if (this.hour) {
      return this.hour + ":" + minutes.slice(-2) + ":" + second.slice(-2);
    } else {
      return minutes.slice(-2) + ":" + second.slice(-2);
    }
  }

  /* local update methods */
  localUpdateTable(payload) {
    this.that = JSON.parse(JSON.stringify(this));
    this.name = payload.number;
  }

  drawbackLocalUpdate() {
    this.name = this.that.name;
  }

  localUpdateTable(payload) {
    this.that.name = this.name;
    this.name = payload.number;
  }

  drawbackLocalUpdate() {
    this.name = this.that.name;
  }
}
