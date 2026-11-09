<template>
  <div v-if="!product.deleted">
    <div class="product">
      <p class="product__title">{{ product.name }}</p>
    </div>
  </div>
</template>

<script>

export default {
  name: "groupProductItem",
  data() {
    return {};
  },
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.product {
  display: flex;
  width: 100%;
  height: auto;
  justify-content: center;
  align-items: center;

  &:hover {
    cursor: pointer;
  }

  &__title {
    align-self: stretch;
    font-size: 0.8rem;
    padding: 6px 5px 2px 2px;
  }
}
</style>
