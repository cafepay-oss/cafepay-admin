<template>
  <!-- <div> -->
  <div style="display: none">
      <template v-if="printTemplateData">
        <template v-if="printTemplateData.type == PrinterTemplateTypesEnum.KITCHEN">
          <kitchen-six-printer
              v-if="printTemplateData.width == PrinterWidthEnum.SIX_CM"
                :printTemplateData="printTemplateData"
              />
          <kitchen-seven-printer
              v-else-if="printTemplateData.width == PrinterWidthEnum.SEVEN_CM"
                :printTemplateData="printTemplateData"
              />
          <kitchen-eight-printer
              v-else
                :printTemplateData="printTemplateData"
              />
        </template>
        <template v-else-if="printTemplateData.type == PrinterTemplateTypesEnum.CUSTOMER">
          <customer-six-printer
              v-if="printTemplateData.width == PrinterWidthEnum.SIX_CM"
                :printTemplateData="printTemplateData"
              />
          <customer-eight-printer
              v-else
                :printTemplateData="printTemplateData"
              />
        </template>
        <template v-else-if="printTemplateData.type == PrinterTemplateTypesEnum.REPORT">
          <report-six-printer
              v-if="printTemplateData.width == PrinterWidthEnum.SIX_CM"
                :printTemplateData="printTemplateData"
              />
          <report-eight-printer
              v-else
                :printTemplateData="printTemplateData"
              />
        </template>
      </template>
  </div>
</template>

<script>
import CustomerSixPrinter from './CustomerSixPrinter.vue'
import CustomerEightPrinter from './CustomerEightPrinter.vue'
import KitchenSixPrinter from './KitchenSixPrinter.vue'
import KitchenSevenPrinter from './KitchenSevenPrinter.vue'
import KitchenEightPrinter from './KitchenEightPrinter.vue'
import ReportSixPrinter from './ReportSixPrinter.vue'
import ReportEightPrinter from './ReportEightPrinter.vue'
export default {
  components: { ReportSixPrinter, ReportEightPrinter, KitchenSixPrinter, KitchenSevenPrinter, KitchenEightPrinter, CustomerSixPrinter, CustomerEightPrinter },
  props: ['printTemplateData']
}
</script>

<style scoped>

</style>