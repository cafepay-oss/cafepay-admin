self.addEventListener('push', event => {
  let body = {}
  try { body = event.data ? event.data.json() : {} } catch (_) { return }
  if (!body || typeof body !== 'object') return
  const title = typeof body.title === 'string' ? body.title : 'کافه پی'
  const message = typeof body.body === 'string' ? body.body : ''
  let url = new URL('/cafe-management', self.location.origin)
  try {
    const candidate = new URL(body.url, self.location.origin)
    if (candidate.origin === self.location.origin) url = candidate
  } catch (_) {}
  event.waitUntil(self.registration.showNotification(title, {
    body: message,
    requireInteraction: true,
    vibrate: [100, 50, 100],
    data: {url: url.href},
    actions: [{action: 'open_url', title: 'مشاهده سفارش ها'}]
  }))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  if (event.action && event.action !== 'open_url') return
  let url
  try {
    url = new URL(event.notification.data.url, self.location.origin)
    if (url.origin !== self.location.origin) return
  } catch (_) { return }
  event.waitUntil(clients.openWindow(url.href))
})
