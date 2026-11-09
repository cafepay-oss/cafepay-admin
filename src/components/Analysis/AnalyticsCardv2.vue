<template>
  <div class="analytics-card shadow-lg card">
    <div class="analytics-card__top">
      <div class="analytics-card__top--right">
        <span class="analytics-card__icon" :class="color">
          <b-icon :icon="icon" :type="typeSetter()"></b-icon>
        </span>
        <h3 class="analytics-card__title">
          {{ title }}
        </h3>
      </div>
      <div class="analytics-card__top--left">
        <h2 class="analytics-card__numerical-result">{{ numericalResult }}<span> {{ numericalResultPostfix }} </span></h2>
        <b-field>
          <b-select v-model="selectedPeriod" size="is-small">
            <option v-for="option in periods" :value="option" :key="option.id">
              {{ option.title }}
            </option>
          </b-select>
        </b-field>
        <b-field>
          <b-select v-model="selectedScale" size="is-small">
            <option
              v-for="option in selectedPeriod.scales"
              :value="option"
              :key="option.id"
            >
              {{ option.title }}
            </option>
          </b-select>
        </b-field>
      </div>
    </div>
    <div class="analytics-card__bottom">
      <line-chart
        style="height: 150px;"
        ref="bigChart"
        chart-id="analytics-line-chart"
        :chart-data="defaultChart.chartData"
        :extra-options="defaultChart.extraOptions"
      ></line-chart>
    </div>

    <button v-if="newData" type="button" class="analytics-card__update" @click="handleUpdateAnalyticsClicked">
      <b-icon icon="refresh" size="is-small" aria-hidden="true"></b-icon>
      <span>اعمال تغییرات</span>
    </button>
  </div>
</template>

<script>
import * as chartConfig from "@/components/Charts/chart.config";
import LineChart from "@/components/Charts/LineChart";

export default {
  name: "AnalyticsCard",
  components: {
    LineChart
  },
  data() {
    return {
      defaultChart: {
        chartData: null,
        extraOptions: {
          ...chartConfig.chartOptionsMain,
          legend: {
            display: true,
            position: "bottom",
            labels: {
              usePointStyle: true,
              fontColor: "#263445",
              fontFamily: "Vazirmatn FD",
              fontSize: 12,
              boxWidth: 12,
              padding: 16
            }
          }
        }
      },
      newData: false,
      selectedPeriod: {},
      selectedScale: {},
      periods: [
        {
          id: 0,
          title: this.$t("analysis.week"),
          days: 7,
          scales: [
            {
              id: 0,
              title: this.$t("analysis.daily"),
              hours: 24 *  1
            }
          ]
        },
        {
          id: 1,
          title: this.$t("analysis.month"),
          days: 30,
          scales: [
            {
              id: 0,
              title: this.$t("analysis.daily"),
              hours: 24 * 1
            },
            {
              id: 1,
              title: this.$t("analysis.weekly"),
              hours: 24 *  7
            }
          ]
        },
        {
          id: 2,
          title: this.$t("analysis.year"),
          days: 365,
          scales: [
            {
              id: 0,
              title: this.$t("analysis.weekly"),
              hours: 24 *  7
            },
            {
              id: 1,
              title: this.$t("analysis.monthly"),
              hours: 24 *  30
            },
            {
              id: 2,
              title: this.$t("analysis.seasonally"),
              hours: 24 *  90
            }
          ]
        }
      ]
    };
  },
  props: {
    color: {},
    icon: {
      required: true
    },
    title: {
      required: true
    },
    numericalResult: {},
    numericalResultPrefix: {},
    numericalResultPostfix: {},
    storeAction: {
      type: String,
      required: true
    },
    chartData: {},
    mutation: {},
    prevMutation: {}
  },
  computed: {
    labels() {
      const periods = Array.isArray(this.chartData) ? this.chartData : [];
      const length = Math.max(0, ...periods.map(period => Array.isArray(period) ? period.length : 0));
      return Array.from({ length }, () => "");
    }
  },
  mounted() {
    this.selectedPeriod = this.periods[0];
    this.selectedScale = this.selectedPeriod.scales[0];
    if (!Array.isArray(this.chartData) || !Array.isArray(this.chartData[0])) {
      this.getData();
    }
    this.fillChartData()
  },
  watch: {
    selectedPeriod(newValue, oldValue) {
      if (oldValue.title) {
        this.newData = true;
        this.selectedScale = this.selectedPeriod.scales[0]
      }
    },
    selectedScale(newValue, oldValue) {
      if (oldValue.title) {
        this.newData = true;
      }
    },
    chartData: {
      deep: true,
      handler() {
        this.fillChartData()
      }
    }
  },
  methods: {
    handleUpdateAnalyticsClicked() {
      this.getData();
      this.newData = false;
    },
    getData() {
      this.$store.dispatch(this.storeAction, {
        end_datetime: this.moment().locale("en").format("YYYY-MM-DDTHH:mm"),
        start_datetime: this.moment()
          .locale("en")
          .subtract(this.selectedPeriod.days, "days")
          .format("YYYY-MM-DDTHH:mm"),
        step: this.selectedScale.hours,
        mutation: this.mutation
      });
      
      this.$store.dispatch(this.storeAction, {
        end_datetime: this.moment()
          .locale("en")
          .subtract(this.selectedPeriod.days, "days")
          .format("YYYY-MM-DDTHH:mm"),
        start_datetime: this.moment()
          .locale("en")
          .subtract(2 * this.selectedPeriod.days, "days")
          .format("YYYY-MM-DDTHH:mm"),
        step: this.selectedScale.hours,
        mutation: this.prevMutation
      });
    },
    typeSetter() {
      if (this.color == "green-background") return "is-success";
      if (this.color == "red-background") return "is-secondary";
      if (this.color == "blue-background") return "is-info";
      if (this.color == "yellow-background") return "is-warning";
    },
    fillChartData() {
      const periods = Array.isArray(this.chartData) ? this.chartData : [];
      this.defaultChart.chartData = {
        datasets: [
          {
            label: "بازهٔ فعلی",
            fill: false,
            borderColor: chartConfig.chartColors.default.primary,
            backgroundColor: chartConfig.chartColors.default.primary,
            borderWidth: 2,
            borderDash: [],
            pointStyle: "circle",
            pointBackgroundColor: chartConfig.chartColors.default.primary,
            pointBorderColor: chartConfig.chartColors.default.primary,
            pointBorderWidth: 1,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 2,
            pointRadius: 4,
            data: Array.isArray(periods[0]) ? periods[0] : []
          },
          {
            label: "بازهٔ قبلی",
            fill: false,
            borderColor: chartConfig.chartColors.default.info,
            backgroundColor: "#ffffff",
            borderWidth: 2,
            borderDash: [6, 4],
            pointStyle: "triangle",
            pointBackgroundColor: "#ffffff",
            pointBorderColor: chartConfig.chartColors.default.info,
            pointBorderWidth: 2,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 2,
            pointRadius: 4,
            data: Array.isArray(periods[1]) ? periods[1] : []
          }
        ],
        labels: this.labels
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.card {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
}

.analytics-card {
  background-color: #ffffff;
  position: relative;
  border: 0;

  &__top {
    padding: 1em 1em 0.1em;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1rem;

    &--right {
      flex: 1 1 10rem;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    &--left {
      flex: 1 1 12rem;
      min-width: 0;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;

      align-items: center;

      & > * {
        margin: .25rem;
      }
    }
  }

  &__icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;

    background-image: radial-gradient(
      rgba(0, 188, 201, 0.37),
      rgba(255, 255, 255, 0)
    );

    margin-inline-start: 0.5em;
    margin-top: 0.2em;
    padding: 0.5em;
    border-radius: 100%;
  }

  &__title {
    margin-inline-start: 0.5em;
    margin-top: 0.3em;
    font-size: 1.3rem;
    font-weight: 500;
  }

  &__numerical-result {
    flex-basis: 100%;
    text-align: center;
    overflow-wrap: anywhere;
    font-size: 1.3rem;
    font-weight: 500;
  }

  &__update {
    display: inline-flex;
    align-items: center;
    gap: .4rem;
    min-height: 2.75rem;
    margin: .5rem 1rem 1rem;
    padding: .5rem .75rem;
    border: 1px solid #116149;
    border-radius: .4rem;
    background: #116149;
    color: #fff;
    font: inherit;
    cursor: pointer;
  }
}

@media (max-width: 767px) {
  .analytics-card__top--right { flex-direction: row; align-items: center; }
}

.green-background {
  background-image: radial-gradient(
    rgba(0, 201, 33, 0.3),
    rgba(255, 255, 255, 0)
  );
}
.red-background {
  background-image: radial-gradient(
    rgba(201, 0, 0, 0.3),
    rgba(255, 255, 255, 0)
  );
}
.blue-background {
  background-image: radial-gradient(
    rgba(0, 127, 201, 0.3),
    rgba(255, 255, 255, 0)
  );
}
.yellow-background {
  background-image: radial-gradient(
    rgba(201, 198, 0, 0.3),
    rgba(255, 255, 255, 0)
  );
}
</style>
