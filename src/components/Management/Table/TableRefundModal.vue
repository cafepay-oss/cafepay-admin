<template>
  <div class="modal-card refund-modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">{{ $t("cafeManagement.refund") }}</p>
    </header>
    <section class="modal-card-body">
      <p class="payment-entry-help">{{ $t('cafeManagement.refundWalletHelp') }}</p>
      <p class="payment-entry-help">{{ $t('cafeManagement.refundManualHelp') }}</p>
      <b-table
        class="table refund-table"
        :data="tableInvoices"
        hoverable
        bordered
        :narrowed="true"
        :sticky-header="true"
        :loading="isLoading"
        :empty="!tableInvoices.length"
      >
        <template slot-scope="props">
          <b-table-column field="user" :label="$t('primary.user')">
            <template>{{ props.row.owner }}</template>
          </b-table-column>

          <b-table-column field="product" :label="$tc('primary.product', 1)">
            <template>{{ props.row.product.name }}</template>
          </b-table-column>

          <b-table-column
            :label="$t('primary.date')"
            field="date"
            centered
            sortable
          >
            {{ new Date(props.row.datetime).toLocaleDateString($i18n.locale) }}
          </b-table-column>

          <b-table-column
            :label="$t('primary.time')"
            field="time"
            centered
            sortable
          >
            {{ new Date(props.row.datetime).toLocaleDateString($i18n.locale) }}
          </b-table-column>

          <b-table-column :label="$t('primary.price')" field="amount" centered>
            {{ props.row.amount | myCurrency}}
          </b-table-column>

          <b-table-column
            :label="$t('primary.paymentMethod')"
            field="method"
            centered
          >
            {{
              props.row.method == 0
                ? $t("primary.online")
                : props.row.method == 1
                ? $t("primary.POS")
                : props.row.method == 2
                ? $t("primary.cash")
                : $t("primary.discount")
            }}
          </b-table-column>

          <b-table-column
            field="refundWholePbr"
            label="کل مبلغ"
            centered
          >
            <b-checkbox
              v-model="props.row.refundWholePbr"
              @input="refundWholePbrUpdated(props.row)"
            >
            </b-checkbox>
          </b-table-column>

          <b-table-column
            field="refundPbr"
            :label="$t('primary.RefundByAmount')"
            centered
          >
            <b-input
              :disabled="props.row.refundWholePbr"
              size="is-small"
              placeholder="0"
              v-model="props.row.refundPBR"
              type="number"
              min="0"
              step="100"
              :max="props.row.amount"
              @input="setIsThereAnyRefundAmount()"
            >
            </b-input>
          </b-table-column>
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
      <div class="notifications">
        <b-notification
          v-for="notification in notifications"
          :key="notification.text"
          type="is-warning"
          aria-close-label="Close notification"
          role="alert"
        >
          {{ notification.text }}
        </b-notification>
      </div>
    </section>
    <footer class="modal-card-foot">
      <b-button
        :loading="isLoading"
        :disabled="!isThereAnyRefundAmount"
        @click="refund()"
        class="button done is-info"
        >{{ $t("cafeManagement.confirmRefund") }}</b-button
      >
      <b-button
        :loading="isLoading"
        class="button exit"
        @click.native="closeModal()"
        >{{ $t("primary.cancel") }}</b-button
      >
    </footer>
  </div>
</template>

<script>
import Vue from 'vue'
export default {
  name: "TableRefundModal",
  data() {
    return {
      isThereAnyRefundAmount: false
    };
  },
  props: {
    notifications: {
      type: Array,
      default: []
    }
  },
  methods: {
    refundWholePbrUpdated(row){
      if(row.refundWholePbr) {
        Vue.set(row , 'refundPBR' ,row.amount)
        this.setIsThereAnyRefundAmount()
      }
    },
    refund() {
      let data = [];
      let internal_refund_data = [];

      this.tableInvoices.forEach(tablepbr => {
        if (parseInt(tablepbr.refundPBR) > 0) {
          if (tablepbr.user) {
            data.push({
              pbr: tablepbr.pbrId,
              amount: parseInt(tablepbr.refundPBR),
              to: tablepbr.user.pk,
              invoice: tablepbr.invoiceId
            });
          } else {
            internal_refund_data.push({
              pbr: tablepbr.pbrId,
              amount: parseInt(tablepbr.refundPBR),
              invoice: tablepbr.invoiceId
            });
          }
        }
      });

      if (data)
        this.$store.dispatch("tableModule/refundPbr", { refunds: data });
      if (internal_refund_data)
        this.$store.dispatch("tableModule/internalRefundPbr", {
          refunds: internal_refund_data
        });
    },
    setIsThereAnyRefundAmount() {
      this.tableInvoices.forEach(pbr => {
        if (pbr.refundPBR > pbr.amount) {
          setTimeout(() => {
            pbr.refundPBR = pbr.amount;
          }, 1);
        }
      });
      if (this.tableInvoices.find(pbr => parseInt(pbr.refundPBR) > 0)) {
        this.isThereAnyRefundAmount = true;
      } else {
        this.isThereAnyRefundAmount = false;
      }
    },
    closeModal() {
      this.$store.state.tableModule.isRefundModalActive = false;
      this.$store.state.tableModule.isDiscountRefundModalActive = false;
    }
  },
  computed: {
    tableInvoices() {
      let tableJoinDetail = this.$store.state.tableModule.tableJoinDetail;
      let tableInvoices = [];

      if (tableJoinDetail) {
        tableJoinDetail.bills.forEach(bill => {
          bill.product_bill_relations.forEach(pbr => {
            // payed invoices
            pbr.invoices.forEach(invoice => {
              if (invoice.tag != 0) {
                tableInvoices.push({
                  datetime: invoice.create_datetime,
                  user: invoice.user_profile,
                  method: invoice.method,
                  amount: invoice.amount,
                  owner: invoice.owner,
                  refundPBR: null,
                  refundWholePbr: false,
                  pbrId: pbr.pk,
                  product: invoice.item,
                  invoiceId: invoice.pk
                });
              }
            });

            // refund invoices
            pbr.invoices.forEach(invoice => {
              if (invoice.tag == 0) {
                let relatedTableInvoice = tableInvoices.find(
                  tableInvoice =>
                    invoice.extra.invoice == tableInvoice.invoiceId
                );

                if (relatedTableInvoice) {
                  relatedTableInvoice.amount -= invoice.amount;
                }
              }
            });
          });
        });
      }

      return tableInvoices.filter(invoice => invoice.amount > 0);
    }
  },
  mounted() {
    this.$store.dispatch(
      "tableModule/getTableJoinDetail",
      this.$store.state.tableModule.refundTable
    );
  }
};
</script>

<style scoped lang="scss">
.done {
  margin: 0 0 0 0.2rem !important;
}

.exit {
  margin: 0 0.2rem 0 0 !important;
}

.refund-modal-card {
  min-width: 70vw;
}

.selector {
  text-align: start;
}

.notification {
  display: flex;
  align-items: center;

  padding: 0.5rem 2.5rem 0.5rem 0.5rem;
  margin-bottom: 0.5rem;
  & .media {
    text-align: right;
    margin-inline-end: 1rem;
  }
}
.refund-table {
  max-height: 35vh;
  overflow-y: auto;

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
</style>
