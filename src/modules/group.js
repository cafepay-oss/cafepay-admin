import mixin from "../mixin";
import i18n from "@/i18n.js";

export default {
  namespaced: true,
  // -----------------------------------------------------------------
  state: {
    groups: [], // cafe product groups
    groupsLoading: false,
    groupsError: null,
    groupsCafeId: null,
    groupsRequest: 0,
    isPrinterGroupsModalActive: false,
    isDeletePrinterGroupsModalActive: false
  },
  // -----------------------------------------------------------------
  getters: {},
  // -----------------------------------------------------------------
  mutations: {
    setGroups(state, payload) {
      state.groups = (payload || []).filter(group => group && group.pk != null).concat({
        pk: null,
        title: i18n.t("printerGroups.withoutGroup")
      });
    },
    addGroup(state, payload) {
      state.groups.unshift(payload);
    },
    editGroup(state, payload) {
      state.groups.find(grp => grp.pk == payload.pk).title = payload.title;
    },
    deleteGroup(state, payload) {
      state.groups = state.groups.filter(grp => grp.pk != payload);
    }
  },
  // -----------------------------------------------------------------
  actions: {
    async getGroups(context) {
      const cafe = context.rootState.accountModule.activeCafe;
      if (!cafe || !cafe.id) return false;
      const cafeId = cafe.id;
      const requestId = ++context.state.groupsRequest;
      const currentRequest = () => requestId === context.state.groupsRequest
        && context.rootState.accountModule.activeCafe && context.rootState.accountModule.activeCafe.id === cafeId;
      context.state.groupsLoading = true;
      context.state.groupsError = null;
      if (context.state.groupsCafeId !== cafeId) {
        context.commit("setGroups", []);
        context.state.groupsCafeId = cafeId;
      }
      try {
        const response = await mixin.methods.request({ method: "GET", url: "api/v1/cafe/" + cafeId + "/group/list/" });
        if (!currentRequest()) return false;
        context.commit("setGroups", response.data);
        return true;
      } catch (error) {
        if (currentRequest()) context.state.groupsError = "دریافت گروه‌های چاپ انجام نشد. لطفا دوباره تلاش کنید.";
        return false;
      } finally {
        if (requestId === context.state.groupsRequest) context.state.groupsLoading = false;
      }
    },
    createGroup(context, payload) {
      mixin.methods
        .request({
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/group/add/",
          method: "POST",
          data: payload
        })
        .then(res => {
          context.state.isPrinterGroupsModalActive = false;
          context.commit("addGroup", res.data);
        })
        .catch(err => {});
    },
    editGroup(context, payload) {
      mixin.methods
      .request({
        url: "api/v1/group/" + payload.pk,
        method: "PATCH",
        data: {
          title: payload.title
        }
      })
      .then(res => {
        context.state.isPrinterGroupsModalActive = false;
        context.commit("editGroup", res.data);
      })
      .catch(err => {});
    },
    deleteGroup(context, payload) {
      mixin.methods
        .request({
          url: "api/v1/group/" + payload,
          method: "DELETE"
        })
        .then(res => {
          context.state.isDeletePrinterGroupsModalActive = false;
          context.commit("deleteGroup", payload);
        })
        .catch(err => {});
    },
    changePrinterGroup(context, { group, product }) {
      let prevProductGroup = product.group;
      product.group = group;
      mixin.methods
        .request({
          url: "api/v1/product/" + product.id + "/",
          method: "PATCH",
          data: {
            group: group.pk
          }
        })
        .then(res => {})
        .catch(err => {
          product.group = prevProductGroup;
        });
    }
  }
};
