import Enums from '../models/Enums'

function isJson(item) {
  item = typeof item !== "string"
      ? JSON.stringify(item)
      : item;

  try {
      item = JSON.parse(item);
  } catch (e) {
      return false;
  }

  if (typeof item === "object" && item !== null) {
      return true;
  }

  return false;
}

export default {
  namespaced: true,
  // -----------------------------------------------------------------
  state: {
    notifications: [],
    notificationsSettingData: (isJson(window.storage.getItem('notificationsSettingData')))
      ? JSON.parse(window.storage.getItem('notificationsSettingData'))
      : [
          {
            id: 0,
            title: "اعلان پرداخت کامل",
            type: Enums.NotificationsTypeEnum.FULL_PAYMENT,
            is_on: true,
            notificationSound: "beyond-doubt",
            notificationColor: {
              id: 0,
              color: "سبز",
              class: "green",
            },
            notificationTimer: {
              id: 4,
              time: "همیشه",
              miliseconds: 5000000,
            },
            notificationDetails: 1,
          },
          {
            id: 1,
            title: "اعلان تغییرات محصول",
            type: Enums.NotificationsTypeEnum.CHANGE_ORDER,
            is_on: true,
            notificationSound: "eventually",
            notificationColor: {
              id: 0,
              color: "سبز",
              class: "green",
            },
            notificationTimer: {
              id: 4,
              time: "همیشه",
              miliseconds: 5000000,
            },
            notificationDetails: 1,
          },
          {
            id: 2,
            title: "اعلان مشتری جدید",
            type: Enums.NotificationsTypeEnum.NEW_CUSTOMER,
            is_on: true,
            notificationSound: "sharp",
            notificationColor: {
              id: 0,
              color: "سبز",
              class: "green",
            },
            notificationTimer: {
              id: 4,
              time: "همیشه",
              miliseconds: 5000000,
            },
            notificationDetails: 1,
          },
          {
            id: 3,
            title: "اعلان پیش سفارش",
            type: Enums.NotificationsTypeEnum.PRE_ORDER,
            is_on: true,
            notificationSound: "definite",
            notificationColor: {
              id: 0,
              color: "سبز",
              class: "green",
            },
            notificationTimer: {
              id: 4,
              time: "همیشه",
              miliseconds: 5000000,
            },
            notificationDetails: 1,
          },
        ],
  },
  // -----------------------------------------------------------------
  getters: {},
  // -----------------------------------------------------------------
  mutations: {
    setNotifications(state, payload) {
      state.notifications = payload;
    },
    setNotificationsSettingData(state, payload) {
      state.notificationsSettingData = payload;
    },
    addNewNotification(state, payload) {
      let notificationSetting = state.notificationsSettingData.find(
        (notif) => notif.type == payload.type
      );
      if (notificationSetting.is_on) {
        state.notifications.push(payload);
        var audio = new Audio(
          require("../assets/sounds/" +
            notificationSetting.notificationSound +
            ".mp3")
        );
        audio.play();
      }
    },
  },
  // -----------------------------------------------------------------
  actions: {},
};
