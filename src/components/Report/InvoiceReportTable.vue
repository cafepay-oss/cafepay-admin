<template>
  <div class="invoiceReportTable">
    <b-table
      :loading="isLoading"
      :data="filteredData"
      :paginated="true"
      :per-page="$store.state.cafeModule.invoicesReportPageSize"
      :total="$store.state.cafeModule.invoicesReportCount"
      backend-pagination
      :current-page.sync="$store.state.cafeModule.invoicesReportPage"
      striped
      narrowed
      hoverable
      sticky-header
      bordered
      :row-class="
        (row, index) => {
          if (row.type == 2) {
            return 'red';
          } else if (row.type == 1) {
            return 'yellow';
          } else if (row.method == 0) {
            return 'green';
          }
        }
      "
    >
      <template slot-scope="props">
        <b-table-column :label="$t('primary.amount')" field="price" centered>
          {{ props.row.amount | myCurrency}} 
        </b-table-column>

        <b-table-column :label="$t('primary.date')" field="date" centered>
          {{ new Date(props.row.create_datetime).toLocaleDateString($i18n.locale) }}
        </b-table-column>

        <b-table-column :label="$t('primary.time')" field="time" centered>
          {{ new Date(props.row.create_datetime).toLocaleTimeString($i18n.locale) }}
        </b-table-column>

        <b-table-column
          :label="$t('primary.paymentMethod')"
          field="methods_str"
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
          :label="$t('reportsSidebar.paymentType')"
          field="methods_str"
          centered
        >
          {{
            props.row.type == 0
              ? $t("reportsSidebar.deposit")
              : props.row.type == 1
              ? $t("primary.Refund")
              : $t("reportsSidebar.withdraw")
          }}
        </b-table-column>
        <b-table-column
          :label="$t('reportsSidebar.paymentStatus')"
          field="methods_str"
          centered
        >
          {{
            props.row.status == 0
              ? $t("reportsSidebar.payed")
              : props.row.status == 1
              ? $t("reportsSidebar.created")
              : props.row.status == 2
              ? $t("reportsSidebar.inPayment")
              : props.row.status == 3
              ? $t("reportsSidebar.rejected")
              : $t("reportsSidebar.internal")
          }}
        </b-table-column>
      </template>
      <template slot="footer" dir="rtl">
        <b-select v-model="$store.state.cafeModule.invoicesReportPageSize">
          <option value="5">5 {{ $t("primary.perPage") }}</option>
          <option value="10">10 {{ $t("primary.perPage") }}</option>
          <option value="15">15 {{ $t("primary.perPage") }}</option>
          <option value="20">20 {{ $t("primary.perPage") }}</option>
        </b-select>
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
      return this.datas.results;
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
