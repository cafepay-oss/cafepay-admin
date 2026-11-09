<template>
  <main class="transfers" dir="rtl">
    <header class="page-header">
      <div><p class="eyebrow">پرداخت مستقیم به مجموعه</p><h1>کارت‌به‌کارت و رسیدها</h1></div>
      <button class="button" :disabled="busy" @click="loadReceipts()">تازه‌سازی</button>
    </header>
    <p class="notification is-info is-light">مشتری با ارسال رسید، سفارش را ثبت می‌کند و آماده‌سازی بدون انتظار برای تأیید پرداخت ادامه می‌یابد. تأیید دریافت وجه فقط برای تسویه حساب است.</p>
    <p v-if="error" class="notification is-danger is-light" role="alert">{{ error }}</p>
    <p v-if="message" class="notification is-success is-light" role="status">{{ message }}</p>
    <details class="settings" :open="settingsExpanded" @toggle="settingsExpanded = $event.target.open">
      <summary>تنظیمات کارت مقصد <span>{{ settings.card_transfer_enabled ? 'فعال' : 'غیرفعال' }}</span></summary>
      <form @submit.prevent="saveSettings">
        <label class="toggle"><input v-model="settings.card_transfer_enabled" type="checkbox"> فعال‌سازی کارت‌به‌کارت برای سفارش آنلاین</label>
        <label>شماره کارت<input v-model="settings.card_transfer_number" inputmode="numeric" dir="ltr" maxlength="32" autocomplete="off" class="input" placeholder="۶۰۳۷ …"></label>
        <label>نام صاحب کارت<input v-model.trim="settings.card_transfer_holder" maxlength="100" class="input"></label>
        <p class="hint">فقط شماره کارت و نام صاحب حساب به مشتری نشان داده می‌شود. با فعال‌سازی، آماده‌سازی بر اساس رسید مشتری شروع می‌شود.</p>
        <button class="button is-primary" :disabled="busy || !cafeId">ذخیره تنظیمات</button>
      </form>
    </details>
    <section class="receipt-list">
      <div class="list-header"><h2>رسیدهای {{ filter === 'submitted' ? 'ثبت‌شده' : filter === 'confirmed' ? 'تأییدشده' : 'ردشده' }} <small>({{ count }})</small></h2>
        <label>نمایش <select v-model="filter" class="select-filter" @change="loadReceipts()">
          <option value="submitted">ثبت‌شده، بررسی‌نشده</option><option value="confirmed">واریز تأییدشده</option><option value="rejected">نیازمند اصلاح</option>
        </select></label>
      </div>
      <p v-if="loading" role="status">در حال دریافت رسیدها…</p>
      <p v-else-if="!receipts.length" class="empty">رسیدی در این بخش نیست.</p>
      <article v-for="receipt in receipts" :key="receipt.uuid" class="receipt-row">
        <div><strong>{{ receipt.customer_name || 'مشتری' }}</strong><p class="hint">سفارش {{ receipt.join }} · {{ date(receipt.submitted_at) }}</p></div>
        <strong>{{ money(receipt.amount) }} تومان</strong>
        <button class="button is-primary is-outlined" :disabled="busy" @click="openReceipt(receipt)">مشاهده رسید</button>
      </article>
      <button v-if="hasMore" class="button" :disabled="loading" @click="loadReceipts(page + 1)">رسیدهای بیشتر</button>
    </section>
    <b-modal class="receipt-review-modal" :active="!!selected" has-modal-card trap-focus :can-cancel="!busy" @close="closeReceipt">
      <div v-if="selected" class="modal-card" dir="rtl">
        <header class="modal-card-head"><p class="modal-card-title">رسید سفارش {{ selected.join }}</p><button class="delete" :disabled="busy" aria-label="بستن" @click="closeReceipt"></button></header>
        <section class="modal-card-body">
          <strong>{{ money(selected.amount) }} تومان</strong>
          <p>{{ selected.destination_holder }} · <span dir="ltr">{{ selected.destination_card }}</span></p>
          <p v-if="receiptLoading" role="status">در حال دریافت تصویر…</p>
          <img v-if="receiptUrl" :src="receiptUrl" class="receipt-image" alt="رسید انتقال مشتری">
          <p v-if="reviewError" class="notification is-danger is-light" role="alert">{{ reviewError }}</p>
          <p v-if="selected.status === 'submitted'" class="hint">پیش از تأیید، واریز را در حساب مقصد بررسی کنید. تصویر رسید به‌تنهایی تأیید بانکی نیست.</p>
          <label v-if="rejecting">دلیل اصلاح رسید<textarea v-model.trim="note" maxlength="500" class="textarea" placeholder="برای مثال: مبلغ رسید با سفارش مطابقت ندارد"></textarea></label>
          <p v-if="selected.review_note">{{ selected.review_note }}</p>
        </section>
        <footer class="modal-card-foot" v-if="selected.status === 'submitted'">
          <button v-if="!rejecting" class="button is-success" :disabled="busy || receiptLoading || !receiptUrl" @click="review('confirm')">واریز را در حساب دیدم</button>
          <button v-if="!rejecting" class="button is-light" :disabled="busy" @click="rejecting = true">رسید نیاز به اصلاح دارد</button>
          <button v-if="rejecting" class="button is-danger" :disabled="busy || !note" @click="review('reject')">ثبت دلیل برای مشتری</button>
          <button v-if="rejecting" class="button" :disabled="busy" @click="rejecting = false">انصراف</button>
        </footer>
      </div>
    </b-modal>
  </main>
</template>

<script>
export default {
  data() {
    return { settings: { card_transfer_enabled: false, card_transfer_number: '', card_transfer_holder: '' }, settingsExpanded: true,
      receipts: [], count: 0, page: 1, hasMore: false, filter: 'submitted', loading: false, busy: false,
      error: '', message: '', selected: null, receiptUrl: '', receiptLoading: false, reviewError: '', rejecting: false, note: '', timer: null, requestVersion: 0 }
  },
  computed: {
    cafeId() { return this.$store.state.accountModule.activeCafe.id }
  },
  watch: {
    cafeId: { immediate: true, handler() { this.initialize() } }
  },
  mounted() {
    this.timer = setInterval(() => {
      if (!this.selected && !this.busy && this.page === 1 && !document.hidden) this.loadReceipts()
    }, 30000)
  },
  beforeDestroy() { clearInterval(this.timer); this.closeReceipt() },
  methods: {
    money(value) { return Number(value).toLocaleString('fa-IR') },
    date(value) { return value ? new Date(value).toLocaleString('fa-IR') : '' },
    errorText(error) {
      const data = error.response && error.response.data
      if (error.response && error.response.status === 403) return 'برای تغییر تنظیمات کارت، دسترسی مدیریت مجموعه لازم است.'
      if (data && typeof data === 'object') return data.detail || Object.values(data).map(value => Array.isArray(value) ? value.join(' ') : value).join(' ')
      return 'ارتباط برقرار نشد؛ دوباره تلاش کنید.'
    },
    async initialize() {
      this.closeReceipt()
      this.receipts = []; this.count = 0; this.error = ''; this.message = ''
      this.settings = { card_transfer_enabled: false, card_transfer_number: '', card_transfer_holder: '' }
      this.settingsExpanded = true
      const cafeId = this.cafeId
      if (!cafeId) return
      this.loadReceipts()
      try {
        const response = await this.request({ method: 'GET', url: `api/v1/cafe/${cafeId}/card-transfer/settings/` })
        if (this.cafeId === cafeId) {
          this.settings = response.data
          this.settingsExpanded = !response.data.card_transfer_enabled
        }
      } catch (error) { if (this.cafeId === cafeId) this.error = this.errorText(error) }
      const uuid = this.$route.query.receipt
      if (uuid && this.cafeId === cafeId) {
        try {
          const response = await this.request({ method: 'GET', url: `api/v1/card-transfers/${uuid}/` })
          if (this.cafeId === cafeId && Number(response.data.cafe) === Number(cafeId)) this.openReceipt(response.data)
        } catch (error) { if (this.cafeId === cafeId) this.error = this.errorText(error) }
      }
    },
    async loadReceipts(page = 1) {
      if (!this.cafeId) return
      const requestVersion = ++this.requestVersion
      const cafeId = this.cafeId
      const filter = this.filter
      this.loading = true
      try {
        const response = await this.request({ method: 'GET', url: `api/v1/cafe/${cafeId}/card-transfers/`,
          params: { status: filter, page }, noLoadingNeeded: true })
        if (cafeId !== this.cafeId || filter !== this.filter || requestVersion !== this.requestVersion) return
        this.receipts = page === 1 ? response.data.results : this.receipts.concat(response.data.results)
        this.count = response.data.count
        this.hasMore = !!response.data.next
        this.page = page
      } catch (error) { if (cafeId === this.cafeId) this.error = this.errorText(error) }
      finally { if (requestVersion === this.requestVersion) this.loading = false }
    },
    async saveSettings() {
      if (this.busy) return
      const cafeId = this.cafeId
      this.busy = true; this.error = ''; this.message = ''
      try {
        const response = await this.request({ method: 'PATCH', url: `api/v1/cafe/${cafeId}/card-transfer/settings/`, data: this.settings })
        if (cafeId === this.cafeId) { this.settings = response.data; this.message = 'تنظیمات کارت ذخیره شد.' }
      } catch (error) { if (cafeId === this.cafeId) this.error = this.errorText(error) }
      finally { this.busy = false }
    },
    closeReceipt() {
      this.selected = null
      if (this.receiptUrl) URL.revokeObjectURL(this.receiptUrl)
      this.receiptUrl = ''
    },
    async openReceipt(receipt) {
      this.closeReceipt()
      this.selected = receipt; this.rejecting = false; this.note = ''; this.reviewError = ''; this.receiptLoading = true
      try {
        const response = await this.request({ method: 'GET', url: `api/v1/card-transfers/${receipt.uuid}/receipt/`, responseType: 'blob', noLoadingNeeded: true })
        if (this.selected && this.selected.uuid === receipt.uuid) this.receiptUrl = URL.createObjectURL(response.data)
      } catch (error) { if (this.selected && this.selected.uuid === receipt.uuid) this.reviewError = 'تصویر بارگذاری نشد؛ صفحه رسید را دوباره باز کنید.' }
      finally { if (this.selected && this.selected.uuid === receipt.uuid) this.receiptLoading = false }
    },
    async review(decision) {
      if (this.busy || !this.selected || (decision === 'reject' && !this.note)) return
      this.busy = true; this.reviewError = ''
      const receipt = this.selected
      const cafeId = this.cafeId
      try {
        await this.request({ method: 'POST', url: `api/v1/card-transfers/${receipt.uuid}/review/`, data: { decision, note: this.note } })
        if (cafeId === this.cafeId) {
          this.closeReceipt(); this.message = decision === 'confirm' ? 'دریافت وجه ثبت شد.' : 'دلیل اصلاح رسید برای مشتری ثبت شد.'
          await this.loadReceipts()
        }
      } catch (error) { if (this.selected && this.selected.uuid === receipt.uuid) this.reviewError = this.errorText(error) }
      finally { this.busy = false }
    }
  }
}
</script>

<style scoped>
.transfers { max-width: 1120px; margin: auto; padding: 28px; color: #203442; }
.page-header, .list-header, .receipt-row { display: flex; justify-content: space-between; align-items: center; gap: 18px; }
h1 { font-size: 28px; font-weight: 800; margin-bottom: 20px; }
h2 { font-size: 20px; font-weight: bold; }
.eyebrow, .hint { color: #526675; font-size: 13px; line-height: 1.9; }
.settings, .receipt-list { background: #fff; border: 1px solid #dce5e9; border-radius: 16px; padding: 24px; margin: 24px 0; }
summary { cursor: pointer; font-weight: bold; }
summary span { color: #076957; padding: 0 16px; }
form { max-width: 540px; display: grid; gap: 18px; padding-top: 24px; }
label { display: grid; gap: 8px; }
.toggle { display: flex; align-items: center; gap: 12px; }
.select-filter { padding: 8px; border: 1px solid #a4b6c0; border-radius: 8px; background: #fff; font: inherit; }
.receipt-row { padding: 18px 0; border-top: 1px solid #e5ecef; }
.list-header { padding-bottom: 24px; }
.empty { text-align: center; padding: 48px; color: #526675; }
.receipt-review-modal { z-index: 1001; }
.modal-card { width: min(600px, 94vw); }
.modal-card-foot { flex-wrap: wrap; gap: 10px; }
.receipt-image { display: block; max-width: 100%; max-height: 60vh; margin: 18px auto; }
.notification { line-height: 1.9; }
@media(max-width: 640px) { .transfers { padding: 16px; } .page-header, .list-header, .receipt-row { flex-wrap: wrap; } .settings, .receipt-list { padding: 18px; } }
</style>
