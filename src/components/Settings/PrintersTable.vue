<template>
  <div>
    <PrinterDiscoveryStatus />
    <b-message v-if="$store.state.printerModule.failedJobs.length" type="is-warning">
      چاپگر را بررسی کنید. نتیجه چاپ‌های انجام‌شده دوباره ثبت می‌شود و فقط چاپ‌های ناموفق تکرار می‌شوند.
      <b-button :loading="$store.state.printerModule.isRunningJobs"
        @click="$store.dispatch('printerModule/retryFailedJobs')">تلاش دوباره</b-button>
    </b-message>
    <modal-box
      :is-active="$store.state.printerModule.isDeletePrinterModalActive"
      :trash-object-name="trashObject.name"
      @confirm="handleDeletePrinterConfirm()"
      @cancel="$store.state.printerModule.isDeletePrinterModalActive = false"
    />

    <b-modal
      :active.sync="$store.state.printerModule.isEditPrinterModalActive"
      class="footer-modal"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <EditPrinterModal :printer="editObject" />
    </b-modal>

    <b-table
      :loading="isLoading"
      :data="cloudPrinters"
      striped
      hoverable
      bordered
    >
      <template slot-scope="props">
        <b-table-column :label="$t('primary.name')" field="name">
          {{ props.row.display_name }}
        </b-table-column>

        <b-table-column :label="$t('settings.model')" field="model">
          {{ props.row.name }}
        </b-table-column>

        <b-table-column
          :label="$t('settings.paperWidth')"
          field="total_times_ordered"
          centered
        >
          {{ props.row.width }}
        </b-table-column>

        <b-table-column
          :label="$t('settings.printerType')"
          field="type"
          centered
        >
          {{ props.row.displayTypes }}
        </b-table-column>

        <b-table-column
          :label="$t('settings.printerGroups')"
          field="type"
          centered
        >
          {{ props.row.groups_str }}
        </b-table-column>

        <b-table-column
          field="printer-status"
          :label="$t('primary.status')"
          centered
        >
          <div dir="ltr" class="field">
            <b-switch
              type="is-info"
              @input="sendIsOn(props.row)"
              v-model="props.row.is_on"
              >{{
                props.row.is_on ? $t("primary.on") : $t("primary.off")
              }}</b-switch
            >
          </div>
        </b-table-column>

        <b-table-column
          field="printer-policy"
          :label="$t('settings.printerPolicy')"
          centered
        >
          <div dir="ltr" class="field">
            <b-switch
              type="is-dark"
              passive-type="is-info"
              @input="value => sendPolicy(props.row, value)"
              v-model="props.row.policy"
              true-value="0"
              false-value="1"
              >{{
                props.row.policy == PrinterPolicies.GROUPED
                  ? $t("settings.byGroup")
                  : $t("settings.allTogether")
              }}</b-switch
            >
          </div>
        </b-table-column>

        <b-table-column
          class="is-actions-cell"
          field="printer-methods"
          :label="$tc('primary.action', 2)"
          centered
        >
          <b-tooltip class="buttons" label="تست" type="is-success">
            <button
              class="button is-small is-success"
              @click="testPrinter(props.row)"
            >
              <b-icon icon="printer" size="is-small" />
            </button>
          </b-tooltip>
          <b-tooltip class="buttons" :label="$t('primary.edit')" type="is-info">
            <button
              class="button is-small is-info"
              @click="editPrinter(props.row)"
            >
              <b-icon icon="pencil-outline" size="is-small" />
            </button>
          </b-tooltip>
          <b-tooltip
            class="buttons"
            :label="$t('primary.delete')"
            type="is-danger"
          >
            <button
              class="button is-small is-danger"
              @click="deletePrinter(props.row)"
            >
              <b-icon icon="trash-can" size="is-small" />
            </button>
          </b-tooltip>
        </b-table-column>
      </template>
      <section class="section" slot="empty">
        <div class="content has-text-grey has-text-centered">
          <template v-if="isLoading">
            <p>
              <b-icon icon="dots-horizontal" size="is-large" />
            </p>
            <p>{{ $t("primary.loading") }}</p>
          </template>
          <template v-else>
            <p>{{ $t("primary.noInformation") }}</p>
          </template>
        </div>
      </section>
    </b-table>
  </div>
</template>

<script>
import EditPrinterModal from "@/components/Settings/EditPrinterModal";
import ModalBox from "@/components/ModalBox";
import PrinterDiscoveryStatus from "@/components/Settings/PrinterDiscoveryStatus";

export default {
  name: "PrintersTable",
  components: {
    PrinterDiscoveryStatus,
    EditPrinterModal,
    ModalBox
  },
  data() {
    return {
      PRINTER_TYPE_ENUM: {
        0: this.$t("settings.kitchen"),
        1: this.$t("settings.customer")
      },
      trashObject: {
        name: ""
      },
      editObject: null
    };
  },
  computed: {
    localPrinters() {
      return this.$store.getters["printerModule/localPrinters"];
    },
    cloudPrinters() {
      let cloudPrinters = this.$store.getters["printerModule/cloudPrinters"];

      if (cloudPrinters) {
        cloudPrinters.forEach(cloudPrinter => {
          cloudPrinter.displayTypes = "";

          cloudPrinter.the_types.forEach(the_type => {
            cloudPrinter.displayTypes +=
              this.PRINTER_TYPE_ENUM[parseInt(the_type.type)] + " - ";
          });
          if (cloudPrinter.displayTypes.length == 0) {
            cloudPrinter.displayTypes = "<پرینتر نوعی ندارد>";
          } else {
            cloudPrinter.displayTypes = cloudPrinter.displayTypes.slice(0, -3);
          }

          cloudPrinter.groups_str = '';
          cloudPrinter.the_groups.forEach(group => {
            cloudPrinter.groups_str += group.title + " - ";
          });

          if (cloudPrinter.groups_str.length < 1) {
            cloudPrinter.groups_str = 'همه گروه ها'
          }
          else {
            cloudPrinter.groups_str = cloudPrinter.groups_str.slice(0, -3)
          }
        });

        return cloudPrinters.sort((a, b) => a.pk - b.pk);
      }

      return [];
    }
  },
  methods: {
    testPrinter(printer) {
      this.sendToPrinter({
        isCloud: false,
        printer,
        raw_data: 'test',
        description: '',
      });
    },
    deletePrinter(printer) {
      this.trashObject = printer;
      this.$store.state.printerModule.isDeletePrinterModalActive = true;
    },
    handleDeletePrinterConfirm() {
      this.$store.dispatch("printerModule/deletePrinter", this.trashObject.pk);
    },
    editPrinter(printer) {
      this.editObject = printer;
      this.$store.state.printerModule.isEditPrinterModalActive = true;
    },
    sendIsOn(printer) {
      this.$store.dispatch("printerModule/editPrinter", printer);
    },
    sendPolicy(printer, policy) {
      this.$store.dispatch("printerModule/setPrinterPolicy", {
        printer: printer,
        policy: policy
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.buttons {
  margin: 0 0.2rem;
}

.button {
  box-shadow: 0 2px 2px #b8b8b8 !important;
}

.b-tooltip {
  & button {
    border-radius: 2px;
    margin: 0;

    & .icon {
      font-size: 0.95rem;
    }
  }
}

.red {
  color: red !important;
}

.green {
  color: green !important;
}

.yellow {
  color: rgb(196, 196, 35) !important;
}

.level {
  direction: rtl !important;
}
</style>
