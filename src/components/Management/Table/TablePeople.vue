<template>
  <section class="people">
    <div
      class="person"
      v-for="customer in filteredCustomers"
      :key="customer.id"
    >
      <img
        class="person__image"
        :src="
          'https://avatars.dicebear.com/v2/bottts/' +
          customer.user_profile.full_name +
          '.svg'
        "
      />
      <p class="person__name">{{ customer.user_profile.full_name }}</p>
      <b-button
        :loading="isLoading"
        disabled
        class="person__about"
        type="is-info"
        >{{ $t("cafeManagement.aboutCustomer") }}</b-button
      >
    </div>
  </section>
</template>

<script>
import CardComponent from "@/components/CardComponent";

export default {
  components: {
    CardComponent,
  },
  data() {
    return {};
  },
  props: {
    tableDetail: {
      type: Object,
      required: true,
    },
  },
  computed: {
    filteredCustomers() {
      return this.tableDetail.scanned;

      let filteredCustomers = JSON.parse(
        JSON.stringify(this.tableDetail.customers)
      );

      this.tableDetail.scanned.forEach((scan) => {
        if (
          !filteredCustomers.find(
            (customer) => customer.id == scan.user_profile.pk
          )
        ) {
          filteredCustomers.push(scan.user_profile);
        }
      });

      return filteredCustomers;
    },
  },
};
</script>

<style lang="scss" scoped>
.people {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;
  height: 20rem;

  overflow: scroll;

  &::-webkit-scrollbar {
    display: none;
  }

  transition: all 2s ease;
}

.person {
  text-align: center;

  border-radius: 5px;

  box-shadow: 0 2px 2px #b8b8b8 !important;

  max-width: 10rem;
  min-height: 12rem;
  height: auto;

  margin: 0.5rem;

  padding: 1rem 0.5rem;

  &__image {
    border-radius: 5%;
    width: 5rem;
    height: 5rem;
    margin: 1rem;
    margin-bottom: 0.5rem;
  }

  &__name {
    margin: 0 1rem 0.5rem 1rem;
    font-weight: 400;
  }
}
</style>
