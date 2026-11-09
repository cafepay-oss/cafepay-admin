<template>
  <div>
    <hero-bar> {{ $t("invoices.invoices") }} </hero-bar>
    <section class="section is-main-section invoices">
      <ColorsGuide />
      <card-component
        class="has-table has-mobile-sort-spaced"
        :title="$t('invoices.activeInvoices')"
      >
        <InvoicesTable
          :activeInvoices="activeInvoicesWithProducts"
          @showTableDetail="handleTableSelected"
        />
      </card-component>
      <card-component
        v-if="activeInvoicesWithoutProducts.length > 0"
        class="has-table has-mobile-sort-spaced"
        :title="$t('invoices.emptyActiveInvoices')"
      >
        <InvoicesTable
          :activeInvoices="activeInvoicesWithoutProducts"
          @showTableDetail="handleTableSelected"
        />
      </card-component>
    </section>
  </div>
</template>

<script>
import InvoicesTable from "@/components/Management/Cafe/Invoices/InvoicesTable";
import CardComponent from "@/components/CardComponent";
import ColorsGuide from "@/components/ColorsGuide";
import HeroBar from "@/components/HeroBar";

export default {
  name: "Invoices",
  components: {
    InvoicesTable,
    CardComponent,
    ColorsGuide,
    HeroBar,
  },
  data() {
    return {
      
    };
  },
  methods: {
    handleTableSelected(table) {
      this.$store.commit("tableModule/setSelectedTable", table);
    }
  },
  computed: {
    activeInvoicesWithProducts() {
      return this.activeInvoices.filter(
        (invoice) => invoice.products.length > 0
      );
    },
    activeInvoicesWithoutProducts() {
      return this.activeInvoices.filter(
        (invoice) => invoice.products.length == 0 && !invoice.table.isMenuOnly
      );
    },
    activeInvoices() {
      let activeInvoices = this.$store.getters["tableModule/activeInvoices"];
      activeInvoices.forEach((invoice) => {
        if (invoice.paymentInfo.netAmount == 0 && invoice.state) {
          invoice.colorState = 3;
        } else if (invoice.paymentInfo.netAmount == 0 && !invoice.state) {
          invoice.colorState = 0;
        } else if (invoice.paymentInfo.netAmount != 0 && !invoice.state) {
          invoice.colorState = 1;
        } else if (invoice.paymentInfo.netAmount != 0 && invoice.state) {
          invoice.colorState = 2;
        }
      });
      return activeInvoices.sort((a, b) => a.colorState - b.colorState);
    },
  },
};
</script>

<style lang="sass" scoped>
</style>