<template>
  <div>
    <b-table
      :loading="isLoading"
      :data="cafeCustomers"
      striped
      hoverable
      narrowed
      :paginated="true"
      :per-page="page_size"
      :total="$store.state.cafeModule.cafeCustomersCount"
      backend-pagination
      :current-page.sync="current_page"
    >
      <template slot-scope="props">
        <b-table-column
          cell-class="has-no-head-mobile is-image-cell"
          width="50"
        >
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

        <b-table-column :label="$t('primary.name')" field="first_name" sortable>
          {{ props.row.first_name + " " + props.row.last_name }}
        </b-table-column>

        <b-table-column
          :label="$tc('customers.visit', 2)"
          field="total_times_ordered"
          centered
          sortable
        >
          {{ props.row.data.total_times_ordered }}
          {{ $tc("customers.time", props.row.data.total_times_ordered) }}
        </b-table-column>

        <b-table-column
          :label="$t('customers.totalSpent')"
          field="total_amount"
          centered
          sortable
        >
          {{ props.row.data.total_amount | myCurrency}}
        </b-table-column>

        <b-table-column
          :label="$t('customers.averageSpent')"
          field="average_spent"
          centered
          sortable
        >
          {{ props.row.data.average_spent | myCurrency}}
        </b-table-column>

        <b-table-column
          :label="$t('customers.favoriteFood')"
          field="fav_product"
        >
          {{ props.row.data.fav_product }}
        </b-table-column>

        <b-table-column
          class="is-actions-cell"
          field="product-methods"
          label=""
          centered
        >
          <b-tooltip
            class="buttons"
            :label="$t('primary.informations')"
            type="is-info"
          >
            <button class="button is-small is-info">
              <b-icon icon="account-alert" size="is-small" />
            </button>
          </b-tooltip>
        </b-table-column>
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
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Customers Table",
  data() {
    return {
      page_size: 10,
      current_page: 1,
    };
  },
  watch: {
    page_size() {
      this.$store.dispatch("cafeModule/getCafeCustomers", {
        page: this.current_page,
        page_size: this.page_size,
      });
    },
    current_page() {
      this.$store.dispatch("cafeModule/getCafeCustomers", {
        page: this.current_page,
        page_size: this.page_size,
      });
    },
  },
  computed: {
    cafeCustomers() {
      return this.$store.state.cafeModule.cafeCustomers;
    },
  },
};
</script>

<style lang="scss" scoped>
.buttons {
  margin: 0 0.2rem;
}

.button {
  box-shadow: 0 2px 2px #b8b8b8 !important;
}

.b-tooltip {
  & button {
    border-radius: 2px;
    margin: 0;

    & .icon {
      font-size: 0.95rem;
    }
  }
}

.red {
  color: red !important;
}

.green {
  color: green !important;
}

.yellow {
  color: rgb(196, 196, 35) !important;
}

.level {
  direction: rtl !important;
}
</style>
