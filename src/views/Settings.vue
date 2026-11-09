<template>
  <div>
    <hero-bar>
      {{ $t("settings.settings") }}
      <b-button
        :loading="isLoading"
        class="button is-info settings-hero-button"
        slot="right"
        @click="handlePrinterGroupsClicked()"
        >{{ $t("settings.printerGroups") }}</b-button
      >
      <b-button
        :loading="isLoading"
        class="button is-info settings-hero-button"
        slot="right"
        @click="addNewPrinter"
        >{{ $t("settings.newPrinter") }}</b-button
      >
    </hero-bar>
    <b-modal
      :active.sync="$store.state.printerModule.isNewPrinterModalActive"
      class="footer-modal"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <NewPrinterModal />
    </b-modal>
    <section class="section is-main-section">
      <card-component
        class="has-table has-mobile-sort-spaced"
        :title="$t('settings.printers')"
      >
        <div class="printers-setting">
          <PrintersTable />
        </div>
      </card-component>

      <card-component
        class="has-table has-mobile-sort-spaced"
        :title="$tc('settings.notification', 2)"
      >
        <div class="notifications">
          <NotificationsSettingTable />
        </div>
      </card-component>

      <card-component
        class="has-table has-mobile-sort-spaced"
        :title="$t('settings.otherSettings')"
      >
        <div class="other-settings">
          <div class="row">
            زبان / Language

            <b-field>
              <b-select v-model="$i18n.locale">
                <option value="en-US">en-US</option>
                <option value="fa-IR">fa-IR</option>
              </b-select>
            </b-field>
          </div>
          <div class="row">
            صفحه پیش فرض

            <b-field>
              <b-select v-model="defaultRoute" @input="setDefaultRoute">
                <option value="cafe-management">کافه داری</option>
                <option value="invoices">صورتحساب ها</option>
                <option value="preorder">پیش سفارش</option>
              </b-select>
            </b-field>
          </div>
        </div>
      </card-component>
    </section>
  </div>
</template>

<script>
import NotificationsSettingTable from "@/components/Settings/NotificationsSettingTable.vue"
import CustomersTable from "@/components/Management/Cafe/Customers/CustomersTable";
import NewPrinterModal from "@/components/Settings/NewPrinterModal";
import PrintersTable from "@/components/Settings/PrintersTable";
import CardComponent from "@/components/CardComponent";
import HeroBar from "@/components/HeroBar";
import webPush from "web-push";

export default {
  name: "Settings",
  components: {
    NotificationsSettingTable,
    NewPrinterModal,
    CustomersTable,
    CardComponent,
    PrintersTable,
    HeroBar,
  },
  data() {
    return {
      defaultRoute: window.storage.getItem("default-route"),
    };
  },
  methods: {
    setDefaultRoute(val) {
      this.defaultRoute = val;
      window.storage.setItem("default-route", val);
    },
    addNewPrinter() {
      this.$store.state.printerModule.isNewPrinterModalActive = true;
    },
    handlePrinterGroupsClicked() {
      this.$router.push("/printer-groups");
    },
    async generateAndStoreKeys() {
      let keys = await webPush.generateVAPIDKeys();
      window.storage.setItem("VAPIDKeys", JSON.stringify(keys));
      return keys;
    },

    async registerPush(sw, keys) {
      // registers a push notification subscription on the given service worker

      return await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keys.publicKey,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.printers-setting {
  padding: 20px;
}

.other-settings,
.notifications {
  margin: 1rem;
}

.row {
  display: flex;
  align-items: center;
  margin: 0.5rem 0;

  & > * {
    margin-inline-start: 2rem;
  }
}

.settings-hero-button {
  margin-inline-start: 0.2rem;
}
</style>
