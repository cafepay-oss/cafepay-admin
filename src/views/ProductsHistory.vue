<template>
  <div class="products-history">
    <hero-bar>{{ $t("productsHistory.productsHistory") }}</hero-bar>
    <section class="section is-main-section">
      <CardComponent
        class="card"
        :title="$t('productsHistory.productsHistory')"
        headerIcon="mdi mdi-refresh"
        @header-icon-click="getCafeProductsHistory"
      >
        <b-table
          :loading="isLoading"
          :data="cafeProductsHistory"
          :columns="columns"
          striped
          hoverable
          :paginated="true"
          :per-page="page_size"
          :total="$store.state.cafeModule.cafeProductsHistoryCount"
          backend-pagination
          :current-page.sync="current_page"
        >
          <template slot="footer">
            <b-select v-model="page_size">
              <option value="5">5 {{ $t("primary.perPage") }}</option>
              <option value="10">10 {{ $t("primary.perPage") }}</option>
              <option value="15">15 {{ $t("primary.perPage") }}</option>
              <option value="20">20 {{ $t("primary.perPage") }}</option>
            </b-select>
          </template>
        </b-table>
      </CardComponent>
    </section>
  </div>
</template>

<script>
import CardComponent from "@/components/CardComponent";
import HeroBar from "@/components/HeroBar";

export default {
  name: "products-histroy",
  components: {
    CardComponent,
    HeroBar,
  },
  data() {
    return {
      columns: [
        {
          field: "name",
          label: this.$tc("primary.product", 2),
          width: "400",
          searchable: true,
          sortable: true,
        },
        {
          field: "price",
          label: this.$t("primary.price"),
          width: "100",
          centered: true,
          sortable: true,
        },
        {
          field: "soldCount",
          label: this.$t("productsHistory.totalCount"),
          centered: true,
          sortable: true,
        },
        {
          field: "totalAmount",
          label: this.$t("productsHistory.totalAmount"),
          centered: true,
          sortable: true,
        },
        {
          field: "payedAmount",
          label: this.$t("productsHistory.totalEarned"),
          centered: true,
          sortable: true,
        },
      ],
      page_size: 10,
      total: 100,
      current_page: 1,
    };
  },
  computed: {
    cafeProductsHistory() {
      let data = [];

      this.$store.state.cafeModule.cafeProductsHistory.forEach((history) => {
        data.push({
          name: history.name,
          soldCount:
            history.payment_info.total_count +
            " " +
            this.$tc("primary.item", history.payment_info.total_count),
          totalAmount: this.$options.filters.myCurrency2(history.payment_info.total_amount),
          payedAmount: this.$options.filters.myCurrency2(history.payment_info.net_payed_amount),
          netAmount: this.$options.filters.myCurrency2(history.payment_info.net_amount),
          refundAmound: this.$options.filters.myCurrency2(history.payment_info.refund_amount),
          price: this.$options.filters.myCurrency2(history.original_price),
        });
      });

      return data;
    },
  },
  watch: {
    page_size() {
      this.$store.dispatch("cafeModule/getCafeProductsHistory", {
        page: this.current_page,
        page_size: this.page_size,
      });
    },
    current_page() {
      this.$store.dispatch("cafeModule/getCafeProductsHistory", {
        page: this.current_page,
        page_size: this.page_size,
      });
    },
  },
  methods: {
    getCafeProductsHistory() {
      this.$store.dispatch("cafeModule/getCafeProductsHistory");
    },
  },
  mounted() {
    this.getCafeProductsHistory();
  },
};
</script>
