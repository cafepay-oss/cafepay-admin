<template>
  <div class="printer-discovery">
    <b-message v-if="discoveryError" type="is-warning" :closable="false">
      {{ discoveryError }}
    </b-message>
    <p v-else-if="!loading && !printers.length">چاپگری روی این دستگاه پیدا نشد.</p>
    <b-button
      type="is-info"
      class="is-outlined"
      icon-left="refresh"
      :loading="loading"
      :disabled="loading"
      @click="$store.dispatch('printerModule/getLocalPrinters')"
    >جست‌وجوی دوباره چاپگرها</b-button>
  </div>
</template>

<script>
export default {
  computed: {
    loading() { return this.$store.state.printerModule.printerLoading; },
    discoveryError() { return this.$store.state.printerModule.printerDiscoveryError; },
    printers() { return this.$store.state.printerModule.localPrinters || []; }
  }
};
</script>

<style scoped>
.printer-discovery { margin-bottom: 1rem; }
.printer-discovery p { margin-bottom: .75rem; }
</style>
