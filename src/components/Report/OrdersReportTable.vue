<template>
  <b-table
    :loading="isLoading"
    :data="filteredData"
    :paginated="true"
    :per-page="$store.state.cafeModule.ordersReportPageSize"
    :total="$store.state.cafeModule.ordersReportCount"
    backend-pagination
    :current-page.sync="$store.state.cafeModule.ordersReportPage"
    bordered
    striped
    narrowed
    hoverable
    detailed
    custom-detail-row
    detail-key="pk"
    sticky-header
    show-detail-icon
  >
    <template slot-scope="props">
      <b-table-column
        :label="$tc('primary.table', 2)"
        field="table"
        sortable
        width="100"
      >
        {{ props.row.tables[0].number }}
      </b-table-column>


      <b-table-column
        :label="$tc('primary.customer', 2)"
        field="customers"
        sortable
        width="180"
      >
        {{ props.row.customers }}
      </b-table-column>

      <b-table-column
        :label="$tc('primary.product', 2)"
        field="products_str"
        sortable
        width="160"
      >
        {{ props.row.products_str }}
      </b-table-column>

      <b-table-column :label="$t('primary.price')" field="price" centered sortable>
        {{ props.row.payment_info.total_amount | myCurrency}}
      </b-table-column>

      <b-table-column :label="$t('primary.payed')" field="payed" centered sortable>
        {{ props.row.payment_info.payed_amount | myCurrency}}
      </b-table-column>

      <b-table-column :label="$t('primary.date')" field="date" centered sortable>
        {{ new Date(props.row.datetime).toLocaleDateString($i18n.locale) }}
      </b-table-column>

      <b-table-column :label="$t('primary.time')" field="time" centered sortable>
        {{ new Date(props.row.datetime).toLocaleTimeString($i18n.locale) }}
      </b-table-column>

      <b-table-column :label="$t('primary.status')" field="status" centered sortable width="90">
        {{ props.row.is_closed ? $t('primary.closed') : $t('primary.active') }}
      </b-table-column>

      <b-table-column
        :label="$t('reportsSidebar.paymentType')"
        field="methods_str"
        centered
        sortable
        width="110"
      >
        {{ props.row.methods_str }}
      </b-table-column>
    </template>
    <template slot="detail" slot-scope="props">
      <tr v-for="item in props.row.invoices" :key="item.pk">
        <td colspan="2"></td>
        <td v-if="!item.is_manual">
          {{ item.owner }}
        </td>
        <td>
          {{ item.item.name }}
        </td>
        <td class="has-text-centered"></td>
        <td class="has-text-centered">
          {{ item.amount }}
        </td>
        <td class="has-text-centered">
          {{ new Date(item.create_datetime).toLocaleDateString($i18n.locale) }}
        </td>
        <td class="has-text-centered">
          {{ new Date(item.create_datetime).toLocaleTimeString($i18n.locale) }}
        </td>
        <td class="has-text-centered"></td>
        <td class="has-text-centered">
          {{
            item.method == 0
              ? $t('primary.online')
              : item.method == 1
              ? $t('primary.POS')
              : item.method == 2 
              ? $t('primary.cash')
              : $t('primary.discount')
              
          }}
        </td>
      </tr>
    </template>
    <template slot="footer" dir="rtl">
      <b-select v-model="$store.state.cafeModule.ordersReportPageSize">
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
</template>

<script>
export default {
  name: "OrdersReportTable",
  data() {
    return {};
  },
  props: {
    datas: {
      type: Array,
      required: true,
    },
  },
  computed: {
    filteredData() {
      return this.datas.filter((data) => data.payment_info.total_amount);
    },
  },
};
</script>
