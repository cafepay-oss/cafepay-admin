<template>
  <div class="preorder">
    <hero-bar>
      {{ $t("preorders.preorders") }}
      <b-button
        :loading="isLoading"
        class="button is-info"
        slot="right"
        @click="addPreorder()"
        >{{ $t("preorders.newPreorder") }}</b-button
      >
    </hero-bar>

    <b-modal
      :active.sync="$store.state.preorderModule.isPreorderModalActive"
      class="footer-modal"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <PreorderModal />
    </b-modal>

    <section class="section is-main-section" v-if="preorders">
      <p class="notification is-light"><router-link to="/card-transfers">کارت‌به‌کارت و رسیدها</router-link> — سفارش دارای رسید آماده پردازش است؛ بررسی واریز مانع آماده‌سازی نمی‌شود.</p>
      <CardComponent v-if="preorders.receiptPreorders.length" title="سفارش‌های ثبت‌شده با رسید" class="has-table">
        <PreordersTable :preorders="preorders.receiptPreorders" @showTableDetail="handleTableSelected" />
      </CardComponent>
      <CardComponent
        class="has-table has-mobile-sort-spaced"
        v-if="preorders.payedPreorders.length > 0"
        :title="$t('preorders.payedPreorders')"
      >
        <PreordersTable
          :preorders="preorders.payedPreorders"
          @showTableDetail="handleTableSelected"
        />
      </CardComponent>
      <CardComponent
        class="has-table has-mobile-sort-spaced"
        v-if="preorders.notPayedPreorders.length > 0"
        :title="$t('preorders.notPayedPreorders')"
      >
        <PreordersTable
          :preorders="preorders.notPayedPreorders"
          @showTableDetail="handleTableSelected"
        />
      </CardComponent>
    </section>
  </div>
</template>

<script>
import PreordersTable from "@/components/Management/Cafe/Preorders/PreordersTable";
import PreorderModal from "@/components/Management/Cafe/Preorders/PreorderModal";
import CardComponent from "@/components/CardComponent";
import ModalBox from "@/components/ModalBox";
import HeroBar from "@/components/HeroBar";

export default {
  name: "Preorder",
  components: {
    PreordersTable,
    CardComponent,
    PreorderModal,
    ModalBox,
    HeroBar,
  },
  data() {
    return {};
  },
  methods: {
    addPreorder() {
      this.$store.state.preorderModule.isPreorderModalActive = true;
    },
    handleTableSelected(table) {
      this.$store.commit("tableModule/setSelectedTable", table);
    },
  },
  computed: {
    preorders() {
      return this.$store.getters["preorderModule/getPreordersV2"];
    },
  },
};
</script>

<style lang="scss" scoped>

</style>