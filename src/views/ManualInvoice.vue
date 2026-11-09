<template>
  <div class="manualInvoice">
    <hero-bar>
      {{ $t("manualInvoices.manualInvoices") }}
      <b-button
        :loading="isLoading"
        class="button is-info"
        slot="right"
        @click="addManualInvoice()"
        >{{ $t("manualInvoices.newManualInvoice") }}</b-button
      >
    </hero-bar>

    <b-modal
      :active.sync="$store.state.manualInvoiceModule.isManualInvoiceModalActive"
      class="footer-modal"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <ManualInvoiceModal />
    </b-modal>

    <section class="section is-main-section" v-if="manualInvoices">
      <CardComponent
        class="has-table has-mobile-sort-spaced"
        v-if="manualInvoices.payedManualInvoices.length > 0"
        :title="$t('manualInvoices.payedManualInvoices')"
      >
        <ManualInvoicesTable
          :manualInvoices="manualInvoices.payedManualInvoices"
          @showTableDetail="handleTableSelected"
        />
      </CardComponent>
      <CardComponent
        class="has-table has-mobile-sort-spaced"
        v-if="manualInvoices.notPayedManualInvoices.length > 0"
        :title="$t('manualInvoices.notPayedManualInvoices')"
      >
        <ManualInvoicesTable
          :manualInvoices="manualInvoices.notPayedManualInvoices"
          @showTableDetail="handleTableSelected"
        />
      </CardComponent>
    </section>

    <div v-if="tableDetailActive" class="table-detail">
      <table-detail
        @close="tableDetailDeactive"
        :tableDetail="selectedTable"
      ></table-detail>
    </div>
  </div>
</template>

<script>
import ManualInvoicesTable from "@/components/Management/Cafe/ManualInvoices/ManualInvoicesTable";
import ManualInvoiceModal from "@/components/Management/Cafe/ManualInvoices/ManualInvoiceModal";
import TableDetail from "@/components/Management/Table/TableDetail";
import CardComponent from "@/components/CardComponent";
import ModalBox from "@/components/ModalBox";
import HeroBar from "@/components/HeroBar";

export default {
  name: "ManualInvoice",
  components: {
    ManualInvoicesTable,
    CardComponent,
    ManualInvoiceModal,
    TableDetail,
    ModalBox,
    HeroBar,
  },
  data() {
    return {
      tableDetailActive: false,
      selectedTable: null,
    };
  },
  methods: {
    addManualInvoice() {
      this.$store.state.manualInvoiceModule.isManualInvoiceModalActive = true;
    },
    handleTableSelected(table) {
      this.selectedTable = table;
      this.tableDetailActive = true;
    },
    tableDetailDeactive() {
      this.selectedTable = null;
      this.tableDetailActive = false;
    },
  },
  computed: {
    manualInvoices() {
      return this.$store.getters["manualInvoiceModule/getManualInvoicesV2"];
    },
  },
};
</script>

<style lang="scss" scoped>
.table-detail {
  position: sticky;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 80vh;
  z-index: 50;

  animation-name: footer-modal;
  animation-duration: 0.5s;
  animation-timing-function: ease-in-out;
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
</style>