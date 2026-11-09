<template>
  <keep-alive>
    <div class="order-aside aside">
      <div class="aside__get-report-button aside-part">
        <b-button
          type="is-info"
          :loading="isLoading"
          @click="getProductsReport"
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
              v-model="reportConfig.startDate"
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
              v-model="reportConfig.endDate"
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
              v-model="reportConfig.startTime"
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
              v-model="reportConfig.endTime"
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
        <div class="aside__scale__title title">{{ $t('reportsSidebar.Scale') }}</div>
        <div class="aside__scale__content aside-content">
          <b-select
            :placeholder="$t('reportsSidebar.Scale')"
            icon="chart-bar"
            v-model="selectedScale"
          >
            <option v-for="scale in scales" :key="scale.id" :value="scale.id">
              {{ scale.title }}
            </option>
          </b-select>
        </div>
      </div> -->

      <!-- Menu -->
      <!-- <div class="aside__scale aside-part">
        <div class="aside__scale__title title">{{ $tc('primary.product', 2) }}</div>
        <div class="aside__scale__content aside-content">
          <div class="menus">
            <div
              class="menus__menu"
              v-for="menu in $store.state.menuModule.menus"
              :key="menu.id"
            >
              <div class="menus__menu__menu-card" @click="expandMenu(menu)">
                <h5 class="menus__menu__mean-card__title">{{ menu.name }}</h5>
                <b-icon
                  :icon="
                    expandedMenu == menu.id ? 'chevron-up' : 'chevron-down'
                  "
                  @click="expandMenu(menu)"
                ></b-icon>
              </div>
              <div
                class="menus__menu__categories"
                v-for="category in menu.categories"
                :key="category.id"
              >
                <div
                  class="menus__menu__categories__category-card"
                  v-if="expandedMenu == menu.id"
                  @click="expandCategory(category)"
                >
                  <h5 class="menus__menu__categories__category__title">
                    {{ category.name }}
                  </h5>
                  <b-icon
                    :icon="
                      expandedCategory == category.id
                        ? 'chevron-up'
                        : 'chevron-down'
                    "
                    @click="expandCategory(category)"
                    size="is-small"
                  ></b-icon>
                </div>
                <div
                  v-if="expandedCategory == category.id"
                  class="menus__menu__categories__products"
                >
                  <div
                    v-for="product in category.products"
                    :key="product.id"
                    class="menus__menu__categories__products__product"
                  >
                    <b-checkbox
                      dir="ltr"
                      v-if="!product.deleted"
                      :native-value="product.id"
                      v-model="selectedProducts"
                      type="is-info"
                      >{{ product.name }}</b-checkbox
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> -->
    </div>
  </keep-alive>
</template>

<script>
import Vue from 'vue';
export default {
  props: [
    'reportConfig'
  ],
  data() {
    return {
      isActive: true,

      expandedMenu: 0,
      expandedCategory: 0,

      selectedProducts: [],
      selectedScale: 24,

      scales: [
        {
          id: 24,
          title: this.$t('reportsSidebar.daily'),
        },
        {
          id: 168,
          title: this.$t('reportsSidebar.weekly'),
        },
        {
          id: 720,
          title: this.$t('reportsSidebar.monthly'),
        },
        {
          id: 8760,
          title: this.$t('reportsSidebar.yearly'),
        },
      ],
    };
  },
  computed: {
    menus() {
      return this.$store.state.menuModule.menus;
    },
  },
  methods: {
    getProductsReport() {
      if (
        this.reportConfig.startDate
        && this.reportConfig.endDate
        && this.reportConfig.startTime
        && this.reportConfig.endTime
        // && this.selectedProducts.length
      ) {
        this.$store.dispatch("cafeModule/productReport", {
          // step: this.selectedScale + ":00:00",
          start_date: this.reportConfig.startDate,
          start_time: this.reportConfig.startTime,
          end_date: this.reportConfig.endDate,
          end_time: this.reportConfig.endTime,
          // products: this.selectedProducts,
        });
      } else {
        this.$buefy.toast.open({
          queue: false,
          queue: false,
          message: this.$t('reportsSidebar.makeSureFieldsAreFilled'),
          type: "is-danger",
        });
      }
    },
    expandMenu(menu) {
      if (this.expandedMenu == menu.id) {
        this.expandedMenu = null;
        this.expandedCategory = null;
      } else {
        this.expandedMenu = menu.id;
      }
    },
    expandCategory(category) {
      if (this.expandedCategory == category.id) {
        this.expandedCategory = null;
      } else {
        this.expandedCategory = category.id;
      }
    },
  },
  mounted() {
    if (!this.$store.state.cafeModule.productsReport) {
      Vue.set(this.reportConfig, 'startTime', "00:00")
      Vue.set(this.reportConfig, 'endTime', "23:59")
      Vue.set(this.reportConfig, 'startDate', this.convertToServerFormat(
        this.convertPersian(new Date().toLocaleDateString("fa-IR"))
      ));
      Vue.set(this.reportConfig, 'endDate', this.convertToServerFormat(
        this.convertPersian(new Date().toLocaleDateString("fa-IR"))
      ));
      setTimeout(() => {
        this.getProductsReport();
      }, 500);
    }
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

  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.3);
    box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.3);
    background-color: #e6e6e6;
  }

  &::-webkit-scrollbar {
    width: 11px;
    background-color: #e6e6e6;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #adb0b4;
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

.menus {
  width: 100%;

  &__menu {
    width: 100%;

    &__menu-card {
      display: flex;
      justify-content: space-between;
      align-items: center;

      width: 100%;
      height: 40px;

      font-size: 0.9rem;

      background: #f6f6f6;

      padding: 5px;

      &:hover {
        cursor: pointer;
      }
    }

    &__categories {
      width: 100%;
      background: #f6f6f6;

      &__category-card {
        display: flex;
        justify-content: space-between;
        align-items: center;

        width: 95%;

        margin-inline-end: auto;
        padding: 5px 10px 5px 9px;

        border-right: 1px solid #cccccc;

        background: #f0f0f0;

        font-size: 0.85rem;

        &:hover {
          cursor: pointer;
        }
      }

      &__products {
        width: 100%;
        background: #f6f6f6;

        &__product {
          background: #f6f6f6;
          width: 100%;
          text-align: start;

          & label {
            background: #e9e9e9;
            display: flex;
            justify-content: space-between;
            align-items: center;

            width: 90%;

            margin-inline-end: auto;
            padding: 5px 10px 5px 11px;

            border-right: 1px solid #cccccc;

            font-size: 0.7rem;
          }
        }
      }
    }
  }
}

button {
  margin: 0;
}
</style>
