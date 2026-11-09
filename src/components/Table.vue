<template>
  <section>
    <b-table
      :data="products"
      :columns="columns"
      :checked-rows.sync="checkedRows"
      checkable
      checkbox-position="right"
    ></b-table>
  </section>
</template>

<script>
export default {
  data() {
    return {
      productsReport: [],
      checkedRows: [],
      columns: [
        {
          field: "name",
          label: "نام محصول"
        },
        {
          field: "payment_info.total_count",
          label: "تعداد فروش",
          centered: true
        },
        {
          field: "payment_info.total_amount",
          label: "هزینه کل",
          centered: true
        },
        {
          field: "payment_info.net_payed_amount",
          label: "درآمد کل",
          centered: true
        },
        {
          field: "overall_rating.rate",
          label: "امتیاز",
          centered: true
        },
        {
          field: "overall_rating.count",
          label: "تعداد نظرات",
          centered: true
        }
      ]
    };
  },
  props: {
    products: {
      type: Array
    }
  }
};
</script>

<style lang="scss" scoped>
.b-table {
  font-size: 0.85rem !important;
}
</style>
