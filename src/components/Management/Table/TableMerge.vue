<template>
  <div class="merge">
    <section class="merge__info">
      <p class="merge__info__text">
        برای اتصال، میز مورد نظر را انتخاب کنید. برای جداسازی، میز متصل را انتخاب کنید.
      </p>
    </section>
    <section class="merge__tables" aria-label="انتخاب میز برای اتصال یا جداسازی">
      <b-button
        class="merge__tables__table"
        v-for="tbl in this.$store.state.tableModule.tables"
        :key="tbl.id"
        :class="{'merge__tables__table--merged': table.mergedTables.includes(tbl),
                 'merge__tables__table--self': table.id == tbl.id}"
        :disabled="table.id == tbl.id"
        :aria-pressed="table.mergedTables.includes(tbl)"
        @click="mergeOrSeparate(tbl)"
      >
        <span class="merge__tables__content">
          <span class="merge__tables__name">{{ tbl.name }}</span>
          <span class="merge__tables__state" v-if="table.id == tbl.id">
            <b-icon icon="map-marker" size="is-small" aria-hidden="true" />
            میز فعلی
          </span>
          <span class="merge__tables__state" v-else-if="table.mergedTables.includes(tbl)">
            <b-icon icon="link-variant" size="is-small" aria-hidden="true" />
            متصل · جداسازی
          </span>
          <span class="merge__tables__state" v-else>
            <b-icon icon="plus" size="is-small" aria-hidden="true" />
            اتصال به این میز
          </span>
        </span>
      </b-button>
    </section>
  </div>
</template>

<script>
export default {
  props: {
    table: {
      type: Object,
      required: true
    }
  },

  methods: {
    mergeOrSeparate(tbl) {
      if (this.table.mergedTables.includes(tbl)){
        this.table.separateTable(tbl)
      } else {
        this.table.mergeTable(tbl)
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.merge {
  display: grid;
  gap: 1rem;
  min-width: 0;
  padding: 1rem;

  &__tables {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: .75rem;
    min-width: 0;

    &__table {
      width: 100%;
      min-width: 0;
      min-height: 5.5rem;
      height: auto;
      margin: 0;
      padding: .75rem;
      border: 1px solid currentColor;
      background: transparent;
      color: inherit;
      white-space: normal;
      overflow-wrap: anywhere;

      &--merged {
        border-width: 2px;
      }

      &--self {
        border-width: 4px;
        border-style: double;
      }
    }

    &__content {
      display: grid;
      gap: .35rem;
      width: 100%;
    }

    &__name {
      font-weight: 600;
    }

    &__state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .3rem;
      font-size: .78rem;
      line-height: 1.7;
    }
  }

  &__info__text {
    margin: 0;
    font-size: .9rem;
    line-height: 1.8;
    text-align: start;
  }
}

@media (min-width: 600px) {
  .merge__tables {
    grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  }
}
</style>
