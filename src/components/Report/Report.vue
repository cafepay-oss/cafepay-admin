<template>
  <div>
    <div class="section-header">
      <h1>{{ title }}</h1>
    </div>
    <report-date-time-picker></report-date-time-picker>
    <report-chart title="نمودار"></report-chart>
    
  </div>
</template>

<script>
import ReportChart from "@/components/Report/ReportChart";
import ReportDateTimePicker from "@/components/Report/ReportDateTimePicker";

export default {
  name: "chart",
  components: {
    ReportChart,
    ReportDateTimePicker
  },
  props: {
    id: {
      type: String,
      default: null,
      required: true
    },
    title: {
      type: String,
      default: null
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

</style>