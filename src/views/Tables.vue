<template>
  <div>
    <hero-bar>
      {{ $t("tables.tables") }}
      <b-button
        :loading="isLoading"
        class="hero-button is-info"
        icon-left="plus"
        slot="right"
        @click="newTable"
        >{{ $t("tables.newTable") }}</b-button
      >
    </hero-bar>
    <b-modal
      :active.sync="$store.state.tableModule.isTableModalActive"
      class="footer-modal"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <table-modal :table="table" :edit="edit" />
    </b-modal>

    <section class="section is-main-section tables">
      <div
        class="card table"
        v-for="table in filteredTables"
        :key="table.id"
      >
        <div>
          <p class="table__title">{{ table.name }}</p>
          <p class="table__token">
            {{ table.token ? table.token : $t("tables.codeUnavailable") }}
          </p>
        </div>
        <div class="table__footer">
          <b-tooltip
            class="buttons table__footer__edit"
            :label="$t('primary.edit')"
            type="is-info"
          >
            <button
              @click.prevent="editTable(table)"
              class="button is-info is-outlined"
              type="button"
              :aria-label="$t('primary.edit') + ' ' + table.name"
              :loading="isLoading"
            >
              <b-icon icon="pencil-outline" size="is-small" />
              <span>{{ $t('primary.edit') }}</span>
            </button>
          </b-tooltip>
          <b-tooltip
            class="buttons table__footer__delete"
            :label="$t('primary.delete')"
            type="is-danger"
          >
            <button
              @click.prevent="deleteTable(table)"
              class="button is-danger is-outlined"
              type="button"
              :aria-label="$t('primary.delete') + ' ' + table.name"
              :loading="isLoading"
            >
              <b-icon icon="trash-can-outline" size="is-small" />
              <span>{{ $t('primary.delete') }}</span>
            </button>
          </b-tooltip>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import HeroBar from "@/components/HeroBar";
import TableModal from "@/components/Management/Table/TableModal.vue";

export default {
  name: "Tables",
  components: {
    TableModal,
    HeroBar,
  },
  data() {
    return {
      table: null,
      edit: false,
    };
  },
  computed: {
    isTableModalActive() {
      return this.$store.state.tableModule.isTableModalActive;
    },
    filteredTables() {
      return this.$store.state.tableModule.tables.filter((table) => !table.isPreorder && !table.isMenuOnly);
    }
  },
  methods: {
    newTable() {
      this.edit = false;
      this.$store.state.tableModule.isTableModalActive = true;
    },
    editTable(table) {
      this.table = table;
      this.edit = true;
      this.$store.state.tableModule.isTableModalActive = true;
    },
    deleteTable(table) {
      this.$store.dispatch("tableModule/deleteTable", table);
    },
  },
};
</script>

<style lang="scss" scoped>
.section {
  padding-top: 2rem;
  padding-bottom: 1rem;
}

.hero-button {
  margin: 0 5px;
  box-shadow: 0 2px 2px #b8b8b8 !important;
}

.tables {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
  gap: 1rem;
  align-content: start;
}

.table {
  display: flex;
  flex-direction: column;

  min-width: 0;
  margin: 0;
  padding: 15px;

  &__title {
    font-size: 1.2rem;
    font-weight: 500;
    padding: 0 !important;
  }

  &__footer {
    display: flex;
    width: 100%;
    margin-top: 1rem;
    gap: .5rem;
    justify-content: flex-end;
    align-items: flex-end;

    &__edit {
      border-radius: 3px !important;
      height: auto;
      margin: 0;
    }

    &__delete {
      border-radius: 3px !important;
      height: auto;
      margin: 0;
    }
  }
  &__token { overflow-wrap: anywhere; color: #65778c; margin-top: .5rem; }
}

.button {
  margin: 0 !important;
}
</style>
