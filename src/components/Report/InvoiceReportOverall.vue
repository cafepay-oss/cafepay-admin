<template>
  <div class="invoiceReportOverall">
    <b-table
      :loading="isLoading"
      :data="filteredData"
      striped
      narrowed
      hoverable
      bordered
      :row-class="
        (row, index) => {
          if (row.title == $t('invoiceReports.totalCleared')) {
            return 'red';
          } else if (row.title == $t('invoiceReports.totalWithdraw')) {
            return 'yellow';
          } else if (row.title == $t('invoiceReports.totalOnlineDeposits')) {
            return 'green';
          }
        }
      "
    >
      <template slot-scope="props">
        <b-table-column
          :label="$t('primary.title')"
          field="title"
          centered
          sortable
          width="500"
        >
          {{ props.row.title }}
        </b-table-column>

        <b-table-column
          :label="$t('primary.price')"
          field="amount"
          centered
          sortable
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
  name: "InvoicesReportTable",
  data() {
    return {};
  },
  props: {
    datas: {
      type: Object,
      required: true
    }
  },
  computed: {
    filteredData() {
      return [
        {
          title: this.$t("invoiceReports.totalCashDeposits"),
          amount: this.datas.total_cash_deposits
        },
        {
          title: this.$t("invoiceReports.totalOnlineDeposits"),
          amount: this.datas.total_online_deposits
        },
        {
          title: this.$t("invoiceReports.totalPOSDeposits"),
          amount: this.datas.total_pos_deposits
        },
        {
          title: this.$t("invoiceReports.totalDeposits"),
          amount: this.datas.total_deposits
        },
        {
          title: this.$t("invoiceReports.totalCleared"),
          amount: this.datas.total_cleared
        },
        {
          title: this.$t("invoiceReports.totalUncleard"),
          amount: this.datas.total_uncleared
        },
        {
          title: this.$t("invoiceReports.totalWithdraw"),
          amount: this.datas.total_withdrawals
        }
      ];
    }
  }
};
</script>

<style lang="scss" scoped>
.red {
  background-color: #ffd5c4 !important;
}
.yellow {
  background-color: #fff6c4 !important;
}
.green {
  background-color: #e8ffc4 !important;
}
</style>
