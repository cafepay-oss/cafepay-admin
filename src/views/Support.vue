<template>
  <div>
    <hero-bar> {{ $t("supports.support") }} </hero-bar>
    <section class="section is-main-section">
      <card-component
        class="has-table has-mobile-sort-spaced"
        :title="$t('supports.driversAndApps')"
      >
        <AppsTable />
      </card-component>
      <card-component
        class="has-table has-mobile-sort-spaced"
        :title="$t('supports.videos')"
      >
        <LessonsTable />
      </card-component>
      <card-component
        class="has-table has-mobile-sort-spaced"
        :title="$t('supports.FAQ')"
      >
        <FAQTable />
      </card-component>
    </section>
  </div>
</template>

<script>
import LessonsTable from "@/components/Management/Cafe/Support/LessonsTable";
import AppsTable from "@/components/Management/Cafe/Support/AppsTable";
import FAQTable from "@/components/Management/Cafe/Support/FAQTable";
import CardComponent from "@/components/CardComponent";
import HeroBar from "@/components/HeroBar";

export default {
  components: {
    CardComponent,
    LessonsTable,
    AppsTable,
    FAQTable,
    HeroBar,
  },
  data() {
    return {};
  },
  computed: {
    driversAndApps() {
      return this.$store.state.supporModule.driversAndApps;
    },
  },
  mounted() {
    this.$store.dispatch("supportModule/getDriversAndApps");
  },
};
</script>

<style>
</style>