<template>
  <div>
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">
          {{ edit ? "ویرایش کارمند" : "کارمند جدید" }}
        </p>
      </header>
      <section class="modal-card-body">
        <b-field
          label="شماره تماس"
          :type="{ 'is-danger': errors.user_profile }"
          :message="errors.user_profile ? errors.user_profile[0] : ''"
        >
          <b-input :disabled="edit" v-model="form.user_profile"></b-input>
        </b-field>
        <b-field
          label="سمت"
          :type="{ 'is-danger': errors.role }"
          :message="errors.role ? errors.role[0] : ''"
        >
          <b-select v-model="form.role" placeholder="انتخاب کنید">
            <option
              v-for="option in $store.state.cafeModule.cafeRoles"
              :value="option.pk"
              :key="option.pk"
            >
              {{ option.display_name }}
            </option>
          </b-select>
        </b-field>
      </section>
      <footer class="modal-card-foot">
        <b-button
          :loading="isLoading"
          @click="submitStaff"
          class="button is-info"
          >ثبت</b-button
        >
        <b-button
          :loading="isLoading"
          class="button"
          type="button"
          @click.native="$parent.close()"
          >بستن</b-button
        >
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    edit: {
      type: Boolean,
      default: false,
    },
    staff: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      form: {},
    };
  },
  methods: {
    submitStaff() {
      if (this.edit) {
        this.$store.dispatch("cafeModule/editStaff", this.form);
      } else {
        this.$store.dispatch("cafeModule/createStaff", this.form);
      }
    },
  },
  mounted() {
    if (this.edit) {
      this.form.user_profile = this.staff.user_profile.phone_number;
      this.form.role = this.staff.role.pk;
    }
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

.control {
  text-align: end;
}
</style>