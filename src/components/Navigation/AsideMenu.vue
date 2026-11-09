<template>
  <aside id="main-navigation" v-show="isAsideVisible" class="aside is-placed-left is-expanded"
    :class="{ 'sidebar-collapsed': collapsedSidebar, 'sidebar-mobile-open': $store.state.isAsideMobileExpanded }">
    <aside-tools :is-main-menu="true">
      <span slot="label">
        <b>
          <span>{{ $t("sideBar.panel") }} </span>
          <span>{{ this.$store.state.accountModule.activeCafe.name }}</span>
        </b>
      </span>
    </aside-tools>
    <div class="menu is-menu-main">
      <template v-for="(menuGroup, index) in menu">
        <p class="menu-label" v-if="typeof menuGroup === 'string'" :key="index">
          {{ $t(menuGroup) }}
        </p>
        <aside-menu-list
          v-else
          :key="index"
          @menu-click="menuClick"
          :menu="menuGroup"
        />
      </template>
    </div>
  </aside>
</template>

<script>
import { mapState } from "vuex";
import AsideTools from "@/components/Navigation/AsideTools";

export default {
  name: "AsideMenu",
  components: { AsideTools },
  props: {
    menu: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    ...mapState(["isAsideVisible"]),
    collapsedSidebar() {
      return this.$store.state.collapsedSidebar;
    }
  },
  methods: {
    menuClick(item) {
      this.$store.commit("asideMobileStateToggle", false);
    },
  },
};
</script>
