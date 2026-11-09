<template>
  <section>
    <b-modal
      v-if="tableDetail.tableType != 'free'"
      :active.sync="$store.state.tableModule.isPayInvoiceModalActive"
      has-modal-card
    >
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            {{ $t("cafeManagement.makePaymentOnInvoice") }}
          </p>
        </header>
        <section class="modal-card-body">
          <p>
            {{ $t("cafeManagement.pleaseSelectYourPaymentMethod") }}
            <br />
            <strong>{{ $t("cafeManagement.paymentAmount") }}</strong> {{ sum }}
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
            @click="$store.state.tableModule.isPayInvoiceModalActive = false"
            >{{ $t("primary.cancel") }}</b-button
          >
          <b-button
            :loading="isLoading"
            :disabled="!payInvoiceMethod"
            class="modal-button is-primary"
            @click="payInvoice()"
            >{{ $t("cafeManagement.makePayment") }}</b-button
          >
        </footer>
      </div>
    </b-modal>
    <b-modal
      :active.sync="$store.state.tableModule.isRefundModalActive"
      has-modal-card
    >
      <TableRefundModal />
    </b-modal>

    <b-modal
      :active.sync="$store.state.tableModule.isDiscountModalActive"
      has-modal-card
    >
      <TableDiscountModal :table="tableDetail" />
    </b-modal>

    <div class="order-toolbar">
      <div class="order-toolbar__group">
        <p class="order-toolbar__label">سفارش</p>
        <div class="order-toolbar__actions">
          <b-button type="is-info" outlined :icon-left="tableProducts.length ? 'pencil-outline' : 'plus'"
            :loading="isLoading" @click="$store.state.tableModule.activeProductChangeModal = 2">
            {{ tableProducts.length ? $tc('cafeManagement.editOrder', 2) : $t('cafeManagement.submitOrder') }}
          </b-button>
          <b-button v-if="tableProducts.length" icon-left="printer" :loading="isLoading" @click="printInvoice()">
            {{ $t('cafeManagement.printInvoice') }}
          </b-button>
          <b-button v-if="tableDetail.paymentInfo && tableDetail.paymentInfo.total_count" icon-left="percent"
            :loading="isLoading" @click="handleTableDiscount()">{{ $t('primary.discount') }}</b-button>
          <b-button v-if="tableProducts.length" type="is-info" outlined icon-left="silverware-fork-knife"
            :loading="isLoading" :disabled="!sendOrderToKitchenPBRs.length" @click="sendOrderToKitchen()">
            {{ $t('cafeManagement.sendToKitchen') }}
          </b-button>
        </div>
      </div>
      <div class="order-toolbar__group order-toolbar__group--payment">
        <p class="order-toolbar__label">پرداخت</p>
        <div class="order-toolbar__actions">
          <b-button v-if="tableDetail.paymentInfo && tableDetail.paymentInfo.net_amount" type="is-success" outlined
            icon-left="credit-card" :loading="isLoading" :disabled="!isThereAnyPaymentAmount"
            @click="$store.state.tableModule.isPayInvoiceModalActive = true">پرداخت انتخاب‌شده</b-button>
          <b-button v-if="tableDetail.paymentInfo && tableDetail.paymentInfo.net_amount" type="is-success"
            icon-left="check-circle-outline" :loading="isLoading"
            @click="$store.state.tableModule.isCloseInvoiceModalActive = true">{{ $t('cafeManagement.payRemainingAmount') }}</b-button>
          <b-button v-if="tableDetail.paymentInfo && !tableDetail.paymentInfo.net_amount" icon-left="check-circle-outline"
            :loading="isLoading" @click="closeInvoice">{{ $t('cafeManagement.closeInvoice') }}</b-button>
          <b-button v-if="tableDetail.paymentInfo && tableDetail.paymentInfo.payed_amount" type="is-danger" outlined
            icon-left="cash-refund" :loading="isLoading" @click="handleTableRefund()">{{ $t('cafeManagement.refund') }}</b-button>
        </div>
      </div>
    </div>
    <card-component
      class="table-products has-table table-card has-mobile-sort-spaced"
    >
      <b-table
        class="table"
        cell-class="hover-blue"
        :data="tableProducts"
        ref="table"
        detailed
        hoverable
        custom-detail-row
        detail-key="pbrId"
        :narrowed="true"
        :sticky-header="true"
        bordered
        :loading="$store.state.tableModule.tableLoading"
        :empty="!tableProducts.length"
        @details-open="showCustomerName = showCustomerName + 1"
        @details-close="showCustomerName = showCustomerName - 1"
        :show-detail-icon="showDetailIcon"
      >
        <template slot-scope="props">
          <b-table-column
            field="product-name"
            :visible="columnsVisible['name'].display"
            :label="columnsVisible['name'].title"
            width="250"
            sortable
          >
            <template v-if="showDetailIcon">{{ props.row.name }}</template>
            <template v-else>
              <a @click="toggle(props.row)">{{ props.row.name }}</a>
            </template>
          </b-table-column>

          <b-table-column
            field="number"
            :visible="columnsVisible['number'].display"
            :label="columnsVisible['number'].title"
            sortable
            centered
            >{{ props.row.number }}
            {{ $tc("primary.item", props.row.number) }}</b-table-column
          >

          <b-table-column
            field="price"
            :visible="columnsVisible['price'].display"
            :label="columnsVisible['price'].title"
            sortable
            centered
            >{{ props.row.price | myCurrency }}
            <b-tag v-if="props.row.discount > 0" type="is-secondary"
              >{{ props.row.discount }}%-</b-tag
            >
          </b-table-column>

          <b-table-column
            field="payed"
            class="payed"
            :visible="columnsVisible['payed'].display"
            :label="columnsVisible['payed'].title"
            sortable
            centered
            >{{ props.row.payed | myCurrency }}</b-table-column
          >

          <b-table-column
            field="netAmount"
            class="net-amount"
            :visible="columnsVisible['netAmount'].display"
            :label="columnsVisible['netAmount'].title"
            sortable
            centered
            >{{ props.row.netAmount | myCurrency }}</b-table-column
          >

          <b-table-column
            field="preferredPaymentMethod"
            class="preferred-payment-method"
            :visible="columnsVisible['preferredPaymentMethod'].display"
            :label="columnsVisible['preferredPaymentMethod'].title"
            sortable
            centered
            >{{ props.row.preferredPaymentMethod }}</b-table-column
          >

          <b-table-column
            field="newPBR"
            class="new-pbr"
            :visible="columnsVisible['newPBR'].display"
            :label="columnsVisible['newPBR'].title"
            sortable
            centered
          >
            <b-input
              size="is-small"
              placeholder="0"
              v-model="props.row.newPBR"
              type="number"
              min="0"
              :disabled="!props.row.netAmount"
              :max="props.row.netAmount"
              step="100"
              @input="setIsThereAnyPaymentAmount()"
            >
            </b-input>
          </b-table-column>

          <b-table-column
            field="kitchen"
            :visible="columnsVisible['kitchen'].display"
            :label="columnsVisible['kitchen'].title"
            centered
          >
            <b-checkbox
              dir="ltr"
              v-model="sendOrderToKitchenPBRs"
              :native-value="props.row"
              type="is-primary"
            >
              {{ props.row.sentToKitchen ? $t("primary.sendAgain") : $t("primary.send") }}
            </b-checkbox>
          </b-table-column>

          <!-- <b-table-column
            field="state"
            :visible="columnsVisible['state'].display"
            :label="columnsVisible['state'].title"
            centered
          >
            <span v-if="props.row.sentToKitchen">{{
              $t("primary.kitchen")
            }}</span>
            <span v-else>
              ارسال نشده
            </span>
          </b-table-column> -->
        </template>

        <template slot="detail" slot-scope="props">
          <tr v-for="item in props.row.items" :key="item.name">
            <td v-if="showDetailIcon"></td>
            <td v-show="columnsVisible['name'].display">
              &nbsp;&nbsp;&nbsp;&nbsp;{{ item.name }} ({{
                moment(item.lastUpdate).fromNow()
              }})
            </td>
            <td
              v-show="columnsVisible['number'].display"
              class="has-text-centered"
            >
              {{ item.number }}{{ $tc("primary.item", props.row.number) }}
            </td>
            <td
              v-show="columnsVisible['price'].display"
              class="has-text-centered"
            >
              {{ item.price | myCurrency }}
            </td>
            <td
              v-show="columnsVisible['payed'].display"
              class="has-text-centered"
            >
              {{ item.payed | myCurrency }}
            </td>
            <td
              v-show="columnsVisible['netAmount'].display"
              class="has-text-centered"
            >
              {{ item.netAmount | myCurrency }}
            </td>
            <td
              v-show="columnsVisible['preferredPaymentMethod'].display"
              class="has-text-centered"
            >
              {{
                item.preferredPaymentMethod == "0"
                  ? $t("primary.online")
                  : $t("primary.cash")
              }}
            </td>
            <td
              v-show="columnsVisible['state'].display"
              class="has-text-centered"
            ></td>
            <td
              v-show="columnsVisible['state'].display"
              class="has-text-centered"
            ></td>
          </tr>
        </template>
      </b-table>
    </card-component>
    <b-field class="description-field">
      <p class="control">
        <span class="button is-info" @click="submitDescription">{{ $t("primary.submit") }}</span>
      </p>
      <b-input :placeholder="$t('primary.description')" v-model="newDescription" expanded></b-input>
      <p class="control">
        <span class="button is-static">{{ $t("primary.description") }}</span>
      </p>
    </b-field>
    <TablePaymentStateOverall :table="tableDetail" />
  </section>
</template>

<script>
import TablePaymentStateOverall from "@/components/Management/Table/TablePaymentStateOverall";
import TableDiscountModal from "@/components/Management/Table/TableDiscountModal";
import TableRefundModal from "@/components/Management/Table/TableRefundModal";
import kitchenPrinters from "@/javascripts/kitchenPrinter.js";
import CardComponent from "@/components/CardComponent";
import printers from "@/javascripts/printer.js";

import { ToastProgrammatic as Toast } from "buefy";

export default {
  components: {
    TablePaymentStateOverall,
    TableDiscountModal,
    TableRefundModal,
    CardComponent
  },
  data() {
    return {
      showCustomerName: 1,
      columnsVisible: {
        name: { title: this.$tc("primary.product", 2), display: true },
        number: { title: this.$t("primary.count"), display: true },
        price: { title: this.$t("primary.price"), display: true },
        payed: { title: this.$t("primary.payed"), display: true },
        netAmount: { title: this.$t("primary.remaining"), display: true },
        kitchen: { title: this.$t("primary.kitchen"), display: true },
        state: { title: this.$t("primary.status"), display: true },
        newPBR: { title: this.$t("primary.payByAmount"), display: true },
        preferredPaymentMethod: {
          title: this.$t("primary.preferredPaymentMethod"),
          display: true
        }
      },
      showDetailIcon: true,
      stickyHeaders: true,
      payInvoiceMethod: false,
      sendOrderToKitchenPBRs: [],
      isThereAnyPaymentAmount: false,
      show: false,
      sum: null,
      newDescription: '',
    };
  },
  props: {
    tableDetail: {
      type: Object,
      required: true
    }
  },
  computed: {
    tableJoinDescription(){
      return this.tableDetail ? this.tableDetail.description : ''
    },
    cafepayFee() {
      let cafepayFee = this.$store.state.accountModule.activeCafe.cafepayFee;
      let feePayer = this.$store.state.accountModule.activeCafe.feePayer;
      return feePayer ? 0 : cafepayFee;
    },
    tableProducts() {
      let tableProducts = this.tableDetail.getTableProducts();
      tableProducts.forEach(product => {
        product.newPBR = "";
        product.preferredPaymentMethod = "";

        if (product.preferredPaymentMethods.includes("0")) {
          product.preferredPaymentMethod += this.$t("primary.online") + " - ";
        }
        if (product.preferredPaymentMethods.includes("1")) {
          product.preferredPaymentMethod += this.$t("primary.cash") + " - ";
        }
        product.preferredPaymentMethod = product.preferredPaymentMethod.slice(
          0,
          -3
        );
      });
      return tableProducts.sort((a, b) => a.id - b.id);
    }
  },
  watch: {
    tableProducts: {
      deep: true,
      handler: function(_newValue, _oldValue){
        // Baraye in ke zire dastesh yehoo chize jadidi ke oomad ersal be ashpazkhane nashe
        setTimeout(this.sendToKitchenSetDefault, 500)
      }
    },
    tableJoinDescription(newValue, _oldValue){
      this.newDescription = newValue;
    },
  },
  mounted(){
    this.newDescription = this.tableJoinDescription
    this.sendToKitchenSetDefault()
  },
  methods: {
    // select all products for kitchen by default
    sendToKitchenSetDefault() {
      this.sendOrderToKitchenPBRs = this.tableProducts.filter(pbr => !pbr.sentToKitchen)
    },
    printInvoice() {
      let ordersToPrint = [];
      this.tableProducts.forEach(tableProduct => {
        ordersToPrint.push(tableProduct);
      });
      this.printOrders({
        templateType: this.PrinterTemplateTypesEnum.CUSTOMER,
        ordersToPrint,
        table: this.tableDetail
      })
    },
    toggle(row) {
      this.$refs.table.toggleDetails(row);
    },
    fullPrice() {
      let sum = 0;
      this.tableProducts.forEach(product => {
        if (product.newPBR) {
          if (parseInt(product.newPBR, 10) > 0) {
            sum += parseInt(product.newPBR, 10);
          }
        }
      });
      this.sum = sum;
    },
    sendOrderToKitchen() {
      this.sendOrderToKitchenPBRs.forEach(order => {
        order.items.forEach(item => {
          item.pbrs.forEach(pbr => {
            if(!pbr.sentToKitchen) {
              this.$store.dispatch("tableModule/sendOrderKitchen", pbr.pbrId);
            }
          });
        });
      });
      this.print();
    },
    print() {
      this.printOrders({
        templateType: this.PrinterTemplateTypesEnum.KITCHEN,
        ordersToPrint: this.sendOrderToKitchenPBRs,
        table: this.tableDetail
      })
      this.sendOrderToKitchenPBRs = [];
    },
    payInvoice() {
      let pbrList = {
        payments: [],
        method: this.payInvoiceMethod
      };

      this.tableProducts.forEach(product => {
        if (product.newPBR) {
          let newPBR = product.newPBR;

          product.items.forEach(item => {
            item.pbrs.forEach(pbr => {
              if (pbr.payment.net_amount) {
                if (pbr.payment.net_amount > newPBR) {
                  pbrList.payments.push({
                    pbr: pbr.pbrId,
                    amount: newPBR
                  });
                  newPBR = 0;
                } else {
                  pbrList.payments.push({
                    pbr: pbr.pbrId,
                    amount: pbr.payment.net_amount
                  });
                  newPBR -= pbr.payment.net_amount;
                }
              }
            });
          });
        }
      });

      this.$store.dispatch("tableModule/payInvoice", pbrList);
      this.sum = null;
      this.isThereAnyPaymentAmount = false;
      this.payInvoiceMethod = null;
    },
    submitDescription(){
      this.request({
        method: "PUT",
        url: `/api/v1/join/${this.tableDetail.joinId}/set/description/`,
          data: {
            description: this.newDescription,
          }
      })
      .then(res => {
        Toast.open({
          queue: false,
          message: `توضیحات با موفقیت ثبت شد`,
          type: "is-success"
        });
      })
      .catch(err => {
        if (err.response) {
          Toast.open({
            queue: false,
            message: "خطا در ثبت توضیحات",
            type: "is-danger"
          });
        }
      })
    },
    closeInvoice() {
      this.$store.dispatch("tableModule/closeInvoice", {
        table: this.tableDetail.joinId,
        forceClose: false,
        sent: true
      });
    },
    isAnyProductLeftForKitchen() {
      return this.tableProducts.find(product => !product.sentToKitchen);
    },
    setIsThereAnyPaymentAmount() {
      let changedProduct = this.tableProducts.find(
        product => product.newPBR > 0
      );
      this.tableProducts.forEach(product => {
        if (parseInt(product.newPBR, 10) > product.netAmount) {
          product.newPBR = "";
          setTimeout(() => {
            product.newPBR = product.netAmount + "";
          }, 1);
        }
      });

      if (changedProduct) {
        this.isThereAnyPaymentAmount = true;
      } else {
        this.isThereAnyPaymentAmount = false;
      }
      setTimeout(() => {
        this.fullPrice();
      }, 5);
    },
    handleTableRefund() {
      this.$store.state.tableModule.refundTable = this.tableDetail;
      this.$store.state.tableModule.isRefundModalActive = true;
    },
    handleTableDiscount() {
      this.$store.state.tableModule.discountTable = this.tableDetail;
      this.$store.state.tableModule.isDiscountModalActive = true;
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
  border-radius: 20px 20px 0 0;

  background-color: white;
  box-shadow: 0 -1rem 2rem rgba(0, 0, 0, 0.2);
  transition: all 0.75s ease;

  &__container {
    margin: 1rem 2rem;
    position: relative;
  }

  &__data {
    position: absolute;

    &__name {
      font-weight: 400;
    }
  }

  &__tab {
    margin-top: 1.5rem;

    &--products {
      display: inline;

      &__buttons {
        display: flex;
        justify-content: space-between;
      }

      &__print-invoice,
      &__pay-invoice,
      &__add-product,
      &__refund {
        margin-inline-end: 0.5em;
        margin-bottom: 0.5em;
      }
    }
  }

  &__exit {
    position: absolute;
    top: 1rem;
    right: 1rem;

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

.b-radio.radio {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-start;

  & > * {
    margin-inline-end: 10px !important;
  }
}



.table-products {
  height: 28vh;
  overflow-y: auto;
  margin-bottom: 0 !important;
  border-bottom: none !important;

  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
    box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
    background-color: #e6e6e6;
  }

  &::-webkit-scrollbar {
    width: 11px;
    background-color: #e6e6e6;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #adb0b4;
  }
}

tr > td {
  font-weight: 400 !important;
  color: #000 !important;
}

.table.is-hoverable tbody tr {
  background-color: #f1fdff !important;
}

.net-amount {
  color: red !important;
}

.payed {
  color: rgb(0, 99, 0) !important;
}
.modal-button {
  margin: 0 0.5rem !important;
  box-shadow: 0 2px 2px #b8b8b8 !important;
}
.bold {
  font-weight: 500;
  font-size: 1rem;
  color: #000;
}
.description-field {
  border-radius: 0 !important;
  margin-bottom: 0 !important;
  direction: ltr !important;
  & * {
    border-radius: 0 !important;
  direction: rtl !important;
  }
}
</style>
