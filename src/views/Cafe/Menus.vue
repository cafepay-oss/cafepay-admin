<template>
  <div class="menu-workspace">
    <hero-bar>
      {{ $t("menus.menus") }}
      <b-button
        :loading="isLoading"
        class="button is-info catalog-add"
        icon-left="plus"
        slot="right"
        @click="addMenu"
        >{{ $t("menus.newMenu") }}</b-button
      >
    </hero-bar>
    <section class="section is-main-section">
      <b-modal
        :active.sync="$store.state.menuModule.isMenuModalActive"
        class="footer-modal"
        has-modal-card
        trap-focus
        aria-role="dialog"
        aria-modal
      >
        <menu-modal
          :url="url"
          :menu="
            $store.state.menuModule.menus.find(
              menu => selectedMenu && menu.id == selectedMenu.id
            )
          "
          :edit="edit"
        />
      </b-modal>

      <div class="menu-toolbar" v-if="cafeMenus.length > 0">
        <div class="menu-selector" :aria-label="$t('menus.menus')">
          <b-button
            class="menu-title"
            @click="changeMenu(menu)"
            :class="{ 'is-info': selectedMenu && selectedMenu.id == menu.id }"
            :aria-pressed="Boolean(selectedMenu && selectedMenu.id == menu.id)"
            v-for="menu in cafeMenus"
            :key="menu.id"
          >
            {{ menu.name }}
            <b-icon
              v-if="menu.isActive"
              icon="check"
              size="is-small"
            ></b-icon>
          </b-button>
        </div>

        <div v-if="selectedMenu" class="menu-toolbar__actions catalog-actions">
          <b-switch
            dir="ltr"
            class="setting__active is-success"
            @input="sendActiveMenu"
            :value="selectedMenu.isActive ? '1' : '0'"
            true-value="1"
            :disabled="selectedMenu.isActive"
            >{{ $t("menus.activeMenu") }}</b-switch
          >

          <b-button class="setting__edit is-info is-outlined catalog-action" icon-left="pencil-outline" @click="editMenu">{{
            $t("menus.editMenu")
          }}</b-button>
          <b-button
            @click="$store.state.menuModule.isModalActive = true"
            class="setting__delete is-outlined catalog-action catalog-action--danger"
            icon-left="trash-can-outline"
            type="is-danger"
            >{{ $t("menus.deleteMenu") }}</b-button
          >
        </div>
      </div>

      <section
        v-if="selectedMenu"
        class="menu-products"
      >
        <h2 class="menu-products__title">{{ $tc('primary.product', 2) }}</h2>
        <menu-detail
          class="menu-card"
          :menu="
            $store.state.menuModule.menus.find(
              menu => selectedMenu && menu.id == selectedMenu.id
            )
          "
        />
      </section>

    </section>

    <modal-box
      v-if="selectedMenu"
      :is-active="$store.state.menuModule.isModalActive"
      :trash-object-name="selectedMenu.name"
      @confirm="trashConfirm"
      @cancel="trashCancel"
    />
  </div>
</template>

<script>
// @ is an alias to /src
import * as chartConfig from "@/components/Charts/chart.config";
import HeroBar from "@/components/HeroBar";
import Tiles from "@/components/Tiles";
import ModalBox from "@/components/ModalBox";
import CardComponent from "@/components/CardComponent";
import LineChart from "@/components/Charts/LineChart";
import MenuModal from "@/components/Management/Cafe/Menu/MenuModal";
import MenuDetail from "@/components/Management/Cafe/Menu/MenuDetail";
import { mapActions } from "vuex";

export default {
  name: "home",
  components: {
    CardComponent,
    MenuDetail,
    MenuModal,
    LineChart,
    ModalBox,
    HeroBar,
    Tiles
  },
  data() {
    return {
      edit: false,
      url: null,
      selectedMenu: null
    };
  },
  computed: {
    cafeMenus() {
      return this.$store.state.menuModule.menus.slice().sort((a, b) => a.id - b.id);
    },
    activeMenu() {
      return this.cafeMenus.find(menu => menu.isActive) || null;
    },
    activeCafeId() {
      return this.$store.state.accountModule.activeCafe.id;
    }
  },
  methods: {
    changeMenu(menu) {
      this.selectedMenu = menu;
    },
    addMenu() {
      this.edit = false;
      this.$store.state.menuModule.isMenuModalActive = true;
      this.url =
        "api/v1/cafe/" +
        this.$store.state.accountModule.activeCafe.id +
        "/menu/add/";
    },
    editMenu() {
      if (!this.selectedMenu) return;
      this.edit = true;
      this.$store.state.menuModule.isMenuModalActive = true;
      this.url =
        "api/v1/menu/" + this.selectedMenu.id + "/";
    },
    sendActiveMenu() {
      if (!this.selectedMenu) return;
      this.$store.dispatch(
        "menuModule/sendActiveMenu",
        this.$store.state.menuModule.menus.find(
          m => m.id == this.selectedMenu.id
        )
      );
    },
    trashConfirm() {
      if (!this.selectedMenu) return;
      this.$store.dispatch(
        "menuModule/deleteMenu",
        this.$store.state.menuModule.menus.find(
          m => m.id == this.selectedMenu.id
        )
      );
      this.selectedMenu = null;
      this.$store.state.menuModule.isModalActive = false;
    },
    trashCancel() {
      this.$store.state.menuModule.isModalActive = false;
    }
  },
  watch: {
    activeCafeId() {
      this.selectedMenu = null;
    },
    cafeMenus: {
      immediate: true,
      handler(newValue) {
        const selectedId = this.selectedMenu && this.selectedMenu.id;
        this.selectedMenu = newValue.find(menu => menu.id === selectedId) ||
          newValue.find(menu => menu.isActive) || newValue[0] || null;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.menu-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e1e7ee;
  border-radius: .65rem;
  background: #fff;
}
.menu-selector { display: flex; flex-wrap: wrap; gap: .5rem; }
.menu-toolbar__actions { gap: .5rem; }
.menu-toolbar .button { margin: 0; }
.setting__active { margin-inline-end: .75rem; }
.menu-products__title { font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; color: #34465a; }
@media (max-width: 767px) {
  .menu-toolbar { gap: .85rem; padding: .85rem; }
  .menu-selector { width: 100%; }
  .menu-title { flex: 1 1 auto; }
  .menu-toolbar__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
    .setting__active { grid-column: 1 / -1; margin: .15rem 0 .5rem; }
  }
}
</style>
