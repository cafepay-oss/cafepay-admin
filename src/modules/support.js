import mixin from "../mixin";

import { ToastProgrammatic as Toast } from "buefy";

export default {
  namespaced: true,
  /* -------------------------------- state --------------------------------- */
  state: {
    driversAndApps: []
  },

  /* -------------------------------- getters --------------------------------- */
  getters: {

  },

  /* -------------------------------- mutations --------------------------------- */
  mutations: {
    setDriversAndApps(state, payload) {
      state.driversAndApps = payload;
    }
  },

  /* -------------------------------- actions --------------------------------- */
  actions: {
    getPreorderProducts(context, payload) {
      mixin.methods
        .request({
          method: "GET",
          url: "api/v1/table/" + payload.table.id + "/products/bulk/post/staff/",
          data: table_products
        })
        .then(res => {
          context.state.isPreorderModalActive = false
          Toast.open({
            queue: false,
            duration: 3000,
            message: "پیش سفارش با موفقیت ثبت شد",
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


    getDriversAndApps(context, payload) {
      mixin.methods
        .request({
          method: "GET",
          url: "api/v1/downloads/list/",
        })
        .then(res => {
          context.commit("setDriversAndApps", res.data)
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
