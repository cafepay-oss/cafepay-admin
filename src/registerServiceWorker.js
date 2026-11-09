import { register } from 'register-service-worker'

if ('serviceWorker' in navigator) {
  if (process.env.VUE_APP_CAFEPAY_LOCAL_RECOVERY === 'true') {
    // Local repairs must load current assets. Leave unrelated registrations alone.
    navigator.serviceWorker.getRegistrations().then(registrations => Promise.all(
      registrations.filter(registration => {
        const worker = registration.active || registration.waiting || registration.installing
        if (!worker) return false
        const url = new URL(worker.scriptURL)
        return url.origin === location.origin && ['/service-worker.js', '/serviceWorker.js'].includes(url.pathname)
      }).map(registration => registration.unregister())
    )).catch(() => {})
  } else if (process.env.NODE_ENV === 'production') {
    // Workbox imports the push handlers into this single root-scope worker.
    register(`${process.env.BASE_URL}service-worker.js`, {
      error () { console.error('Service worker registration failed.') }
    })
  }
}
