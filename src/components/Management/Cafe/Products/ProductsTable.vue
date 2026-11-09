<template>
  <div>
    <modal-box
      :is-active="isModalActive"
      :trash-object-name="trashObject.name"
      @confirm="trashConfirm"
      @cancel="trashCancel"
    />
    <b-table
      class="products-table"
      :data="filteredProducts"
      :show-detail-icon="showDetailIcon"
      striped
      hoverable
      narrowed
      sticky-header
      ref="table"
      detail-key="id"
      detailed
    >
      <!-- @details-open="(row, index) => $buefy.toast.open(`Expanded ${row.name}`)" -->

      <template slot-scope="props">
        <b-table-column
          field="product-name"
          :label="$t('primary.name')"
          width="350"
        >
          <template v-if="showDetailIcon">
            {{ props.row.name }}
            <span v-if="props.row.deleted">(حذف شده)</span>
          </template>
          <template v-else>
            <a @click="toggle(props.row)">{{ props.row.name }}</a>
          </template>
        </b-table-column>

        <b-table-column
          field="product-price"
          :label="$t('primary.price')"
          numeric
          centered
        >
          <template v-if="props.row.discount == 0">
            {{ props.row.original_price | myCurrency }}
          </template>
          <template v-else>
            <strike>{{ props.row.original_price | myCurrency }}</strike>
            -
            {{
              ((props.row.original_price * (100 - props.row.discount)) / 100)
                | myCurrency
            }}
          </template>
        </b-table-column>

        <b-table-column
          field="product-discount"
          :label="$t('primary.discount')"
          numeric
          centered
          >{{ props.row.discount }} %</b-table-column
        >

        <b-table-column
          field="product-count"
          :label="$t('primary.count')"
          numeric
          centered
          >{{ props.row.count }}
          {{ $tc("primary.item", props.row.count) }}</b-table-column
        >

        <b-table-column
          field="product-status"
          :label="$t('primary.status')"
          numeric
          centered
        >
          <div dir="ltr" class="field">
            <b-switch
              type="is-info"
              @input="sendAvailablity(props.row)"
              v-model="props.row.available"
              >{{
                props.row.available
                  ? $t("products.available")
                  : $t("products.notAvailable")
              }}</b-switch
            >
          </div>
        </b-table-column>

        <b-table-column
          class="is-actions-cell"
          field="product-methods"
          :label="$tc('primary.action', 2)"
          numeric
          centered
        >
          <b-tooltip
            class="buttons"
            :label="$t('products.editProduct')"
            type="is-info"
          >
            <button
              @click="$emit('editProductTrigger', props.row)"
              class="button is-info is-outlined catalog-action"
              type="button"
              :aria-label="$t('products.editProduct') + ' ' + props.row.name"
              :title="$t('products.editProduct')"
            >
              <b-icon icon="pencil-outline" size="is-small" />
              <span>{{ $t("primary.edit") }}</span>
            </button>
          </b-tooltip>
          <b-tooltip
            class="buttons"
            :label="$t('products.deleteProduct')"
            type="is-danger"
          >
            <button
              @click.prevent="trashModal(props.row)"
              class="button is-danger is-outlined catalog-action catalog-action--danger"
              type="button"
              :aria-label="$t('products.deleteProduct') + ' ' + props.row.name"
              :title="$t('products.deleteProduct')"
            >
              <b-icon icon="trash-can-outline" size="is-small" />
              <span>{{ $t("primary.delete") }}</span>
            </button>
          </b-tooltip>
          <!-- <b-tooltip class="buttons" label="جزییات" type="is-primary">
            <button @click="productInfo(props.row.id)" class="button is-small is-primary">
              <b-icon icon="information" size="is-small" />
            </button>
          </b-tooltip>-->
        </b-table-column>
      </template>
      <template slot="detail" slot-scope="props">
        <div class="detail-card">
          <div class="detail-image">
            <img
              class="rounded"
              :src="
                !props.row.images[0]
                  ? cafeDefault
                  : props.row.images.find((image) => image.is_avatar)
                  ? props.row.images.find((image) => image.is_avatar).image
                  : props.row.images[props.row.images.length - 1].image
              "
              alt
            />
          </div>
          <div class="detail-content">
            <strong>{{ $t("products.productDescription") }}</strong>
            <!-- <small>5 ماه پیش</small> -->
            <!-- <b-field label="توضیحات محصول" label-position="on-border"> -->
            <p class="detail-content__description">
              {{ props.row.description }}
            </p>
            <!-- </b-field> -->
            <!-- <b-field>
              <button class="button is-info">ثبت</button>
            </b-field>-->
          </div>
        </div>
      </template>
    </b-table>
  </div>
</template>

<script>
import ModalBox from "@/components/ModalBox";
import cafeDefault from "@/assets/cafe-default.png";

export default {
  components: { ModalBox },
  data() {
    return {
      isSwitched: false,
      showDetailIcon: true,
      isModalActive: false,
      trashObject: {},
      selected: {},
      cafeDefault,
    };
  },
  methods: {
    toggle(row) {
      this.$refs.table.toggleDetails(row);
    },
    sendAvailablity(product) {
      this.$store.dispatch("productModule/changeAvailablity", product);
    },
    productInfo(productId) {
      this.$router.push(`product/${productId}/`);
    },
    trashModal(trashObject) {
      this.trashObject = trashObject;
      this.isModalActive = true;
    },
    trashConfirm() {
      this.isModalActive = false;
      this.$store.dispatch("productModule/deleteProduct", this.trashObject);
    },
    trashCancel() {
      this.isModalActive = false;
    },
  },
  computed: {
    filteredProducts() {
      return this.products.filter((product) => !product.deleted);
    },
  },
  props: {
    products: {},
  },
  watch: {
    products: {
      deep: true,
      handler() {
        this.$forceUpdate();
      },
    },
  },
};
</script>

<style lang="scss" scoped>
img {
  border-radius: 100px;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-card {
  display: grid;
  grid-template-columns: minmax(0, 128px) minmax(0, 1fr);
  align-items: start;
  gap: 1rem;
  min-width: 0;
}

.detail-image {
  width: 100%;
  max-width: 128px;
  height: 128px;
}

.detail-content {
  min-width: 0;
  overflow-wrap: anywhere;

  &__description {
    font-size: 0.9rem;
    font-weight: 400;
  }
}

@media (max-width: 480px) {
  .detail-card {
    grid-template-columns: minmax(0, 1fr);
  }
}

.has-addons {
  justify-content: center;
}

.buttons {
  margin: 0 0.2rem;
}

.button {
  box-shadow: 0 2px 2px #b8b8b8 !important;
}
.b-tooltip {
  & button {
    border-radius: 2px;
    margin: 0;

    & .icon {
      font-size: 0.95rem;
    }
  }
}
</style>
