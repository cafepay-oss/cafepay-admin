<template>
  <keep-alive>
    <div class="customer-aside aside">
      <div class="aside__get-report-button aside-part">
        <b-button
          type="is-info"
          :loading="isLoading"
          @click="getCustomersReport()"
          >{{ $t('reportsSidebar.generateReport') }}</b-button
        >
      </div>
      <!-- Orders Number -->
      <div class="aside__orders-number aside-part">
        <div class="aside__scale__title title">{{ $t('reportsSidebar.retention') }}</div>
        <div
          class="aside__scale__content aside-content aside-content__orders-number"
        >
          <p>{{ $t('reportsSidebar.fromToRetention', {from: ordersNumber[0], to: ordersNumber[1]}) }}</p>
          <b-slider
            type="is-info"
            v-model="ordersNumber"
            rounded
            :min="0"
            :max="20"
            :step="1"
          ></b-slider>
        </div>
      </div>
      <!-- Price Range -->
      <div class="aside__price-range aside-part">
        <div class="aside__scale__title title">{{ $t('primary.price') }}</div>
        <div
          class="aside__scale__content aside-content aside-content__price-range"
        >
          <!-- <p>قیمت سفارشات</p> -->
          <p>
            {{ $t('reportsSidebar.fromToPrice', {from: $options.filters.myCurrency2(priceRange[0]), to: $options.filters.myCurrency2(priceRange[1]) }) }}
          </p>
          <b-slider
            type="is-info"
            v-model="priceRange"
            rounded
            :min="0"
            :max="500000"
            :step="5000"
          ></b-slider>
          <!-- <p>تخفیف</p>
          <p>از {{ discountRange[0] }} الی {{ discountRange[1] }} تومان</p>
          <b-slider
            type="is-info"
            v-model="discountRange"
            rounded
            :min="0"
            :max="100000"
            :step="500"
          ></b-slider> -->
        </div>
      </div>
      <!-- Customer -->
      <div class="aside__customer aside-part">
        <div class="aside__customer__title title">{{ $t('reportsSidebar.customerName') }}</div>
        <div
          class="aside__customer__content aside-content aside-content__customer"
        >
          <b-input
            :placeholder="$t('primary.name')"
            v-model="customerName"
            type="name"
            icon="account"
          ></b-input>
        </div>
      </div>
      <!-- Pro Filters -->
      <!-- <div class="aside__has-category aside-part">
        <div class="aside__scale__title title">فیلترهای پیشرفته</div>
        <div
          :class="{ invisible: !proFilter }"
          class="aside__scale__content aside-content"
        >
          <b-select
            placeholder="دارای محصول خاص"
            icon="food"
            expanded
            class="aside-content__select"
          >
            <option v-for="scale in scales" :key="scale.id" :value="scale.id">
              {{ scale.title }}
            </option>
          </b-select>
          <b-select
            placeholder="دارای دسته ی خاص"
            icon="view-dashboard"
            expanded
            class="aside-content__select"
          >
            <option v-for="scale in scales" :key="scale.id" :value="scale.id">
              {{ scale.title }}
            </option>
          </b-select>
        </div> 
      </div> -->
    </div>
  </keep-alive>
</template>

<script>
export default {
  data() {
    return {
      priceRange: [0, 2000000],
      ordersNumber: [0, 80],
      customerName: "",

      // startDate: null,
      // endDate: null,
      // startTime: null,
      // endTime: null,

      // proFilter: false,

      // discountRange: [5000, 25000],
    };
  },
  methods: {
    getCustomersReport() {
      this.$store.dispatch("cafeModule/customersReport", {
        priceRange: this.priceRange,
        ordersNumber: this.ordersNumber,
        customerName: this.customerName,
        page: this.customersReportPage,
        pageSize: this.customersReportPageSize,
      });
    },
  },
  computed: {
    customersReportPage() {
      return this.$store.state.cafeModule.customersReportPage;
    },
    customersReportPageSize() {
      return this.$store.state.cafeModule.customersReportPageSize;
    },
  },
  watch: {
    customersReportPage() {
      this.getCustomersReport();
    },
    customersReportPageSize() {
      this.getCustomersReport();
    },
  },
};
</script>

<style lang="scss" scoped>
$report-aside-background-color: #ffffff;
$report-aside-single-part-background-color: #fcfcfc;
$title-font-size: 0.9rem;
$aside-content-font-size: 0.7rem;
$aside-border-color: #cfcfcf;

.aside {
  position: fixed;
  z-index: 10;
  background-color: $report-aside-background-color;
  min-width: 240px;
  width: 17vw;
  height: 91.5vh;
  overflow-y: auto;
  border-left: 1px solid $aside-border-color;
  border-right: 1px solid $aside-border-color;

  &__orders-number {
    padding: 2rem 0 0 0;
  }

  &__get-report-button {
    position: fixed;
    min-width: 240px;
    width: 17vw;
    z-index: 20;

    & > button {
      width: 100%;
      border-radius: 0 !important;
    }
  }

  &::-webkit-scrollbar {
    display: none;
  }
}

.title {
  text-align: center;
  font-size: $title-font-size;
  margin: 1rem 0 0.3rem;
}

.aside-content {
  background-color: $report-aside-single-part-background-color;
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: $aside-content-font-size;
  width: 100%;
  height: 100%;

  border-bottom: 1px solid $aside-border-color;
  transition: all 0.75s ease;

  &__select {
    margin: 0.2rem 0;
  }

  &__price-range {
    padding: 1rem 1.5rem;
  }

  &__orders-number {
    padding: 1rem 1.5rem;
  }

  &__customer {
    padding: 1rem 0.7rem;
  }
}

.datetime-picker {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0.1rem;

  & p {
    width: 3rem;
  }
}

.invisible {
  // visibility: hidden;
  // height: 0;
  // opacity: 0;
}
</style>