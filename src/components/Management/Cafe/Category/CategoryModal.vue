<template>
  <div>
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ title }}</p>
      </header>
      <section class="modal-card-body">
        <b-field
          :label="$t('primary.name')"
          :type="{ 'is-danger': errors.title }"
          :message="errors.title ? errors.title[0] : ''"
        >
          <b-input v-model="categoryForm.name" required></b-input>
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
        <p v-if="edit" class="header">
          {{ $t("products.modal.categoryProductsOrder") }}
        </p>
        <draggable
          v-if="edit"
          v-model="categoryProducts"
          @start="drag = true"
          @end="drag = false"
        >
          <div
            class="product-item"
            v-for="product in categoryProducts"
            :key="product.id"
          >
            <b-icon icon="menu" size="is-small"> </b-icon>
            {{ product.name }}
          </div>
        </draggable>
      </section>
      <footer class="modal-card-foot">
        <b-button
          :loading="isLoading"
          @click="submitCategory"
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
import draggable from "vuedraggable";

export default {
  components: {
    draggable,
  },
  props: {
    url: {
      type: String,
      default: "",
    },
    edit: {
      type: Boolean,
      default: false,
    },
    category: {
      type: Object,
      default: {},
    },
    local: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      categoryForm: {},
      drag: false,
    };
  },
  computed: {
    title() {
      if (this.edit) return this.$t("products.modal.editCategory");
      else return this.$t("products.modal.newCategory");
    },
    categoryProducts: {
      get() {
        return this.$store.state.categoryModule.categories.find(
          (cat) => cat.id == this.category.id
        ).products;
      },
      set(value) {
        this.$store.dispatch("categoryModule/updateCategoryProductsOrder", {
          products: value,
          category: this.category,
        });
      },
    },
  },
  methods: {
    submitCategory() {
      if (this.edit) {
        this.categoryForm.title = this.categoryForm.name;
        this.$store.dispatch("categoryModule/editCategory", this.categoryForm);
      } else {
        this.categoryForm.title = this.categoryForm.name;
        this.$store.dispatch(
          "categoryModule/createCategory",
          this.categoryForm
        );
      }
    },
  },
  watch: {},
  mounted() {
    if (this.edit) {
      this.categoryForm = JSON.parse(JSON.stringify(this.category));
      this.categoryForm.products = [];
    } else
      this.categoryForm = {
        name: "",
        description: "",
        products: [],
      };
  },
};
</script>

<style scoped lang="scss">
.button {
  margin: 0 0.5rem;
  box-shadow: 0 2px 2px #b8b8b8 !important;
}

.modal-card {
  min-width: 50vw;
}

.selector {
  text-align: start;
}

.header {
  font-weight: 500;
  color: #000;
  font-size: 1.02rem;
}

.product-item {
  &:hover {
    cursor: pointer;
  }
}
</style>
