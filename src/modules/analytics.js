import mixin from "../mixin";

export default {
  namespaced: true,
  state: {
    newCustomersData: [],
    newCustomersDataPrev: [],
    salesData: [],
    salesDataPrev: [],
    ordersData: [],
    ordersDataPrev: []
  },
  getters: {},
  mutations: {
    setNewCustomersData(state, payload) {
      state.newCustomersData = payload
    },
    setNewCustomersDataPrev(state, payload) {
      state.newCustomersDataPrev = payload
    },
    setSalesData(state, payload) {
      state.salesData = payload
    },
    setSalesDataPrev(state, payload) {
      state.salesDataPrev = payload
    },
    setOrdersData(state, payload) {
      state.ordersData = payload
    },
    setOrdersDataPrev(state, payload) {
      state.ordersDataPrev = payload
    }
  },
  actions: {
    getNewCustomers(context, payload) {
      mixin.methods
        .request({
          method: "GET",
          url:
            "api/v1/cafe/"+ context.rootState.accountModule.activeCafe.id +
            "/report/new-customers/?start_datetime=" +
            payload.start_datetime +
            "&end_datetime=" +
            payload.end_datetime +
            "&step=" + payload.step,
          data: payload
        })
        .then(res => {
          context.commit(payload.mutation, res.data)
        })
        .catch(err => {
          //console.log(err);
        });
    },
    getSales(context, payload) {
      mixin.methods
        .request({
          method: "GET",
          url:
            "api/v1/cafe/"+ context.rootState.accountModule.activeCafe.id +
            "/report/sales/?start_datetime=" +
            payload.start_datetime +
            "&end_datetime=" +
            payload.end_datetime +
            "&step=" + payload.step,
          data: payload
        })
        .then(res => {
          context.commit(payload.mutation, res.data)
        })
        .catch(err => {
        });
    },
    getOrders(context, payload) {
      mixin.methods
        .request({
          method: "GET",
          url:
            "api/v1/cafe/"+ context.rootState.accountModule.activeCafe.id +
            "/report/orders/?start_datetime=" +
            payload.start_datetime +
            "&end_datetime=" +
            payload.end_datetime +
            "&step=" + payload.step,
          data: payload
        })
        .then(res => {
          context.commit(payload.mutation, res.data)
        })
        .catch(err => {
        });
    }
  }
};
