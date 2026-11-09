<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">
        {{ $t("settings.printerModal.editPrinter") }} {{ printer.name }}
      </p>
    </header>
    <section class="modal-card-body">
      <b-field
        :label="$t('primary.name')"
        :type="{ 'is-danger': errors.display_name }"
        :message="errors.display_name ? errors.display_name[0] : ''"
      >
        <b-input
          v-model="printerForm.display_name"
          style="width: 90%"
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
          class="select-field"
          multiple
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
        @click="editPrinter()"
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
export default {
  name: "EditPrinterModal",
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
        display_name: "",
        width: "",
        types: [],
        pk: "",
        groups: []
      },
      widthList,
      printerTypes,
    };
  },
  props: {
    printer: {
      type: Object,
      required: true,
    },
  },
  computed: {
    printerGroups() {
      return this.$store.state.groupModule.groups.filter(group => group.pk);
    }
  },
  methods: {
    editPrinter() {
      if (this.printerForm.display_name.length) {
        this.$store.dispatch("printerModule/editPrinter", this.printerForm);
      } else {
        // todo: Toast
      }
    },
  },
  mounted() {
    this.printerForm = {
      display_name: this.printer.display_name,
      types: this.printer.types,
      pk: this.printer.pk,
      groups: this.printer.groups
    };
    this.printerForm.width = this.widthList.find(
      (width) => width.name == this.printer.width
    ).name;
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


.field .control {
  text-align: start !important;
}
</style>