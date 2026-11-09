<template>
  <div>
    <div class="section-header">
      <h1>{{ title }}</h1>
    </div>
    <section class="section">
      <card-component>
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
    </section>
  </div>
</template>

<script>
import LineChart from "@/components/Charts/LineChart";
import * as chartConfig from "@/components/Charts/chart.config";
import CardComponent from "@/components/CardComponent";

export default {
  name: "report",
  components: {
    LineChart,
    CardComponent
  },
  data() {
    return {
      defaultChart: {
        chartData: null,
        extraOptions: chartConfig.chartOptionsMain
      }
    };
  },
  props: {
    title: {
      type: String,
      default: null
    }
  },
  computed: {},
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
            pointRadius: 6,
            data: this.randomChartData(9)
          }
        ],
        labels: ["01", "02", "03", "04", "05", "06", "07", "08", "09"]
      };
    }
  }
};
</script>

<style lang="sass" scoped>


.section-header
    text-align: center
    padding-top: 1rem
    h1
        font-size: 1.2rem

.section
  padding-top: 1rem 

</style>