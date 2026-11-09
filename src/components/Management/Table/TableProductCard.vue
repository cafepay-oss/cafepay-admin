<template>
  <div class="product">
    <p class="product__name">{{ truncate(order.product.name, 40) }}</p>
    <b-field dir="ltr">
      <b-numberinput
        controls-position="compact"
        class="product__count"
        :min="
          Math.ceil(
                order.paymentInfo.net_payed_amount /
                  (order.product.original_price / order.paymentInfo.total_count)
              ) 
        "
        size="is-small"
        type="is-info"
        v-model="productCount"
        @input="handleInput"
      ></b-numberinput>
    </b-field>
  </div>
</template>

<script>
export default {
  name: "table-products-card-in-modal",
  data() {
    return {
      productCount: 0,
      insideEvent: false,
    };
  },
  props: {
    order: {
      type: Object,
      required: true,
    },
    table: {
      type: Object,
      required: false,
    },
    customer: {
      type: Object,
      required: false,
    },
  },
  methods: {
    truncate(str, length) {
      if (str.length > length) {
        return str.substring(0, length) + "...";
      }
      return str;
    },
    handleInput() {
      this.insideEvent = true;
    },
  },
  mounted() {
    this.productCount = this.order.paymentInfo.total_count;
  },
  watch: {
    "order.paymentInfo.total_count": function () {
      this.productCount = this.order.paymentInfo.total_count;
    },
    productCount: function (newValue, prevValue) {
      if (this.insideEvent) {
        if (prevValue < newValue) {
          this.$emit("addProductToTable");
        } else {
          this.$emit("deleteProductFromTable");
        }
        this.insideEvent = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.product {
  display: flex;
  min-width: 18rem;
  justify-content: space-between;
  font-weight: 400;
  font-size: 0.9rem;
  color: #535353;

  margin: 0.1rem 1rem;

  align-items: center;

  &__count {
    width: 6rem;
    justify-content: start;
  }
}
</style>
