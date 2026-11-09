<template>
  <div class="table-payment-state-overall card">
    <b-table
      :loading="isLoading"
      :data="filteredData"
      striped
      narrowed
      hoverable
      bordered
    >
      <template slot-scope="props">
        <b-table-column
          class="table-title"
          :label="$t('primary.title')"
          field="title"
          centered
          width="500"
        >
          {{ props.row.title }}
        </b-table-column>

        <b-table-column
          class="table-price"
          :label="$t('primary.price')"
          field="amount"
          centered
          width="500"
        >
          {{ props.row.amount | myCurrency}}
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
export default {
  name: "TablePaymentStateOverall",
  data() {
    return {};
  },
  props: {
    table: {
      type: Object,
      required: true
    }
  },
  computed: {
    tableDiscountAmount() {
      let tableDiscountAmount = 0
      this.table.customers.forEach(customer => {
        customer.orders.forEach(order => {
          tableDiscountAmount += ((order.originalPrice * order.paymentInfo.total_count) - order.paymentInfo.total_amount) 
        });
      });

      return tableDiscountAmount
    },
    cafepayFee() {
      return this.$store.state.accountModule.activeCafe.cafepayFee;
    },
    feePayer() {
      return this.$store.state.accountModule.activeCafe.feePayer;
    },
    filteredData() {
      if (this.table.paymentInfo) {
        return [
          {
            title: this.$t('cafeManagement.invoiceTotalPrice'),
            amount: this.table.paymentInfo.total_amount
          },
          {
            title: this.$t('cafeManagement.tax'),
            amount: !this.feePayer
              ? this.table.paymentInfo.total_amount * this.cafepayFee
              : 0
          },
          {
            title: this.$t('cafeManagement.totalPayedAmount'),
            amount: !this.feePayer
              ? this.table.paymentInfo.payed_amount * (1 + this.cafepayFee)
              : this.table.paymentInfo.payed_amount
          },
          {
            title: this.$t('cafeManagement.totalDiscountAmount'),
            amount: this.tableDiscountAmount,
          },
          {
            title: this.$t('cafeManagement.totalRemainingAmount'),
            amount: !this.feePayer
              ? this.table.paymentInfo.net_amount * (1 + this.cafepayFee)
              : this.table.paymentInfo.net_amount
          }
        ];
      } else {
        return [
          {
            title: this.$t('cafeManagement.invoiceTotalPrice'),
            amount: 0
          },
          {
            title: this.$t('cafeManagement.tax'),
            amount: 0
          },
          {
            title: this.$t('cafeManagement.totalPayedAmount'),
            amount: 0
          },
          {
            title: this.$t('cafeManagement.totalDiscountAmount'),
            amount: 0
          },
          {
            title: this.$t('cafeManagement.totalRemainingAmount'),
            amount: 0
          }
        ]
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.table-payment-state-overall {
  border-radius: 0 0 2px 2px !important;
}

.table-title {
  font-weight: 400;
  font-size: 0.9em;
}

.table-price {
  font-weight: 400;
  font-size: 0.9em;
}
</style>
