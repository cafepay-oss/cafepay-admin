<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">
        {{ $t("settings.printerModal.addNewPrinter") }}
      </p>
    </header>
    <section class="modal-card-body">
      <PrinterDiscoveryStatus />
      <b-field
        :label="$t('settings.printerModal.selectYourPrinter')"
        required
        :type="{ 'is-danger': errors.name }"
        :message="errors.name ? errors.name[0] : ''"
      >
        <b-select
          :placeholder="$tc('settings.printerModal.printer', 1)"
          class="selector"
          v-model="printerForm.name"
        >
          <option
            v-for="localPrinter in localPrinters"
            :key="localPrinter.id"
            :value="localPrinter.name"
          >
            {{ localPrinter.name }}
          </option>
        </b-select>
      </b-field>

      <b-field
        :label="$t('primary.name')"
        :type="{ 'is-danger': errors.display_name }"
        :message="errors.display_name ? errors.display_name[0] : ''"
      >
        <b-input
          v-model="printerForm.display_name"
          style="width: 80%"
        ></b-input>
      </b-field>

      <b-field
        :label="$t('settings.paperWidth')"
        required
        :type="{ 'is-danger': errors.width }"
        :message="errors.width ? errors.width[0] : ''"
      >
        <b-select
          :placeholder="$t('settings.paperWidth')"
          class="selector"
          v-model="printerForm.width"
        >
          <option
            v-for="width in widthList"
            :key="width.id"
            :value="width.name"
          >
            {{ width.name }}
          </option>
        </b-select>
      </b-field>

      <b-field :label="$t('settings.printerType')">
        <b-select
          dir="ltr"
          multiple
          class="select-field"
          :native-size="printerTypes.length"
          v-model="printerForm.types"
        >
          <option v-for="type in printerTypes" :key="type.id" :value="type.id">
            {{ $t(type.name) }}
          </option>
        </b-select>
      </b-field>
      
      <b-field :label="$t('settings.groups')">
        <b-select
          dir="ltr"
          multiple
          class="select-field"
          :native-size="printerGroups.length"
          v-model="printerForm.groups"
        >
          <option v-for="group in printerGroups" :key="group.pk" :value="group.pk">
            {{ $t(group.title) }}
          </option>
        </b-select>
      </b-field>

    </section>
    <footer class="modal-card-foot">
      <b-button
        :loading="isLoading"
        @click="addNewPrinter()"
        class="button is-info"
        >{{ $t("primary.submit") }}</b-button
      >
      <b-button
        :loading="isLoading"
        class="button"
        type="button"
        @click.native="$parent.close()"
        >{{ $t("primary.close") }}</b-button
      >
    </footer>
  </div>
</template>

<script>
import PrinterDiscoveryStatus from "@/components/Settings/PrinterDiscoveryStatus";
export default {
  components: { PrinterDiscoveryStatus },
  name: "NewPrinterModal",
  data() {
    const widthList = [
      {
        id: 0,
        name: "6cm",
      },
      {
        id: 1,
        name: "7cm",
      },
      {
        id: 2,
        name: "8cm",
      },
    ];

    const printerTypes = [
      {
        id: 1,
        name: "settings.kitchen",
      },
      {
        id: 2,
        name: "settings.customer",
      },
    ];

    return {
      printerForm: {
        name: "",
        uid: "",
        display_name: "",
        width: "",
        types: [],
        groups: []
      },
      widthList,
      printerTypes,
    };
  },
  methods: {
    addNewPrinter() {
      this.printerForm.uid = this.$store.state.printerModule.machineId;
      if (
        this.printerForm.name.length &&
        this.printerForm.display_name.length
      ) {
        this.$store.dispatch("printerModule/addPrinter", this.printerForm);
      } else {
        // todo: Toast
      }
    },
  },
  computed: {
    localPrinters() {
      return this.$store.getters["printerModule/localPrinters"] || [];
    },
    printerGroups() {
      return this.$store.state.groupModule.groups.filter(group => group.pk);
    }
  },
  mounted() {
    this.printerForm.uid = this.$store.state.printerModule.machineId;
  },
};
</script>

<style scoped lang="scss">
button {
  margin: 0 0.5rem;
}

.modal-card {
  min-width: 50vw;
}

.field .control {
  text-align: start !important;
}

.en {
  & .select-field {
    text-align: left;
  }
}
.fa {
  & .select-field {
    text-align: right;
  }
}
</style>