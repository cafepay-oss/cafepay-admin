<template>
  <b-modal
    :active.sync="$store.state.tableModule.isTableCloseInvoiceModalActive"
    has-modal-card
  >
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ $t('cafeManagement.closeInvoice') }}</p>
      </header>
      <section class="modal-card-body">
        <p>
          {{ $t('cafeManagement.pleaseSelectOneOfTheFollowingMethods') }}
          <br />
          <br />
        </p>
        <div class="field">
          <b-radio v-model="payInvoiceMethod" native-value="0" type="is-primary"
            >{{ $t('cafeManagement.closeInvoiceWithoutAnyPayment') }}
            </b-radio
          >
        </div>
        <div class="field">
          <b-radio v-model="payInvoiceMethod" native-value="1" type="is-primary"
            >{{ $t('cafeManagement.closeInvoiceWithPOSPayment') }}
            </b-radio
          >
        </div>
        <div class="field">
          <b-radio v-model="payInvoiceMethod" native-value="2" type="is-primary"
            >{{ $t('cafeManagement.closeInvoiceWithCashPayment') }}
            </b-radio
          >
        </div>
        <div class="field">
          <b-radio v-model="payInvoiceMethod" native-value="4" type="is-primary"
            >{{ $t('cafeManagement.closeInvoiceWithDiscount') }}</b-radio
          >
        </div>
      </section>
      <footer class="modal-card-foot">
        <b-button
          :loading="isLoading || $store.state.tableModule.invoiceClosing"
          :disabled="!payInvoiceMethod || $store.state.tableModule.invoiceClosing"
          class="modal-button is-primary"
          @click="$emit('closeInvoice',  payInvoiceMethod)"
          >{{ $t('cafeManagement.closeInvoice') }}</b-button
        >
        <b-button
          :loading="isLoading || $store.state.tableModule.invoiceClosing"
          class="modal-button"
          @click="
            $store.state.tableModule.isTableCloseInvoiceModalActive = false
          "
          >{{ $t('primary.cancel') }}</b-button
        >
      </footer>
    </div>
  </b-modal>
</template>

<script>
export default {
  data() {
    return {
      payInvoiceMethod: 1
    };
  },
};
</script>

<style lang="scss">
.modal-button {
  margin: 0 0.5rem !important;
  box-shadow: 0 2px 2px #b8b8b8 !important;
}
</style>
