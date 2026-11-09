<template>
  <!-- eslint-disable -->
  <div>
    <modal-box
      :is-active="$store.state.categoryModule.isDeleteCategoryModalActive"
      :trash-object-name="trashObject.name"
      @confirm="trashConfirm"
      @cancel="trashCancel"
    />
    <hero-bar>
      {{ $t("products.products") }}
      <b-button
        :loading="isLoading"
        class="button is-info catalog-add"
        icon-left="plus"
        slot="right"
        @click="newProduct()"
        >{{ $t("products.newProduct") }}</b-button
      >
      <b-button
        :loading="isLoading"
        class="button is-info is-outlined catalog-add"
        icon-left="folder-plus-outline"
        slot="right"
        @click="newCategory()"
        >{{ $t("products.newCategory") }}</b-button
      >
    </hero-bar>

    <b-modal
      :active.sync="$store.state.productModule.isProductModalActive"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <product-modal :product="product" :edit="edit" />
    </b-modal>

    <b-modal
      :active.sync="$store.state.categoryModule.isCategoryModalActive"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <CategoryModal :category="category" :edit="edit" />
    </b-modal>

    <section class="section">
      <div class="search">
        <b-field class="search__field" :label="$t('products.searchProducts')">
          <b-input
            expanded
            dir="rtl"
            class="search__field__input"
            icon="magnify"
            :aria-label="$t('products.searchProducts')"
            :placeholder="$t('products.productName')"
            v-model="searchValue"
          ></b-input>
        </b-field>
      </div>
      <!-- <draggable v-model="categories" @start="drag = true" @end="drag = false"> -->
      <div
        v-for="category in categories.filter(cat => !cat.is_delete)"
        :key="category.id"
        class="category-card"
      >
        <card-component
          :title="category.name"
          class="has-table table-card has-mobile-sort-spaced"
        >
          <div class="category-header">
            <div class="category-header__description">
              {{ $t("products.categoryDescription") }}
              {{
                category.description
                  ? category.description
                  : $t("products.noDescription")
              }}
            </div>
            <div class="category-header__setting catalog-actions">
              <b-tooltip
                class="buttons"
                :label="$t('products.editCategory')"
                type="is-info"
              >
                <button
                  @click="editCategory(category)"
                  class="button is-info is-outlined catalog-action"
                  type="button"
                  :aria-label="$t('products.editCategory')"
                  :title="$t('products.editCategory')"
                >
                  <b-icon icon="pencil-outline" size="is-small" />
                  <span>{{ $t("primary.edit") }}</span>
                </button>
              </b-tooltip>
              <b-tooltip
                class="buttons"
                :label="$t('products.deleteCategory')"
                type="is-danger"
              >
                <button
                  @click.prevent="deleteCategory(category)"
                  class="button is-danger is-outlined catalog-action catalog-action--danger"
                  type="button"
                  :aria-label="$t('products.deleteCategory')"
                  :title="$t('products.deleteCategory')"
                >
                  <b-icon icon="trash-can-outline" size="is-small" />
                </button>
              </b-tooltip>
            </div>
          </div>
          <ProductsTable
            @editProductTrigger="editProduct"
            @editCategoryTrigger="editCategory"
            :products="filterProducts(category.products)"
          />
        </card-component>
      </div>
      <!-- </draggable> -->
    </section>
  </div>
</template>

<script>
import ProductsTable from "@/components/Management/Cafe/Products/ProductsTable";
import CategoryModal from "@/components/Management/Cafe/Category/CategoryModal";
import ProductModal from "@/components/Management/Cafe/Products/ProductModal";
import * as chartConfig from "@/components/Charts/chart.config";
import CardComponent from "@/components/CardComponent";
import ModalBox from "@/components/ModalBox";
import HeroBar from "@/components/HeroBar";
import Tiles from "@/components/Tiles";
import draggable from "vuedraggable";

export default {
  name: "home",
  components: {
    ProductsTable,
    CardComponent,
    CategoryModal,
    ProductModal,
    draggable,
    ModalBox,
    HeroBar,
    Tiles,
  },
  data() {
    return {
      edit: false,
      category: false,
      product: { name: "", price: 0, off: 0, about: "" },
      categoryName: "",
      category: {},

      searchValue: "",
      trashObject: {},

      drag: false,
    };
  },
  computed: {
    menus: function () {
      return this.$store.state.menus;
    },
    categories: {
      get() {
        return this.$store.state.categoryModule.categories;
      },
      set(value) {
        this.$store.dispatch("categoryModule/updateCategoriesOrder", value);
      },
    },
  },
  methods: {
    newProduct() {
      this.edit = false;
      this.$store.state.productModule.isProductModalActive = true;
    },
    newCategory() {
      this.edit = false;
      this.$store.state.categoryModule.isCategoryModalActive = true;
    },
    editProduct(product) {
      this.edit = true;
      this.product = product;
      this.$store.state.productModule.isProductModalActive = true;
    },
    editCategory(category) {
      this.edit = true;
      this.category = category;
      this.$store.state.categoryModule.isCategoryModalActive = true;
    },
    filterProducts(products) {
      return products.filter((product) =>
        product.name.includes(this.searchValue)
      );
    },
    deleteCategory(category) {
      this.trashObject = category;
      this.$store.state.categoryModule.isDeleteCategoryModalActive = true;
    },
    trashConfirm() {
      this.$store.dispatch("categoryModule/deleteCategory", this.trashObject);
    },
    trashCancel() {
      this.$store.state.categoryModule.isDeleteCategoryModalActive = false;
    },
  },
  created() {
    let that = this;
  },
  watch: {
    categories: {
      deep: true,
      handler() {
        this.$forceUpdate();
      },
    },
  },
};
</script>

<style scoped lang="scss">
.section {
  padding-top: 2rem;
  padding-bottom: 1rem;
}
.button {
  margin: 0 5px;
  box-shadow: 0 2px 2px #b8b8b8 !important;
}
.table-card {
  margin-bottom: 20px;
  padding: 0;
}
.card {
  background-color: #fff;
}
.search {
  display: flex;
  justify-content: flex-start !important;

  width: 100%;

  &__field {
    margin: 0 0 1rem;
    width: 100%;
    max-width: 36rem;

    &__input {
      width: 100%;
    }
  }
}
.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: .75rem;
  margin: 1rem;

  &__description {
    font-size: .85rem;
    flex: 1 1 16rem;
    min-width: 0;
    color: #65778c;
    overflow-wrap: anywhere;
  }
  &__setting {
    flex: 0 0 auto;
    margin-inline-start: auto;
  }
}

.buttons {
  margin: 0 0.2rem;
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

.category-card {
  &:hover {
    cursor: pointer;
  }
}
</style>
