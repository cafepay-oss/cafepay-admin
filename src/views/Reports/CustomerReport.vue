<template>
  <keep-alive>
    <span>

    <div class="customer-report">
      <div class="customer-report__aside">
        <CustomerAside />
      </div>
      <div class="customer-report__body">
        <section class="section is-main-section">
          <CardComponent class="has-table has-mobile-sort-spaced" v-if="customersReport" :title="$tc('primary.customer', 2)">
            <CustomersReportTable :datas="customersReport" />
          </CardComponent>
        </section>
      </div>
    </div>
    </span>
  </keep-alive>
</template>

<script>
import CustomersReportTable from "@/components/Report/CustomersReportTable.vue";
import CustomerAside from "@/components/Report/CustomerAside.vue";
import CardComponent from "@/components/CardComponent";

export default {
  name: "CustomersReport",
  components: {
    CustomersReportTable,
    CustomerAside,
    CardComponent,
  },
  data() {
    return {};
  },
  computed: {
    customersReport() {
      return this.$store.state.cafeModule.customersReport;
    },
  },
};
</script>

<style lang="scss" scoped>
$aside-width: 17vw;

.card {
  z-index: 0;
}

.customer-report {
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