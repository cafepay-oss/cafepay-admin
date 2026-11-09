<template>
  <div>
    <hero-bar> {{ $t("analysis.analysis") }} </hero-bar>
    <div class="analysis">
      <div class="analysis__analysis-card-container">
        <AnalysisCard
          icon="account"
          color="green-background"
          :title="$tc('primary.customer', 2)"
          :numericalResult="$store.state.analyticsModule.newCustomersData.total"
          numericalResultPrefix=""
          :numericalResultPostfix="$t('analysis.person')"
          storeAction="analyticsModule/getNewCustomers"
          :chartData="[
            $store.state.analyticsModule.newCustomersData.reports,
            $store.state.analyticsModule.newCustomersDataPrev.reports
          ]"
          mutation="setNewCustomersData"
          prevMutation="setNewCustomersDataPrev"
        />
      </div>
      <div class="analysis__analysis-card-container">
        <AnalysisCard
          icon="cash"
          color="red-background"
          :title="$t('analysis.sales')"
          :numericalResult="$options.filters.myCurrency($store.state.analyticsModule.salesData.total)"
          numericalResultPrefix=""
          numericalResultPostfix=""
          storeAction="analyticsModule/getSales"
          :chartData="[
            $store.state.analyticsModule.salesData.reports,
            $store.state.analyticsModule.salesDataPrev.reports
          ]"
          mutation="setSalesData"
          prevMutation="setSalesDataPrev"
        />
      </div>
      <div class="analysis__analysis-card-container">
        <AnalysisCard
          icon="receipt"
          color="blue-background"
          :title="$tc('primary.order', 2)"
          :numericalResult="$store.state.analyticsModule.ordersData.total"
          numericalResultPrefix=""
          :numericalResultPostfix="$tc('primary.item', $store.state.analyticsModule.ordersData.total)"
          storeAction="analyticsModule/getOrders"
          :chartData="[
            $store.state.analyticsModule.ordersData.reports,
            $store.state.analyticsModule.ordersDataPrev.reports
          ]"
          mutation="setOrdersData"
          prevMutation="setOrdersDataPrev"
        />
      </div>
    </div>
  </div>
</template>

<script>
import AnalysisCard from "@/components/Analysis/AnalyticsCardv2.vue";
import HeroBar from "@/components/HeroBar";

export default {
  name: "Analysis",
  components: {
    AnalysisCard,
    HeroBar
  },
  data() {
    return {};
  }
};
</script>

<style scoped lang="scss">
.analysis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(24rem, 1fr));
  gap: 1.25rem;
  padding: 1.25rem;
  width: 100%;

  &__analysis-card-container {
    min-width: 0;
    width: 100%;
  }
}
@media (max-width: 767px) {
  .analysis { grid-template-columns: minmax(0, 1fr); padding: 1rem; }
}
</style>
