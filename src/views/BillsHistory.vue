<template>
  <div class="bills-history">
    <hero-bar>{{ $t("billsHistory.billsHistory") }}</hero-bar>
    <section class="section is-main-section">
      <CardComponent
        class="card"
        :title="$t('billsHistory.billsHistory')"
        headerIcon="mdi mdi-refresh"
        @header-icon-click="getCafeBillsHistory"
      >
        <b-table
          :loading="isLoading"
          :data="cafeBillsHistory"
          :columns="columns"
          striped
          hoverable
          :paginated="true"
          :per-page="page_size"
          :total="$store.state.cafeModule.cafeBillsHistoryCount"
          backend-pagination
          :current-page.sync="current_page"
          detailed
          custom-detail-row
          detail-key="pk"
          sticky-header
          show-detail-icon
        >

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
          <template slot="footer">
            <b-select v-model="page_size">
              <option value="5">5 {{ $t("primary.perPage") }}</option>
              <option value="10">10 {{ $t("primary.perPage") }}</option>
              <option value="15">15 {{ $t("primary.perPage") }}</option>
              <option value="20">20 {{ $t("primary.perPage") }}</option>
            </b-select>
          </template>
        </b-table>
      </CardComponent>
    </section>
  </div>
</template>

<script>
import CardComponent from "@/components/CardComponent";
import HeroBar from "@/components/HeroBar";

export default {
  name: "bills-histroy",
  components: {
    CardComponent,
    HeroBar,
  },
  data() {
    return {
      columns: [
        {
          field: "tables",
          label: this.$tc("primary.table", 2),
          searchable: true,
          width: "100",
          sortable: true,
        },
        {
          field: "scanned",
          label: this.$tc("primary.customer", 2),
          width: "180",
          sortable: true,
        },
        {
          field: "products",
          width: "180",
          label: this.$tc("primary.product", 2),
          sortable: true,
        },
        {
          field: "totalAmount",
          label: this.$t("primary.price"),
          centered: true,
          sortable: true,
        },
        {
          field: "payedAmount",
          label: this.$t("billsHistory.totalAmount"),
          centered: true,
          sortable: true,
        },
        {
          field: "date",
          label: this.$t("primary.date"),
          centered: true,
          sortable: true,
        },
        {
          field: "time",
          label: this.$t("primary.time"),
          centered: true,
          sortable: true,
        },
        {
          field: "status",
          label: this.$t("primary.status"),
          centered: true,
          sortable: true,
        },
        {
          field: "methods_str",
          label: this.$t("reportsSidebar.paymentType"),
          centered: true,
          sortable: false,
        },
      ],
      page_size: 10,
      total: 100,
      current_page: 1,
    };
  },
  computed: {
    cafeBillsHistory() {
      let data = [];

      this.$store.state.cafeModule.cafeBillsHistory.forEach((history) => {
        let tables = history.tables.reduce((acc, curr) => {
          return curr.number + ", " + acc;
        }, "");

        let scanned = history.scanned.reduce((acc, curr) => {
          return `${curr.user_profile.full_name} (${curr.user_profile.username})` + " - " + acc;
        }, "");

        if (scanned.length < 3) {
          scanned = history.cafe.name + " - ";
        }


        if (history.payment_info.total_count) {
          let products = []
          history.bill_products.forEach(billProduct => {
            let relatedProduct = products.find(product => product.product.id == billProduct.product)
            if (relatedProduct) {
              product.count += relatedProduct.payment_info.total_count;
            } else {
              products.push({
                product: billProduct.product_data,
                count: billProduct.payment_info.total_count
              })
            }
          });
  
          let products_str = ''
          products.forEach(product => {
            products_str += product.product.name + ' (' + product.count + ") - ";
          });
  
          products_str = products_str.slice(0, -3)

          /* set history invoices */
          let invoices = [];
          history.bill_products.forEach((bill_product) => {
            invoices = invoices.concat(bill_product.invoices);
          });
          
          let methods = [];
          invoices.forEach((invoice) => {
            methods.push(invoice.method);
          });
  
          let methods_str = "";
          if (methods.includes("0")) {
            methods_str += this.$t('primary.online') + " - ";
          }
          if (methods.includes("1")) {
            methods_str += this.$t('primary.POS') + " - ";
          }
          if (methods.includes("2")) {
            methods_str += this.$t('primary.cash') + " - ";
          }
          if (methods.includes("4")) {
            methods_str += this.$t('primary.discount') + " - ";
          }
          if (methods_str.length)
            methods_str = methods_str.slice(
              0,
              methods_str.length - 2
            );

          data.push({
            pk: history.pk,
            tables: tables.slice(0, tables.length - 2),
            date: new Date(history.datetime).toLocaleDateString(this.$i18n.locale),
            time: new Date(history.datetime).toLocaleTimeString(this.$i18n.locale),
            status: history.is_closed
              ? this.$t("primary.closed")
              : this.$t("primary.active"),
            products: products_str,
            totalAmount: this.$options.filters.myCurrency2(history.payment_info.total_amount),
            payedAmount: this.$options.filters.myCurrency2(history.payment_info.payed_amount),
            netAmount: this.$options.filters.myCurrency2(history.payment_info.net_amount),
            refundAmound: this.$options.filters.myCurrency2(history.payment_info.refund_amount),
            scanned: scanned.slice(0, scanned.length - 2),
            billProducts: history.bill_products,
            invoices,
            methods_str,
          });
        }
      });
      return data;
    },
  },
  watch: {
    page_size() {
      this.$store.dispatch("cafeModule/getCafeBillsHistory", {
        page: this.current_page,
        page_size: this.page_size,
      });
    },
    current_page() {
      this.$store.dispatch("cafeModule/getCafeBillsHistory", {
        page: this.current_page,
        page_size: this.page_size,
      });
    },
  },
  methods: {
    getCafeBillsHistory() {
      this.$store.dispatch("cafeModule/getCafeBillsHistory");
    },
  },
  mounted() {
    this.getCafeBillsHistory();
  },
};
</script>
