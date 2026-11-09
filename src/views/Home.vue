<template>
  <div>
    <hero-bar :has-right-visible="false">داشبورد</hero-bar>
    <section class="section is-main-section">
      <tiles>
        <card-widget
          class="tile is-child"
          type="is-primary"
          icon="account-multiple"
          :number="52"
          label="مشتریان جدید"
        />
        <card-widget
          class="tile is-child"
          type="is-info"
          icon="cart-outline"
          :number="720000"
          label="فروش کل "
        />
        <card-widget
          class="tile is-child"
          type="is-success"
          icon="chart-timeline-variant"
          :number="256"
          suffix="%"
          label="بازده کل"
        />
      </tiles>

      <card-component
        title="نمودار بازده"
        @header-icon-click="fillChartData"
        icon="finance"
        header-icon="reload"
      >
        <div v-if="defaultChart.chartData" class="chart-area">
          <line-chart
            style="height: 100%"
            ref="bigChart"
            chart-id="big-line-chart"
            :chart-data="defaultChart.chartData"
            :extra-options="defaultChart.extraOptions"
          ></line-chart>
        </div>
      </card-component>
      <!--
      <card-component title="Clients" class="has-table has-mobile-sort-spaced">
        <products-table data-url="/data-sources/clients.json" />
      </card-component>-->
    </section>
  </div>
</template>

<script>
// @ is an alias to /src
import * as chartConfig from "@/components/Charts/chart.config";
import HeroBar from "@/components/HeroBar";
import Tiles from "@/components/Tiles";
import CardWidget from "@/components/CardWidget";
import CardComponent from "@/components/CardComponent";
import LineChart from "@/components/Charts/LineChart";
import ProductsTable from "@/components/Management/Cafe/Products/ProductsTable";
export default {
  name: "home",
  components: {
    ProductsTable,
    LineChart,
    CardComponent,
    CardWidget,
    Tiles,
    HeroBar,
  },
  data() {
    return {
      defaultChart: {
        chartData: null,
        extraOptions: chartConfig.chartOptionsMain,
      },
    };
  },
  computed: {
    titleStack() {
      return ["Admin", "Dashboard"];
    },
  },
  created() {
    let token = window.storage.getItem("token");
    if(token) {
      this.$router.replace(
        window.storage.getItem('default-route') ? window.storage.getItem('default-route')
          : (this.isMobile ? 'invoices' : 'cafe-management')
      )
    }
  },
  mounted() {
    this.fillChartData();
  },
  methods: {
    randomChartData(n) {
      let data = [];

      for (let i = 0; i < n; i++) {
        data.push(Math.round(Math.random() * 200));
      }

      return data;
    },
    fillChartData() {
      this.defaultChart.chartData = {
        datasets: [
          {
            fill: false,
            borderColor: chartConfig.chartColors.default.primary,
            borderWidth: 2,
            borderDash: [],
            borderDashOffset: 0.0,
            pointBackgroundColor: chartConfig.chartColors.default.primary,
            pointBorderColor: "rgba(255,255,255,0)",
            pointHoverBackgroundColor: chartConfig.chartColors.default.primary,
            pointBorderWidth: 20,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 15,
            pointRadius: 4,
            data: this.randomChartData(9),
          },
          {
            fill: false,
            borderColor: chartConfig.chartColors.default.info,
            borderWidth: 2,
            borderDash: [],
            borderDashOffset: 0.0,
            pointBackgroundColor: chartConfig.chartColors.default.info,
            pointBorderColor: "rgba(255,255,255,0)",
            pointHoverBackgroundColor: chartConfig.chartColors.default.info,
            pointBorderWidth: 20,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 15,
            pointRadius: 4,
            data: this.randomChartData(9),
          },
          {
            fill: false,
            borderColor: chartConfig.chartColors.default.danger,
            borderWidth: 2,
            borderDash: [],
            borderDashOffset: 0.0,
            pointBackgroundColor: chartConfig.chartColors.default.danger,
            pointBorderColor: "rgba(255,255,255,0)",
            pointHoverBackgroundColor: chartConfig.chartColors.default.danger,
            pointBorderWidth: 20,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 15,
            pointRadius: 4,
            data: this.randomChartData(9),
          },
        ],
        labels: ["01", "02", "03", "04", "05", "06", "07", "08", "09"],
      };
    },
  },
};
</script>
