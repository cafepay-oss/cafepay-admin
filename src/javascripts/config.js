export default {
  baseURL: process.env.VUE_APP_CAFEPAY_ADMIN_BASEURL,
  socketURL: process.env.VUE_APP_CAFEPAY_ADMIN_SOCKETURL,
  debug: process.env.NODE_ENV == "development",
  defaultLocale: process.env.VUE_APP_I18N_LOCALE,
};
