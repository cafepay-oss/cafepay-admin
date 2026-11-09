<template>
  <div class="analysis-card shadow-lg card" :class="{'positive': state==0, 'negetive': state==1}">
    <div class="row top-row">
      <p class="analysis-card__title">{{ title }}</p>
    </div>
    <div class="row middle-row">
      <div class="analysis-card__percentage-result">
        (<span class="analysis-card__percentage-result__prefix" v-if="percentageResultPrefix">{{
          percentageResultPrefix
        }}</span>
        <span class="analysis-card__percentage-result__result" v-if="percentageResult">{{
          percentageResult
        }}</span>
        <span class="analysis-card__percentage-result__postfix" v-if="percentageResultPostfix">{{
          percentageResultPostfix
        }}</span>) 
      </div>
      <div class="analysis-card__numerical-result">
        <span class="analysis-card__numerical-result__prefix" v-if="numericalResultPrefix">{{
          numericalResultPrefix
        }}</span>
        <span class="analysis-card__numerical-result__result" v-if="numericalResult">{{
          numericalResult
        }}</span>
        <span class="analysis-card__numerical-result__postfix" v-if="numericalResultPostfix"> {{
          numericalResultPostfix
        }}</span>
      </div>
    </div>
    <div v-if="options" class="row bottom-row">
      <b-field>
        <b-select v-model="selectedOption" size="is-small">
          <option v-for="option in options" :value="option" :key="option.id">
            {{ option.title }}
          </option>
        </b-select>
      </b-field>
    </div>
  </div>
</template>

<script>
export default {
  name: "AnalysisCard",
  data() {
    return {};
  },
  props: {
    title: {
      required: true
    },
    numericalResult:{},
    numericalResultPrefix:{},
    numericalResultPostfix:{},
    percentageResult:{},
    percentageResultPrefix:{},
    percentageResultPostfix:{},
    options: {
      type: Array
    },
    selectedOption: {
      type: Object
    },
    state: {}
  }
};
</script>

<style lang="scss" scoped>

.analysis-card {
  background-color: #ffffff;
  padding: 1em;

  & .row { 
    display: flex;
  }

  & .middle-row {
    justify-content: flex-end;
  }

  &__title {
    color: #000;
    font-weight: 500;
    font-size: 1.1em;
  }

  &__numerical-result {
    color: #000;
    font-size: 1.5em;
  }
  &__percentage-result {
    margin: auto 0 auto 0.25em;
  }
}

.card {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
}

.positive {
  background-color: #73ff3221;
  border: none;
  border-bottom: 1px solid #3dc000;

  & .analysis-card__percentage-result {
    color: #2f9400;
  }
}
.negetive {
  background-color: #ff00001a;
  border: none;
  border-bottom: 1px solid #cf000086;

  & .analysis-card__percentage-result {
    color: #cf0000;
  }
}
</style>
