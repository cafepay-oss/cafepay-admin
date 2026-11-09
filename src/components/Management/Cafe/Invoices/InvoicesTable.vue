<template>
  <div>
    <TableCloseInvoiceModal @closeInvoice="closeInvoice" />
    <b-modal
      :active.sync="$store.state.tableModule.isCloseInvoiceModalActive"
      has-modal-card
      v-if="activeInvoices.length > 0"
    >
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ $t("cafeManagement.makePaymentOnInvoice") }}</p>
        </header>
        <section class="modal-card-body">
          <p>
            {{ $t("cafeManagement.pleaseSelectYourPaymentMethod") }}
            <br />
            <strong>{{ $t("cafeManagement.paymentAmount") }}</strong> {{ fullTableInvoicePrice }}
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
            @click="payInvoice"
            >{{ $t("cafeManagement.makePayment") }}</b-button
          >
        </footer>
      </div>
    </b-modal>

    <b-table
      :loading="isLoading"
      :data="activeInvoices"
      striped
      hoverable
      :row-class="
        (row, index) => {
          let clss = 'invoice-row'
          if (row.colorState == 3) {
            return clss + ' green';
          } else if (row.colorState == 0) {
            return clss + ' yellow';
          } else if (row.colorState == 1) {
            return clss + ' blue';
          } else if (row.colorState == 2) {
            return clss + ' red';
          }
        }
      "
      detailed
      custom-detail-row
      detail-key="joinId"
      :has-detailed-visible="(row) => !!row.table.description"
      :show-detail-icon="true"
      class="invoices-table"
      :opened-detailed="activeInvoices.reduce((o,u) => u.table.description ? o.concat(u.joinId) : o, []) /* open all of them */"
    >
      <template slot-scope="props">
        <b-table-column
          :label="$tc('primary.table', 1)"
          field="table"
          sortable
          width="100"
        >
          {{ props.row.table.name }}
        </b-table-column>

        <b-table-column :label="$t('primary.status')" field="colorState" width="170">
          <OrderStatusBadge :color-state="props.row.colorState" />
        </b-table-column>

        <b-table-column
          :label="$tc('primary.product', 2)"
          field="products"
          sortable
          width="450"
        >
          <span class="invoice-products">{{ props.row.paymentInfo.name }}</span>
          <span
            class="link"
            @click.prevent="$emit('showTableDetail', props.row.table)"
          >
            ({{ $t("primary.edit") }})
          </span>
        </b-table-column>

        <b-table-column
          :label="$t('primary.count')"
          field="number"
          centered
          sortable
        >
          {{ props.row.paymentInfo.number }}
        </b-table-column>

        <b-table-column
          :label="$t('primary.price')"
          field="price"
          centered
          sortable
          width="110"
        >
          {{ props.row.paymentInfo.price | myCurrency }}
        </b-table-column>

        <b-table-column
          :label="$t('primary.payed')"
          field="payed"
          class="payed"
          centered
          sortable
          width="110"
        >
          {{ props.row.paymentInfo.payed | myCurrency }}
        </b-table-column>

        <b-table-column
          :label="$t('primary.remaining')"
          field="netAmount"
          class="net-amount"
          centered
          sortable
          width="110"
        >
          {{ props.row.paymentInfo.netAmount | myCurrency }}
        </b-table-column>

        <b-table-column
          :label="$tc('primary.action', 2)"
          field="state"
          centered
          sortable
          width="150"
        >
          <section class="b-tooltips invoice-actions">
            <template v-if="props.row.products.length > 0">

              <b-tooltip
                :size="buttonSize"
                :loading="isLoading"
                class="buttons"
                :label="$t('cafeManagement.printInvoice')"
                type="is-dark"
                v-if="!isMobile"
              >
                <button type="button" :aria-label="$t('cafeManagement.printInvoice')"
                  @click.prevent="printInvoice(props.row.table)"
                  :class="buttonSize"
                  class="tooltip-button button"
                >
                  <b-icon v-if="isMobile" custom-size="mdi-24px"  icon="printer" />
                  <b-icon v-else :size="buttonSize" icon="printer" />
                <span class="action-label">{{ $t('cafeManagement.printInvoice') }}</span>
                </button>
              </b-tooltip>

              <b-tooltip
                :size="buttonSize"
                :loading="isLoading"
                class="buttons"
                :label="
                  !props.row.state
                    ? $t('primary.sendToKitchen')
                    : $t('primary.sendAgain')
                "
                :type="!props.row.state ? 'is-success' : 'is-link'"
              >
                <button type="button" :aria-label="
                  !props.row.state
                    ? $t('primary.sendToKitchen')
                    : $t('primary.sendAgain')
                "
                  @click.prevent="
                    sendOrderKitchen(
                      props.row.paymentInfo,
                      props.row.table,
                      props.row.state
                    )
                  "
                  class="tooltip-button button"
                  :class="{
                    'is-medium' : buttonSize == 'is-medium',
                    'is-small' : buttonSize == 'is-small',
                    'is-success': !props.row.state,
                    'is-link': props.row.state
                  }"
                >
                  <b-icon v-if="isMobile" custom-size="mdi-24px" icon="pot-mix" />
                  <b-icon v-else :size="buttonSize" icon="pot-mix" />
                <span class="action-label">{{
                  !props.row.state
                    ? $t('primary.sendToKitchen')
                    : $t('primary.sendAgain')
                 }}</span>
                </button>
              </b-tooltip>

              <b-tooltip
                v-if="
                  props.row.table.paymentInfo &&
                    props.row.table.paymentInfo.net_amount
                "
                :size="buttonSize"
                :loading="isLoading"
                class="buttons"
                :label="$t('primary.pay')"
                type="is-primary"
              >
                <button type="button" :aria-label="$t('primary.pay')"
                  @click="handlePayInvoiceClicked(props.row.table)"
                  class="tooltip-button button is-primary"
                  :class="buttonSize"
                >
                  <b-icon v-if="isMobile" custom-size="mdi-24px" icon="credit-card-outline" />
                  <b-icon v-else :size="buttonSize" icon="credit-card-outline" />
                <span class="action-label">{{ $t('primary.pay') }}</span>
                </button>
              </b-tooltip>

            </template>
            <b-tooltip
              class="buttons"
              :label="$t('primary.closeInvoice')"
              type="is-danger"
            >
              <button type="button" :aria-label="$t('primary.closeInvoice')"
                @click.prevent="handleCloseInvoiceClicked(props.row.table)"
                class="tooltip-button button is-danger is-outlined"
                :class="buttonSize"
              >
                <b-icon v-if="isMobile" custom-size="mdi-24px" icon="receipt" />
                <b-icon v-else :size="buttonSize" icon="receipt" />
              <span class="action-label">{{ $t('primary.closeInvoice') }}</span>
                </button>
            </b-tooltip>
          </section>
        </b-table-column>
      </template>


      <template slot="detail" slot-scope="props">
        <tr>
          <td colspan="9" style="font-size: 14px; padding-right: 17px;">
            توضیحات: {{ props.row.table.description }}
          </td>
        </tr>
      </template>

      <section class="section" slot="empty">
        <div class="content has-text-grey has-text-centered">
          <template v-if="isLoading">
            <p>
              <b-icon icon="dots-horizontal" size="is-large" />
            </p>
            <p>{{ $t("primary.loading") }}</p>
          </template>
          <template v-else>
            <p>{{ $t("primary.noInformation") }}</p>
          </template>
        </div>
      </section>
    </b-table>
  </div>
</template>

<script>
import TableCloseInvoiceModal from "@/components/Management/Table/TableCloseInvoiceModal";
import kitchenPrinters from "@/javascripts/kitchenPrinter.js";
import printers from "@/javascripts/printer.js";
import OrderStatusBadge from "@/components/OrderStatusBadge.vue";

export default {
  name: "InvoicesTable",
  components: {
    TableCloseInvoiceModal,
    OrderStatusBadge
  },
  props: [
    'activeInvoices'
  ],
  data() {
    return {
      payInvoiceMethod: null,
      selectedTable: null,
      fullTableInvoicePrice: null
    };
  },
  computed: {
    buttonSize(){
      return this.isMobile ? 'is-medium' : 'is-small'
    },
    cafepayFee() {
      let cafepayFee = this.$store.state.accountModule.activeCafe.cafepayFee;
      let feePayer = this.$store.state.accountModule.activeCafe.feePayer;
      return feePayer ? 0 : cafepayFee;
    },
    tables() {
      return this.$store.state.tableModule.tables;
    },
  },
  methods: {
    handlePayInvoiceClicked(table) {
      this.selectedTable = table;
      this.setFullTableInvoicePrice();
      this.$store.state.tableModule.isCloseInvoiceModalActive = true;
    },
    handleCloseInvoiceClicked(table) {
      if (table.paymentInfo.net_amount > 0) {
        this.closeTableSelected = table;
        this.$store.state.tableModule.isTableCloseInvoiceModalActive = true;
      } else {
        this.$store.dispatch("tableModule/closeInvoice", {
          table: table.joinId,
          forceClose: true,
          sent: false
        });
      }
    },
    setFullTableInvoicePrice() {
      let sum = 0;
      this.selectedTable.customers.forEach(customer => {
        customer.orders.forEach(order => {
          if (order.paymentInfo.net_amount) {
            sum += order.paymentInfo.net_amount;
          }
        });
      });
      this.fullTableInvoicePrice = sum;
    },
    closeInvoice(payInvoiceMethod) {
      return this.$store.dispatch("tableModule/settleAndCloseInvoice", {
        table: this.closeTableSelected,
        method: payInvoiceMethod
      });
    },
    printInvoice(table) {
      let ordersToPrint = [];
      table.getTableProducts().forEach(tableProduct => {
        ordersToPrint.push(tableProduct);
      });
      this.printOrders({
        templateType: this.PrinterTemplateTypesEnum.CUSTOMER,
        ordersToPrint,
        table,
      })
    },
    sendOrderKitchen(product, table, state) {
      let orders = table.getTableProducts();
      let readyToSendOrders = [];

      if (state) {
        orders.forEach(order => {
          readyToSendOrders.push(order);
        });
      } else {
        orders.forEach(order => {
          if (!order.sentToKitchen) {
            readyToSendOrders.push(order);
          }
        });
      }
      if (readyToSendOrders.length > 0) {
        this.printOrders({
          templateType: this.PrinterTemplateTypesEnum.KITCHEN,
          ordersToPrint: readyToSendOrders,
          table,
        })
      }
      if (!state) {
        table.customers.forEach(customer => {
          customer.orders.forEach(order => {
            if (!order.sentToKitchen) {
              this.$store.dispatch("tableModule/sendOrderKitchen", order.id);
            }
          });
        });
      }
    },
    payInvoice() {
      let table = this.selectedTable;
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
    }
  }
};
</script>

<style lang="scss">
@media screen and (max-width: 768px) {
  .invoices-table.b-table .table.has-mobile-cards tr.invoice-row {
    margin-top: 2rem !important;
  }
  .invoices-table.b-table .table.has-mobile-cards tr {
    font-size: 125%;
  }
  .invoice-products {
    padding-right: 10px;
  }
}
.tooltip-button {
  margin-bottom: 0.1em !important;
  margin: 0 0.2em !important;
}

.b-tooltip {
  & button {
    border-radius: 2px;
    margin: 0;

    & .icon {
      font-size: 0.85rem;
    }
  }
}

i {
  font-size: 1rem;
}

.modal-button {
  margin: 0 0.5rem !important;
  box-shadow: 0 2px 2px #b8b8b8 !important;
}

.link {
  font-size: 0.8em;
  color: #6e6e6e;

  &:hover {
    cursor: pointer;
    color: rgb(0, 68, 255);
  }
}

.net-amount {
  color: red !important;
}

.payed {
  color: rgb(0, 99, 0) !important;
}
</style>
