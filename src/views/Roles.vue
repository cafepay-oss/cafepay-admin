<template>
  <div>
    <hero-bar>
      سمت ها
      <b-button
        :loading="isLoading"
        class="button is-info"
        slot="right"
        @click="addMenu"
        >سمت جدید</b-button
      >
    </hero-bar>
    <section class="section is-main-section">
      <card-component
        class="has-table has-mobile-sort-spaced"
        title="سمت ها"
        icon="account-multiple"
      >
        <RolesTable />
      </card-component>
    </section>
  </div>
</template>

<script>
import RolesTable from "@/components/Management/Cafe/Roles/RolesTable";
import CardComponent from "@/components/CardComponent";
import HeroBar from "@/components/HeroBar";

export default {
  name: "roles",
  components: {
    CardComponent,
    RolesTable,
    HeroBar,
  },
  methods: {
    getCafeRoles() {
      this.$store.dispatch("cafeModule/getCafeRoles");
    },
  },
  mounted() {
    if (!this.$store.state.cafeModule.cafeRoles.length) {
      this.getCafeRoles();
    }
  },
};
</script>

<style>
</style>