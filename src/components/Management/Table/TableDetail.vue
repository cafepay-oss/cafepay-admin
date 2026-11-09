<template>
  <div class="table-detail">
    <TableCloseInvoiceModal @closeInvoice="closeInvoice" />

    <b-modal
      v-if="tableDetail.tableType != 'free'"
      :active.sync="$store.state.tableModule.isCloseInvoiceModalActive"
      has-modal-card
    >
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            {{ $t("cafeManagement.payRemainingAmount") }}
          </p>
        </header>
        <section class="modal-card-body">
          <p>
            {{ $t("cafeManagement.pleaseSelectYourPaymentMethod") }}
            <br />
            <strong>{{ $t("cafeManagement.paymentAmount") }}</strong> {{ fullTableInvoicePrice | myCurrency }}
            <br />
            <br />
          </p>
          <div class="field">
            <b-radio
              v-model="payInvoiceMethod"
              native-value="1"
              type="is-primary"
              >{{ $t("cafeManagement.POS") }}</b-radio
            >
          </div>
          <div class="field">
            <b-radio
              v-model="payInvoiceMethod"
              native-value="2"
              type="is-primary"
              >{{ $t("cafeManagement.cash") }}</b-radio
            >
          </div>
        </section>
        <footer class="modal-card-foot">
          <b-button
            :loading="isLoading"
            class="modal-button"
            @click="$store.state.tableModule.isCloseInvoiceModalActive = false"
            >{{ $t("primary.cancel") }}</b-button
          >
          <b-button
            :loading="isLoading"
            :disabled="!payInvoiceMethod"
            class="modal-button is-primary"
            @click="payInvoice(tableDetail)"
            >{{ $t("cafeManagement.makePayment") }}</b-button
          >
        </footer>
      </div>
    </b-modal>

    <b-modal
      ref="CategoryModal"
      :active.sync="isTableProductModalActive"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <table-product-modal :table="tableDetail" />
    </b-modal>

    <header class="table-detail__header">
      <div>
        <p class="table-detail__eyebrow">جزئیات میز</p>
        <h2 class="table-detail__name">{{ tableDetail.name }}</h2>
      </div>
      <div class="table-detail__header-actions">
        <b-button v-if="tableDetail.joinId" type="is-danger" outlined icon-left="receipt"
          @click.prevent="handleCloseInvoiceClicked()">
          {{ $t('primary.closeInvoice') }}
        </b-button>
        <button type="button" class="table-detail__dismiss" aria-label="بستن جزئیات میز"
          title="بستن جزئیات میز" @click="close()">
          <b-icon icon="close" />
        </button>
      </div>
    </header>
    <div class="table-detail__container">
      <b-tabs
        type="is-boxed is-left"
        class="table-detail__tab"
        size="is-small"
        :animated="false"
      >
        <b-tab-item>
          <template slot="header">
            <b-icon custom-size="fa-lg" icon="coffee"></b-icon>
            <span>
              {{ $tc("primary.product", 2) }}
              <b-tag rounded>{{
                tableDetail.tableType == "fill"
                  ? tableDetail.paymentInfo.total_count
                  : 0
              }}</b-tag>
            </span>
          </template>
          <table-products
            :tableDetail="tableDetail"
            class="table-detail__products"
          />
        </b-tab-item>
        <b-tab-item>
          <template slot="header">
            <b-icon custom-size="fa-lg" icon="account"></b-icon>
            <span>
              {{ $tc("primary.customer", 2) }}
              <b-tag rounded>{{ tableDetail.scanned.length }}</b-tag>
            </span>
          </template>
          <table-people :tableDetail="tableDetail" />
        </b-tab-item>
        <!-- <b-tab-item>
          <template slot="header">
            <b-icon custom-size="fa-lg" icon="cogs"></b-icon>
            <span>عملیات ها</span>
          </template>
          <table-actions :table="tableDetail" />
        </b-tab-item>-->
      </b-tabs>
    </div>
    <div class="table-detail__scrollable"></div>
  </div>
</template>

<script>
import TableCloseInvoiceModal from "@/components/Management/Table/TableCloseInvoiceModal";
import TableProductModal from "@/components/Management/Table/TableProductModal";
import TableProducts from "@/components/Management/Table/TableProducts";
import TableActions from "@/components/Management/Table/TableActions";
import TablePeople from "@/components/Management/Table/TablePeople";
import CardComponent from "@/components/CardComponent";
import ModalBox from "@/components/ModalBox";

export default {
  name: "table-detail",
  components: {
    TableCloseInvoiceModal,
    TableProductModal,
    TableProducts,
    CardComponent,
    TableActions,
    TablePeople,
    ModalBox
  },
  props: {
    tableDetail: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isAddProductToTableModalActive: false,
      trashObject: {},
      editTableProducts: false,

      payInvoiceMethod: false
    };
  },
  methods: {
    handleCloseInvoiceClicked() {
      if (this.tableDetail.paymentInfo.net_amount > 0) {
        this.closeTableSelected = this.tableDetail;
        this.$store.state.tableModule.isTableCloseInvoiceModalActive = true;
      } else {
        this.$store.dispatch("tableModule/closeInvoice", {
          table: this.tableDetail.joinId,
          forceClose: true,
          sent: false
        });
      }
    },
    closeInvoice(payInvoiceMethod) {
      return this.$store.dispatch("tableModule/settleAndCloseInvoice", {
        table: this.tableDetail,
        method: payInvoiceMethod
      });
    },
    close() {
      this.$emit("close", true);
    },
    setFullTableInvoicePrice() {
      setTimeout(() => {
        let sum = 0;
        this.tableDetail.customers.forEach(customer => {
          customer.orders.forEach(order => {
            if (order.paymentInfo.net_amount) {
              sum += order.paymentInfo.net_amount;
            }
          });
        });
        this.fullTableInvoicePrice = sum;
      }, 100);
    },
    payInvoice(table) {
      let pbr = {
        payments: [],
        method: this.payInvoiceMethod
      };
      table.customers.forEach(customer => {
        customer.orders.forEach(order => {
          if (order.paymentInfo.net_amount) {
            pbr.payments.push({
              pbr: order.id,
              amount: order.paymentInfo.net_amount
            });
          }
        });
      });
      this.$store.dispatch("tableModule/payInvoice", pbr);
    },
    sendOrderKitchenAndPayInvoice() {
      let pbr = {
        payments: [],
        method: 2
      };

      this.tableDetail.customers.forEach(customer => {
        customer.orders.forEach(order => {
          pbr.payments.push({
            pbr: order.id,
            amount: order.paymentInfo.net_amount
          });
        });
      });

      this.$store.dispatch("tableModule/sendOrderKitchenAndPayInvoice", {
        joinId: this.tableDetail.joinId,
        pbr: pbr
      });
    }
  },
  computed: {
    isTableProductModalActive: {
      get() {
        return this.$store.state.tableModule.activeProductChangeModal > 0
      },
      set() {
        this.$store.state.tableModule.activeProductChangeModal = 0
      }
    },
    fullTableInvoicePrice() {
      let sum = 0;
      this.tableDetail.customers.forEach(customer => {
        customer.orders.forEach(order => {
          if (order.paymentInfo.net_amount) {
            sum += order.paymentInfo.net_amount;
          }
        });
      });
      return sum;
    },
    cafepayFee() {
      let cafepayFee = this.$store.state.accountModule.activeCafe.cafepayFee
      let feePayer = this.$store.state.accountModule.activeCafe.feePayer
      return feePayer ? 0 : cafepayFee
    }
  }
};
</script>

<style lang="scss" scoped>
.en {
  & .table-detail__data {
    right: 1rem;
  }
}
.fa {
  & .table-detail__data {
    left: 1rem;
  }
}

.table-detail {
  padding: 1rem 1rem 0.5rem;
  border-radius: 3px 3px 0 0;
  height: 100%;

  background-color: white;
  box-shadow: 0 -1rem 2rem rgba(0, 0, 0, 0.2);
  transition: all 0.75s ease;

  &__container {
    margin: 1rem 2rem;
    position: relative;
  }

  &__data {
    position: absolute;
    display: flex;

    &__name {
      font-weight: 400;
      padding: 0 1rem;
    }
  }

  &__tab {
    margin-top: 0.5rem;

    &--products {
      display: inline;

      &__buttons {
        display: flex;
        justify-content: space-between;
      }

      &__pay-invoice {
        margin: 0 0.5rem auto 0.5rem;
      }

      &__add-product {
        margin: 0 0.5rem 0.5rem 0.5rem;
      }

      &__close-invoice {
        margin: 0 0.5rem auto 0.5rem;
      }
    }
  }

  &__exit {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.4rem;

    &:hover {
      cursor: pointer;
    }
  }
}

.message-warning {
  & .media {
    background: red;
    text-align: start !important;
  }
}

.modal-button {
  margin: 0 0.5rem !important;
  box-shadow: 0 2px 2px #b8b8b8 !important;
}

.green {
  color: green;
}

.red {
  color: red;
}

.bold {
  font-weight: 500;
  font-size: 1rem;
  color: #000;
}
</style>
