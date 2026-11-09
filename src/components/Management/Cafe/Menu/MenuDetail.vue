<template>
  <div>
    <modal-box
      :is-active="$store.state.menuModule.isDeleteCategoryFromMenuModalActive"
      :trash-object-name="trashObject.name"
      @confirm="trashConfirm"
      @cancel="trashCancel"
    />
    <b-modal
      ref="CategoryModal"
      :active.sync="$store.state.menuModule.isCategoryMenuModalActive"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            {{ $t("menus.modal.addNewCategoryTo") }} {{ menu.name }}
          </p>
        </header>
        <section class="modal-card-body add-category-modal">
          <b-tabs position="is-centered" class="block">
            <b-tab-item :label="$t('menus.modal.useExistingCategories')">
              <b-field :label="$t('menus.modal.categories')">
                <b-select
                  expanded
                  :placeholder="$t('primary.select')"
                  class="selector"
                  v-model="category"
                >
                  <option
                    v-for="category in this.$store.state.categoryModule
                      .categories"
                    :key="category.id"
                    :value="category"
                  >
                    {{ category.name }}
                  </option>
                </b-select>
              </b-field>
              <div
                v-if="category.products"
                class="add-category-modal__category-products"
              >
                <p class="add-category-modal__category-products__title">
                  {{ $t("menus.modal.productsOfSelectedCategory") }}
                </p>
                <ul class="add-category-modal__category-products__product">
                  <span v-for="product in category.products" :key="product.pk">
                    <li v-if="!product.deleted">{{ product.name }}</li>
                  </span>
                </ul>
              </div>
              <b-button
                :loading="isLoading"
                :disabled="!category.products"
                class="button is-info"
                icon-left="plus"
                  @click="addCategoryToMenu"
                >{{ $t("menus.modal.addCategory") }}</b-button
              >
            </b-tab-item>
            <b-tab-item :label="$t('menus.modal.createNewCategory')">
              <b-field
                :label="$t('primary.name')"
                :type="{ 'is-danger': errors.title }"
                :message="errors.title ? errors.title[0] : ''"
              >
                <b-input v-model="categoryForm.title" required></b-input>
              </b-field>
              <b-field
                :label="$t('primary.description')"
                :type="{ 'is-danger': errors.description }"
                :message="errors.description ? errors.description[0] : ''"
              >
                <b-input
                  v-model="categoryForm.description"
                  type="textarea"
                  maxlength="300"
                ></b-input>
              </b-field>
              <b-button
                :loading="isLoading"
                class="button is-info"
                icon-left="plus"
                  @click="createCategoryToMenu"
                >ساخت دسته جدید</b-button
              >
            </b-tab-item>
          </b-tabs>
        </section>
        <footer class="modal-card-foot">
          <b-button
            :loading="isLoading"
            class="button"
            type="button"
            @click.native="
              $store.state.menuModule.isCategoryMenuModalActive = false
            "
            >{{ $t("primary.close") }}</b-button
          >
        </footer>
      </div>
    </b-modal>
    <b-modal
      ref="CategoryModal"
      :active.sync="
        $store.state.categoryModule.isAddProductToCategoryModalActive
      "
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            {{ $t("menus.modal.addNewProductTo") }} {{ category.name }}
          </p>
        </header>
        <section class="modal-card-body add-category-modal">
          <section class="add-category-modal__create">
            <b-tabs position="is-centered" class="block">
              <b-tab-item :label="$t('menus.modal.useExistingProducts')">
                <b-field :label="$tc('primary.product', 2)">
                  <b-select
                    expanded
                    :placeholder="$t('primary.select')"
                    class="selector"
                    v-model="product"
                  >
                    <option
                      v-for="product in this.$store.state.productModule.products.filter(
                        (pro) => !pro.deleted
                      )"
                      :key="product.id"
                      :value="product"
                    >
                      {{ product.name }}
                    </option>
                  </b-select>
                </b-field>
                <b-button
                  :disabled="!product.id"
                  :loading="isLoading"
                  class="button is-info"
                  icon-left="plus"
                  @click="addProductToCategory"
                  >{{ $t("menus.modal.addProduct") }}</b-button
                >
              </b-tab-item>
              <b-tab-item :label="$t('menus.modal.createNewProduct')">
                <b-field
                  :label="$t('primary.name')"
                  :type="{ 'is-danger': errors.name }"
                  :message="errors.name ? errors.name[0] : ''"
                >
                  <b-input v-model="productForm.name" required></b-input>
                </b-field>

                <b-field
                  :label="$t('primary.priceAndCurrency')"
                  :type="{ 'is-danger': errors.original_price }"
                  :message="
                    errors.original_price ? errors.original_price[0] : ''
                  "
                >
                  <b-input
                    type="number"
                    v-model="productForm.original_price"
                  ></b-input>
                </b-field>

                <b-field
                  :label="$t('primary.discount')"
                  :type="{ 'is-danger': errors.discount }"
                  :message="errors.discount ? errors.discount[0] : ''"
                >
                  <b-input
                    type="number"
                    v-model="productForm.discount"
                    max="100"
                    min="0"
                  ></b-input>
                </b-field>

                <b-field
                  :label="$t('primary.count')"
                  :type="{ 'is-danger': errors.count }"
                  :message="errors.count ? errors.count[0] : ''"
                >
                  <b-input
                    type="number"
                    v-model="productForm.count"
                    min="0"
                  ></b-input>
                </b-field>

                <b-field :label="$t('primary.description')">
                  <b-input
                    type="textarea"
                    maxlength="300"
                    :value="product.description"
                    v-model="productForm.description"
                  ></b-input>
                </b-field>

                <b-field
                  :label="$t('products.modal.productImage')"
                  :type="{ 'is-danger': errors.image }"
                  :message="errors.image ? errors.image[0] : ''"
                >
                  <span class="product-images">
                    <b-upload
                      class="product-images__upload"
                      v-model="dropFile"
                      drag-drop
                    >
                      <section class="section">
                        <div class="content has-text-centered">
                          <p>
                            <b-icon icon="upload" size="is-large"></b-icon>
                          </p>
                          <p>{{ $t("primary.uploadOrDragAndDrop") }}</p>
                        </div>
                      </section>
                    </b-upload>
                  </span>
                </b-field>
                <div v-if="dropFile" class="tags" dir="ltr">
                  <span class="tag is-info">
                    {{ dropFile.name }}
                    <button
                      class="delete is-small"
                      aria-label="حذف تصویر انتخاب‌شده"
                      title="حذف تصویر انتخاب‌شده"
                      type="button"
                      @click="dropFile = null"
                    ></button>
                  </span>
                </div>

                <b-button
                  class="button is-info"
                  :loading="isLoading"
                  icon-left="plus"
                  @click="createProduct"
                  >ساخت محصول جدید</b-button
                >
              </b-tab-item>
            </b-tabs>
          </section>
        </section>
        <footer class="modal-card-foot">
          <b-button
            :loading="isLoading"
            class="button"
            type="button"
            @click="
              $store.state.categoryModule.isAddProductToCategoryModalActive = false
            "
            >{{ $t("primary.close") }}</b-button
          >
        </footer>
      </div>
    </b-modal>
    <b-modal
      :active.sync="$store.state.productModule.isProductModalActive"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <product-modal :product="product" :edit="edit" />
    </b-modal>
    <div v-if="menu.categories" class="category">
      <div
        class="category__item"
        v-for="category in menu.categories"
        :key="category.id"
      >
        <div class="category__item__header">
          <p class="category__item__header__title">{{ category.name }}</p>
          <b-tooltip
            class="category__item__header__delete"
            label="حذف دسته بندی از منو"
            type="is-danger"
          >
            <button
              @click.prevent="deleteCategoryFromMenu(category)"
              class="button is-danger is-outlined catalog-action catalog-action--danger"
              type="button"
              :aria-label="'حذف دسته‌بندی ' + category.name + ' از منو'"
              title="حذف دسته‌بندی از منو"
            >
              <b-icon icon="link-off" size="is-small" />
              <span>حذف از منو</span>
            </button>
          </b-tooltip>
        </div>
        <hr class="is-info" />
        <span>
          <menu-item
            class="category__item__products"
            v-for="product in category.products"
            :key="product.id"
            :product="product"
            @editProduct="handleEditProduct(product)"
          ></menu-item>

          <button
            type="button"
            @click="addProductToCategoryModalActive(category)"
            class="button is-info is-outlined category__item__add-product catalog-add"
          >
            <b-icon icon="plus" size="is-small" />
            <span>{{ $t("menus.addProductToCategory") }}</span>
          </button>
        </span>
      </div>
      <button type="button" @click="addCategoryToMenuModalActive" class="button is-info is-outlined category__add catalog-add">
        <b-icon icon="folder-plus-outline" size="is-small" />
        <span>{{ $t("menus.addCategoryToMenu") }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import ProductModal from "@/components/Management/Cafe/Products/ProductModal";
import MenuItem from "@/components/Management/Cafe/Menu/MenuItem";
import ModalBox from "@/components/ModalBox";
import Tiles from "@/components/Tiles";

export default {
  components: {
    ProductModal,
    ModalBox,
    MenuItem,
    Tiles,
  },
  props: {
    menu: {
      type: Object,
      default: {},
      required: true,
    },
  },
  data() {
    return {
      edit: false,
      url: "",
      category: {},
      productForm: {},
      categoryForm: {},
      product: {},
      dropFile: null,
      trashObject: {},
    };
  },
  methods: {
    handleEditProduct(product) {
      this.product = product;
      this.edit = true;
      this.$store.state.productModule.isProductModalActive = true;
    },
    createCategoryToMenu() {
      this.$store.dispatch("menuModule/createCategoryToMenu", {
        menu: this.menu,
        category: this.categoryForm,
      });
    },
    addCategoryToMenu() {
      this.$store.dispatch("menuModule/addCategoryToMenu", {
        menu: this.menu,
        category: this.category,
      });
    },
    addCategoryToMenuModalActive() {
      this.category = {};
      this.$store.state.menuModule.isCategoryMenuModalActive = true;
      this.categoryForm = {
        title: "",
        description: "",
        products: [],
      };
    },
    addProductToCategoryModalActive(category) {
      this.category = category;
      this.$store.state.categoryModule.isAddProductToCategoryModalActive = true;
      this.productForm = {
        name: "",
        original_price: "",
        discount: 0,
        description: "",
        count: "",
        category: category.id,
      };
    },
    addProductToCategory() {
      this.$store.dispatch("categoryModule/addProductToCategory", {
        product: this.product,
        category: this.category,
      });
    },
    createProduct() {
      this.$store.dispatch("productModule/createProduct", {
        product: {
          ...this.productForm,
          category: this.category.id,
        },
        image: this.dropFile,
      });
    },
    deleteCategoryFromMenu(cateogry) {
      this.trashObject = cateogry;
      this.$store.state.menuModule.isDeleteCategoryFromMenuModalActive = true;
    },
    trashConfirm() {
      this.$store.dispatch("menuModule/deleteCategoryFromMenu", {
        category: this.trashObject,
        menu: this.menu,
      });
    },
    trashCancel() {
      this.$store.state.menuModule.isDeleteCategoryFromMenuModalActive = false;
    },
  },
};
</script>

<style scoped lang="scss">
.selector {
  text-align: start;
}

.modal-card {
  max-width: 62.5vw !important;
  min-width: 50vw !important;
}

.category {
  display: flex;
  flex-wrap: wrap;

  &__item {
    padding: 1rem;
    margin: 0.3rem 0.2rem;
    flex: 1;
    min-width: 30%;
    max-width: 33%;

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      &__title {
        font-size: 1.2rem;
        font-weight: 500;
        color: #000;
      }
    }

    hr {
      width: 100%;
      height: 0.1rem;
      margin: 0.5rem 0;
      background-color: rgb(163, 163, 163);
    }

    &__products {
      width: 100%;
      padding: 0.4rem 0.2rem 0.4rem 0;
      border-radius: 5px;

      &:hover {
        background-color: #f0f0ff;
      }
    }

    &__add-product {
      margin: 0.2rem 0;
      padding: 0.5rem 0;

      display: flex;
      align-self: center;
      justify-content: center;

      border: 1px dotted grey;
      border-radius: 5px;

      &:hover {
        cursor: pointer;
        background-color: #f0f0ff;
        border-color: #00b7ff;
      }
    }
  }

  &__add {
    display: flex;
    max-width: 33%;
    min-width: 32%;
    padding: 1rem;
    margin: 0.3rem 0.2rem;
    height: 150px;
    justify-content: center;
    align-items: center;
    border: 1px dashed grey;
    border-radius: 5px;

    &:hover {
      cursor: pointer;
      background-color: #f0f0ff;
      border-color: #00b7ff;
    }
  }
}

.add-category-modal {
  display: flex;
  flex-direction: column;

  height: 70vh;

  &__category-products {
    max-height: 40vh;

    &__title {
      font-size: 1.1rem;
      font-weight: 500;
    }

    & ul {
      height: 25vh;
      overflow: scroll;
      margin: 1rem 0 1rem 1rem;
      padding: 0.5rem 1rem;
      border: 1px solid rgb(209, 209, 209);
      border-radius: 3px;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    &__product {
      font-size: 1rem;

      &:hover {
        cursor: pointer;
      }
    }
  }
}
.en {
  & .select-field {
    text-align: left !important;
  }
}
.fa {
  & .select-field {
    text-align: right !important;
  }
}
</style>
