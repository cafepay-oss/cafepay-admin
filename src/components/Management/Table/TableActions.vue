<template>
  <div class="actions">
    <div class="actions__buttons">
      <b-button
        :disabled="true"
        class="actions__merge action"
        :class="{ small: action, active: action == 'merge' }"
        @click="action = 'merge'"
      >اتصال</b-button>
      <b-button
        :disabled="true"
        class="actions__transfer action"
        :class="{ small: action, active: action == 'transfer' }"
        @click="action = 'transfer'"
      >انتقال</b-button>
      <b-button
        class="actions__bill action"
        :class="{ small: action, active: action == 'bill' }"
        @click="action = 'bill'"
      >پرداخت صورتحساب</b-button>
      <b-button
        :disabled="true"
        class="actions__history action"
        :class="{ small: action, active: action == 'history' }"
        @click="action = 'history'"
      >تاریخچه میز</b-button>
      <b-button
        :disabled="true"
        class="actions__close action"
        :class="{ small: action, active: action == 'close' }"
        @click="action = 'close'"
      >بستن میز</b-button>
    </div>
    <div class="actions__components" v-if="action">
      <table-merge v-if="action == 'merge'" :table="table"></table-merge>
      <table-transfer v-if="action == 'transfer'" :table="table"></table-transfer>
      <table-close-invoice v-if="action == 'bill'" :table="table"></table-close-invoice>
      <table-merge v-if="action == 'history'" :table="table"></table-merge>
      <table-merge v-if="action == 'close'" :table="table"></table-merge>
    </div>
  </div>
</template>

<script>
import TableCloseInvoice from "@/components/Management/Table/TableCloseInvoice";
import TableTransfer from "@/components/Management/Table/TableTransfer";
import TableMerge from "@/components/Management/Table/TableMerge";

export default {
  components: {
    TableCloseInvoice,
    TableTransfer,
    TableMerge,
  },
  data() {
    return {
      action: null,
    };
  },
  props: {
    table: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  height: 20rem;

  & p {
    margin-bottom: 1rem;
    font-weight: 500;
  }

  &__buttons {
    display: flex;
    flex-direction: row;
  }

  &__components {
    height: 15rem;
    width: 100%;

    box-shadow: 0 2px 2px #b8b8b8 !important;
    border-radius: 5px;
  }
}

.action {
  margin: 0.5rem;
  height: 7rem;
  min-width: 10vw;
  box-shadow: 0 2px 2px #b8b8b8 !important;
  border: none;

  &:hover {
    border: none;
    background-color: rgb(243, 243, 243);
  }
}

.small {
  height: 3rem;
}

.active,
.active:focus {
  border-style: none;
  box-shadow: none;
  background-color: #167df0;
  color: white;

  &:hover {
    background-color: #146fd8;
  }
}
</style>
