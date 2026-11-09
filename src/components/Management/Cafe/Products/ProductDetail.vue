<template>
  <div>
    <div class="section-header">
      <h1>{{ title }}</h1>
    </div>
    <p v-if="loading" role="status">{{ $t("primary.loading") }}</p>
    <b-message v-else-if="loadError" type="is-danger" :closable="false">
      دریافت اطلاعات محصول انجام نشد.
      <b-button type="is-info" icon-left="refresh" @click="loadProduct">تلاش دوباره</b-button>
    </b-message>
    <section v-else class="section">
      <div class="card">
        <div class="columns is-gapless">
          <div class="column is-one-quarter image-part">
            <img
              :src="productImage"
              alt
              class="card-image"
            />
            <p class="card-point">4.6</p>
            <b-button class="is-info card-gallary">گالری</b-button>
          </div>
          <div class="column product-data">
            <p class="product-name">
              نام محصول:
              <span v-if="!modifyMode">{{ product.name }}</span>
              <span v-else>
                <b-input :value="product.name" expanded></b-input>
              </span>
            </p>

            <b-switch
              dir="ltr"
              class="product-status"
              type="is-info"
              v-model="isSwitchedCustom"
              true-value="موجود"
              false-value="تمام شده"
            >{{ isSwitchedCustom }}</b-switch>
            <p class="product-modify" @click="modifyMode = !modifyMode">
              <b-button :loading="isLoading" class="product-modify-icon" v-if="!modifyMode">ویرایش</b-button>

              <b-button :loading="isLoading" class="check" v-else>ثبت</b-button>
            </p>
            <div class="product-description">
              توضیحات محصول:
              <span v-if="!modifyMode">{{ product.description }}</span>
              <span v-else>
                <b-input
                  class="product-description-input"
                  maxlength="200"
                  type="textarea"
                  :value="product.description"
                ></b-input>
              </span>
            </div>
            <p class="product-menus" v-if="!modifyMode">
              منوها :
              <span v-for="menu in product.menu_retrieve" :key="menu.pk">{{ menu.name }}.</span>
            </p>
            <p class="product-categories" v-if="!modifyMode">
              <span class="category-title" v-if="product.category_retrieve">
                دسته بندی:
                <span>{{ product.category_retrieve.title }}</span>
              </span>
              <span v-else>بدون دسته بندی</span>
            </p>
            <p class="product-price-before-off">
              قیمت محصول:
              <span v-if="!modifyMode">{{ product.price }}</span>
              <span v-else>
                <b-input class="product-price-input" :value="product.price"></b-input>
              </span>
            </p>
            <p class="product-off-persentage">
              درصد تخفیف:
              <span v-if="!modifyMode">25%</span>
              <span v-else>
                <b-input class="product-off-input" value="25"></b-input>
              </span>
            </p>
            <p class="product-price-after-off">
              قیمت نهایی:
              <span>{{ product.price }}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>


<script>
import CardComponent from "@/components/CardComponent";
import cafeDefault from "@/assets/cafe-default.png";

export default {
  name: "productDetail",
  components: {
    CardComponent,
  },
  data() {
    return {
      product: { images: [] },
      loading: true,
      loadError: false,
      isSwitchedCustom: "موجود",
      modifyMode: false,
    };
  },
  props: {
    id: {
      type: String,
      default: null,
      required: true,
    },
    title: {
      type: String,
      default: null,
    },
  },
  computed: {
    productImage() {
      const images = this.product.images || [];
      const image = images.find(item => item.is_avatar) || images[0];
      return image ? image.image : cafeDefault;
    }
  },
  methods: {
    async loadProduct() {
      const productId = this.id;
      this.loading = true;
      this.loadError = false;
      try {
        const response = await this.request({ method: "GET", url: "api/v1/product/" + productId + "/" });
        if (this.id === productId) this.product = response.data;
        return true;
      } catch (error) {
        if (this.id === productId) this.loadError = true;
        return false;
      } finally {
        if (this.id === productId) this.loading = false;
      }
    }
  },
  created() {
    this.loadProduct();
  },
  watch: {
    id() { this.loadProduct(); }
  },
};
</script>

<style lang="sass" scoped>

.card 
  position: relative
  border-radius: 20px
  width: 100%
  height: 100%
  

.section-header
  text-align: center
  padding-top: 1rem
  h1
    font-size: 1.2rem
    
.section
  padding-top: 1rem

.image-part
  position: relative
  width: 100%
  max-width: 16rem
  height: auto

.card-image
  display: block
  width: 100%
  height: 16rem
  object-fit: cover
  border-radius: .5rem .5rem 0 0

.card-gallary
  width: 100%
  min-height: 2.75rem
  border-radius: 0 0 .5rem .5rem

.card-point
  position: absolute
  height: 2.5rem
  width: 2.5rem
  right: 0
  top: 0
  border-radius: 0 .5rem 0 .5rem
  display: flex
  align-items: center
  justify-content: center
  background-color: #1fbfbf
  color: white

.product-data
  display: grid
  grid-template-columns: repeat(3, minmax(0, 1fr))
  align-items: start
  gap: 1rem
  width: 100%
  min-width: 0
  padding: 1rem !important
  overflow-wrap: anywhere

.product-name, .product-description, .product-menus, .product-categories
  grid-column: 1 / -1
  min-width: 0
  font-weight: 400

.product-name
  font-size: 1.2rem

.product-status
  grid-column: 1 / 3

.product-modify
  justify-self: end

.product-description-input
  width: 100%
  min-height: 5rem

.product-price-before-off, .product-off-persentage, .product-price-after-off
  min-width: 0
  font-size: 1rem
  font-weight: 400

.product-price-input, .product-off-input
  width: 100%
  max-width: 8rem

@media (max-width: 767px)
  .image-part
    margin: 0 auto
  .product-data
    grid-template-columns: minmax(0, 1fr)
    > *
      grid-column: 1 / -1
  .product-modify
    justify-self: start

</style>