<template>
  <div class="notifications-setting-table">
    <b-table
      :loading="isLoading"
      :data="notificationsSettingData"
      striped
      hoverable
      bordered
    >
      <template slot-scope="props">
        <b-table-column label="عنوان" field="title">
          {{ props.row.title }}
        </b-table-column>

        <b-table-column
          field="notification-status"
          :label="$t('primary.status')"
          centered
        >
          <div dir="ltr" class="field">
            <b-switch
              type="is-info"
              v-model="props.row.is_on"
              >{{
                props.row.is_on ? $t("primary.on") : $t("primary.off")
              }}</b-switch
            >
          </div>
        </b-table-column>

        <b-table-column label="صدا" field="sound" centered>
          <div class="notifications__sound field select-field">
            <b-select
              v-model="props.row.notificationSound"
              @input="(sound) => handleSoundSelect(sound)"
              placeholder="انتخاب صدا"
            >
              <option v-for="sound in sounds" :value="sound" :key="sound.id">
                {{ sound }}
              </option>
            </b-select>
          </div>
        </b-table-column>

        <b-table-column label="رنگ" field="color" centered>
          <div class="notifications__color field select-field">
            <b-select
              v-model="props.row.notificationColor"
              placeholder="انتخاب رنگ"
            >
              <option v-for="color in colors" :value="color" :key="color.id">
                {{ color.color }}
              </option>
            </b-select>
          </div>
        </b-table-column>

        <b-table-column label="زمان نمایش" field="timer" centered>
          <div class="notifications__timer field select-field">
            <b-select
              v-model="props.row.notificationTimer"
              placeholder="انتخاب زمان"
            >
              <option v-for="time in times" :value="time" :key="time.id">
                {{ time.time }}
              </option>
            </b-select>
          </div>
        </b-table-column>

        <b-table-column label="جزئیات" field="details" centered>
          <div class="notifications__detail field select-field">
            <b-select
              v-model="props.row.notificationDetails"
              placeholder="انتخاب وضعیت"
            >
              <option
                v-for="detailState in detailStates"
                :value="detailState.id"
                :key="detailState.id"
              >
                {{ detailState.state }}
              </option>
            </b-select>
          </div>
        </b-table-column>
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
  </div>
</template>

<script>
export default {
  name: "NotificationsSettingTable",
  data() {
    return {
      colors: [
        {
          id: 0,
          color: "سبز",
          class: "green"
        },
        {
          id: 1,
          color: "قرمز",
          class: "red"
        },
        {
          id: 2,
          color: "آبی",
          class: "blue"
        },
        {
          id: 3,
          color: "بنفش",
          class: "purple"
        },
      ],

      sounds: [
        "accomplished",
        "beyond-doubt",
        "deduction",
        "definite",
        "eventually",
        "high-definite",
        "just-saying",
        "moonless",
        "plucky",
        "quite-impressed",
        "sharp",
        "soundsnap",
        "to-the-point",
      ],

      detailStates: [
        {
          id: 0,
          state: "عدم نمایش",
        },
        {
          id: 1,
          state: "در حالت بسته",
        },
        {
          id: 2,
          state: "در حالت باز",
        },
      ],

      times: [
        {
          id: 0,
          time: "5 ثانیه",
          miliseconds: 5000,
        },
        {
          id: 1,
          time: "10 ثانیه",
          miliseconds: 10000,
        },
        {
          id: 2,
          time: "20 ثانیه",
          miliseconds: 20000,
        },
        {
          id: 3,
          time: "60 ثانیه",
          miliseconds: 60000,
        },
        {
          id: 4,
          time: "همیشه",
          miliseconds: 5000000,
        },
      ],
    };
  },
  methods: {
    handleSoundSelect(sound) {
      var audio = new Audio(require("../../assets/sounds/" + sound + ".mp3"));
      audio.play();
    },
  },
  computed: {
    notificationsSettingData: {
      get() {
        return this.$store.state.notificationModule.notificationsSettingData
      },
      set(value) {
        this.$store.state.notificationModule.notificationsSettingData = value
      }
    }
  },
  watch: {
    notificationsSettingData: {
      deep: true,
      handler(newValue) {
        this.$store.commit('notificationModule/setNotificationsSettingData', newValue)
        window.storage.setItem('notificationsSettingData', JSON.stringify(newValue))
      }
    }
  }
};
</script>

<style lang="scss" scoped>

.select-field {
  & > .control {
    text-align: center !important;
  }
}

</style>