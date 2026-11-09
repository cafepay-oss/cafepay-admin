<template>
  <section class="section">
    <card-component class="date-time-picker">
      <div class="compare-chart">
        <b-button :loading="isLoading" type="is-info" @click="addNewChart()"
          >مقایسه با نمودار دیگر</b-button
        >
      </div>

      <section
        v-for="dateTimeObject in dateTimeObjects"
        :key="dateTimeObject.id"
        class="date-time-picker-section"
        :style="{ backgroundColor: dateTimeObject.selectedColor.hashBack }"
      >
        <div class="chart-color">
          <b-select
            placeholder="رنگ نمودار"
            icon="brush"
            v-model="dateTimeObject.selectedColor"
          >
            <option v-for="color in colors" :key="color.id" :value="color">
              {{ color.title }}
            </option>
          </b-select>
        </div>
        <div class="date-picker">
          <span class="space-around">از تاریخ</span>
          <span class="space-around">
            <date-picker :clearable="true" />
          </span>
          <span class="space-around">الی</span>
          <span class="space-around">
            <date-picker :clearable="true" />
          </span>
        </div>
        <div v-if="!dateTimeObject.extendedTimeMode" class="simple-time-picker">
          <span class="space-around">از ساعت</span>
          <span class="space-around">
            <date-picker type="time" />
          </span>
          <span class="space-around">الی</span>
          <span class="space-around">
            <date-picker type="time" />
          </span>
        </div>

        <span class="change-time-mode">
          <b-button
            type="is-info"
            @click="
              dateTimeObject.extendedTimeMode = !dateTimeObject.extendedTimeMode
            "
            >{{
              dateTimeObject.extendedTimeMode
                ? "حذف جزئیات روزانه"
                : "با جزئیات روزانه"
            }}</b-button
          >
        </span>

        <div
          v-if="dateTimeObject.extendedTimeMode"
          class="extended-time-picker"
        >
          <b-field
            class="slider-field"
            v-for="day in dateTimeObject.days"
            :key="day.day"
          >
            <div class="field checkbox-field">
              <b-checkbox v-model="day.status" type="is-info"></b-checkbox>
            </div>
            <div class="day-title">{{ day.title }}</div>
            <span class="slider-flex">
              <b-slider
                v-for="time in day.timeSlices"
                :key="time.id"
                v-model="time.time"
                :min="0"
                :max="24"
                :step="0.5"
                ticks
                type="is-info"
                class="time-slider"
              >
                <template v-for="val in 24">
                  <b-slider-tick :value="val" :key="val.i">{{
                    val + ":00"
                  }}</b-slider-tick>
                </template>
              </b-slider>
            </span>
            <b-button
              class="add-slider-button"
              type="is-info"
              @click="addNewTimeSlider(day)"
              >+</b-button
            >
          </b-field>
        </div>
      </section>

      <div class="chart-scale">
        <b-select placeholder="مقیاس نمودار" icon="chart-bar">
          <option v-for="scale in scales" :key="scale.id" :value="scale.id">
            {{ scale.title }}
          </option>
        </b-select>
      </div>

      <span class="get-report-button">
        <b-button :loading="isLoading" type="is-info" @click="getReport()"
          >انجام مقایسه</b-button
        >
      </span>
    </card-component>
  </section>
</template>

<script>
import CardComponent from "@/components/CardComponent";

export default {
  name: "dateTimePicker",
  components: {
    CardComponent,
  },
  data() {
    return {
      lastDateTimeObjectId: 1,
      dateTimeObjects: [],
      colors: [
        {
          id: 1,
          title: "قرمز",
          hashCode: "#d10202",
          hashBack: "#ffe3e3",
        },
        {
          id: 2,
          title: "نارنجی",
          hashCode: "#fc7a00",
          hashBack: "#fff4de",
        },
        {
          id: 3,
          title: "سبز",
          hashCode: "#009e2a",
          hashBack: "#e8ffe0",
        },
        {
          id: 4,
          title: "آبی",
          hashCode: "#022abd",
          hashBack: "#dbddff",
        },
        {
          id: 5,
          title: "آبی کمرنگ",
          hashCode: "#00b7c4",
          hashBack: "#dbfffe",
        },
        {
          id: 6,
          title: "مشکی",
          hashCode: "#000000",
          hashBack: "#ebebeb",
        },
      ],
      scales: [
        {
          id: 1,
          title: "روزانه",
        },
        {
          id: 2,
          title: "هفتگی",
        },
        {
          id: 3,
          title: "ماهانه",
        },
        {
          id: 4,
          title: "سالانه",
        },
      ],
    };
  },
  created() {
    this.addNewChart();
  },
  methods: {
    addNewChart() {
      let newDateTimeObject = {
        id: 1,
        startDate: "",
        endDate: "",
        selectedColor: "",
        extendedTimeMode: false,
        days: [
          {
            day: 1,
            status: true,
            title: "شنبه",
            timeSlices: [{ id: 1, time: [0, 1] }],
          },
          {
            day: 2,
            status: true,
            title: "یکشنبه",
            timeSlices: [{ id: 1, time: [0, 1] }],
          },
          {
            day: 3,
            status: true,
            title: "دوشنبه",
            timeSlices: [{ id: 1, time: [0, 1] }],
          },
          {
            day: 4,
            status: true,
            title: "سه شنبه",
            timeSlices: [{ id: 1, time: [0, 1] }],
          },
          {
            day: 5,
            status: true,
            title: "چهارشنبه",
            timeSlices: [{ id: 1, time: [0, 1] }],
          },
          {
            day: 6,
            status: true,
            title: "پنجشنبه",
            timeSlices: [{ id: 1, time: [0, 1] }],
          },
          {
            day: 7,
            status: true,
            title: "جمعه",
            timeSlices: [{ id: 1, time: [0, 1] }],
          },
        ],
      };
      newDateTimeObject.id = this.lastDateTimeObjectId;
      this.dateTimeObjects.push(newDateTimeObject);
      this.lastDateTimeObjectId++;
    },
    addNewTimeSlider(day) {
      let newTimeSlice = {
        id: 0,
        time: [0, 1],
      };
      newTimeSlice.id = day.timeSlices[day.timeSlices.length - 1].id + 1;
      day.timeSlices.push(newTimeSlice);
    },
    getReport() {
      // api call for report
    },
  },
};
</script>

<style scoped lang="sass">
.section
  padding-top: 1rem

.field.has-addons
  display: flex

.checkbox-field
  margin-bottom: 0px

.compare-chart, .chart-color, .change-time-mode, .chart-scale, .simple-time-picker, .date-picker, .get-report-button
  display: flex
  justify-content: center
  align-items: center
  padding: 10px

.date-time-picker
  background-color: white

.date-time-picker-section
  border-radius: 1rem
  padding: 10px
  margin: 5px

.slider-field
  display: inline-flex
  justify-content: space-between
  align-items: center

.time-slider
  width: 90%

.slider-flex
  display: flex
  width: 100%
  justify-content: center
  align-items: center
  flex-direction: column

.day-title
  width: 7%

.space-around
  padding: 0 5px
</style>