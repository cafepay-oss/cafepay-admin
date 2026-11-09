<template>
  <div>
    <b-modal
      :active.sync="$store.state.cafeModule.isAddStaffModuleActive"
      class="footer-modal"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <StaffModal :edit="edit" :staff="editStaff" />
    </b-modal>

    <hero-bar>
      {{ $t("employees.employees") }}
      <!-- <b-button
        :loading="isLoading"
        class="button is-info"
        slot="right"
        @click="addStaff"
        >کارمند جدید</b-button
      > -->
    </hero-bar>
    <section class="section is-main-section">
      <card-component
        :title="$t('employees.employees')"
      >
        <StaffTable @editStaff="handleEditStaff" />
      </card-component>
    </section>
  </div>
</template>

<script>
import StaffTable from "@/components/Management/Cafe/Staff/StaffTable";
import StaffModal from "@/components/Management/Cafe/Staff/StaffModal";
import CardComponent from "@/components/CardComponent";
import HeroBar from "@/components/HeroBar";

export default {
  name: "staff",
  components: {
    CardComponent,
    StaffTable,
    StaffModal,
    HeroBar,
  },
  data() {
    return {
      edit: false,
      editStaff: {},
    };
  },
  methods: {
    getCafeStaff() {
      this.$store.dispatch("cafeModule/getCafeStaff");
    },
    getCafeRoles() {
      this.$store.dispatch("cafeModule/getCafeRoles");
    },
    addStaff() {
      this.edit = false;
      this.$store.state.cafeModule.isAddStaffModuleActive = true;
    },
    handleEditStaff(staff) {
      this.edit = true;
      this.editStaff = staff;
      this.$store.state.cafeModule.isAddStaffModuleActive = true;
    },
  },
  mounted() {
    if (!this.$store.state.cafeModule.cafeStaff.length) {
      this.getCafeStaff();
      this.getCafeRoles();
    }
  },
};
</script>