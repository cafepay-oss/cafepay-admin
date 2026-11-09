<template>
  <div class="customersReportTable">
    <b-table
      :loading="isLoading"
      :data="filteredData"
      :paginated="true"
      :per-page="$store.state.cafeModule.customersReportPageSize"
      :total="$store.state.cafeModule.customersReportCount"
      backend-pagination
      :current-page.sync="$store.state.cafeModule.customersReportPage"
      striped
      narrowed
      hoverable
      sticky-header
      bordered
    >
      <template slot-scope="props">
        <b-table-column cell-class="has-no-head-mobile is-image-cell">
          <div class="image">
            <img
              :src="
                'https://avatars.dicebear.com/v2/bottts/' +
                props.row.first_name +
                ' ' +
                props.row.last_name +
                '.svg'
              "
              class="is-rounded"
            />
          </div>
        </b-table-column>

        <b-table-column :label="$t('primary.name')" field="name">
          {{ props.row.first_name + " " + props.row.last_name }}
        </b-table-column>

        <b-table-column :label="$t('customerReports.totalSpent')" field="total_amount" centered>
          {{ props.row.data.total_amount | myCurrency}} 
        </b-table-column>

        <b-table-column :label="$t('customerReports.averageSpent')" field="average_spent" centered>
          {{ props.row.data.average_spent | myCurrency}} 
        </b-table-column>

        <b-table-column :label="$tc('customerReports.visit', 2)" field="average_spent" centered>
          {{ props.row.data.total_times_ordered }} {{ $tc('customerReports.time', props.row.data.total_times_ordered) }}
        </b-table-column>

        <b-table-column :label="$t('customerReports.favoriteFood')" field="fav_product">
          {{ props.row.data.fav_product }}
        </b-table-column>

        <!-- 

        <b-table-column label="ساعت" field="time" centered>
          {{ new Date(props.row.create_datetime).toLocaleTimeString("fa-IR") }}
        </b-table-column> -->
      </template>
      <template slot="footer" dir="rtl">
        <b-select v-model="$store.state.cafeModule.customersReportPageSize">
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
  name: "CustomersReportTable",
  data() {
    return {};
  },
  props: {
    datas: {
      type: Object,
      required: true,
    },
  },
  computed: {
    filteredData() {
      return this.datas.results;
    },
  },
};
</script>