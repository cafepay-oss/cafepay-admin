<template>
  <b-modal :active.sync="isModalActive" has-modal-card>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ $t("deleteModal.warning") }}</p>
      </header>
      <section class="modal-card-body">
        <p>
          {{ $t("deleteModal.areYouSureAboutDeleting") }}
          <b class="font-bold">{{ trashObjectName }}</b>
          {{ $t("deleteModal.areYouSureAboutDeletingX") }}
        </p>
        <p>{{ $t("deleteModal.youCannotUndoThisAction") }}</p>
      </section>
      <footer class="modal-card-foot">
        <b-button :loading="isLoading" class="button" @click="cancel">{{
          $t("deleteModal.cancel")
        }}</b-button>
        <b-button
          :loading="isLoading"
          class="button is-danger"
          @click="confirm"
          >{{ $t("deleteModal.confirm") }}</b-button
        >
      </footer>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: "ModalBox",
  props: {
    isActive: {
      type: Boolean,
      default: false,
    },
    trashObjectName: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      isModalActive: false,
    };
  },
  methods: {
    cancel() {
      this.$emit("cancel");
    },
    confirm() {
      this.$emit("confirm");
    },
  },
  watch: {
    isActive(newValue) {
      this.isModalActive = newValue;
    },
    isModalActive(newValue) {
      if (!newValue) {
        this.cancel();
      }
    },
  },
};
</script>

<style scoped>
.button {
  margin: 0 0.5rem !important;
  box-shadow: 0 2px 2px #b8b8b8 !important;
}
</style>
