<template>
  <keep-alive>
    <div class="invoice-report">
      <div class="invoice-report__aside">
        <InvoiceAside />
      </div>
      <div class="invoice-report__body">
        <section class="section is-main-section">
          <CardComponent
            v-if="invoicesReport"
            :title="$t('invoiceReports.overallData')"
          >
            <InvoiceReportOverall :datas="invoicesReport" />
          </CardComponent>
          <CardComponent
          class="has-table has-mobile-sort-spaced"
            v-if="invoicesReport"
            :title="$t('invoiceReports.transactions', {count: invoicesReport.count})"
          >
            <InvoiceReportTable :datas="invoicesReport" />
          </CardComponent>
        </section>
      </div>
    </div>
  </keep-alive>
</template>

<script>
import InvoiceReportOverall from "@/components/Report/InvoiceReportOverall.vue";
import InvoiceAside from "@/components/Report/InvoiceAside.vue";
import InvoiceReportTable from "@/components/Report/InvoiceReportTable.vue";
import CardComponent from "@/components/CardComponent";

export default {
  name: "InvoiceReport",
  components: {
    InvoiceReportOverall,
    InvoiceReportTable,
    CardComponent,
    InvoiceAside,
  },
  data() {
    return {};
  },
  computed: {
    invoicesReport() {
      return this.$store.state.cafeModule.invoicesReport;
    },
  },
};
</script>

<style lang="scss" scoped>
$aside-width: 17vw;

.card {
  z-index: 0;
}

.invoice-report {
  display: flex;

  &__aside {
    position: relative;
    min-width: 240px;
    width: $aside-width;
  }

  &__body {
    width: 100%;

    &__tags {
      display: flex;
      text-align: start;
      flex-wrap: wrap;
      align-items: flex-start;
      margin-bottom: 1rem;
      width: clac(100% - 240);

      & > .tags {
        margin: 3px;
      }
    }
  }
}
</style>