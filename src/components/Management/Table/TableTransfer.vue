<template>
  <div class="transfer">
    <section class="transfer__info">
      <p class="transfer__info__text">برای انتقال، میز مقصد را انتخاب کنید.</p>
    </section>
    <section class="transfer__tables" aria-label="انتخاب میز مقصد">
      <b-button
        class="transfer__tables__table"
        v-for="tbl in this.$store.state.tableModule.tables"
        :key="tbl.id"
        :class="{ 'transfer__tables__table--self': table.id == tbl.id }"
        :disabled="table.id == tbl.id"
        @click="transferTable(tbl)"
      >
        <span class="transfer__tables__content">
          <span class="transfer__tables__name">{{ tbl.name }}</span>
          <span class="transfer__tables__state" v-if="table.id == tbl.id">
            <b-icon icon="map-marker" size="is-small" aria-hidden="true" />
            میز فعلی
          </span>
          <span class="transfer__tables__state" v-else>
            <b-icon icon="swap-horizontal" size="is-small" aria-hidden="true" />
            انتقال به این میز
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
      required: true,
    },
  },

  methods: {
    transferTable(tbl) {
      if (this.table != tbl) {
        this.table.transferTable(tbl);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.transfer {
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
  .transfer__tables {
    grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  }
}
</style>
