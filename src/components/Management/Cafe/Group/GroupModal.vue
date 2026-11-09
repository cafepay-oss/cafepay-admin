<template>
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
        <b-input v-model="groupForm.title"></b-input>
      </b-field>
    </section>
    <footer class="modal-card-foot">
      <b-button
        :loading="isLoading"
        @click="submitGroup"
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
    edit: {
      type: Boolean,
      default: false
    },
    group: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      groupForm: {}
    };
  },
  computed: {
    title() {
      if (this.edit) return this.$t("printerGroups.modal.editGroup");
      else return this.$t("printerGroups.modal.newGroup");
    }
  },
  methods: {
    submitGroup() {
      if (this.edit) {
        console.log('hi1');
        this.$store.dispatch("groupModule/editGroup", this.groupForm);
      } else {
        this.$store.dispatch("groupModule/createGroup", this.groupForm);
      }
    }
  },
  mounted() {
    if (this.edit) {
      this.groupForm = this.group;
    } else
      this.groupForm = {
        title: "",
      };
  }
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
