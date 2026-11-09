<template>
  <div class="preorderTable">
    <reject-preorder-modal
      :is-active="!!preorderToReject"
      @confirm="rejectConfirm"
      @cancel="rejectCancel"
    />
    <b-table
      :loading="isLoading"
      :data="filteredPreorders"
      striped
      narrowed
      hoverable
      :row-class="
        (row, index) => {
          if (row.cardTransfer && row.cardTransfer.status === 'submitted') return 'receipt-submitted';
          if (row.paymentInfo.net_amount == 0) {
            return 'green';
          } else if (row.paymentInfo.net_amount != 0) {
            return 'red';
          }
        }
      "  detailed
      custom-detail-row
      detail-key="joinId"
      :has-detailed-visible="(row) => !!row.description || !!row.address"
      :show-detail-icon="true"
      :opened-detailed="filteredPreorders.reduce((o,u) => (u.description || u.address) ? o.concat(u.joinId) : o, []) /* open all of them */"
    >
      <template slot-scope="props">
        <b-table-column label="وضعیت رسید">
          <router-link v-if="props.row.cardTransfer" :to="'/card-transfers?receipt=' + props.row.cardTransfer.uuid">
            {{ props.row.cardTransfer.status === 'submitted' ? 'رسید ثبت شد · آماده پردازش' : props.row.cardTransfer.status === 'confirmed' ? 'واریز تأیید شد' : props.row.cardTransfer.status === 'rejected' ? 'رسید رد شد' : 'در انتظار رسید' }}
          </router-link>
          <span v-else>—</span>
        </b-table-column>
        <b-table-column
          :label="$t('primary.customerName')"
          field="name"
          width="130"
        >
          {{
            props.row.customers[0].fullName != " "
              ? props.row.customers[0].fullName
              : $t("preorders.newUser")
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
          :label="$t('preorders.submitTime')"
          field="datetime"
          width="100"
          centered
        >
          {{ moment(props.row.time).calendar() }}
        </b-table-column>

        <b-table-column
          :label="$t('preorders.preparingTime')"
          field="datetime"
          centered
          width="100"
        >
          <b-input
            v-if="!props.row.readyTime"
            :placeholder="$t('preorders.minute(s)')"
            class="ready-time-field__input"
            size="is-small"
            type="number"
            min="0"
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
          {{ props.row.paymentInfo.total_amount | myCurrency }}
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
          <OrderStatusBadge :state="props.row.cardTransfer && props.row.cardTransfer.status === 'submitted' ? 'receipt-submitted' : props.row.paymentInfo.net_amount == 0 ? 'paid' : 'payment-due'" />
          <div class="order-workflow-status">
          {{
            !props.row.customers[0].orders[0].accepted
              ? $t("preorders.pending")
              : !props.row.customers[0].orders[0].sentToKitchen
              ? $t("preorders.accepted")
              : !props.row.customers[0].orders[0].isReady
              ? $t("preorders.preparing")
              : !props.row.customers[0].orders[0].isDelivered
              ? $t("preorders.ready")
              : $t("preorders.delivered")
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
              v-if="props.row.customers[0].orders[0].accepted && !isMobile"
              size="is-small"
              :loading="isLoading"
              class="buttons"
              :label="$t('cafeManagement.printInvoice')"
              type="is-dark"
            >
              <button type="button" :aria-label="$t('cafeManagement.printInvoice')"
                @click.prevent="printCustomerPreorder(props.row)"
                class="tooltip-button button is-small is-dark"
              >
                <b-icon v-if="isMobile" custom-size="is-small"  icon="printer" />
                <b-icon v-else size="is-small" icon="printer" />
              <span class="action-label">{{ $t('cafeManagement.printInvoice') }}</span>
                </button>
            </b-tooltip>

            <b-tooltip
              v-if="!props.row.customers[0].orders[0].accepted"
              class="buttons"
              :label="
                props.row.localReadyTime
                  ? $t('preorders.acceptPreorder')
                  : $t('preorders.pleaseEnterPreparingTime')
              "
              type="is-success"
            >
              <button type="button" :aria-label="
                props.row.localReadyTime
                  ? $t('preorders.acceptPreorder')
                  : $t('preorders.pleaseEnterPreparingTime')
              "
                :disabled="!props.row.localReadyTime.length > 0"
                @click="acceptPreorder(props.row, '1')"
                class="tooltip-button button is-small is-success"
              >
                <b-icon icon="check" size="is-small" />
              <span class="action-label">{{
                props.row.localReadyTime
                  ? $t('preorders.acceptPreorder')
                  : $t('preorders.pleaseEnterPreparingTime')
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
              :label="$t('preorders.ready')"
              type="is-success"
            >
              <button type="button" :aria-label="$t('preorders.ready')"
                @click="changePreorderStatus(props.row, '3')"
                class="tooltip-button button is-small is-success"
              >
                <b-icon icon="check" size="is-small" />
              <span class="action-label">{{ $t('preorders.ready') }}</span>
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
              :label="$t('preorders.delivered')"
              type="is-success"
            >
              <button type="button" :aria-label="$t('preorders.delivered')"
                @click="changePreorderStatus(props.row, '4')"
                class="tooltip-button button is-small is-success"
              >
                <b-icon icon="check" size="is-small" />
              <span class="action-label">{{ $t('preorders.delivered') }}</span>
                </button>
            </b-tooltip>

            <b-tooltip
              v-if="!props.row.customers[0].orders[0].isDelivered"
              class="buttons"
              :label="$t('preorders.editPreorder')"
              type="is-info"
            >
              <button type="button" :aria-label="$t('preorders.editPreorder')"
                :disabled="!!(props.row.cardTransfer && ['submitted', 'confirmed'].includes(props.row.cardTransfer.status))"
                @click="editPreorder(props.row)"
                class="tooltip-button button is-small is-info"
              >
                <b-icon icon="pencil-outline" size="is-small" />
              <span class="action-label">{{ $t('preorders.editPreorder') }}</span>
                </button>
            </b-tooltip>

            <b-tooltip
              v-if="!props.row.customers[0].orders[0].accepted"
              class="buttons"
              label="لغو سفارش"
              type="is-danger"
            >
              <button type="button" :aria-label="'لغو سفارش'"
                @click="rejectPreorder(props.row, false)"
                class="tooltip-button button is-small is-danger"
              >
                <b-icon icon="minus" size="is-small" />
              <span class="action-label">{{ 'لغو سفارش' }}</span>
                </button>
            </b-tooltip>

            <b-tooltip
              class="buttons"
              :label="$t('preorders.closePreorder')"
              type="is-danger"
            >
              <button type="button" :aria-label="$t('preorders.closePreorder')"
                @click.prevent="closePreorder(props.row)"
                class="tooltip-button button is-small is-danger"
              >
                <b-icon icon="receipt" size="is-small" />
              <span class="action-label">{{ $t('preorders.closePreorder') }}</span>
                </button>
            </b-tooltip>
          </section>
        </b-table-column>
      </template>

      <template slot="detail" slot-scope="props">
        <tr>
          <td colspan="10" style="font-size: 14px; padding-right: 17px;">
            <template v-if="props.row.description">
              توضیحات: {{ props.row.description }}<br />
            </template>
            <template v-if="props.row.address">
              آدرس: {{ props.row.address.address }}<br />
              <template v-if="deliveryFee(props.row) != null">
                هزینه پیک: <template v-if="deliveryFee(props.row)">{{ deliveryFee(props.row) | myCurrency }}</template><template v-else>رایگان</template>
              </template>
            </template>
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
import printers from "@/javascripts/printer.js";
import OrderStatusBadge from "@/components/OrderStatusBadge.vue";
import { ToastProgrammatic as Toast } from "buefy";
import RejectPreorderModal from './RejectPreorderModal.vue';

export default {
  components: { RejectPreorderModal, OrderStatusBadge },
  name: "preordersTable",
  props: {
    preorders: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      preorderToReject: null,
    };
  },
  computed: {
    filteredPreorders() {
      return this.preorders.sort((a, b) => b.id - a.id)
    }
  },
  mounted() {
    setInterval(() => {
      this.$forceUpdate();
    }, 10000);
  },
  methods: {
    printCustomerPreorder(preorder){
      let ordersToPrint = [];
      preorder.getTableProducts().forEach(tableProduct => {
        ordersToPrint.push(tableProduct);
      });
      this.printOrders({
        templateType: this.PrinterTemplateTypesEnum.CUSTOMER,
        ordersToPrint,
        table: preorder,
        address: preorder.address,
        deliveryFee: this.deliveryFee(preorder)
      })
    },
    deliveryFee(join) {
      if(!join.address) {
        return null
      }
      if (join.cardTransfer && join.cardTransfer.status !== 'expired' && join.cardTransfer.delivery_fee != null) {
        return join.cardTransfer.delivery_fee
      }
      let regionPrices = this.$store.getters['regionModule/regionPrices']
      if(regionPrices) {
        let regionPrice = regionPrices.find(rp => rp.region == join.address.region.pk);
        if(regionPrice) {
          return regionPrice.price
        }
        return null
      }
      return null
    },
    rejectConfirm(){
      this.rejectPreorder(this.preorderToReject, true)
    },
    rejectCancel(){
      this.preorderToReject = null;
    },
    rejectPreorder(preorder, is_force) {
      if(is_force) {
        this.request({
          method: "PUT",
          url: `/api/v1/join/${preorder.joinId}/refund-online-payments/`
        })
        .then(res => {
          this.rejectPreorderAfterCheck(preorder)
        })
        .catch(err => {
          if (err.response) {
            Toast.open({
              queue: false,
              message: "خطا در بازگشت وجه",
              type: "is-danger"
            });
          }
        })
      } else {
        if(preorder.paymentInfo.payed_amount_online > 0){
          this.preorderToReject = preorder
        } else {
          this.rejectPreorderAfterCheck(preorder)
        }
      }
    },
    rejectPreorderAfterCheck(preorder){
      this.request({
        method: "PUT",
        url: `/api/v1/join/${preorder.joinId}/cancel/`
      })
      .then(res => {
        Toast.open({
          queue: false,
          message: `سفارش با موفقیت لغو شد`,
          type: "is-info"
        });
        if(is_force) {
          this.preorderToReject = null;
        }
      })
      .catch(err => {
        if (err.response) {
          Toast.open({
            queue: false,
            message: "خطا در لغو سفارش",
            type: "is-danger"
          });
        }
      })
    },
    acceptPreorder(preorder, status) {
      this.$store
        .dispatch("preorderModule/setReadyTime", preorder)
        .then(res => {
          let data = [];

          preorder.customers[0].orders.forEach(order => {
            data.push({
              pbr: order.id,
              status: status
            });
          });

          let pbrs = { pbrs: data };
          this.$store.dispatch("preorderModule/changePreorderStatus", {pbrs: pbrs, preorder: preorder});

          this.$buefy.toast.open({
            queue: false,
            duration: 3000,
            message: this.$t('preorders.preparingTimeHasBeenSentToCustomer'),
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
    handleLocalReadyTimeInput(preorder, value) {
      preorder.localReadyTime = value;
      this.$forceUpdate();
    },
    changePreorderStatus(table, status) {
      let data = [];

      table.customers[0].orders.forEach(order => {
        data.push({
          pbr: order.id,
          status: status
        });
      });

      let pbrs = { pbrs: data };
      this.$store.dispatch("preorderModule/changePreorderStatus", {pbrs: pbrs, preorder: table});
    },
    editPreorder(table) {
      this.$emit("showTableDetail", table);
    },
    closePreorder(table) {
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

<style>
.preorderTable tr.receipt-submitted { background-color: #fff8e2; color: #44351b; }
</style>
