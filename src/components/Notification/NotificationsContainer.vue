<template>
  <div class="notifications-container">
    <Notification v-for="notification in notifications" :key="notification.id" :notification="notification"/>
    <div v-if="notifications.length > 1" @click="closeAllNotifications" class="notifications-container__close-all">X</div>
  </div>
</template>

<script>
import Notification from "@/components/Notification/Notification.vue"

export default {
  name: "NotificationsContainer",
  components: {
    Notification
  },
  data() {
    return {}
  },
  computed: {
    notifications() {
      return this.$store.state.notificationModule.notifications
    }
  },
  methods: {
    closeAllNotifications() {
      this.$store.commit("notificationModule/setNotifications", [])
    }
  }
}
</script>

<style lang='scss' scoped>

.notifications-container {
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 1em 2em;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  overflow: hidden;
  z-index: 1000;
  pointer-events: none;

  &__close-all {
    background: rgb(236, 236, 236);
    border-radius: 100%;
    padding: 0.5em 0.95em;
    color: rgb(167, 0, 0);
    pointer-events: auto;
    cursor: pointer;
    font-weight: 600;
  }
}

</style>