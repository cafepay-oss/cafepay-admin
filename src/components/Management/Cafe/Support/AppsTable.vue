<template>
  <div>
    <b-table
      :loading="isLoading"
      :striped="true"
      :hoverable="true"
      :data="apps"
      default-sort="status"
      bordered
    >
      <template slot-scope="props">
        <b-table-column :label="$t('supports.title')" field="title">
          {{ props.row.title }}
        </b-table-column>

        <b-table-column :label="$t('supports.version')" field="description">
          {{ props.row.description }}
        </b-table-column>

        <b-table-column :label="$t('supports.description')" field="description">
          {{ props.row.description }}
        </b-table-column>

        <b-table-column :label="$t('supports.file')" field="file" centered>
          <a :href="props.row.file">{{ $t("supports.download") }}</a>
        </b-table-column>
      </template>

      <section class="section" slot="empty">
        <div class="content has-text-grey has-text-centered">
          <template v-if="isLoading">
            <p>
              <b-icon icon="dots-horizontal" size="is-large" />
            </p>
            <p>{{ $t("primary.loading") }}</p>
          </template>
          <template v-else>
            <p>
              <b-icon icon="emoticon-sad" size="is-large" />
            </p>
            <p>{{ $t("primary.noInformation") }}</p>
          </template>
        </div>
      </section>
    </b-table>
  </div>
</template>

<script>
export default {
  name: "AppsTable",
  data() {
    return {};
  },
  computed: {
    apps() {
      return this.$store.state.supportModule.driversAndApps;
    },
  },
};
</script>

<style lang="scss" scoped>
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

.red {
  color: red !important;
}

.green {
  color: green !important;
}

.yellow {
  color: rgb(196, 196, 35) !important;
}
</style>