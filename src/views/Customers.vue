<template>
  <div>
    <hero-bar> {{ $t("customers.customers") }} </hero-bar>
    <section class="section is-main-section">
      <card-component
        :title="$t('customers.customers')"
      >
        <CustomersTable @customerDetail="handleCustomerDetail" />
      </card-component>
    </section>
  </div>
</template>

<script>
import CustomersTable from "@/components/Management/Cafe/Customers/CustomersTable";
import CardComponent from "@/components/CardComponent";
import HeroBar from "@/components/HeroBar";

export default {
  name: "customers",
  components: {
    CardComponent,
    CustomersTable,
    HeroBar,
  },
  data() {
    return {};
  },
  methods: {
    getCafeCustomers() {
      this.$store.dispatch("cafeModule/getCafeCustomers");
    },
  },
  mounted() {
    this.getCafeCustomers();
  },
};
</script>
