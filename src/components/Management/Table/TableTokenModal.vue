<template>
  <div>
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">
          {{ $t("cafeManagement.enterTableNewCode") }}
        </p>
      </header>
      <section class="modal-card-body">
        <b-field
          :label="$t('cafeManagement.code')"
          :type="{ 'is-danger': error }"
          :message="error ? error : ''"
        >
          <b-input v-model="form.token"></b-input>
        </b-field>
      </section>
      <footer class="modal-card-foot">
        <b-button
          :loading="isLoading"
          @click="submitToken"
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
  data() {
    return {
      form: {},
      error: null,
    };
  },
  methods: {
    submitToken() {
      if (this.form.token) {
        let relatedTableToken = this.$store.state.tableModule.cafeTableTokens.find(
          (tableToken) => tableToken.token == this.form.token
        );
        if (relatedTableToken) {
          this.error = null;
          this.$store.dispatch("tableModule/changeTableToken", {
            table: this.$store.state.tableModule.tableToken.id,
            token: this.form.token,
          });
        } else {
          this.error = "کد وارد شده درست نمیباشد";
        }
      }
    },
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