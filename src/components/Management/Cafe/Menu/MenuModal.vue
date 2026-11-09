<template>
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
        <b-input v-model="menuForm.name"></b-input>
      </b-field>
    </section>
    <footer class="modal-card-foot">
      <b-button
        :loading="isLoading"
        @click="submitmenu"
        class="button is-info"
        >{{ $t("primary.submit") }}</b-button
      >
      <b-button
        :loading="isLoading"
        class="button"
        type="button"
        @click.native="$parent.close()"
        >{{ $t("primary.close") }}</b-button
      >
    </footer>
  </div>
</template>

<script>
export default {
  props: {
    url: {
      type: String,
      default: "",
    },
    edit: {
      type: Boolean,
      default: false,
    },
    menu: {
      default: {},
    },
    url: {
      type: String,
    },
  },
  data() {
    return {
      menuForm: {},
    };
  },
  computed: {
    title() {
      if (this.edit) return this.$t("menus.modal.editMenu");
      else return this.$t("menus.modal.newMenu");
    },
  },
  methods: {
    submitmenu() {
      if (this.edit) {
        this.$store.dispatch("menuModule/editMenu", this.menuForm);
      } else {
        this.$store.dispatch("menuModule/createMenu", this.menuForm);
      }
    },
  },
  mounted() {
    if (this.edit) {
      this.menuForm = this.menu;
    } else
      this.menuForm = {
        name: "",
        products: [],
      };
  },
};
</script>

<style scoped>
button {
  margin: 0 0.5rem;
}

.modal-card {
  min-width: 50vw;
}

.selector {
  text-align: start;
}
</style>