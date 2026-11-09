/** VUEX module for product management in cafe management app **/

import mixin from "../mixin";

export default {
  namespaced: true,
  // -----------------------------------------------------------------
  state: {
    cities: [],
    regionPrices: [],
    localLoading: false,
    citiesError: null,
    regionPricesError: null,
    regionPricesCafeId: null,
    regionPricesRequest: 0
  },
  // -----------------------------------------------------------------
  getters: {
    localLoading: (state) => state.localLoading,
    regionPrices: (state) => state.regionPrices,
    cities: (state) => state.cities,
  },
  // -----------------------------------------------------------------
  mutations: {
    setLocalLoading(state, newValue) {
      state.localLoading = newValue
    },
    setCities(state, newData) {
      state.cities = newData
    },
    setRegionPrices(state, newData) {
      state.regionPrices = newData
    },
  },
  // -----------------------------------------------------------------
  actions: {
    async getCities(context) {
      context.state.citiesError = null;
      try {
        const response = await mixin.methods.request({ method: "GET", url: "api/v1/city/list/" });
        context.commit("setCities", response.data);
        return true;
      } catch (error) {
        context.state.citiesError = "دریافت فهرست شهرها انجام نشد. لطفا دوباره تلاش کنید.";
        return false;
      }
    },
    async getRegionPrices(context) {
      const cafe = context.rootState.accountModule.activeCafe;
      if (!cafe || !cafe.id) return false;
      const cafeId = cafe.id;
      const requestId = ++context.state.regionPricesRequest;
      const currentRequest = () => requestId === context.state.regionPricesRequest
        && context.rootState.accountModule.activeCafe && context.rootState.accountModule.activeCafe.id === cafeId;
      context.commit("setLocalLoading", true);
      context.state.regionPricesError = null;
      if (context.state.regionPricesCafeId !== cafeId) {
        context.commit("setRegionPrices", []);
        context.state.regionPricesCafeId = cafeId;
      }
      try {
        const response = await mixin.methods.request({
          method: "GET", url: "api/v1/cafe/" + cafeId + "/region-price/list/"
        });
        if (!currentRequest()) return false;
        context.commit("setRegionPrices", response.data);
        return true;
      } catch (error) {
        if (currentRequest()) context.state.regionPricesError = "دریافت هزینه ارسال مناطق انجام نشد. لطفا دوباره تلاش کنید.";
        return false;
      } finally {
        if (requestId === context.state.regionPricesRequest) context.commit("setLocalLoading", false);
      }
    },
  },
};
