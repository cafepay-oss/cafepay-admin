<template>
  <div class="modal-card discount-modal-card" style="width: auto">
    <b-modal
      :active.sync="$store.state.tableModule.isDiscountRefundModalActive"
      has-modal-card
    >
      <TableRefundModal :notifications="notifications" />
    </b-modal>
    <header class="modal-card-head">
      <p class="modal-card-title">{{ $t("primary.discount") }}</p>
    </header>

    <section class="modal-card-body">
      <b-table
        class="table discount-table"
        :data="discountTable"
        bordered
        :narrowed="true"
        :loading="isLoading"
        :row-class="(row, index) => index == 0 && 'blue'"
      >
        <template slot-scope="props">
          <b-table-column
            field="title"
            :label="$t('primary.title')"
            width="280"
          >
            <template>{{ props.row.title }}</template>
          </b-table-column>

          <b-table-column
            :label="$t('primary.price')"
            field="amount"
            centered
            width="105"
          >
            {{ props.row.amount | myCurrency}}
          </b-table-column>

          <b-table-column
            :label="$t('primary.payed')"
            field="payed"
            centered
            width="105"
          >
            {{ props.row.payed | myCurrency}}
          </b-table-column>

          <b-table-column
            :label="$t('primary.remaining')"
            field="payed"
            centered
            width="105"
          >
            {{ props.row.remaining | myCurrency}}
          </b-table-column>

          <b-table-column
            :label="$t('cafeManagement.modal.byAmount')"
            field="amountDiscount"
            width="115"
            centered
          >
            <b-input
              v-if="props.row.id"
              size="is-small"
              placeholder="0"
              v-model="props.row.amountDiscount"
              type="number"
              min="0"
              :max="props.row.amount"
              @input="value => setAmountDiscount(value, props.row)"
            >
            </b-input>
            <div v-else>
              {{ props.row.amountDiscount }}
            </div>
          </b-table-column>

          <b-table-column
            :label="$t('cafeManagement.modal.byPercentage')"
            field="percentDiscount"
            width="115"
            centered
          >
            <b-input
              size="is-small"
              placeholder="0%"
              v-model="props.row.percentDiscount"
              type="number"
              min="0"
              max="100"
              @input="value => setPercentDiscount(value, props.row)"
            >
            </b-input>
          </b-table-column>

          <b-table-column label="" centered width="170">
            <b-button
              class="table-button"
              type="is-success"
              size="is-small"
              :disabled="props.row.percentDiscount == 0 && props.row.amountDiscount == 0"
              @click="handleSubmitDiscount(props.row)"
            >
              {{ $t("primary.submit") }}
            </b-button>
            <b-button
              class="table-button"
              type="is-secondary"
              size="is-small"
              v-if="props.row.amount - props.row.payed != 0"
              :disabled="props.row.percentDiscount != 0"
              @click="handleSubmitRimainingDiscount(props.row)"
            >
              {{ $t("cafeManagement.modal.allRemaining") }}
            </b-button>
          </b-table-column>
        </template>
      </b-table>

      <div class="notifications">
        <b-notification
          v-for="notification in notifications"
          :key="notification.text"
          type="is-warning is-light"
          aria-close-label="Close notification"
          role="alert"
        >
          {{ notification.text }}
        </b-notification>
      </div>
    </section>
    <footer class="modal-card-foot">
      <b-button
        v-if="notifications.length > 0"
        :loading="isLoading"
        class="button modal-button is-warning"
        @click.native="handleRefundModal()"
        >{{ $t("cafeManagement.modal.openRefund") }}</b-button
      >
      <b-button
        :loading="isLoading"
        class="button modal-button exit"
        @click.native="closeModal()"
        >{{ $t("primary.cancel") }}</b-button
      >
    </footer>
  </div>
</template>

<script>
import TableRefundModal from "@/components/Management/Table/TableRefundModal";

export default {
  name: "TableDiscountModal",
  components: {
    TableRefundModal
  },
  data() {
    return {
      isRefundOkay: 0,
      notifications: []
    };
  },
  props: {
    table: {
      type: Object,
      required: true
    }
  },
  methods: {
    closeModal() {
      this.$store.state.tableModule.isDiscountModalActive = false;
    },
    handleRefundModal() {
      this.$store.state.tableModule.refundTable = this.table;
      this.$store.state.tableModule.isDiscountRefundModalActive = true;
    },
    setAmountDiscount(value, pbr) {
      if (value > pbr.amount) {
        this.$nextTick(() => {
          pbr.amountDiscount = pbr.amount;
          pbr.percentDiscount = '';
          // pbr.percentDiscount = 100;
        });
      } else {
        pbr.amountDiscount = value;
        pbr.percentDiscount = '';
        // pbr.percentDiscount = Math.round((value / pbr.amount) * 100);
      }
    },
    setPercentDiscount(value, pbr) {
      if (value > 100) {
        this.$nextTick(() => {
          pbr.percentDiscount = 100;
          pbr.amountDiscount = pbr.amount;
        });
      } else {
        pbr.percentDiscount = value;
        pbr.amountDiscount = Math.round((value / 100) * pbr.amount);
      }
    },
    handleSubmitDiscount(pbr) {
      this.notifications = [];
      let healthyRefund = true;

      // check if discount amount is okay for all of the orders
      pbr.orders.forEach(order => {
        let orderDiscountAmount =
          // (order.paymentInfo.total_amount * pbr.percentDiscount) / 100;
          pbr.amountDiscount;

        if (orderDiscountAmount > order.paymentInfo.net_amount) {
          healthyRefund = false;

          let leftOver =
            orderDiscountAmount -
            order.paymentInfo.net_amount;

          this.notifications.push({
            text: this.$t("cafeManagement.modal.discountRefundMessage", {
              amountDiscount: pbr.amountDiscount,
              name: order.product.name,
              leftOver: leftOver
            })
          });
        }
      });

      if (healthyRefund) {
        pbr.orders.forEach(order => {
          let orderDiscountAmount =
            // (order.paymentInfo.total_amount * pbr.percentDiscount) / 100;
            pbr.amountDiscount;

          if (orderDiscountAmount <= order.paymentInfo.net_amount) {
            let pbrList = {
              payments: [
                {
                  pbr: order.id,
                  amount: orderDiscountAmount
                }
              ],
              method: 4
            };

            this.$store.dispatch("tableModule/payInvoice", pbrList);
          }
        });
        pbr.percentDiscount = "";
        pbr.amountDiscount = "";
      }
    },
    handleSubmitRimainingDiscount(pbr) {
      this.notifications = [];
      pbr.orders.forEach(order => {
        let pbrList = {
          payments: [
            {
              pbr: order.id,
              amount: order.paymentInfo.net_amount
            }
          ],
          method: 4
        };

        this.$store.dispatch("tableModule/payInvoice", pbrList);
      });
    }
  },
  computed: {
    totalDiscount() {
      return [
        {
          title: this.$t("cafeManagement.modal.submitDiscountOnInvoice"),
          amount: this.table.paymentInfo.total_amount,
          payed: this.table.paymentInfo.net_payed_amount,
          remaining: this.table.paymentInfo.net_amount,
          amountDiscount: "",
          percentDiscount: "",
          orders: [],
          id: 0
        }
      ];
    },
    discountTable() {
      this.table.customers.forEach(customer => {
        this.totalDiscount[0].orders = this.totalDiscount[0].orders.concat(
          customer.orders
        );
      });
      return this.totalDiscount.concat(this.tablePbrs);
    },
    tablePbrs() {
      let pbrs = [];

      this.table.customers.forEach(customer => {
        customer.orders.forEach(order => {
          pbrs.push({
            title: customer.fullName + " (" + order.product.name + ")",
            amount: order.paymentInfo.total_amount,
            payed: order.paymentInfo.net_payed_amount,
            remaining: order.paymentInfo.net_amount,
            amountDiscount: "",
            percentDiscount: "",
            orders: [order],
            id: order.id
          });
        });
      });

      return pbrs;
    }
  },
  watch: {
    discountTable: {
      deep: true,
      handler: function(newValue, oldValue) {
        newValue.forEach(newValueRow => {
          let relatedOldValueRow = oldValue.find(
            oldValueRow => oldValueRow.id == newValueRow.id
          );
          if (relatedOldValueRow) {
            if (newValueRow.amountDiscount == "") {
              this.setPercentDiscount(
                relatedOldValueRow.percentDiscount,
                newValueRow
              );
            }
          }
        });
      }
    }
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

.discount-modal-card {
  min-width: 75vw;
}

.selector {
  text-align: right;
}

.table-button {
  margin-inline-start: 0.2rem;
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
.discount-table {
  max-height: 40vh;
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
