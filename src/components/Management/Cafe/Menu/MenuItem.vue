<template>
  <div v-if="!product.deleted">
    <modal-box
      :is-active="isModalActive"
      :trash-object-name="trashObject.name"
      @confirm="trashConfirm"
      @cancel="trashCancel"
    />
    <!-- <b-modal
      :active.sync="isProductModalActive"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <product-modal :url="url" :product="product" :edit="edit" />
    </b-modal>-->

    <div class="product">
      <p class="product__title">{{ product.name }}</p>
      <b-tooltip
        class="buttons product__edit"
        :label="$t('primary.edit')"
        type="is-info"
      >
        <button
          @click="$emit('editProduct')"
          class="button is-info is-outlined catalog-action"
          type="button"
          :aria-label="$t('products.editProduct') + ' ' + product.name"
          :title="$t('products.editProduct')"
        >
          <b-icon icon="pencil-outline" size="is-small" />
          <span>{{ $t("primary.edit") }}</span>
        </button>
      </b-tooltip>
      <b-tooltip
        class="buttons product__delete"
        :label="$t('primary.delete')"
        type="is-danger"
      >
        <button @click.prevent="trashModal" class="button is-danger is-outlined catalog-action catalog-action--danger"
          type="button" :aria-label="$t('products.deleteProduct') + ' ' + product.name"
          :title="$t('products.deleteProduct')">
          <b-icon icon="trash-can-outline" size="is-small" />
        </button>
      </b-tooltip>
    </div>
  </div>
</template>

<script>
import ModalBox from "@/components/ModalBox";

export default {
  components: {
    ModalBox,
  },
  data() {
    return {
      isProductModalActive: false,
      isModalActive: false,
      trashObject: {},
      edit: true,
    };
  },
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
  methods: {
    trashModal() {
      this.trashObject = this.product;
      this.isModalActive = true;
    },
    trashConfirm() {
      this.isModalActive = false;
      this.$store.dispatch("productModule/deleteProduct", this.trashObject);
    },
    trashCancel() {
      this.isModalActive = false;
    },
  }
};
</script>

<style lang="scss" scoped>
.product {
  display: flex;
  width: 100%;
  height: auto;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: .5rem;

  &:hover {
    cursor: pointer;
  }

  &__title {
    flex: 1 1 6rem;
    min-width: 0;
    overflow-wrap: anywhere;
    align-self: center;
    font-size: 0.8rem;
    padding: 6px 5px 2px 2px;
  }

  &__edit {
    align-self: center;
    justify-self: flex-start;
    margin-inline-start: auto;
    height: auto;
  }

  &__delete {
    align-self: center;
    margin: 0 0.2rem 0 0.3rem;
    height: auto;
  }
}

.button {
  margin: 0 !important;
}
</style>
