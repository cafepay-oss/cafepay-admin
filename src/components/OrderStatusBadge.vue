<template>
  <span class="order-status" :class="'order-status--' + statusKey">
    <b-icon :icon="status.icon" size="is-small" aria-hidden="true" />
    <span class="order-status__label">{{ status.label }}</span>
  </span>
</template>

<script>
const invoiceStates = { 0: "ready", 1: "new", 2: "unpaid", 3: "complete" };
const statuses = {
  "receipt-submitted": { icon: "receipt", label: "رسید ثبت‌شده؛ آماده پردازش" },
  complete: { icon: "check-circle-outline", label: "پرداخت کامل؛ ارسال‌شده" },
  ready: { icon: "clock-outline", label: "پرداخت کامل؛ آماده ارسال" },
  new: { icon: "plus-circle-outline", label: "سفارش جدید؛ پرداخت ناقص" },
  unpaid: { icon: "alert-outline", label: "ارسال‌شده؛ پرداخت ناقص" },
  paid: { icon: "check-circle-outline", label: "پرداخت کامل" },
  "payment-due": { icon: "alert-circle-outline", label: "پرداخت ناقص" },
  free: { icon: "circle-outline", label: "بدون سفارش" },
  merged: { icon: "link-variant", label: "میز متصل" },
  unknown: { icon: "clock-outline", label: "در حال دریافت وضعیت" },
};

export default {
  name: "OrderStatusBadge",
  props: {
    state: { type: String, default: null },
    colorState: { type: [Number, String], default: null },
    table: { type: Object, default: null },
  },
  computed: {
    statusKey() {
      if (this.table) {
        if (this.table.tableType === "free") return "free";
        if (this.table.tableType === "merged") return "merged";
        if (!this.table.paymentInfo) return "unknown";
        if (this.table.cardTransfer && this.table.cardTransfer.status === 'submitted') return 'receipt-submitted';

        // Match the existing card colors: unpaid sent orders take priority,
        // followed by paid unsent orders, then unpaid unsent orders.
        let state = "complete";
        (this.table.customers || []).forEach(customer => {
          (customer.orders || []).forEach(order => {
            if (!order.paymentInfo) return;
            if (order.paymentInfo.net_amount != 0 && !order.sentToKitchen) {
              if (state === "complete") state = "new";
            } else if (order.paymentInfo.net_amount == 0 && !order.sentToKitchen) {
              if (state !== "unpaid") state = "ready";
            } else if (order.paymentInfo.net_amount != 0 && order.sentToKitchen == true) {
              state = "unpaid";
            }
          });
        });
        return state;
      }
      if (this.colorState !== null && this.colorState !== undefined) {
        return invoiceStates[this.colorState] || "unknown";
      }
      return statuses[this.state] ? this.state : "unknown";
    },
    status() {
      return statuses[this.statusKey];
    },
  },
};
</script>

<style lang="scss" scoped>
.order-status {
  display: inline-grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: .35rem;
  max-width: 100%;
  min-width: 0;
  padding: .3rem .45rem;
  border: 1px solid currentColor;
  border-radius: .4rem;
  background: #fff;
  color: #243447;
  font-size: .8rem;
  font-weight: 600;
  line-height: 1.65;
  text-align: start;
  white-space: normal;
  vertical-align: middle;

  .icon { margin: 0; color: inherit; }
  &__label { min-width: 0; overflow-wrap: anywhere; color: inherit; }
}
</style>
