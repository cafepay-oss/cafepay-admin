<template>
  <div
    id="app"
    :class="{ en: locale == 'en-US', fa: locale == 'fa-IR' }"
    :dir="$t('dir')"
  >
    <WholePageLoader
      v-if="$store.state.loadWholePage"
      :message="$store.state.loadWholePageMessage"
    />
    <aside-menu v-if="!fullScreen" :menu="menu" />
    <button
      v-if="!fullScreen && $store.state.isAsideMobileExpanded"
      class="sidebar-backdrop"
      aria-label="بستن فهرست"
      @click="$store.commit('asideMobileStateToggle', false)"
    />
    <div class="app__body">
      <nav-bar v-if="!fullScreen" class="app__body__navbar" />
      <router-view class="app__body__content" />
    </div>

    <div v-if="tableSelected" class="table-detail-container" :class="{'full-width': $store.state.collapsedSidebar}">
      <table-detail
        @close="tableDetailDeactive"
        :tableDetail="tableSelected"
      ></table-detail>
    </div>

    <PrinterTemplate
      v-for="printTemplateData in printTemplateDatas"
      :printTemplateData="printTemplateData"
      :key="printTemplateData.uuid"
    />
    <NotificationsContainer v-if="notificationExist" />
  </div>
</template>

<script>
import NotificationsContainer from "@/components/Notification/NotificationsContainer.vue";
import TableDetail from "@/components/Management/Table/TableDetail";
import PrinterTemplate from "@/components/Printer/PrinterTemplate";
import WholePageLoader from "@/components/Loader/WholePageLoader";
import AsideMenu from "@/components/Navigation/AsideMenu";
import sidebarMenu from "@/javascripts/sidebarMenu.js";
import NavBar from "@/components/Navigation/NavBar";
import FooterBar from "@/components/FooterBar";
import configs from "./javascripts/config";
import Enums from "./models/Enums";
import Vue from "vue";

export default {
  name: "home",
  components: {
    NotificationsContainer,
    WholePageLoader,
    PrinterTemplate,
    TableDetail,
    FooterBar,
    AsideMenu,
    NavBar,
  },
  data() {
    return {
      menu: sidebarMenu.sidebarMenu,
      preloadedCafeId: null,
      tableTokenSignature: "",
    };
  },
  methods: {
    tableDetailDeactive() {
      this.$store.commit('tableModule/setSelectedTable', null);
    },
    setDefaultLocale() {
      if (!window.storage.getItem("default-locale")) {
        window.storage.setItem("default-locale", configs.defaultLocale);
      }

      const locale = window.storage.getItem("default-locale");
      Vue.prototype.moment.locale(locale);
      this.$i18n.locale = locale;
    },
    loadRouteData() {
      if (!this.activeCafe.id || this.preloadedCafeId !== this.activeCafe.id) return;
      const path = this.$route.path;
      if (path === "/region-prices") {
        if (!this.$store.state.regionModule.cities.length) {
          this.$store.dispatch("regionModule/getCities");
        }
      }
      if (path === "/region-prices" || path === "/preorder") {
        this.$store.dispatch("regionModule/getRegionPrices");
      }
    },
    setFilters() {
      Vue.filter("myCurrency", (value) => {
        return this.$options.filters.currency(value, {
          symbol: this.$t("vueCurrency.symbol"),
          thousandsSeparator: this.$t("vueCurrency.thousandsSeparator"),
          fractionCount: this.$t("vueCurrency.fractionCount"),
          fractionSeparator: this.$t("vueCurrency.fractionSeparator"),
          symbolPosition: this.$t("vueCurrency.symbolPosition"),
          symbolSpacing: this.$t("vueCurrency.symbolSpacing"),
          avoidEmptyDecimals: this.$t("vueCurrency.avoidEmptyDecimals"),
        });
      });
      Vue.filter("myCurrency2", (value) => {
        return this.$options.filters.currency(value, {
          symbol: this.$t("vueCurrency.symbol-2"),
          thousandsSeparator: this.$t("vueCurrency.thousandsSeparator-2"),
          fractionCount: this.$t("vueCurrency.fractionCount-2"),
          fractionSeparator: this.$t("vueCurrency.fractionSeparator-2"),
          symbolPosition: this.$t("vueCurrency.symbolPosition-2"),
          symbolSpacing: this.$t("vueCurrency.symbolSpacing-2"),
          avoidEmptyDecimals: this.$t("vueCurrency.avoidEmptyDecimals-2"),
        });
      });
    },
  },
  created() {
    this.setDefaultLocale();
    this.setFilters();

    let token = window.storage.getItem("token");
    if (token) {
      this.$store.commit("accountModule/setToken", token);
      this.$store.dispatch("accountModule/getUserCafeRelations");
    } else {
      this.$router.replace("/login");
    }
  },
  computed: {
    printTemplateDatas() {
      return this.$store.getters["printerModule/printTemplateDatas"];
    },
    fullScreen() {
      return this.$route.path == "/login" || this.$route.path == "/stores";
    },
    activeCafe() {
      return this.$store.state.accountModule.activeCafe;
    },
    fillProducts() {
      return (
        this.$store.state.productModule.newProduct &&
        this.$store.state.categoryModule.newCategory
      );
    },
    fillCategories() {
      return (
        this.$store.state.categoryModule.newCategory &&
        this.$store.state.menuModule.newMenu
      );
    },
    tables() {
      return this.$store.state.tableModule.tables;
    },
    socketReady() {
      return Boolean(this.activeCafe.id && this.tables && this.fillProducts);
    },
    locale() {
      return this.$i18n.locale;
    },
    tries() {
      return this.$store.state.tries;
    },
    notificationExist() {
      return this.$store.state.notificationModule.notifications.length > 0;
    },
    tableSelected() {
      return this.$store.state.tableModule.selectedTable
    }
  },
  watch: {
    fillProducts(newValue) {
      if (newValue) {
        this.$store.dispatch("categoryModule/fillProducts");
      }
    },
    fillCategories(newValue) {
      if (newValue) {
        this.$store.dispatch("menuModule/fillCategories");
      }
    },
    activeCafe(newValue) {
      const cafeId = newValue && newValue.id;
      if (cafeId === this.preloadedCafeId) return;
      this.preloadedCafeId = cafeId || null;
      this.tableTokenSignature = "";
      if (cafeId) {
        Vue.prototype.$disconnect();
        this.$store.state.loadWholePage = true;
        this.$store.state.loadWholePageMessage = this.$t(
          "loader.connectingToServer"
        );
        this.$store.dispatch("getBasicData");
        this.loadRouteData();
      } else {
        Vue.prototype.$disconnect();
      }
    },
    tables(newValue) {
      if (newValue && this.activeCafe.id) {
        const signature = this.activeCafe.id + ":" + newValue.map(table => table.id).sort().join(",");
        if (signature !== this.tableTokenSignature) {
          this.tableTokenSignature = signature;
          this.$store.dispatch("tableModule/getCafeTableTokens");
        } else {
          this.$store.commit("tableModule/setEachTableToken", this.$store.state.tableModule.cafeTableTokens);
        }
      }
    },
    "$route.path"() {
      this.loadRouteData();
    },
    socketReady(ready) {
      if (ready) Vue.prototype.$connect();
      else Vue.prototype.$disconnect();
    },
    locale(newValue) {
      Vue.prototype.moment.locale(newValue);
      window.storage.setItem("default-locale", newValue);
    },
    tries(newValue) {
      if (newValue > 5) {
        this.$buefy.toast.open({
          queue: false,
          duration: 3000,
          message: "لطفا اتصال سیستم به اینترنت را چک و سپس صفحه را رفرش کنید.",
          type: "is-danger",
        });
      }
    },
  },
};
</script>

<style lang="scss">
html {
  font-size: 15px !important;
}
#app {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;
  position: relative;
}

.app__body {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  &__content {
    height: 100%;
    overflow-y: auto;

    &::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
      box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
      background-color: #e6e6e6;
    }

    &::-webkit-scrollbar {
      width: 11px;
      background-color: #e6e6e6;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #adb0b4;
    }
  }
}

.notices ~ .en {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important;
  & *:not(i) {
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important;
  }
}
.notices ~ .fa {
  font-family: "Vazirmatn FD", sans-serif !important;
  & *:not(i) {
    font-family: "Vazirmatn FD", sans-serif !important;
  }
}

body > .en + .fa {
  background: #8f227b !important;
}

.snackbar {
  background: #006fb9 !important;
  color: rgb(243, 243, 243) !important;
  margin: 0.3em !important;

  & .text {
    font-size: 0.9em;
    margin-inline-start: auto;
  }

  & .action {
    background-color: #006fb9 !important;
    margin-inline-start: 0 !important;

    & .button {
      background: #006fb9 !important;
    }
  }
}

.vpd-input-group input {
  border: 1px solid #dadada !important;
}

.card {
  border-radius: 3px;
}

button {
  margin: 0;
  border-radius: 3px !important;
}

.green {
  background-color: rgb(173, 255, 177) !important;
}
.blue {
  background-color: rgb(200, 219, 255) !important;
}
.yellow {
  background-color: rgb(250, 255, 179) !important;
}
.red {
  background-color: rgb(255, 198, 196) !important;
}

.en {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important;
  & *:not(i) {
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important;
  }
}
.fa {
  font-family: "Vazirmatn FD", sans-serif !important;
  & *:not(i) {
    font-family: "Vazirmatn FD", sans-serif !important;
  }
}

.b-radio.radio {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-start;

  & > * {
    margin-inline-start: 10px !important;
  }
}

.b-tooltips {
  & .buttons.b-tooltip {
    margin-bottom: 0 !important;
  }
}

.table td,
.table th {
  vertical-align: middle !important;
}

strong {
  font-weight: 500 !important;
}

#analytics-line-chart {
  border-radius: 0 0 3px 3px;
}

.table-detail-container {
  position: fixed;
  left: 0;
  bottom: 0;
  right: 15rem;
  height: 81.5vh;
  z-index: 50;

  animation-name: footer-modal;
  animation-duration: 0.5s;
  animation-timing-function: ease-in-out;
}
.full-width {
  right: 0rem !important;
}

@keyframes footer-modal {
  0% {
    transform: translateY(200px);
  }
  80% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0);
  }
}

@import "./scss/responsive";
@import "./scss/ergonomics";
</style>
