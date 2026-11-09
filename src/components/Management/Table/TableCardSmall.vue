<template>
  <div class="table-card" :class="backgroundColor">
    <!-- free table FRONT SIDE -->
    <div v-if="tableDetail.tableType == 'free'" class="table-card__side">
      <div class="table-card__side--free" @click="showTableDetail">
        <p class="table-card__side--free__name bold">
          {{ tableDetail.name }}
        </p>
        <div class="table-card__order-status"><OrderStatusBadge :table="tableDetail" /></div>
      </div>
    </div>
    <!-- fill and merged table FRONT SIDE -->
    <div v-if="tableDetail.tableType == 'fill'" class="table-card__side">
      <span @click="showTableDetail" class="clickable">
        <p class="table-card__side__name">
          <span>{{ tableDetail.name }}</span>
        </p>
        <div class="table-card__order-status"><OrderStatusBadge :table="tableDetail" /></div>

        <p class="table-card__side__total-amount">
          <span>{{ $t("cafeManagement.totalPrice") }}</span>
          <span>{{ tableDetail.paymentInfo.total_amount | myCurrency }} </span>
        </p>
        <p class="table-card__side__payed-amount">
          <span>پرداختی: </span>
          <span
            >{{ tableDetail.paymentInfo.net_payed_amount | myCurrency }}
          </span>
        </p>
        <p class="table-card__side__met-amount">
          <span>{{ $t("cafeManagement.totalRemaining") }}</span>
          <span>{{ tableDetail.paymentInfo.net_amount | myCurrency }} </span>
        </p>
      </span>

      <!-- merged table FRONT SIDE -->
      <div
        v-if="tableDetail.tableType == 'merged'"
        class="table-card__side--merged"
      >
        <p class="table-card__side--merged__name">
          {{ $tc("table", 1) + " " + tableDetail.name }}
        </p>
        <p class="table-card__side--merged__description">
          متصل به میز {{ tableDetail.mergedTables[0].name }}
        </p>

        <b-button
          class="table-card__side--merged__separate-but"
          @click="separateSelf()"
          >جدا کردن میز</b-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import TableTokenModal from "@/components/Management/Table/TableTokenModal";
import Tiles from "@/components/Tiles";
import OrderStatusBadge from "@/components/OrderStatusBadge.vue";

export default {
  name: "table-card",
  components: {
    TableTokenModal,
    Tiles,
    OrderStatusBadge,
  },
  data() {
    return {
      tableProductCount: 0,
      selectTableToJoin: false,
      selectTableToTransfer: false,
      tables: [],
      selectedTables: [],
      mergeTablesStatus: [], // { "table": table.pk, "merged": boolean, "pre-merge-state": boolean}
      transferTableId: this.tableDetail.pk,

      table: null,
    };
  },
  props: {
    tableDetail: {
      type: Object,
      required: true,
    },
  },
  methods: {
    showTableDetail() {
      this.$emit("tableSelected", this.tableDetail);
    },
    separateSelf() {
      this.tableDetail.separateTable(this.tableDetail);
    },
    billHasBeenSentToKitchen() {
      this.tableDetail.customers.forEach((customer) => {
        customer.orders.forEach((order) => {
          if (order.sentToKitchen != true) {
            return false;
          }
        });
      });
      return true;
    },
    payedOrderHasNotBeenSentToKitchen() {
      this.tableDetail.customers.forEach((customer) => {
        customer.orders.forEach((order) => {
          if (
            order.paymentInfo.net_amount != 0 &&
            order.sentToKitchen == true
          ) {
            console.log(order);
            return false;
          }
        });
      });
      return true;
    },
  },
  computed: {
    numberOfOrders() {
      let numberOfOrders = 0;

      this.tableDetail.customers.forEach((customer) => {
        customer.orders.forEach((order) => {
          numberOfOrders += order.count;
        });
      });

      return numberOfOrders;
    },
    backgroundColor() {
      if (this.tableDetail.paymentInfo) {
        let backgroundColor = "green";

        this.tableDetail.customers.forEach((customer) => {
          customer.orders.forEach((order) => {
            if (order.paymentInfo.net_amount != 0 && !order.sentToKitchen) {
              if (backgroundColor == "green") backgroundColor = "blue";
            } else if (
              order.paymentInfo.net_amount == 0 &&
              !order.sentToKitchen
            ) {
              if (backgroundColor != "red") backgroundColor = "yellow";
            } else if (
              order.paymentInfo.net_amount != 0 &&
              order.sentToKitchen == true
            ) {
              backgroundColor = "red";
            }
          });
        });

        return backgroundColor;
      }
    },
    diffObj() {
      return this.tableDetail.diffObj;
    },
  },
};
</script>

<style lang="scss" scoped>
.table-card__order-status {
  width: 100%;
  min-width: 0;
  margin: .35rem 0 .5rem;
}

* {
  padding: 0;
  margin: 0;
}

.clickable {
  cursor: pointer;
}

.table-card {
  margin: 0.4rem;
  padding: 0.9rem 0.7rem 0.7rem 0.7rem;

  position: relative;
  display: flex;

  background-color: rgb(255, 255, 255);

  min-height: 7rem;
  border-radius: 10px;

  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;

  &:hover {
    cursor: pointer;
  }

  &__side {
    height: 100%;
    width: 100%;

    border-radius: 10px;

    &__name {
      margin: 0px auto 7px;
      font-size: 0.92rem !important;
      color: #161616 !important;
      font-weight: 600 !important;
    }

    &--free {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      justify-content: center;
      align-items: center;

      &__name {
        font-weight: 600 !important;
        font-size: 1rem !important;
        color: #161616 !important;
      }
    }

    &--merged {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(3px);

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      border-radius: 3px;

      &__name {
        font-size: 1.1rem !important;
        font-weight: 500 !important;
      }

      &__description {
        font-size: 1.2rem;
        font-weight: 400 !important;
        color: rgb(0, 0, 0);
      }

      &__separate-but {
        padding: 0 1rem;
        margin-top: 1rem;

        background-color: #ececec;
        color: #161616;
        border: none;

        & span {
          font-size: 1rem;
          font-weight: 400 !important;
        }

        transition: all 0.5s ease;

        &:focus {
          border: none;
          box-shadow: none;
        }

        &:hover {
          background-color: #ffffff;
        }
      }
    }

    p {
      font-size: 0.85rem;
      font-weight: 400;
      color: #646464;
      display: flex;

      span {
        margin-inline-start: 0.2rem !important;
      }
    }

    span:not(:last-child) {
      font-weight: 500;
      color: #000000;
    }
  }
}
</style>
