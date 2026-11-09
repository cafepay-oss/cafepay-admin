import mixin from "../mixin";
import { ToastProgrammatic as Toast } from "buefy";

export default {
  namespaced: true,
  state: {
    cafeBillsHistory: [],
    cafeBillsHistoryCount: 0,

    cafeProductsHistory: [],
    cafeProductsHistoryCount: 0,

    cafeInvoicesHistory: [],
    cafeInvoicesHistoryCount: 0,
    cafeInvoicesHistoryPage: 1,
    cafeInvoicesHistoryPageSize: 10,

    cafeCustomers: [],
    cafeCustomersCount: 0,

    invoicesReport: null,
    invoicesReportCount: 0,
    invoicesReportPage: 1,
    invoicesReportPageSize: 20,

    customersReport: null,
    customersReportCount: 0,
    customersReportPage: 1,
    customersReportPageSize: 20,

    ordersReport: null,
    ordersReportCount: 0,
    ordersReportPage: 1,
    ordersReportPageSize: 20,

    productsReport: null,

    cafeStaff: [],
    cafeRoles: [],

    localLoading: false,
    deleteImageModalActive: false,
    isAddStaffModuleActive: false
  },
  getters: {
    getProductReportOverall(state) {
      let productsReport = JSON.parse(JSON.stringify(state.productsReport));
      let overall = null;

      if (productsReport.length) {
        overall = productsReport[0];
      } else {
        return overall;
      }

      overall.forEach(product => {
        product.overall_rating.count = 0;
        product.overall_rating.rate = 0;
        product.payment_info.total_count = 0;
        product.payment_info.total_amount = 0;
        product.payment_info.payed_amount = 0;
        product.payment_info.net_payed_amount = 0;
        product.payment_info.net_amount = 0;
      });

      productsReport.forEach(step => {
        step.forEach(product => {
          let relatedOverallProduct = overall.find(
            overallProduct => overallProduct.pk == product.pk
          );
          relatedOverallProduct.overall_rating.count +=
            product.overall_rating.count;
          relatedOverallProduct.overall_rating.rate +=
            product.overall_rating.rate;
          relatedOverallProduct.payment_info.total_count +=
            product.payment_info.total_count;
          relatedOverallProduct.payment_info.total_amount +=
            product.payment_info.total_amount;
          relatedOverallProduct.payment_info.payed_amount +=
            product.payment_info.payed_amount;
          relatedOverallProduct.payment_info.net_payed_amount +=
            product.payment_info.net_payed_amount;
          relatedOverallProduct.payment_info.net_amount +=
            product.payment_info.net_amount;
        });
      });

      return overall;
    }
  },
  mutations: {
    setInvoicesReport(state, payload) {
      state.invoicesReport = payload;
    },
    setInvoicesReportCount(state, payload) {
      state.invoicesReportCount = payload;
    },
    setCustomersReport(state, payload) {
      state.customersReport = payload;
    },
    setCustomersReportCount(state, payload) {
      state.customersReportCount = payload;
    },
    setProductReport(state, payload) {
      state.productsReport = payload;
    },
    setOrdersReport(state, payload) {
      state.ordersReport = payload;
    },
    setOrdersReportCount(state, payload) {
      state.ordersReportCount = payload;
    },
    setCafeBillsHistory(state, payload) {
      state.cafeBillsHistory = payload;
    },
    setCafeBillHistoryCount(state, count) {
      state.cafeBillsHistoryCount = count;
    },
    setCafeProductsHistory(state, payload) {
      state.cafeProductsHistory = payload;
    },
    setCafeProductsHistoryCount(state, payload) {
      state.cafeProductsHistoryCount = payload;
    },
    setCafeInvoicesHistory(state, payload) {
      state.cafeInvoicesHistory = payload;
    },
    setCafeInvoicesHistoryCount(state, payload) {
      state.cafeInvoicesHistoryCount = payload;
    },
    setCafeCustomers(state, payload) {
      state.cafeCustomers = payload;
    },
    setCafeCustomersCount(state, payload) {
      state.cafeCustomersCount = payload;
    },
    setCafeStaff(state, payload) {
      state.cafeStaff = payload;
    },
    setCafePendingStaff(state, payload) {
      payload.forEach(pendingStaff => {
        pendingStaff.user_profile = {
          first_name: "",
          last_name: "",
          phone_number: pendingStaff.phone_number
        };
        state.cafeStaff.push(pendingStaff);
      });
    },
    setCafeRoles(state, payload) {
      state.cafeRoles = payload;
    }
  },
  actions: {
    getCafeBillsHistory(context, payload = { page: 1, page_size: 10 }) {
      mixin.methods
        .request({
          method: "GET",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/tables/join/simple/?page=" +
            payload.page +
            "&page_size=" +
            payload.page_size
        })
        .then(res => {
          context.commit("setCafeBillsHistory", res.data.results);
          context.commit("setCafeBillHistoryCount", res.data.count);
        })
        .catch(err => {
          Toast.open({
            queue: false,
            message: "مشکلی در دریافت اطلاعات به وجود آمد",
            type: "is-danger"
          });
        });
    },
    getCafeProductsHistory(context, payload = { page: 1, page_size: 10 }) {
      mixin.methods
        .request({
          method: "GET",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/products/payment-info/?page=" +
            payload.page +
            "&page_size=" +
            payload.page_size
        })
        .then(res => {
          context.commit("setCafeProductsHistory", res.data.results);
          context.commit("setCafeProductsHistoryCount", res.data.count);
        })
        .catch(err => {
          Toast.open({
            queue: false,
            message: "مشکلی در دریافت اطلاعات به وجود آمد",
            type: "is-danger"
          });
        });
    },
    getCafeInvoicesHistory(context, payload = { page: 1, page_size: 10 }) {
      mixin.methods
        .request({
          method: "GET",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/wallet/invoices/?page=" +
            payload.page +
            "&page_size=" +
            payload.page_size
        })
        .then(res => {
          context.commit("setCafeInvoicesHistory", res.data);
          context.commit("setCafeInvoicesHistoryCount", res.data.count);
        })
        .catch(err => {
          //console.log(err);
        });
    },
    productReport(context, payload) {
      mixin.methods
        .request({
          method: "GET",
          url: 
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/products/report/?end_date=" +
            payload.end_date +
            "&end_time=" +
            payload.end_time +
            "&start_date=" +
            payload.start_date +
            "&start_time=" +
            payload.start_time,
          data: payload
        })
        .then(res => {
          context.commit("setProductReport", res.data);
        })
        .catch(err => {
          //console.log(err);
        });
    },
    ordersReport(context, payload) {
      mixin.methods
        .request({
          method: "GET",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/tables/join/simple/filtered/?end_date=" +
            payload.end_date +
            "&end_time=" +
            payload.end_time +
            "&start_date=" +
            payload.start_date +
            "&start_time=" +
            payload.start_time +
            "&page=" +
            payload.page +
            "&page_size=" +
            payload.pageSize
        })
        .then(res => {
          context.commit("setOrdersReport", res.data);
          context.commit("setOrdersReportCount", res.data.count);
        })
        .catch(err => {
          //console.log(err);
        });
    },
    invoicesReport(context, payload) {
      mixin.methods
        .request({
          method: "GET",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/wallet/invoices/?method=" +
            payload.selectedMethod +
            "&type=" +
            payload.selectedType +
            "&status=" +
            payload.selectedStatus +
            "&amount__gt=&amount__lt=&amount__lte=" +
            payload.priceRange[1] +
            "&amount__gte=" +
            payload.priceRange[0] +
            "&create_datetime__gt=&create_datetime__lt=&create_datetime__lte=" +
            payload.endDateTime +
            "&create_datetime__gte=" +
            payload.startDateTime +
            "&page=" +
            payload.page +
            "&page_size=" +
            payload.pageSize
        })
        .then(res => {
          context.commit("setInvoicesReport", res.data);
          context.commit("setInvoicesReportCount", res.data.count);
        })
        .catch(err => {
          //console.log(err);
        });
    },
    customersReport(context, payload) {
      mixin.methods
        .request({
          method: "GET",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/users/reports/?search=" +
            payload.customerName +
            "&amount__lte=" +
            payload.priceRange[1] +
            "&amount__gte=" +
            payload.priceRange[0] +
            "&total_retention__lte=" +
            payload.ordersNumber[1] +
            "&total_retention__gte=" +
            payload.ordersNumber[0] +
            "&page=" +
            payload.page +
            "&page_size=" +
            payload.pageSize
        })
        .then(res => {
          context.commit("setCustomersReport", res.data);
          context.commit("setCustomersReportCount", res.data.count);
        })
        .catch(err => {
          //console.log(err);
        });
    },
    getCafeStaff(context) {
      mixin.methods
        .request({
          method: "GET",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/staff/list/"
        })
        .then(res => {
          context.dispatch("getCafePendingStaff");
          context.commit("setCafeStaff", res.data);
        })
        .catch(err => {
          //console.log(err);
        });
    },
    getCafePendingStaff(context) {
      mixin.methods
        .request({
          method: "GET",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/pending/staff/list/"
        })
        .then(res => {
          context.commit("setCafePendingStaff", res.data);
        })
        .catch(err => {
          //console.log(err);
        });
    },
    getCafeRoles(context) {
      mixin.methods
        .request({
          method: "GET",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/role/list/"
        })
        .then(res => {
          context.commit("setCafeRoles", res.data);
        })
        .catch(err => {
          //console.log(err);
        });
    },
    createStaff(context, payload) {
      context.rootState.errors = [];
      mixin.methods
        .request({
          method: "POST",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/staff/add/",
          data: payload
        })
        .then(res => {
          context.state.isAddStaffModuleActive = false;
          context.dispatch("getCafeStaff");
        })
        .catch(err => {
          context.rootState.errors = err.response.data;
          //console.log(err);
        });
    },
    editStaff(context, payload) {
      context.rootState.errors = [];
      mixin.methods
        .request({
          method: "PUT",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/staff/",
          data: payload
        })
        .then(res => {
          context.state.isAddStaffModuleActive = false;
          context.dispatch("getCafeStaff");
        })
        .catch(err => {
          context.rootState.errors = err.response.data;
          //console.log(err);
        });
    },
    deactivateStaff(context, payload) {
      mixin.methods
        .request({
          method: "PUT",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/staff/" +
            payload +
            "/deactivate/"
        })
        .then(res => {
          context.dispatch("getCafeStaff");
        })
        .catch(err => {
          //console.log(err);
        });
    },
    addRole(context, payload) {
      mixin.methods
        .request({
          method: "PUT",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/role/add/",
          data: payload
        })
        .then(res => {
          context.dispatch("getCafeRoles");
        })
        .catch(err => {
          //console.log(err);
        });
    },
    getCafeCustomers(context, payload = { page: 1, page_size: 10 }) {
      mixin.methods
        .request({
          method: "GET",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/users/reports/?page=" +
            payload.page +
            "&page_size=" +
            payload.page_size
        })
        .then(res => {
          context.commit("setCafeCustomers", res.data.results);
          context.commit("setCafeCustomersCount", res.data.count);
        })
        .catch(err => {
          Toast.open({
            queue: false,
            message: "مشکلی در دریافت اطلاعات به وجود آمد",
            type: "is-danger"
          });
        });
    },
    addCafeImage(context, payload) {
      context.state.localLoading = true; // active loading mode
      Toast.open({ queue: false, message: "در حال ارسال عکس، شکیبا باشید." });

      let formData = new FormData();
      formData.append("image", payload);
      formData.append("avatar", true);

      mixin.methods
        .request({
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/gallery/image/add/",
          method: "POST",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(function(res) {
          context.state.localLoading = false; // deactive loading mode

          context.rootState.accountModule.activeCafe.images.push(res.data);
          Toast.open({
            queue: false,
            message: "عکس با موفقیت ارسال شد",
            type: "is-success"
          });
        })
        .catch(function(err) {
          context.state.localLoading = false; // deactive loading mode
          Toast.open({
            queue: false,
            message: "مشکلی در ارسال عکس به وجود آمد",
            type: "is-danger"
          });
        });
    },
    deleteCafeImage(context, payload) {
      Toast.open({ queue: false, message: "در حال حذف عکس" });
      mixin.methods
        .request({
          method: "DELETE",
          url: "api/v1/cafe/image/" + payload + "/"
        })
        .then(res => {
          context.state.deleteImageModalActive = false;
          context.rootState.accountModule.activeCafe.images = context.rootState.accountModule.activeCafe.images.filter(
            image => image.pk != payload
          );
        })
        .catch(err => {
          Toast.open({
            queue: false,
            message: "مشکلی در حذف عکس به وجود آمد",
            type: "is-danger"
          });
        });
    },
    unsetCafeAvatarImage(context, image) {
      Toast.open({ queue: false, message: "در حال به روز رسانی" });
      mixin.methods
        .request({
          method: "PATCH",
          url: "api/v1/cafe/image/" + image.pk + "/",
          data: {
            is_avatar: false
          }
        })
        .then(res => {
          image.is_avatar = false;
          Toast.open({ queue: false, message: "به روز رسانی انجام شد" });
        })
        .catch(err => {
          Toast.open({
            queue: false,
            message: "مشکلی به وجود آمد لطفا مجددا تلاش کنید",
            type: "is-danger"
          });
        });
    },
    setCafeAvatarImage(context, image) {
      Toast.open({ queue: false, message: "در حال به روز رسانی" });
      let relatedImage = context.rootState.accountModule.activeCafe.images.find(
        img => img.pk == image.pk
      );
      let currentAvatarImage = context.rootState.accountModule.activeCafe.images.find(
        img => img.is_avatar
      );

      if (currentAvatarImage) {
        mixin.methods
          .request({
            method: "PATCH",
            url: "api/v1/cafe/image/" + currentAvatarImage.pk + "/",
            data: {
              is_avatar: false
            }
          })
          .then(res => {
            currentAvatarImage.is_avatar = false;
          })
          .catch(err => {
            Toast.open({
              queue: false,
              message: "مشکلی به وجود آمد لطفا مجددا تلاش کنید",
              type: "is-danger"
            });
          });
      }

      mixin.methods
        .request({
          method: "PATCH",
          url: "api/v1/cafe/image/" + relatedImage.pk + "/",
          data: {
            is_avatar: true
          }
        })
        .then(res => {
          relatedImage.is_avatar = true;
          Toast.open({ queue: false, message: "به روز رسانی انجام شد" });
        })
        .catch(err => {
          Toast.open({
            queue: false,
            message: "مشکلی به وجود آمد لطفا مجددا تلاش کنید",
            type: "is-danger"
          });
        });
    },
    setCafeHeaderImage(context, image) {
      Toast.open({ queue: false, message: "در حال به روز رسانی" });
      let relatedImage = context.rootState.accountModule.activeCafe.images.find(
        img => img.pk == image.pk
      );
      let currentHeaderImage = context.rootState.accountModule.activeCafe.images.find(
        img => img.is_header
      );

      if (currentHeaderImage) {
        mixin.methods
          .request({
            method: "PATCH",
            url: "api/v1/cafe/image/" + currentHeaderImage.pk + "/",
            data: {
              is_header: false
            }
          })
          .then(res => {
            currentHeaderImage.is_header = false;
          })
          .catch(err => {
            Toast.open({
              queue: false,
              message: "مشکلی به وجود آمد لطفا مجددا تلاش کنید",
              type: "is-danger"
            });
          });
      }

      mixin.methods
        .request({
          method: "PATCH",
          url: "api/v1/cafe/image/" + relatedImage.pk + "/",
          data: {
            is_header: true
          }
        })
        .then(res => {
          relatedImage.is_header = true;
          Toast.open({ queue: false, message: "به روز رسانی انجام شد" });
        })
        .catch(err => {
          Toast.open({
            queue: false,
            message: "مشکلی به وجود آمد لطفا مجددا تلاش کنید",
            type: "is-danger"
          });
        });
    },
    unsetCafeHeaderImage(context, image) {
      Toast.open({ queue: false, message: "در حال به روز رسانی" });
      
      mixin.methods
      .request({
        method: "PATCH",
          url: "api/v1/cafe/image/" + image.pk + "/",
          data: {
            is_header: false
          }
        })
        .then(res => {
          image.is_header = false;
          Toast.open({ queue: false, message: "به روز رسانی انجام شد" });
        })
        .catch(err => {
          Toast.open({
            queue: false,
            message: "مشکلی به وجود آمد لطفا مجددا تلاش کنید",
            type: "is-danger"
          });
        });
    }
  }
};
