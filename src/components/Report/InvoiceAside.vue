<template>
  <keep-alive>
    <div class="invoice-aside aside">
      <div class="aside__get-report-button aside-part">
        <b-button
          type="is-info"
          :loading="isLoading"
          @click="getInvoicesReport()"
          >{{ $t('reportsSidebar.generateReport') }}</b-button
        >
      </div>
      <!-- Date Picker -->
      <div class="aside__date aside-part">
        <div class="aside__date__title title">{{$t('reportsSidebar.start')}}</div>
        <div class="aside__date__content aside-content">
          <div class="aside__date__start datetime-picker">
            <!-- شروع -->
            <date-picker
              :placeholder="$t('reportsSidebar.time')"
              color="#03a9f4"
              v-model="startDateTime"
              class="picker"
              type="datetime"
              format="YYYY-MM-DDTHH:mm"
              display-format="jYYYY-jMM-jDD HH:mm"
              clearable
              :timezone="true"
              :locale="$t('locale')"
            />
          </div>
        </div>
      </div>
      <!-- Time Picker -->
      <div class="aside__time aside-part">
        <div class="aside__time__title title">{{$t('reportsSidebar.end')}}</div>
        <div class="aside__time__content aside-content">
          <div class="aside__time__end datetime-picker">
            <!-- پایان -->
            <date-picker
              :placeholder="$t('reportsSidebar.time')"
              color="#03a9f4"
              v-model="endDateTime"
              type="datetime"
              class="picker"
              format="YYYY-MM-DDTHH:mm"
              display-format="jYYYY-jMM-jDD HH:mm"
              clearable
              :timezone="true"
              :locale="$t('locale')"
            />
          </div>
        </div>
      </div>
      <!-- Price Range -->
      <div class="aside__price-range aside-part">
        <div class="aside__scale__title title">{{$t('reportsSidebar.priceRange')}}</div>
        <div
          class="aside__scale__content aside-content aside-content__price-range"
        >
          <p>
            {{ $t('reportsSidebar.fromToPrice', {from: $options.filters.myCurrency2(priceRange[0]), to: $options.filters.myCurrency2(priceRange[1])}) }}
          </p>
          <b-slider
            type="is-info"
            v-model="priceRange"
            rounded
            :min="0"
            :max="10000000"
            :step="10000"
          ></b-slider>
        </div>
      </div>
      <!-- Pro Filters -->
      <div class="aside__has-category aside-part">
        <div class="aside__scale__title title">{{ $t('reportsSidebar.advanceFilters') }}</div>
        <div class="aside__scale__content aside-content">
          <b-select
            :placeholder="$t('reportsSidebar.paymentMethod')"
            icon="credit-card"
            expanded
            class="aside-content__select"
            v-model="selectedMethod"
          >
            <option
              v-for="method in methods"
              :key="method.id"
              :value="method.id"
            >
              {{ method.title }}
            </option>
          </b-select>
          <b-select
            :placeholder="$t('reportsSidebar.paymentMethod')"
            icon="format-list-bulleted-type"
            expanded
            class="aside-content__select"
            v-model="selectedType"
          >
            <option v-for="type in types" :key="type.id" :value="type.id">
              {{ type.title }}
            </option>
          </b-select>
          <b-select
            :placeholder="$t('reportsSidebar.paymentMethod')"
            icon="format-list-checks"
            expanded
            class="aside-content__select"
            v-model="selectedStatus"
          >
            <option
              v-for="status in statuses"
              :key="status.id"
              :value="status.id"
            >
              {{ status.title }}
            </option>
          </b-select>
        </div>
      </div>
    </div>
  </keep-alive>
</template>

<script>
export default {
  data() {
    return {
      startDateTime: null,
      endDateTime: null,
      priceRange: [0, 3000000],

      selectedMethod: null,
      methods: [
        {
          name: "Online",
          title: this.$t('primary.online'),
          id: 0,
        },
        {
          name: "POS",
          title: this.$t('primary.POS'),
          id: 1,
        },
        {
          name: "CASH",
          title: this.$t('primary.cash'),
          id: 2,
        },
        {
          name: "none",
          title: this.$t('reportsSidebar.all'),
          id: "",
        },
      ],

      selectedType: null,
      types: [
        {
          name: "Deposit",
          title: this.$t('reportsSidebar.deposit'),
          id: 0,
        },
        {
          name: "Withdraw",
          title: this.$t('reportsSidebar.withdraw'),
          id: 1,
        },
        {
          name: "Clearing",
          title: this.$t('reportsSidebar.checkout'),
          id: 2,
        },
        {
          name: "none",
          title: this.$t('reportsSidebar.all'),
          id: "",
        },
      ],

      selectedStatus: null,
      statuses: [
        {
          name: "Payed",
          title: this.$t('reportsSidebar.payed'),
          id: 0,
        },
        {
          name: "Created",
          title: this.$t('reportsSidebar.created'),
          id: 1,
        },
        {
          name: "In Payment",
          title: this.$t('reportsSidebar.inPayment'),
          id: 2,
        },
        {
          name: "Rejected",
          title: this.$t('reportsSidebar.rejected'),
          id: 3,
        },
        {
          name: "Internal",
          title: this.$t('reportsSidebar.internal'),
          id: 4,
        },
        {
          name: "none",
          title: this.$t('reportsSidebar.all'),
          id: "",
        },
      ],
    };
  },
  methods: {
    getInvoicesReport() {
      if (this.startDateTime && this.endDateTime) {
        this.$store.dispatch("cafeModule/invoicesReport", {
          startDateTime: this.startDateTime,
          endDateTime: this.endDateTime,
          priceRange: this.priceRange,
          selectedMethod:
            this.selectedMethod != null ? this.selectedMethod : "",
          selectedType: this.selectedType != null ? this.selectedType : "",
          selectedStatus:
            this.selectedStatus != null ? this.selectedStatus : "",
          page: this.invoicesReportPage,
          pageSize: this.invoicesReportPageSize,
        });
      } else {
        this.$buefy.toast.open({
          queue: false,
          message: this.$t('reportsSidebar.makeSureFieldsAreFilled'),
          type: "is-danger",
        });
      }
    },
  },
  computed: {
    invoicesReportPage() {
      return this.$store.state.cafeModule.invoicesReportPage;
    },
    invoicesReportPageSize() {
      return this.$store.state.cafeModule.invoicesReportPageSize;
    },
  },
  watch: {
    invoicesReportPage() {
      this.getInvoicesReport();
    },
    invoicesReportPageSize() {
      this.getInvoicesReport();
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

  &__date {
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