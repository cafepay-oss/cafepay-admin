<template>
  <div>
    <b-table
      :loading="isLoading"
      :striped="true"
      :hoverable="true"
      :data="[]"
      default-sort="status"
      bordered
    >
      <template slot-scope="props"> </template>

      <section class="section" slot="empty">
        <div class="content has-text-grey has-text-centered">
          <template v-if="isLoading">
            <p>
              <b-icon icon="dots-horizontal" size="is-large" />
            </p>
            <p>{{ $t("primary.loading") }}</p>
          </template>
          <template v-else>
            <p>{{ $t("primary.comingSoon") }}</p>
          </template>
        </div>
      </section>
    </b-table>
  </div>
</template>

<script>
export default {
  name: "LessonsTable",
  data() {
    return {};
  },
};
</script>
