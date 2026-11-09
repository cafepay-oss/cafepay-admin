<template>
  <div>
    <product-detail :id="id" title="اطلاعات کلی"></product-detail>
    <report :id="id" title="گزارشات محصول"></report>
    <comment :id="id" title="نظرات"></comment>
  </div>
</template>


<script>
import ProductDetail from "@/components/Management/Cafe/Products/ProductDetail"
import Comment from "@/components/Management/Cafe/Products/Comment"
import Report from "@/components/Report/Report"

export default {
  name: "productPage",
  components: {
    Report,
    ProductDetail,
    Comment
  },
  props: {
    id: {
      type: String,
      default: null,
      required: true
    }
  }
}

</script>


