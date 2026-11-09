import Vue from "vue";
import Vuex from "vuex";
import WebPush from "web-push";

/* store Modules */
import manualInvoiceModule from "./modules/manualInvoice";
import notificationModule from "./modules/notification";
import SubscriptionModule from "./modules/subscription";
import analyticsModule from "./modules/analytics";
import categoryModule from "./modules/category";
import preorderModule from "./modules/preorder";
import printerModule from "./modules/printer";
import supportModule from "./modules/support";
import productModule from "./modules/product";
import regionModule from "./modules/region";
import accountModule from "./modules/account";
import groupModule from "./modules/group";
import tableModule from "./modules/table";
import cafeModule from "./modules/cafe";
import postModule from "./modules/post";
import menuModule from "./modules/menu";

import { ToastProgrammatic as Toast } from "buefy";
import i18n from "@/i18n.js";

import configs from "./javascripts/config";
import Enums from "./models/Enums";

let socketBootstrapTimer = null;
function cancelSocketBootstrapTimer() {
  clearTimeout(socketBootstrapTimer);
  socketBootstrapTimer = null;
}
function hasCatalogData(state) {
  return Array.isArray(state.tableModule.tables) &&
    state.productModule.newProduct && state.categoryModule.newCategory;
}
function finishSocketSnapshot(state, source, status) {
  if (!state.socket.pendingSources.includes(source)) return;
  if (status !== 200 && status !== 404) {
    cancelSocketBootstrapTimer();
    state.loadWholePage = false;
    state.socket.pendingSources = [];
    Toast.open({ queue: false, message: "دریافت وضعیت سفارش‌ها انجام نشد. لطفاً دوباره تلاش کنید.", type: "is-danger" });
    return;
  }
  state.socket.pendingSources = state.socket.pendingSources.filter(item => item !== source);
  if (!state.socket.pendingSources.length) {
    cancelSocketBootstrapTimer();
    state.socket.initializedCafeId = state.accountModule.activeCafe.id;
    state.loadWholePage = false;
  }
}

Vue.use(Vuex);
let isMobile = () =>
  (function (a) {
    return (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    );
  })(navigator.userAgent || navigator.vendor || window.opera);
export default new Vuex.Store({
  state: {
    /* enable loading whole page */
    loadWholePage: false, // if user is logged in, load store data
    loadWholePageMessage: "در حال دریافت اطلاعات فروشگاه",

    /* NavBar */
    isNavBarVisible: true,
    isMobile: isMobile(),
    collapsedSidebar: isMobile(),

    /* FooterBar */
    isFooterBarVisible: true,

    /* Aside */
    isAsideVisible: true,
    isAsideMobileExpanded: false,

    /* system states */
    systemStates: {
      noUserState: false,

      userLoginInProcess: {
        userLogin: false,
        userStores: false,
        userSelectStore: false,
      },

      cafeDataStateProcess: {
        cafeTables: false,
        cafeProducts: false,
        cafeMenus: false,
        cafeCategories: false,
        cafeFillProducts: false,
        cafeFillCategories: false,
      },

      stableSocketStateProcess: {
        socketConnected: false,
        socketEchoChecked: false,
      },
    },

    /* Last Update */
    lastUpdate: Date.now(),
    timer: "",

    /* loading state */
    isLoading: false,

    /* Socket */
    socket: {
      isConnected: false,
      message: "",
      reconnectError: false,
      initializedCafeId: null,
      pendingSources: [],
    },

    tries: 0,

    /* errors */
    errors: [],

    VAPIDKeys: !!window.storage.getItem("VAPIDKeys")
      ? JSON.parse(window.storage.getItem("VAPIDKeys"))
      : null,

    /* regular expressions */
    tableAggRegExp: new RegExp("table[.](\\d)*[.]aggregate[.]"),
    tableDetailRegExp: new RegExp("table[.](\\d)*[.]join[.]simple[.]by-id[.]"),
    cafePrinterJobRegExp: new RegExp("cafe[.](\\d)*[.]printer[.]jobs[.]"),
    cafePreorderTablesRegExp: new RegExp(
      "cafe[.](\\d)*[.]tables[.]join[.]simple[.]" +
        Enums.TableTokenTypes.SELF_PICKUP +
        "[.]"
    ),
    cafeManualInvoiceTablesRegExp: new RegExp(
      "cafe[.](\\d)*[.]tables[.]join[.]simple[.]" +
        Enums.TableTokenTypes.PAYMENT_ONLY +
        "[.]"
    ),
  },
  mutations: {
    /* A fit-them-all commit */
    basic(state, payload) {
      state[payload.key] = payload.value;
    },

    setVAPIDKey(state, keys) {
      state.VAPIDKeys = keys;
      if (!!keys) window.storage.setItem("VAPIDKeys", JSON.stringify(keys));
    },

    /* User */
    user(state, payload) {
      if (payload.name) {
        state.userName = payload.name;
      }
      if (payload.email) {
        state.userEmail = payload.email;
      }
      if (payload.avatar) {
        state.userAvatar = payload.avatar;
      }
    },
    clearToken(state) {
      state.token = null;
      window.storage.removeItem("token");
      window.storage.removeItem("cafeId");
    },
    /* socket mutations */
    SOCKET_ONOPEN(state, event) {
      Vue.prototype.$socket = event.currentTarget;
      state.socket.isConnected = true;

      if (configs.debug) {
        console.log("Socket Opened");
      }

      cancelSocketBootstrapTimer();
      state.socket.reconnectError = false;
      const cafeId = state.accountModule.activeCafe.id;
      if (!cafeId || !hasCatalogData(state)) return;
      const socket = event.currentTarget;
      state.loadWholePageMessage = i18n.t("loader.loadingData");
      state.loadWholePage = state.socket.initializedCafeId !== cafeId;
      state.socket.pendingSources = state.tableModule.tables.map(table =>
        `table.${table.id}.join.simple.by-id.`);
      state.socket.pendingSources.push(
        `cafe.${cafeId}.tables.join.simple.${Enums.TableTokenTypes.SELF_PICKUP}.`,
        `cafe.${cafeId}.tables.join.simple.${Enums.TableTokenTypes.PAYMENT_ONLY}.`
      );
      // Release immediately on snapshots. This timeout only handles missing replies.
      socketBootstrapTimer = setTimeout(() => {
        if (Vue.prototype.$socket !== socket || state.accountModule.activeCafe.id !== cafeId) return;
        state.loadWholePage = false;
        state.socket.pendingSources = [];
        Toast.open({ queue: false, message: "دریافت وضعیت سفارش‌ها طول کشید. لطفاً اتصال را بررسی کنید.", type: "is-warning" });
      }, 15000);

      state.tableModule.tables.forEach((table) => {
        table.watchTableDetailData();
      });

      if (state.productModule.newProduct && state.categoryModule.newCategory) {
        let preorderRequest = {
          request: {
            endpoint:
              "cafe/" +
              state.accountModule.activeCafe.id +
              "/tables/join/simple/" +
              Enums.TableTokenTypes.SELF_PICKUP +
              "/",
            data: {},
            headers: {
              Authorization: "Token " + state.accountModule.user.token,
            },
            method: "WATCH",
          },
        };

        let preorderRequestStr = JSON.stringify(preorderRequest);
        Vue.prototype.$socket.send(preorderRequestStr);

        let manualInvoiceRequest = {
          request: {
            endpoint:
              "cafe/" +
              state.accountModule.activeCafe.id +
              "/tables/join/simple/" +
              Enums.TableTokenTypes.PAYMENT_ONLY +
              "/",
            data: {},
            headers: {
              Authorization: "Token " + state.accountModule.user.token,
            },
            method: "WATCH",
          },
        };

        let manualInvoiceRequestStr = JSON.stringify(manualInvoiceRequest);
        Vue.prototype.$socket.send(manualInvoiceRequestStr);
      }

      let request = {
        request: {
          endpoint:
            "cafe/" + state.accountModule.activeCafe.id + "/printer/jobs/",
          data: {},
          headers: {
            Authorization: "Token " + state.accountModule.user.token,
          },
          method: "WATCH",
        },
      };

      let request_str = JSON.stringify(request);
      Vue.prototype.$socket.send(request_str);
    },
    SOCKET_ONCLOSE(state, event) {
      state.socket.isConnected = false;
      if (configs.debug) {
        console.log("socket closed");
      }
      cancelSocketBootstrapTimer();
      state.socket.pendingSources = [];
      if (hasCatalogData(state)) state.loadWholePage = false;
      state.loadWholePageMessage = i18n.t("loader.reconnectingToServer");
    },
    SOCKET_ONERROR(state, event) {
      if (hasCatalogData(state)) state.loadWholePage = false;
    },
    // default handler called for all methods
    SOCKET_ONMESSAGE(state, message) {
      state.socket.message = message;

      try {
        message = JSON.parse(message.data);
      } catch (error) {
        return;
      }
      if (!message || !message.message || typeof message.message.source !== "string") return;
      const cafeSource = message.message.source.match(/^cafe\.(\d+)\./);
      if (cafeSource && Number(cafeSource[1]) !== Number(state.accountModule.activeCafe.id)) return;
      if (configs.debug) {
        console.log("Socket Message");
        console.log(message);
      }
      state.lastUpdate = Date.now();

      if (message.message.status_code == 200) {
        if (message.type == "response") {
          if (state.tableAggRegExp.test(message.message.source)) {
            this.dispatch("tableModule/setTableAggregateData", message.message);
          } else if (state.tableDetailRegExp.test(message.message.source)) {
            this.dispatch("tableModule/setTableDetailData", message.message);
          } else if (state.cafePrinterJobRegExp.test(message.message.source)) {
            this.dispatch(
              "printerModule/handleCloudPrintJobs",
              message.message.data
            );
          } else if (
            state.cafePreorderTablesRegExp.test(message.message.source)
          ) {
            this.dispatch(
              "preorderModule/setPreorderData",
              message.message.data
            );
          } else if (
            state.cafeManualInvoiceTablesRegExp.test(message.message.source)
          ) {
            this.dispatch(
              "manualInvoiceModule/setManualInvoiceData",
              message.message.data
            );
          }
        }
      } else if (message.message.status_code == 404) {
        if (message.type == "response") {
          this.dispatch("tableModule/setTableAggregateData", message.message);
        }
      } else if (message.message.status == 400) {
        let request = {
          request: {
            endpoint:
              "cafe/" +
              state.accountModule.activeCafe.id +
              "/tables/join/simple/",
            data: {},
            headers: {
              Authorization: "Token " + state.accountModule.user.token,
            },
            method: "WATCH",
          },
        };

        let request_str = JSON.stringify(request);
        //console.log(request)
        //Vue.prototype.$socket.send(request_str)
      }
      if (message.type === "response") {
        finishSocketSnapshot(state, message.message.source, Number(message.message.status_code));
      }
    },
    // mutations for reconnect methods
    SOCKET_RECONNECT(state, count) {
      if (configs.debug) {
        console.log("socket reconnected");
        console.info("Socket reconnect attempt", count);
      }
      if (hasCatalogData(state)) state.loadWholePage = false;
      if (count == 2) {
        Toast.open({
          queue: false,
          message: "لطفا اتصال سیستم به اینترنت را چک کنید",
          type: "is-danger",
        });
      }
    },
    SOCKET_RECONNECT_ERROR(state) {
      cancelSocketBootstrapTimer();
      state.socket.reconnectError = true;
      state.loadWholePage = false;
    },

    /* Aside Mobile */
    asideMobileStateToggle(state, payload = null) {
      const htmlClassName = "has-aside-mobile-expanded";

      let isShow;

      if (payload !== null) {
        isShow = payload;
      } else {
        isShow = !state.isAsideMobileExpanded;
      }

      if (isShow) {
        document.documentElement.classList.add(htmlClassName);
      } else {
        document.documentElement.classList.remove(htmlClassName);
      }

      state.isAsideMobileExpanded = isShow;
    },
  },
  actions: {
    getOrCreateVAPIDKeys(context) {
      // window.storage.removeItem('VAPIDKeys')
      // context.state.VAPIDKeys = null

      if (!context.state.VAPIDKeys) {
        context.commit("setVAPIDKey", WebPush.generateVAPIDKeys());
      }

      return context.state.VAPIDKeys;
    },
    getBasicData: (context) => {
      if (!context.rootState.accountModule.activeCafe.id) return;
      cancelSocketBootstrapTimer();
      context.state.socket.pendingSources = [];
      context.rootState.tableModule.tables = null;
      context.rootState.menuModule.newMenu = false;
      context.rootState.productModule.newProduct = false;
      context.rootState.categoryModule.newCategory = false;
      context.dispatch("accountModule/getActiveCafeBasicInfo");
      context.dispatch("productModule/getProducts");
      context.dispatch("categoryModule/getCategories");
      context.dispatch("menuModule/getMenus");
      context.dispatch("tableModule/getTables");
      context.dispatch("groupModule/getGroups");
    },
  },
  getters: {
    isMobile: (state) => state.isMobile,
    tablesStatusSimple(state) {
      state.tables.forEach((element) => {});
    },
  },

  modules: {
    regionModule,
    manualInvoiceModule,
    notificationModule,
    SubscriptionModule,
    analyticsModule,
    preorderModule,
    categoryModule,
    productModule,
    printerModule,
    supportModule,
    accountModule,
    groupModule,
    tableModule,
    menuModule,
    postModule,
    cafeModule,
  },
});
