<template>
  <div class="notification" :class="notificationSetting.notificationColor.class">
    <span class="notification__top">
      <b-icon
        @click.native="closeNotification()"
        class="notification__top__close-button"
        icon="close"
        size="is-small"
      ></b-icon>
      {{ notification.message }}
    </span>
    <span class="notification__bottom">
      <b-button
        type="is-ghost is-light"
        size="is-small"
        @click="showTable()"
      >
        نمایش
      </b-button>
      <!-- <b-button type="is-ghost is-light" size="is-small">
        ارسال به آشپزخانه</b-button
      > -->
    </span>
  </div>
</template>

<script>
export default {
  name: "notification",
  data() {
    return {};
  },
  props: {
    notification: {
      type: Object,
      required: true,
    },
  },
  computed: {
    notificationSetting() {
      return this.$store.state.notificationModule.notificationsSettingData.find(
        (setting) => setting.type == this.notification.type
      )
    },
  },
  mounted() {
    setTimeout(() => {
      this.closeNotification();
    }, this.notificationSetting.notificationTimer.miliseconds);
  },
  methods: {
    showTable() {
      if(window.isElectron) {
        window.onCafePayNotificationClick()
      }
      if(this.notification.table.isPreorder) {
        if(this.$route.name != 'Preorder'){
          this.$router.push({name: 'Preorder'})
        }
      } else {
        this.$store.commit('tableModule/setSelectedTable',this.notification.table);
      }
      this.closeNotification();
    },
    closeNotification() {
      let newNotifications = this.$store.state.notificationModule.notifications.filter(
        (notif) => notif != this.notification
      );
      this.$store.commit(
        "notificationModule/setNotifications",
        newNotifications
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.notification {
  padding: 0.7em 0.7em 0.7em 1em;
  margin: 0.5em 0;
  min-height: 3.1em;
  min-width: 25em;
  max-width: 40em;
  font-size: 0.9em;
  pointer-events: auto;

  &__top {
    display: flex;
    align-items: center;

    &__close-button {
      width: 2em;
      height: 1.5em;
      margin-inline-end: 0.5em;
      transition: all 0.3s ease;

      &:hover {
        cursor: pointer;
        color: rgb(167, 7, 7);
      }
    }
  }

  &__bottom {
    display: flex;
    justify-content: flex-end;
  }
}

.green {
  background: #1ba771 !important;
  color: white;

  & .button {
    background: #1ba771 !important;
    color: white;
  }
}

.red {
  background: #a71b1b !important;
  color: white;

  & .button {
    background: #a71b1b !important;
    color: white;
  }
}

.blue {
  background: #1b6da7 !important;
  color: white;

  & .button {
    background: #1b6da7 !important;
    color: white;
  }
}

.purple {
  background: #8b1ba7 !important;
  color: white;

  & .button {
    background: #8b1ba7 !important;
    color: white;
  }
}
</style>