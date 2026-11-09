import mixin from "../mixin";

import { ToastProgrammatic as Toast } from "buefy";

export default {
  namespaced: true,
  /* -------------------------------- state --------------------------------- */
  state: {
  },

  /* -------------------------------- getters --------------------------------- */
  getters: {
  },

  /* -------------------------------- mutations --------------------------------- */
  mutations: {
  },

  /* -------------------------------- actions --------------------------------- */
  actions: {
    getSubscriptionKeys(context, cafeId) {
      return mixin.methods
        .request({
          method: "GET",
          url: `api/v1/cafe/${cafeId}/update/basic/`,
        })
      },
    setSubscriptionKeys(context, payload) {
      return mixin.methods
        .request({
          method: "PATCH",
          data: payload.data,
          url: `api/v1/cafe/${payload.cafeId}/update/basic/`,
        }).then((res) => {
          Toast.open({
            queue: false,
            message: "ثبت شد",
            type: "is-success"
          });
        })
        .catch((err) => {
          Toast.open({
            queue: false,
            message: "لطفا مجددا درخواست را ارسال کنید",
            type: "is-danger"
          });
        })
    },
    setPushEndpoint(context, payload) {
      return mixin.methods
        .request({
          method: "POST",
          data: payload.data,
          url: `api/v1/cafe/${payload.cafeId}/push-subscription/append/`,
        }).then((res) => {
          Toast.open({
            queue: false,
            message: "سیستم برای اطلاع رسانی ثبت شد",
            type: "is-success"
          });
        })
        .catch((err) => {
          Toast.open({
            queue: false,
            message: "لطفا مجددا درخواست را ارسال کنید",
            type: "is-danger"
          });
        })
    }
    }
};
