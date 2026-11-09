<template>
  <div class="manualInvoiceTable">
    <b-table
      :loading="isLoading"
      :data="filteredManualInvoices"
      striped
      narrowed
      hoverable
      :row-class="
        (row, index) => {
          if (row.paymentInfo.net_amount == 0) {
            return 'green';
          } else if (row.paymentInfo.net_amount != 0) {
            return 'red';
          }
        }
      "
    >
      <template slot-scope="props">
        <b-table-column
          :label="$t('primary.customerName')"
          field="name"
          width="130"
        >
          {{
            props.row.customers[0].fullName != " "
              ? props.row.customers[0].fullName
              : $t("manualInvoices.newUser")
          }}
        </b-table-column>

        <b-table-column
          :label="$t('primary.phoneNumber')"
          field="phone_number"
          width="100"
        >
          {{ props.row.customers[0].phoneNumber }}
        </b-table-column>
    
        <b-table-column
          :label="$tc('primary.product', 2)"
          field="products_str"
          width="210"
        >
          <div v-for="pro in props.row.products_list" :key="pro">
            &dash; {{ pro }}
          </div>
        </b-table-column>

        <b-table-column
          :label="$t('manualInvoices.submitTime')"
          field="datetime"
          width="100"
          centered
        >
          {{ moment(props.row.time).calendar() }}
        </b-table-column>

        <b-table-column
          :label="$t('manualInvoices.preparingTime')"
          field="datetime"
          centered
          width="100"
        >
          <b-input
            v-if="!props.row.readyTime"
            :placeholder="$t('manualInvoices.minute(s)')"
            class="ready-time-field__input"
            size="is-small"
            type="number"
            @input="(value) => handleLocalReadyTimeInput(props.row, value)"
          >
          </b-input>
          <span v-else>{{ moment(props.row.readyTime).fromNow() }}</span>

          
        </b-table-column>

        <b-table-column
          :label="$t('primary.price')"
          field="payed"
          class="payed"
          centered
        >
          {{ props.row.paymentInfo.net_amount | myCurrency }}
        </b-table-column>

        <b-table-column
          :label="$t('primary.payed')"
          field="payed"
          class="payed"
          centered
        >
          {{ props.row.paymentInfo.net_payed_amount | myCurrency }}
        </b-table-column>

        <b-table-column
          :label="$t('primary.status')"
          field="status"
          class="status"
          centered
          width="130"
        >
          <OrderStatusBadge :state="props.row.paymentInfo.net_amount == 0 ? 'paid' : 'payment-due'" />
          <div class="order-workflow-status">
          {{
            !props.row.customers[0].orders[0].accepted
              ? $t("manualInvoices.pending")
              : !props.row.customers[0].orders[0].sentToKitchen
              ? $t("manualInvoices.accepted")
              : !props.row.customers[0].orders[0].isReady
              ? $t("manualInvoices.preparing")
              : !props.row.customers[0].orders[0].isDelivered
              ? $t("manualInvoices.ready")
              : $t("manualInvoices.delivered")
          }}
          </div>
        </b-table-column>

        <b-table-column
          field="actions"
          :label="$tc('primary.action', 2)"
          numeric
          centered
          width="140"
        >
          <section class="b-tooltips invoice-actions">
            <b-tooltip
              v-if="!props.row.customers[0].orders[0].accepted"
              class="buttons"
              :label="
                props.row.localReadyTime
                  ? $t('manualInvoices.acceptManualInvoice')
                  : $t('manualInvoices.pleaseEnterPreparingTime')
              "
              type="is-success"
            >
              <button type="button" :aria-label="
                props.row.localReadyTime
                  ? $t('manualInvoices.acceptManualInvoice')
                  : $t('manualInvoices.pleaseEnterPreparingTime')
              "
                :disabled="!props.row.localReadyTime.length > 0"
                @click="acceptManualInvoice(props.row, '1')"
                class="tooltip-button button is-small is-success"
              >
                <b-icon icon="check" size="is-small" />
              <span class="action-label">{{
                props.row.localReadyTime
                  ? $t('manualInvoices.acceptManualInvoice')
                  : $t('manualInvoices.pleaseEnterPreparingTime')
               }}</span>
                </button>
            </b-tooltip>

            <b-tooltip
              v-if="
                props.row.customers[0].orders[0].accepted &&
                  !props.row.customers[0].orders[0].sentToKitchen
              "
              size="is-small"
              :loading="isLoading"
              class="buttons"
              :label="
                !props.row.customers[0].orders[0].sentToKitchen
                  ? $t('primary.sendToKitchen')
                  : $t('primary.sendAgain')
              "
              :type="
                !props.row.customers[0].orders[0].sentToKitchen
                  ? 'is-success'
                  : 'is-link'
              "
            >
              <button type="button" :aria-label="
                !props.row.customers[0].orders[0].sentToKitchen
                  ? $t('primary.sendToKitchen')
                  : $t('primary.sendAgain')
              "
                @click.prevent="
                  sendOrderKitchen(
                    props.row.paymentInfo,
                    props.row,
                    props.row.customers[0].orders[0].sentToKitchen
                  )
                "
                class="tooltip-button button is-small"
                :class="{
                  'is-success': !props.row.customers[0].orders[0].sentToKitchen,
                  'is-link': props.row.customers[0].orders[0].sentToKitchen
                }"
              >
                <b-icon icon="printer" size="is-small" />
              <span class="action-label">{{
                !props.row.customers[0].orders[0].sentToKitchen
                  ? $t('primary.sendToKitchen')
                  : $t('primary.sendAgain')
               }}</span>
                </button>
            </b-tooltip>

            <b-tooltip
              v-if="
                props.row.customers[0].orders[0].accepted &&
                  props.row.customers[0].orders[0].sentToKitchen &&
                  !props.row.customers[0].orders[0].isReady
              "
              class="buttons"
              :label="$t('manualInvoices.ready')"
              type="is-success"
            >
              <button type="button" :aria-label="$t('manualInvoices.ready')"
                @click="changeManualInvoiceStatus(props.row, '3')"
                class="tooltip-button button is-small is-success"
              >
                <b-icon icon="check" size="is-small" />
              <span class="action-label">{{ $t('manualInvoices.ready') }}</span>
                </button>
            </b-tooltip>

            <b-tooltip
              v-if="
                props.row.customers[0].orders[0].accepted &&
                  props.row.customers[0].orders[0].sentToKitchen &&
                  props.row.customers[0].orders[0].isReady &&
                  !props.row.customers[0].orders[0].isDelivered
              "
              class="buttons"
              :label="$t('manualInvoices.delivered')"
              type="is-success"
            >
              <button type="button" :aria-label="$t('manualInvoices.delivered')"
                @click="changeManualInvoiceStatus(props.row, '4')"
                class="tooltip-button button is-small is-success"
              >
                <b-icon icon="check" size="is-small" />
              <span class="action-label">{{ $t('manualInvoices.delivered') }}</span>
                </button>
            </b-tooltip>

            <b-tooltip
              v-if="!props.row.customers[0].orders[0].isDelivered"
              class="buttons"
              :label="$t('manualInvoices.editManualInvoice')"
              type="is-info"
            >
              <button type="button" :aria-label="$t('manualInvoices.editManualInvoice')"
                @click="editManualInvoice(props.row)"
                class="tooltip-button button is-small is-info"
              >
                <b-icon icon="pencil-outline" size="is-small" />
              <span class="action-label">{{ $t('manualInvoices.editManualInvoice') }}</span>
                </button>
            </b-tooltip>

            <b-tooltip
              class="buttons"
              :label="$t('manualInvoices.closeManualInvoice')"
              type="is-danger"
            >
              <button type="button" :aria-label="$t('manualInvoices.closeManualInvoice')"
                @click.prevent="closeManualInvoice(props.row)"
                class="tooltip-button button is-small is-danger"
              >
                <b-icon icon="receipt" size="is-small" />
              <span class="action-label">{{ $t('manualInvoices.closeManualInvoice') }}</span>
                </button>
            </b-tooltip>
          </section>
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
  </div>
</template>

<script>
import printers from "@/javascripts/printer.js";
import OrderStatusBadge from "@/components/OrderStatusBadge.vue";

export default {
  name: "manualInvoicesTable",
  components: { OrderStatusBadge },
  props: {
    manualInvoices: {
      type: Array,
      required: true
    }
  },
  data() {
    return {};
  },
  computed: {
    filteredManualInvoices() {
      return this.manualInvoices.sort((a, b) => b.id - a.id)
    }
  },
  mounted() {
    setInterval(() => {
      this.$forceUpdate();
    }, 10000);
  },
  methods: {
    acceptManualInvoice(manualInvoice, status) {
      this.$store
        .dispatch("manualInvoiceModule/setReadyTime", manualInvoice)
        .then(res => {
          let data = [];

          manualInvoice.customers[0].orders.forEach(order => {
            data.push({
              pbr: order.id,
              status: status
            });
          });

          let pbrs = { pbrs: data };
          this.$store.dispatch("manualInvoiceModule/changeManualInvoiceStatus", {pbrs: pbrs, manualInvoice: manualInvoice});

          this.$buefy.toast.open({
            queue: false,
            duration: 3000,
            message: this.$t('manualInvoices.preparingTimeHasBeenSentToCustomer'),
            type: "is-success"
          });
        })
        .catch(err => {
          this.$buefy.toast.open({
            queue: false,
            duration: 3000,
            message: this.$t('notifications.pleaseTryAgain'),
            type: "is-danger"
          });
        });
    },
    handleLocalReadyTimeInput(manualInvoice, value) {
      manualInvoice.localReadyTime = value;
      this.$forceUpdate();
    },
    changeManualInvoiceStatus(table, status) {
      let data = [];

      table.customers[0].orders.forEach(order => {
        data.push({
          pbr: order.id,
          status: status
        });
      });

      let pbrs = { pbrs: data };
      this.$store.dispatch("manualInvoiceModule/changeManualInvoiceStatus", {pbrs: pbrs, manualInvoice: table});
    },
    editManualInvoice(table) {
      this.$emit("showTableDetail", table);
    },
    closeManualInvoice(table) {
      this.$store.dispatch("tableModule/closeInvoice", {
        table: table.joinId,
        forceClose: true,
        sent: false
      });
    },
    sendOrderKitchen(product, table, state) {
      let orders = table.getTableProducts();
      console.log(orders);
      let readyToSendOrders = [];

      console.log(product, table, state);
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
    }
  }
};
</script>

<style lang="scss">
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

.green {
  background-color: rgba(194, 255, 197, 1) !important;
}
.red {
  background-color: rgb(255, 205, 205) !important;
}

.ready-time-field {
  &__input {
    border-radius: 0 5px 5px 0 !important;
    border: 0px !important;
  }
  &__control {
    &__button {
      border-radius: 5px 0 0 5px !important;
    }
  }
}
</style>

<style lang="scss" scoped>
.order-workflow-status { margin-top: .4rem; }
</style>
