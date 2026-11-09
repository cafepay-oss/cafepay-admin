// Only the packaged preload can provide native capabilities.
window.storage = localStorage;
window.isElectron = !!window.cafepayDesktop;
if (window.isElectron) {
  const desktop = window.cafepayDesktop;
  window.storage = {
    getItem: key => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
    removeItem: key => localStorage.removeItem(key),
    clear: () => {
      localStorage.clear();
      // Logout must never import a legacy token again.
      localStorage.setItem('desktop-preferences-imported', 'true');
    }
  };
  if (!localStorage.getItem('desktop-preferences-imported')) {
    const preferences = desktop.legacyPreferences();
    Object.keys(preferences).forEach(key => {
      if (localStorage.getItem(key) === null) localStorage.setItem(key, preferences[key]);
    });
    localStorage.setItem('desktop-preferences-imported', 'true');
  }
  window.getPrinterList = () => desktop.getPrinterList();
  window.printTest = (deviceName, size) => desktop.print({deviceName, size, sample: true});
  window.posPrint = (deviceName, html) => desktop.print({deviceName, html});
  window.onCafePayNotification = () => desktop.notify().catch(() => {});
  window.onCafePayNotificationClick = () => desktop.restore().catch(() => {});
  window.cafepayReload = () => desktop.reload().catch(() => {});
}
