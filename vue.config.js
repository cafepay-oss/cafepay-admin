module.exports = {
  pwa: {
    workboxOptions: { importScripts: ['serviceWorker.js'] }
  },
  pluginOptions: {
    i18n: {
      locale: 'fa-IR',
      fallbackLocale: 'fa-IR',
      localeDir: 'locales',
      enableInSFC: false
    }
  }
}
