import mixin from "../mixin";
import router from "@/router";

import { ToastProgrammatic as Toast } from "buefy";
import i18n from '@/i18n.js'

import Cafe from "../models/CafeClass";
import User from "../models/UserClass";

function savedCafe() {
  try {
    const cafe = JSON.parse(window.storage.getItem("activeCafe"));
    return cafe && cafe.id ? new Cafe(cafe) : {};
  } catch (error) {
    window.storage.removeItem("activeCafe");
    return {};
  }
}

export default {
  namespaced: true,
  // -----------------------------------------------------------------
  state: {
    user: {}, // loged in user

    cafes: [], // list of cafes that user work in
    activeCafe: savedCafe(), // selected cafe

    localLoading: false, // loading mode,
    testVerificationCode: ''
  },
  // -----------------------------------------------------------------
  getters: {
    activeCafe: state => {
      return state.activeCafe;
    },
    isAuthenticated: state => !!state.user.token
  },
  // -----------------------------------------------------------------
  mutations: {
    setActiveCafe(state, cafe) {
      state.activeCafe = cafe || {};
      if (cafe && cafe.id) window.storage.setItem("activeCafe", JSON.stringify(cafe));
      else window.storage.removeItem("activeCafe");
    },
    setToken(state, token) {
      state.user.token = token;
      window.storage.setItem("token", token);
    },
    setCafesData(state, payload) {
      let cafes = [];

      payload.forEach(cafeRelation => {
        cafes.push(new Cafe(cafeRelation.cafe));
      });

      state.cafes = cafes;
    },
    setUserData(state, payload) {
      state.user = new User(payload);
    },
    setCafeDetailData(state, payload) {
      state.activeCafe
        .setAddress(payload.address)
        .setLocation(payload.location)
        .setDescription(payload.description);
    },
    setActiveCafeBasicInfo(state, payload) {
      state.activeCafe.setBasicInfo(payload)
    },
    setIsClosed(state, payload) {
      state.activeCafe.isClosed = payload
    },
    setTestVerificationCode(state, payload) {
      state.testVerificationCode = payload
    }
  },
  // -----------------------------------------------------------------
  actions: {
    localLogin(context, payload) {
      if (process.env.VUE_APP_CAFEPAY_LOCAL_RECOVERY !== 'true') {
        return Promise.reject(new Error('Local login is disabled.'));
      }
      context.state.localLoading = true;
      return mixin.methods.baseRequest({
        url: "api/v1/local/login/",
        method: "POST",
        data: payload
      }).then(res => {
        context.commit("setCafesData", res.data.cafe_relations);
        window.storage.setItem("token", res.data.token);
        context.dispatch("getUserData", {redirectAfterLoad: true});
      }).catch(error => {
        context.state.localLoading = false;
        throw error;
      });
    },
    /* Login User

			* payload: { username, password }
			* API response: { token, cafe_relations: [ { cafe } ] }
		*/
    login(context, payload) {
      context.state.localLoading = true; // activate loading mode

      mixin.methods
        .baseRequest({
          // login user api call
          url: "api/v1/user-profile/cafe-auth-token/",
          method: "POST",
          data: {
            phone_number: payload.phone_number,
            password: payload.password
          }
        })
        .then(res => {
          context.commit("setCafesData", res.data.cafe_relations); // create related cafe classes

          window.storage.setItem("token", res.data.token); // save token into window.storage

          context.dispatch("getUserData", {redirectAfterLoad: true}); // get user data
        })
        .catch(err => {
          context.state.localLoading = false; // deactive loading mode
          if (err.response) {
            if (err.response.status == 400) {
              Toast.open({
                queue: false,
                message: "اطلاعات ورودی معتبر نیست",
                type: "is-danger"
              });
            }
            else if (err.response.status == 403) {
              context.rootState.errors = {
                code: [i18n.t('toasts.wrongCode')]
              }
            }
            else if (err.response.status == 404) {
              context.rootState.errors = {
                code: [i18n.t('toasts.tryLater')]
              }
            }
          }
        });
    },
    sendPhoneNumber(context, payload) {
      mixin.methods
      .baseRequest({
        // login user api call
        url: "api/v1/user-profile/send-code/",
        method: "POST",
        data: {
          phone_number: payload,
        }
      })
      .then(res => {
        if (res.data.code) {
          context.commit('setTestVerificationCode', res.data.code)
        }
      })
      .catch(err => {
        context.rootState.errors = (err.response && err.response.data) || { detail: ["خطا در ارتباط با سرور"] };
      });
    },
    /* Get User Data

			* payload: token
			* API response: { full_name, email, national_code, has_usable_password,
													phone_number, verification_status, get_verification_status_display }
		*/
    getUserData(context, payload) {
      return mixin.methods
        .request({
          url: "api/v1/user-profile/",
          method: "GET"
        })
        .then(res => {
          context.state.localLoading = false; // deactive loading mode

          res.data["token"] = window.storage.getItem("token"); // get user token from window.storage

          context.commit("setUserData", res.data); // create user class instance

          Toast.open({
            queue: false,
            message: `${i18n.t('login.wellcome')} ${context.state.user.fullName}`,
            type: "is-success"
          });

          const saved = context.state.activeCafe;
          const selected = context.state.cafes.find(cafe => saved && cafe.id == saved.id)
            || (context.state.cafes.length === 1 ? context.state.cafes[0] : null);
          context.commit("setActiveCafe", selected);
          if (!selected) {
            context.rootState.loadWholePage = false;
            if (router.currentRoute.path !== "/stores") router.replace("/stores").catch(() => {});
            return;
          }
          context.dispatch("getCafeData");
          if ((payload && payload.redirectAfterLoad) || ["/login", "/stores", "/"].includes(router.currentRoute.path)) {
            router.replace("/").catch(() => {});
          }
        })
        .catch(err => {
          context.state.localLoading = false; // deactive loading mode
          if (err.response) {
            if (err.response.status == 400) {
              Toast.open({
                queue: false,
                message: "اطلاعات کاربر به درستی دریافت نشد",
                type: "is-danger"
              });
            }
          }
        });
    },
    /* Get Cafe Data

			* payload: cafe_id
			* API response: { name, description, location, address, printers }
		*/
    getCafeData(context) {
      if (!context.state.activeCafe || !context.state.activeCafe.id) return Promise.resolve(false);
      return mixin.methods
        .request({
          url: "api/v1/cafe/" + context.getters.activeCafe.id + "/update/basic/",
          method: "GET"
        })
        .then(res => {
          context.commit("setCafeDetailData", res.data);
          context.commit("printerModule/setCloudPrinters", res.data.printers, { root: true });
        })
        .catch(err => {
          context.state.localLoading = false; // deactive loading mode
          if (err.response) {
            if (err.response.status == 400) {
              Toast.open({
                queue: false,
                message: "اطلاعات کافه به درستی دریافت نشد",
                type: "is-danger"
              });
            }
          }
        });
    },
    /* update cafe informations from about cafe page */
    updateCafeInfo(context, payload) {
      context.state.activeCafe.localUpdateCafe(payload);

      mixin.methods
        .request({
          url: "api/v1/cafe/" + context.state.activeCafe.id + "/update/basic/",
          method: "PUT",
          data: payload
        })
        .then(res => {})
        .catch(err => {
          context.state.activeCafe.localDrawbackUpdate();
          Toast.open({
            queue: false,
            message: " مشکلی در ارتباط با سرور به وجود آمد. لطفا مجددا تلاش کنید.",
            type: "is-danger"
          });
        });
    },
    getActiveCafeBasicInfo(context) {
      if (!context.state.activeCafe || !context.state.activeCafe.id) return Promise.resolve(false);
      return mixin.methods
        .request({
          method: "GET",
          url: "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/basic/info/"
        })
        .then(res => {
          context.commit("setActiveCafeBasicInfo", res.data);
        })
        .catch(() => {});
    },
    setCafeFromLocalStorage: (context, payload) => {
      context.state.activeCafe = new Cafe(payload);
      context.dispatch("getCafeData");
    },
    /* Get User Cafe Relations

			* payload: token
			* API response: { token, cafe_relations: [ { cafe } ] }
		*/
    getUserCafeRelations: context => {
      return mixin.methods.request({ url: "api/v1/auth/info/", method: "GET" })
        .then(res => {
          context.commit("setCafesData", res.data.cafe_relations);
          return context.dispatch("getUserData");
        })
        .catch(() => { context.rootState.loadWholePage = false; });
    },
    isClosed(context, payload) {
      mixin.methods
        .request({
          url: "api/v1/cafe/"+ context.state.activeCafe.id +"/update/basic/",
          method: "PATCH",
          data: {
            is_closed: payload
          }
        })
        .then(res => {
        })
        .catch(err => {
        });
    }
  }
};
