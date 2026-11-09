<template>
  <div class="table-card">
    <b-modal
      :active.sync="$store.state.tableModule.isTableTokenModalActive"
      class="footer-modal"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <TableTokenModal />
    </b-modal>
    <!-- free table FRONT SIDE -->
    <div v-if="tableDetail.tableType == 'free'" class="table-card__side">
      <div class="table-card__side--free" @click="showTableDetail">
        <p class="table-card__side--free__name bold">
          {{ tableDetail.name }}
        </p>
        <div class="table-card__order-status"><OrderStatusBadge :table="tableDetail" /></div>
        <p class="table-card__side--free__description">
          {{ $t("cafeManagement.noOrders") }}
        </p>
      </div>
    </div>
    <!-- fill and merged table FRONT SIDE -->
    <div v-if="tableDetail.tableType == 'fill'" class="table-card__side">
      <span @click="showTableDetail" class="clickable">
        <p class="table-card__side__name">
          <span>{{ tableDetail.name }}</span>
        </p>
        <div class="table-card__order-status"><OrderStatusBadge :table="tableDetail" /></div>

        <p class="table-card__side__product">
          <span>{{ $t("cafeManagement.totalCount") }}</span>
          <span
            >{{ tableDetail.paymentInfo.total_count }}
            {{ $tc("primary.item", tableDetail.paymentInfo.total_count) }}
          </span>
        </p>

        <p class="table-card__side__total-amount">
          <span>{{ $t("cafeManagement.totalPrice") }}</span>
          <span>{{ tableDetail.paymentInfo.total_amount | myCurrency }} </span>
        </p>
        <p class="table-card__side__payed-amount">
          <span>{{ $t("cafeManagement.totalPayed") }}</span>
          <span
            >{{ tableDetail.paymentInfo.net_payed_amount | myCurrency }}
          </span>
        </p>
        <p class="table-card__side__met-amount">
          <span>{{ $t("cafeManagement.totalRemaining") }}</span>
          <span>{{ tableDetail.paymentInfo.net_amount | myCurrency }} </span>
        </p>
        <hr />
      </span>
      <p class="table-card__side__time-cost">
        <span>{{ $t("cafeManagement.timeCost") }}</span>
        <span>{{ tableDetail.getHourlyPrice() | myCurrency }} </span>
      </p>

      <div class="table-card__side__time">
        <b-button
          @click="tableDetail.startTimer()"
          v-if="tableDetail.playNotPause"
          id="play"
          class="table-card__side__time__play"
          icon-right="play"
          custom-size="mdi-18px"
        />
        <b-button
          @click="tableDetail.stopTimer()"
          v-if="!tableDetail.playNotPause"
          id="pause"
          class="table-card__side__time__pause"
          icon-right="pause"
          custom-size="mdi-18px"
        />

        <b-button
          @click="tableDetail.resetTimer()"
          class="table-card__side__time__stop"
          icon-right="stop"
          custom-size="mdi-18px"
        />

        <p class="table-card__side__time__lable">
          {{ $t("cafeManagement.costPerHour") }}
        </p>

        <b-field size="is-small" class="table-card__side__time__cost-field">
          <b-input
            class="table-card__side__time__cost-field__input"
            type="number"
            placeholder="0"
            size="is-small"
            v-model="tableDetail.hourlyPrice"
          ></b-input>
        </b-field>

        <p class="table-card__side__time__timer">
          {{ watchDogTimer }}
          <span>
            <b-icon
              class="table-card__side__timer__icon"
              icon="clock-outline"
              size="is-small"
              type="is-danger"
            ></b-icon>
          </span>
        </p>
      </div>

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

    <div
      class="table-card__qrcode"
      v-if="tableDetail.tableType != 'merged'"
      @click="handleTableToken()"
    >
      <b-icon
        class="table-card__qrcode__icon"
        icon="qrcode"
        custom-size="mdi-18px"
      />
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
    handleTableToken() {
      this.$store.state.tableModule.tableToken = this.tableDetail;
      this.$store.state.tableModule.isTableTokenModalActive = true;
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
    watchDogTimer() {
      return this.tableDetail.getTimer();
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

.en {
  & .table-card__qrcode {
    right: 8rem;
  }
}
.fa {
  & .table-card__qrcode {
    left: 8rem;
  }
}

.table-card {
  margin: 1rem;

  position: relative;
  display: flex;

  background-color: rgb(255, 255, 255);

  min-height: 12.4rem;

  &__side {
    height: auto;
    width: 100%;

    padding: 1rem 1rem 0.5rem 1rem;

    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
    border-radius: 3px;

    &__name {
      margin: -7px 0 12px 0;
      font-size: 0.91rem !important;
    }

    &--free {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      justify-content: center;
      align-items: center;
      font-size: 1.2rem;

      &__name {
        font-weight: 500 !important;
      }
      &__description {
        font-weight: 300 !important;
      }

      &:hover {
        cursor: pointer;
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
        font-size: 1.2rem !important;
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
      font-size: 0.9rem;
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

    hr {
      background-color: #42424277;
      height: 1px;
      margin: 0.4rem 0;
    }

    &__time {
      display: flex;
      flex-direction: row;

      justify-content: space-evenly;
      align-items: center;

      margin-top: 0.5rem;

      &__play {
        flex: 1;
        height: 30px;
        max-width: 30px;

        border: 0;
        margin: 0.1rem;
      }
      &__pause {
        flex: 1;
        height: 30px;
        max-width: 30px;

        margin: 0.1rem;
        border: 0;
      }
      &__stop {
        flex: 1;
        height: 30px;
        max-width: 30px;

        margin: 0.1rem;
        border: 0;
      }
      &__lable {
        flex: 1 1 auto;
        font-size: 0.8rem !important;
        font-weight: 400 !important;
        margin-top: 0;
        margin-bottom: 0;
        margin-inline-start: 0.5rem;
        margin-inline-end: -1rem;
      }
      &__cost-field {
        flex: 2;
        width: 100%;
        margin: 0 0.1rem 0 0.5rem;
        margin-inline-start: 0.1rem;
        margin-inline-end: 0.5rem;

        &__input {
          width: 80px;
        }
      }
      &__timer {
        flex: 1 1 auto;
        justify-content: flex-end;
        display: flex;
      }
    }
  }

  &__qrcode {
    position: absolute;
    top: -0.7rem;

    display: flex;

    padding: 0.2rem 0.5rem;

    background-color: #fff;
    color: #000000;

    border-radius: 3px;

    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;

    &:hover {
      cursor: pointer;
    }

    &__icon {
      margin: 0.2rem 0.1rem;
    }
  }
}
</style>
