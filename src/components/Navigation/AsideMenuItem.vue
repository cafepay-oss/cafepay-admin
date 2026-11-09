<template>
  <!-- eslint-disable -->
  <li :class="{ 'is-active': isDropdownActive }">
    <component
      :is="componentIs"
      :to="itemTo"
      :href="itemHref"
      :type="hasDropdown ? 'button' : null"
      :aria-expanded="hasDropdown ? isDropdownActive : null"
      @click="menuClick"
      exact-active-class="is-active"
      :class="{ 'has-icon': !!item.icon, 'has-dropdown-icon': hasDropdown }"
    >
      <b-icon
        v-if="item.icon"
        :icon="item.icon"
        :class="{ 'has-update-mark': item.updateMark }"
        custom-size="default"
      />

      <span v-if="item.label" :class="{ 'menu-item-label': !!item.icon }">{{
        $t(item.label)
      }}</span>
      <div v-if="hasDropdown" class="dropdown-icon">
        <b-icon :icon="dropdownIcon" custom-size="default" />
      </div>
    </component>
    <aside-menu-list
      v-if="hasDropdown"
      :menu="item.menu"
      :isSubmenuList="true"
      @menu-click="$emit('menu-click', $event)"
    />
  </li>
</template>

<script>
export default {
  name: "AsideMenuItem",
  data() {
    return {
      isDropdownActive: false,
    };
  },
  props: {
    item: {
      type: Object,
      default: null,
    },
  },
  watch: {
    "$route.path": {
      immediate: true,
      handler(path) {
        if (this.item.menu && this.item.menu.some(item => item.to === path)) {
          this.isDropdownActive = true;
        }
      },
    },
  },
  methods: {
    menuClick() {
      if (this.hasDropdown) {
        this.isDropdownActive = !this.isDropdownActive;
      } else {
        this.$emit("menu-click", this.item);
      }
    },
  },
  computed: {
    componentIs() {
      return this.item.to ? "router-link" : (this.hasDropdown ? "button" : "a");
    },
    hasDropdown() {
      return !!this.item.menu;
    },
    dropdownIcon() {
      return this.isDropdownActive ? "chevron-down" : "chevron-left";
    },
    itemTo() {
      return this.item.to ? this.item.to : null;
    },
    itemHref() {
      return this.item.href ? this.item.href : null;
    },
  },
};
</script>
