/* Styles */
import "@/scss/main.scss";
import "@mdi/font/css/materialdesignicons.css";
import "@/css/vazirmatn.css";

/* Core */
import Vue from "vue";
import Buefy from "buefy";
import mixin from "./mixin";
import moment from "moment";

import * as Sentry from "@sentry/vue";
import { Integrations } from "@sentry/tracing";

Sentry.init({
  Vue,
  dsn: process.env.VUE_APP_SENTRY_KEY,
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

moment.locale(i18n.locale)

Vue.prototype.moment = moment;
Vue.mixin(mixin);

/* Vue Currency Filter */
import VueCurrencyFilter from 'vue-currency-filter'
Vue.use(VueCurrencyFilter)

/* Router & Store */
import router from "./router";
import store from "./store";
store.dispatch("printerModule/getLocalPrinters")

/* Service Worker */
import "./registerServiceWorker";

/* Vue. Main component */
import App from "./App.vue";

/* Vue. Component in recursion */
import AsideMenuList from "@/components/Navigation/AsideMenuList";

/* Persian Date-Time Picker */
import VuePersianDatetimePicker from "vue-persian-datetime-picker";

/* Web Socket */
import VueNativeSock from "vue-native-websocket";
import config from "./javascripts/config"

Vue.use(VueNativeSock, config.socketURL + "ws/v1/", {
  connectManually: true,
  store: store,
  reconnection: true,
  reconnectionDelay: 3000
});

/* Printer */
import VueHtmlToPaper from "vue-html-to-paper";

import i18n from './i18n'

const options = {
  name: "_blank",
  specs: ["fullscreen=yes", "titlebar=yes", "scrollbars=yes"],
  styles: [
    "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css",
    "https://unpkg.com/kidlat-css/css/kidlat.css",
    "scss/cafepay/_printer.css"
  ]
};

Vue.use(VueHtmlToPaper, options);

/* Collapse mobile aside menu on route change */
router.afterEach(() => {
  store.commit("asideMobileStateToggle", false);
});
Vue.config.productionTip = false;

/* These components are used in recursion algorithm */
Vue.component("date-picker", VuePersianDatetimePicker);
Vue.component("AsideMenuList", AsideMenuList);

Vue.use(Buefy);

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount("#app");