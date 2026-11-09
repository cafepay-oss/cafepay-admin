<template>
  <div>
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ title }}</p>
      </header>
      <section class="modal-card-body">
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
          :message="errors.original_price ? errors.original_price[0] : ''"
        >
          <b-input type="number" v-model="productForm.original_price"></b-input>
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
          <b-input type="number" v-model="productForm.count" min="0"></b-input>
        </b-field>

        <b-field
          :label="$tc('primary.Category', 1)"
          required
          :type="{ 'is-danger': errors.category }"
          :message="errors.category ? errors.category[0] : ''"
        >
          <b-select
            :placeholder="$t('primary.select')"
            class="selector select-field"
            v-model="productForm.category"
          >
            <option
              v-for="cat in $store.state.categoryModule.categories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </b-select>
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
            <div
              class="product-images__image"
              v-for="image in product.images"
              :key="image.pk"
            >
              <img :src="image.image" alt="" />
              <button
                type="button"
                aria-label="انتخاب تصویر اصلی محصول"
                title="انتخاب تصویر اصلی محصول"
                :aria-pressed="image.is_avatar"
                @click="handleAvatarClicked(image)"
                class="product-images__image__avatar"
                :class="{
                  'product-images__image__avatar--not-avatar': !image.is_avatar,
                }"
              >
                <b-icon icon="check-bold" type="is-white"></b-icon>
              </button>
              <button
                type="button"
                aria-label="حذف تصویر محصول"
                title="حذف تصویر محصول"
                @click="handleDeleteClicked(image)"
                class="product-images__image__delete"
              >
                <b-icon icon="trash-can-outline" type="is-white"></b-icon>
              </button>
            </div>
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
      </section>
      <footer class="modal-card-foot">
        <b-button
          :loading="isLoading"
          @click="submitProduct"
          class="button is-info"
          >{{ $t("primary.submit") }}</b-button
        >
        <b-button
          :loading="isLoading"
          class="button"
          type="button"
          @click.native="$parent.close()"
          >{{ $t("primary.cancel") }}</b-button
        >
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    edit: {
      type: Boolean,
      default: false,
    },
    product: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      productForm: {},
      dropFile: null,
    };
  },
  computed: {
    title() {
      if (this.edit) return this.$t("products.modal.editProduct");
      else return this.$t("products.modal.newProduct");
    },
  },
  methods: {
    handleAvatarClicked(image) {
      if (!image.is_avatar) {
        this.$store.dispatch("productModule/setProductAvatarImage", {
          product: this.product,
          image: image,
        });
      }
    },
    handleDeleteClicked(image) {
      this.$store.dispatch("productModule/deleteProductImage", {
        product: this.product,
        image: image,
      });
    },
    submitProduct() {
      if (this.edit) {
        if (this.productForm.group) {
          this.productForm.group = this.productForm.group.pk;
        }
        if (this.productForm.category) {
          this.$store.dispatch("productModule/editProduct", {
            product: this.productForm,
            image: this.dropFile,
          });
          delete this.errors.category;
        } else {
          this.errors.category = ["لطفا یک دسته بندی را انتخاب کنید"];
        }
      } else {
        if (this.productForm.category) {
          delete this.errors.category;
          this.$store.dispatch("productModule/createProduct", {
            product: this.productForm,
            image: this.dropFile,
          });
        } else {
          this.errors.category = ["لطفا یک دسته بندی را انتخاب کنید"];
        }
      }
    },
  },
  mounted() {
    if (this.edit) {
      this.productForm = JSON.parse(JSON.stringify(this.product));
      this.productForm.prevCategory = this.product.category.pk;
      this.productForm.category = this.product.category.pk;
    } else
      this.productForm = {
        name: "",
        original_price: "",
        discount: 0,
        description: "",
        count: "",
        category: null,
      };
  },
};
</script>

<style lang="scss" scoped>
.button {
  margin: 0 0.5rem;
  box-shadow: 0 2px 2px #b8b8b8 !important;
}

.modal-card {
  max-width: 62.5vw !important;
  min-width: 50vw !important;
}

.selector {
  text-align: start;
}

.product-images {
  display: flex;
  flex-wrap: wrap;

  &__image {
    padding-inline-end: 0.5rem;
    margin-bottom: 0.5rem;
    position: relative;

    & > img {
      width: 19vw;
      height: 16vw;
      object-fit: cover;
      object-position: center;
      border-radius: 3px;
    }

    &__avatar {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      right: 0;
      top: 0;
      width: 35px;
      height: 35px;
      opacity: 0.85;
      border-radius: 0 3px 0 3px;
      background-color: #16aa2a;
      transition: all 0.3s;

      &--not-avatar {
        opacity: 1;
      }

      &:hover {
        opacity: 1 !important;
      }
    }

    &__delete {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      right: 0;
      bottom: 0.45rem;
      left: 0.5rem;
      height: 2.75rem;
      border-radius: 3px 3px 0 0;
      background-image: linear-gradient(to top, #cc1f1f 55%, #cc1f1f00);
      opacity: 1;
      transition: all 0.3s ease-out;
    }

    &:hover {
      & > .product-images__image__delete,
      .product-images__image__avatar--not-avatar {
        cursor: pointer;
        height: 35px;
        opacity: 0.85;
      }
    }
  }

  &__upload {
    width: 19vw;
    height: 16vw;
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
