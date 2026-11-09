<template>
  <div class="invoices-history">
    <hero-bar>{{ $t("transactionsHistory.transactionsHistory") }}</hero-bar>
    <section class="section is-main-section">
      <CardComponent
        class="card"
        :title="$t('transactionsHistory.transactionsHistory')"
        headerIcon="mdi mdi-refresh"
        @header-icon-click="getCafeInvoicesHistory"
      >
        <b-table
          :loading="isLoading"
          :data="cafeInvoicesHistory"
          :paginated="true"
          :per-page="page_size"
          :total="$store.state.cafeModule.cafeInvoicesHistoryCount"
          backend-pagination
          :current-page.sync="current_page"
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
            <b-table-column
              :label="$t('transactionsHistory.amount')"
              field="price"
              centered
            >
              {{ props.row.amount | myCurrency}}
            </b-table-column>

            <b-table-column :label="$t('primary.date')" field="date" centered>
              {{
                new Date(props.row.create_datetime).toLocaleDateString($i18n.locale)
              }}
            </b-table-column>

            <b-table-column :label="$t('primary.time')" field="time" centered>
              {{
                new Date(props.row.create_datetime).toLocaleTimeString($i18n.locale)
              }}
            </b-table-column>

            <b-table-column
              :label="$t('transactionsHistory.method')"
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
              :label="$t('transactionsHistory.type')"
              field="methods_str"
              centered
            >
              {{
                props.row.type == 0
                  ? $t("primary.deposite")
                  : props.row.type == 1
                  ? $t("primary.Refund")
                  : $t("primary.withdraw")
              }}
            </b-table-column>
            <b-table-column
              :label="$t('primary.status')"
              field="methods_str"
              centered
            >
              {{
                props.row.status == 0
                  ? $t("transactionsHistory.payed")
                  : props.row.status == 1
                  ? $t("transactionsHistory.created")
                  : props.row.status == 2
                  ? $t("transactionsHistory.inPayment")
                  : props.row.status == 3
                  ? $t("transactionsHistory.failed")
                  : $t("transactionsHistory.wallet")
              }}
            </b-table-column>
          </template>
          <template slot="footer" dir="rtl">
            <b-select v-model="page_size">
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
      </CardComponent>
    </section>
  </div>
</template>

<script>
import CardComponent from "@/components/CardComponent";
import HeroBar from "@/components/HeroBar";

export default {
  name: "invoices-histroy",
  components: {
    CardComponent,
    HeroBar,
  },
  data() {
    return {
      page_size: 10,
      current_page: 1,
    };
  },
  computed: {
    cafeInvoicesHistory() {
      return this.$store.state.cafeModule.cafeInvoicesHistory.results;
    },
  },
  watch: {
    page_size() {
      this.$store.dispatch("cafeModule/getCafeInvoicesHistory", {
        page: this.current_page,
        page_size: this.page_size,
      });
    },
    current_page() {
      this.$store.dispatch("cafeModule/getCafeInvoicesHistory", {
        page: this.current_page,
        page_size: this.page_size,
      });
    },
  },
  methods: {
    getCafeInvoicesHistory() {
      this.$store.dispatch("cafeModule/getCafeInvoicesHistory");
    },
  },
  mounted() {
    this.getCafeInvoicesHistory();
  },
};
</script>
