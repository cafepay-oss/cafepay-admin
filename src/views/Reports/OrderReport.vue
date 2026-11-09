<template>
  <keep-alive>
    <div class="order-report">
      <div class="order-report__aside">
        <OrderAside />
      </div>
      <div class="order-report__body">
        <section class="section is-main-section">
          <card-component class="has-table has-mobile-sort-spaced" v-if="ordersReport" :title="$tc('primary.order', 2)">
            <OrdersReportTable :datas="ordersReport" />
          </card-component>
        </section>
      </div>
    </div>
  </keep-alive>
</template>

<script>
import OrderAside from "@/components/Report/OrderAside.vue";
import CardComponent from "@/components/CardComponent";
import OrdersReportTable from "@/components/Report/OrdersReportTable.vue";

export default {
  name: "orders-report",
  components: {
    OrdersReportTable,
    CardComponent,
    OrderAside,
  },
  data() {
    return {};
  },
  computed: {
    ordersReport() {
      if (!this.$store.state.cafeModule.ordersReport) return null;
      if (this.$store.state.productModule.products.length > 0) {

        let ordersReport = this.$store.state.cafeModule.ordersReport.results;
  
        /* set order customers string */
        ordersReport.forEach((report) => {
          let scanned = report.scanned.reduce((acc, curr) => {
            return curr.user_profile.full_name + " - " + acc;
          }, "");

          if (scanned.length < 3) {
            scanned = report.cafe.name + " - ";
          }
          report.customers = scanned
        });

        /* set order products string */
        ordersReport.forEach((report) => {
          report.products_str = "";
          report.bill_products.forEach((bill_product) => {
            let relatedProduct = this.$store.state.productModule.products.find(
              (product) => product.id == bill_product.product
            );
            report.products_str +=
              relatedProduct.name + " (" + bill_product.count + ") - ";
          });
          report.products_str = report.products_str.slice(
            0,
            report.products_str.length - 2
          );
        });
  
        /* set order invoices */
        ordersReport.forEach((report) => {
          report.invoices = [];
          report.bill_products.forEach((bill_product) => {
            report.invoices = report.invoices.concat(bill_product.invoices);
          });
        });
  
        /* set order payment methods */
        ordersReport.forEach((report) => {
          report.methods = [];
          report.invoices.forEach((invoice) => {
            report.methods.push(invoice.method);
          });
  
          report.methods_str = "";
          if (report.methods.includes("0")) {
            report.methods_str += this.$t('primary.online') + " - ";
          }
          if (report.methods.includes("1")) {
            report.methods_str += this.$t('primary.POS') + " - ";
          }
          if (report.methods.includes("2")) {
            report.methods_str += this.$t('primary.cash') + " - ";
          }
          if (report.methods.includes("4")) {
            report.methods_str += this.$t('primary.discount') + " - ";
          }
          if (report.methods_str.length)
            report.methods_str = report.methods_str.slice(
              0,
              report.methods_str.length - 2
            );
        });
  
        return ordersReport;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
$aside-width: 17vw;

.card {
  z-index: 0;
}

.order-report {
  display: flex;

  &__aside {
    position: relative;
    min-width: 240px;
    width: $aside-width;
  }

  &__body {
    width: 100%;
  }
}
</style>