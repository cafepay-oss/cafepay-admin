import { Line, mixins } from "vue-chartjs";

export default {
  name: "line-chart",
  extends: Line,
  mixins: [mixins.reactiveProp],
  props: {
    extraOptions: Object
  },
  computed: {
    // reactiveProp uses `options` when it recreates a chart after data arrives.
    options() {
      return this.extraOptions;
    }
  },
  mounted() {
    if (this.chartData && Array.isArray(this.chartData.datasets)) {
      this.renderChart(this.chartData, this.options);
    }
  }
};
