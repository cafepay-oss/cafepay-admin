<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">{{ title }}</p>
    </header>
    <section class="modal-card-body">
      <b-field
        :label="$t('primary.name')"
        :type="{ 'is-danger': errors.tableName }"
        :message="errors.tableName ? errors.tableName[0] : ''"
      >
        <b-input v-model="tableForm.number" required></b-input>
      </b-field>
    </section>
    <footer class="modal-card-foot">
      <b-button
        :loading="isLoading"
        @click="submitTable"
        class="button done is-info"
        >{{ $t("primary.submit") }}</b-button
      >
      <b-button
        :loading="isLoading"
        class="button exit"
        @click.native="closeModal()"
        >{{ $t("primary.cancel") }}</b-button
      >
    </footer>
  </div>
</template>

<script>
export default {
  props: {
    edit: {
      type: Boolean,
      default: false,
    },
    table: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      tableForm: {
        number: null,
      },
    };
  },
  computed: {
    title() {
      if (this.edit) return this.$t("tables.modal.editTable");
      else return this.$t("tables.modal.newTable");
    },
  },
  methods: {
    closeModal() {
      this.$store.state.tableModule.isTableModalActive = false;
      delete this.$store.state.errors.tableName;
    },
    submitTable() {
      if (this.edit) {
        this.$store.dispatch("tableModule/editTable", this.tableForm);
      } else {
        this.$store.dispatch("tableModule/createTable", this.tableForm);
      }
      this.$parent.close();
    },
  },
  mounted() {
    if (this.edit) {
      this.tableForm.number = this.table.name;
      this.tableForm.id = this.table.id;
    } else {
      this.tableForm = {
        number: null,
      };
    }
  },
};
</script>

<style scoped>
.done {
  margin: 0 0 0 0.2rem !important;
}

.exit {
  margin: 0 0.2rem 0 0 !important;
}

.modal-card {
  min-width: 50vw;
}

.selector {
  text-align: start;
}
</style>
