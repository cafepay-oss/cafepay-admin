<template>
  <keep-alive>
    <div class="order-aside aside">
      <div class="aside__get-report-button aside-part">
        <b-button type="is-info" :loading="isLoading" @click="getOrdersReport()"
          >{{ $t('reportsSidebar.generateReport') }}</b-button
        >
      </div>
      <!-- Date Picker -->
      <div class="aside__date aside-part">
        <div class="aside__date__title title">{{$t('reportsSidebar.date')}}</div>
        <div class="aside__date__content aside-content">
          <div class="aside__date__start datetime-picker">
            <!-- شروع -->
            <date-picker
              :placeholder="$t('reportsSidebar.start')"
              color="#03a9f4"
              v-model="startDate"
              :clearable="true"
              class="picker"
              format="jYYYY/jMM/jDD"
              :editable="true"
              :locale="$t('locale')"
            />
          </div>
          <div class="aside__date__end datetime-picker">
            <!-- پایان -->
            <date-picker
              :placeholder="$t('reportsSidebar.end')"
              color="#03a9f4"
              v-model="endDate"
              :clearable="true"
              format="jYYYY/jMM/jDD"
              :editable="true"
              :locale="$t('locale')"
            />
          </div>
        </div>
      </div>
      <!-- Time Picker -->
      <div class="aside__time aside-part">
        <div class="aside__time__title title">{{$t('reportsSidebar.time')}}</div>
        <div class="aside__time__content aside-content">
          <div class="aside__time__start datetime-picker">
            <!-- شروع -->
            <date-picker
              :placeholder="$t('reportsSidebar.start')"
              color="#03a9f4"
              v-model="startTime"
              type="time"
              class="picker"
              :editable="true"
              :locale="$t('locale')"
            />
          </div>
          <div class="aside__time__end datetime-picker">
            <!-- پایان -->
            <date-picker
              :placeholder="$t('reportsSidebar.end')"
              color="#03a9f4"
              v-model="endTime"
              type="time"
              class="picker"
              :editable="true"
              :locale="$t('locale')"
            />
          </div>
        </div>
      </div>
      <!-- Chart Scale -->
      <!-- <div class="aside__scale aside-part">
      <div class="aside__scale__title title">مقیاس نمودار</div>
      <div class="aside__scale__content aside-content">
        <b-select placeholder="مقیاس" icon="chart-bar">
          <option v-for="scale in scales" :key="scale.id" :value="scale.id">
            {{ scale.title }}
          </option>
        </b-select>
      </div>
    </div> -->
      <!-- Price Range -->
      <!-- <div class="aside__price-range aside-part">
      <div class="aside__scale__title title">بازه قیمت</div>
      <div
        class="aside__scale__content aside-content aside-content__price-range"
      >
        <p>قیمت از {{ priceRange[0] }} الی {{ priceRange[1] }}</p>
        <b-slider
          type="is-info"
          v-model="priceRange"
          rounded
          :min="0"
          :max="200000"
          :step="1000"
        ></b-slider>
      </div>
    </div> -->
      <!-- Pro Filters -->
      <!-- <div class="aside__has-category aside-part">
      <div class="aside__scale__title title">فیلترهای پیشرفته</div>
      <div :class="{'invisible': !proFilter}" class="aside__scale__content aside-content">
        <b-select placeholder="دارای محصول خاص" icon="food" expanded class="aside-content__select">
          <option v-for="scale in scales" :key="scale.id" :value="scale.id">{{ scale.title }}</option>
        </b-select>
        <b-select
          placeholder="دارای دسته ی خاص"
          icon="view-dashboard"
          expanded
          class="aside-content__select"
        >
          <option v-for="scale in scales" :key="scale.id" :value="scale.id">{{ scale.title }}</option>
        </b-select>
        <b-select
          placeholder="دارای مشتری خاص"
          icon="account"
          expanded
          class="aside-content__select"
        >
          <option v-for="scale in scales" :key="scale.id" :value="scale.id">{{ scale.title }}</option>
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
      startDate: null,
      endDate: null,
      startTime: null,
      endTime: null,

      proFilter: false,

      priceRange: [10000, 50000],
    };
  },
  methods: {
    getOrdersReport() {
      if (this.startDate && this.endDate && this.startTime && this.endTime) {
        this.$store.dispatch("cafeModule/ordersReport", {
          start_date: this.startDate,
          start_time: this.startTime,
          end_date: this.endDate,
          end_time: this.endTime,
          page: this.ordersReportPage,
          pageSize: this.ordersReportPageSize,
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
  mounted() {
    if (!this.$store.state.cafeModule.ordersReport) {
      this.startTime = "00:00";
      this.endTime = "23:59";
      this.startDate = this.convertToServerFormat(
        this.convertPersian(new Date().toLocaleDateString("fa-IR"))
      );
      this.endDate = this.convertToServerFormat(
        this.convertPersian(new Date().toLocaleDateString("fa-IR"))
      );
      setTimeout(() => {
        this.getOrdersReport();
      }, 500);
    }
  },
  computed: {
    ordersReportPage() {
      return this.$store.state.cafeModule.ordersReportPage;
    },
    ordersReportPageSize() {
      return this.$store.state.cafeModule.ordersReportPageSize;
    },
  },
  watch: {
    ordersReportPage() {
      this.getOrdersReport();
    },
    ordersReportPageSize() {
      this.getOrdersReport();
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