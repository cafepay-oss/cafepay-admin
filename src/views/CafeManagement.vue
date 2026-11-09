<template>
  <div class="cafe-management">
    <hero-bar>
      {{ $store.state.accountModule.activeCafe.name }}
      <b-button slot="right" class="view-mode-button" :icon-left="view === 0 ? 'view-list' : 'view-module'"
        @click="changeView(view === 0 ? 1 : 0)">
        {{ view === 0 ? 'نمایش جزئیات میزها' : 'نمایش خلاصه میزها' }}
      </b-button>
    </hero-bar>

    <section class="section is-main-section">
      <div class="cafe-tables" v-if="view == 0">
        <ColorsGuide />
        <div class="cafe-table-grid">
          <table-card-small
            v-for="table in visibleTables"
            :key="table.id"
            :tableDetail="table"
            class="cafe-table-small"
            @tableSelected="showTableDetail"
          />
        </div>
      </div>

      <div class="cafe-tables" v-if="view == 1">
        <div class="cafe-table-grid cafe-table-grid--detailed">
          <table-card
            v-for="table in visibleTables"
            :key="table.id"
            :tableDetail="table"
            class="cafe-table"
            @tableSelected="showTableDetail"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import TableCardSmall from "@/components/Management/Table/TableCardSmall";
import TableCard from "@/components/Management/Table/TableCard";
import ColorsGuide from "@/components/ColorsGuide";
import HeroBar from "@/components/HeroBar";

export default {
  name: "CafeManagement",
  components: {
    TableCardSmall,
    ColorsGuide,
    TableCard,
    HeroBar,
  },
  data() {
    return {
      view: 0,
    };
  },
  computed: {
    visibleTables() {
      return (this.$store.state.tableModule.tables || []).filter(table => !table.isPreorder && !table.isMenuOnly);
    },
  },
  methods: {
    changeView(view) {
      this.view = view;
    },
    showTableDetail(table) {
      this.$store.commit("tableModule/setSelectedTable", table);
    },
  },
};
</script>

<style lang="scss" scoped>
.cafe-tables { width: 100%; }
.cafe-table-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: .8rem;
  align-items: start;
  &--detailed { grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr)); }
  .table-card {
    min-width: 0;
    max-width: none;
    width: 100%;
    margin: 0;
    border: 1px solid #d1dae4;
    box-shadow: none !important;
  }
}
@media (max-width: 359px) {
  .cafe-table-grid, .cafe-table-grid--detailed { grid-template-columns: minmax(0, 1fr); }
}
</style>
