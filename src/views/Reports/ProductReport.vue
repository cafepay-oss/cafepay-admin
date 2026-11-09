<template>
  <keep-alive>
    <div class="product-report">
      <div class="product-report__aside">
        <product-aside :reportConfig="reportConfig" />
      </div>
      <div class="product-report__body">
        <section class="section is-main-section"
            v-if="productsReportViewData">
          <b-button type="is-info" style="margin-bottom: 10px;" @click="printReport">
            چاپ
          </b-button>
          <b-table
            :data="productsReportViewData.productSalesDataArray"
            striped
            narrowed
            hoverable
            sticky-header
            bordered>

            <template slot-scope="props">
              <b-table-column label="عنوان" centered>
                  {{ props.row.product.name }}
              </b-table-column>

              <b-table-column label="تعداد" centered>
                  {{ props.row.payment_info.total_count }}
              </b-table-column>

              <b-table-column label="مبلغ کل" centered>
                  {{ props.row.payment_info.total_amount }}
              </b-table-column>

              <b-table-column label="پرداخت نقدی" centered>
                  {{ props.row.payment_info.payed_amount_cash }}
              </b-table-column>

              <b-table-column label="پرداخت کارتخوان" centered>
                  {{ props.row.payment_info.payed_amount_pos }}
              </b-table-column>

              <b-table-column label="پرداخت آنلاین" centered>
                  {{ props.row.payment_info.payed_amount_online }}
              </b-table-column>

              <b-table-column label="مجموع پرداخت ها" centered>
                  {{ props.row.payment_info.payed_amount }}
              </b-table-column>
              
              <b-table-column label="بازپرداخت" centered>
                  {{ props.row.payment_info.refund_amount }}
              </b-table-column>

              <b-table-column label="پرداخت شده" centered>
                  {{ props.row.payment_info.net_payed_amount }}
              </b-table-column>
            </template>

          </b-table>
        </section>
      </div>
    </div>
  </keep-alive>
</template>

<script>
import * as chartConfig from "@/components/Charts/chart.config";
import ProductsTable from "@/components/Management/Cafe/Products/ProductsTable";
import ProductAside from "@/components/Report/ProductAside.vue";
import CardComponent from "@/components/CardComponent";
import LineChart from "@/components/Charts/LineChart";
import BarChart from "@/components/Charts/BarChart";
import CardWidget from "@/components/CardWidget";
import Table from "@/components/Table";

export default {
  name: "product-report",
  components: {
    CardComponent,
    ProductsTable,
    ProductAside,
    CardWidget,
    LineChart,
    BarChart,
    Table,
  },
  data() {
    return {
      reportConfig: {
        startDate: null,
        endDate: null,
        startTime: null,
        endTime: null,
      },
      defaultChart: {
        chartData: null,
        extraOptions: chartConfig.chartOptionsMain,
      },
    };
  },
  mounted() {
    // this.fillChartData(this.$store.state.cafeModule.productsReport);
  },
  computed: {
    productsReportViewData() {
      let rawData = this.$store.state.cafeModule.productsReport;
      let cafeProducts = this.$store.state.productModule.products

      if(!rawData || !cafeProducts) {
        return null
      }

      let overallData = {
        "total_count": 0,
        "total_amount": 0,
        "payed_amount_pos": 0,
        "payed_amount_cash": 0,
        "payed_amount_online": 0,
        "refund_amount": 0,
        "net_payed_amount": 0,
        "net_amount": 0
      }
      let productSalesDataArray = []

      rawData.forEach(productSaleData => {
        if(productSaleData.payment_info.total_count > 0) {

          // set overallData
          for (const key in productSaleData.payment_info) {
            if (Object.hasOwnProperty.call(productSaleData.payment_info, key)) {
              overallData[key] += productSaleData.payment_info[key];
            }
          }

          // add to products
          let product = cafeProducts.find(p => p.id == productSaleData.product)
          if(product) {
            productSalesDataArray.push({
              product,
              payment_info: productSaleData.payment_info
            })
          }
        }
      });
      console.log(productSalesDataArray)
      return {
        overallData,
        productSalesDataArray
      }
    },
  },
  methods: {
    printReport(){
      this.printData({
        templateType: this.PrinterTemplateTypesEnum.REPORT,
        printerType: this.PrinterTypesEnum.CUSTOMER,
        data: Object.assign({
          reportConfig: this.reportConfig
        },this.productsReportViewData)
      })
    },
    deleteProduct(product) {
      this.$store.state.cafeModule.productsReport = this.productsReport.filter(
        (productReport) => productReport.id != product.id
      );
    },
    randomChartData(n) {
      let data = [];

      for (let i = 0; i < n; i++) {
        data.push(Math.round(Math.random() * 200));
      }

      return data;
    },
    fillChartData(data) {
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
      };

      this.defaultChart.chartData.datasets = [];
      data[0].forEach((product, index) => {
        this.defaultChart.chartData.datasets.push({
          id: product.pk,
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
          data: [],
        });
      });

      data.forEach((step, index) => {
        step.forEach((stepProduct) => {
          let relatedDataset = this.defaultChart.chartData.datasets.find(
            (dataset) => dataset.id == stepProduct.pk
          );

          relatedDataset.data.push(stepProduct.payment_info.total_count);
        });
      });

      this.defaultChart.chartData.labels = [];
      data.forEach((step, index) => {
        this.defaultChart.chartData.labels.push(index + 1);
      });
    },
  },
  watch: {
    productsReport: {
      deep: true,
      handler(newValue) {
        this.fillChartData(newValue);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
$aside-width: 17vw;

.card {
  z-index: 0;
}

.product-report {
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
