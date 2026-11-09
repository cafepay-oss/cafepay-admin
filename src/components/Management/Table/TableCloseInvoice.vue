<template>
  <section class="close-invoice">
    <div class="close-invoice__text">
      <span>مبلغ کلی صورتحساب:</span>
      {{ table.paymentInfo.total_amount | myCurrency }}
      <br />
      <span class="green">مبلغ پرداخت شده:</span>
      {{ table.paymentInfo.net_payed_amount | myCurrency }}
      <br />
      <span class="red">مبلغ باقی مانده:</span>
      {{ table.paymentInfo.net_amount | myCurrency }}
    </div>
    <b-button :loading="isLoading" type="is-success" @click="payInvoice(table)"
      >پرداخت صورتحساب</b-button
    >
  </section>
</template>

<script>
export default {
  props: {
    table: {
      type: Object,
      required: true,
    },
  },

  methods: {
    payInvoice(table) {
      let pbr = {
        payments: [],
        method: 2,
      };
      table.customers.forEach((customer) => {
        customer.orders.forEach((order) => {
          pbr.payments.push({
            pbr: order.id,
            amount: order.paymentInfo.net_amount,
          });
        });
      });
      this.$store.dispatch("tableModule/payInvoice", pbr);
    },
  },
};
</script>

<style scoped lang="scss">
.close-invoice {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  justify-items: center;

  &__text {
    padding: 1rem;
    margin-bottom: 1rem;
    text-align: center;

    & span {
      font-weight: 500;
      font-size: 1.1rem;
    }
  }
}

.green {
  color: green;
}

.red {
  color: red;
}
</style>
