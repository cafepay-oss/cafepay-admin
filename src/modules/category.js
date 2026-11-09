/** VUEX module for category management in cafe management app **/

import mixin from "../mixin";
import Category from "../models/CategoryClass";
import { ToastProgrammatic as Toast } from "buefy";

export default {
  namespaced: true,
  // -----------------------------------------------------------------
  state: {
    categories: [], // categoryClass instance
    newCategory: false,

    preCategories: [],

    isCategoryModalActive: false,
    isDeleteCategoryModalActive: false,
    isAddProductToCategoryModalActive: false,
  },
  // -----------------------------------------------------------------
  getters: {},
  // -----------------------------------------------------------------
  mutations: {
    setCategories(state, categories) {
      state.categories = categories;
      state.newCategory = true;
    },
    localUpdateCategoriesOrder(state, payload) {
      state.preCategories = state.categories.slice();
      state.categories = payload;
    },
    localWithdrawCategoriesOrderUpdate(state) {
      state.categories = state.preCategories;
    },
    localUpdateCategoryProductsOrder(state, { products, category }) {
      category.preProducts = category.products.slice();
      category.products = products;
    },
    localWithdrawCategoryProductsOrderUpdate(state, category) {
      category.products = category.preProducts;
    },
  },
  // -----------------------------------------------------------------
  actions: {
    /* create category instance and commit them to state */
    initialCategories: (context, categoriesData) => {
      let categories = [];

      categoriesData.forEach((category) => {
        categories.push(new Category(category));
      });

      context.commit("setCategories", categories);
    },
    /* get categories of cafe and initialize categories' data */
    getCategories: (context) => {
      return mixin.methods
        .request({
          method: "get",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/category/list/",
        })
        .then((res) => {
          context.dispatch("initialCategories", res.data);
        })
        .catch((e) => {});
    },
    createCategory: (context, payload) => {
      return mixin.methods
        .request({
          method: "POST",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/category/add/",
          data: payload,
        })
        .then((res) => {
          context.state.isCategoryModalActive = false;
          context.rootState.categoryModule.categories.push(
            new Category(res.data)
          );
          if (context.rootState.errors.title) {
            delete context.rootState.errors.title;
          }
          Toast.open({
            queue: false,
            message: `دسته بندی جدید ساخته شد`,
            type: "is-success",
          });
        })
        .catch((err) => {
          context.rootState.errors = (err.response && err.response.data) || { detail: ["خطا در ارتباط با سرور"] };
          Toast.open({
            queue: false,
            message: `مشکلی در ساخت دسته بندی به وجود آمد`,
            type: "is-danger",
          });
        });
    },
    editCategory: (context, payload) => {
      let category = context.state.categories.find(
        (cat) => cat.id == payload.id
      );

      return mixin.methods
        .request({
          method: "PUT",
          url: "api/v1/category/" + payload.id + "/",
          data: payload,
        })
        .then((res) => {
          context.state.isCategoryModalActive = false;
          category.updateCategory(res.data);
          Toast.open({
            queue: false,
            message: `دسته بندی با موفقیت ویرایش شد`,
            type: "is-success",
          });
        })
        .catch((err) => {
          context.rootState.errors = (err.response && err.response.data) || { detail: ["خطا در ارتباط با سرور"] };
          Toast.open({
            queue: false,
            message: `مشکلی در ویرایش دسته بندی به وجود آمد`,
            type: "is-danger",
          });
        });
    },
    deleteCategory: (context, payload) => {
      return mixin.methods
        .request({
          method: "DELETE",
          url: "api/v1/category/" + payload.id + "/",
          data: payload,
        })
        .then((res) => {
          context.rootState.categoryModule.isDeleteCategoryModalActive = false;
          context.state.categories = context.state.categories.filter(
            (cat) => cat.id != payload.id
          );
          Toast.open({
            queue: false,
            message: `دسته بندی با موفقیت حذف شد`,
            type: "is-success",
          });
        })
        .catch((err) => {
          context.rootState.errors = (err.response && err.response.data) || { detail: ["خطا در ارتباط با سرور"] };
          Toast.open({
            queue: false,
            message: `مشکلی در حذف دسته بندی به وجود آمد`,
            type: "is-danger",
          });
        });
    },
    updateCategoriesOrder(context, payload) {
      context.commit("localUpdateCategoriesOrder", payload);
      let data = [];
      payload.forEach((category, index) => {
        data.push({
          category: category.id,
          order: index,
        });
      });
      return mixin.methods
        .request({
          method: "PUT",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/categories/set/order/",
          data: { category_orders: data },
        })
        .then((res) => {})
        .catch((e) => {
          context.commit("localWithdrawCategoriesOrderUpdate");
        });
    },
    updateCategoryProductsOrder(context, { products, category }) {
      context.commit("localUpdateCategoryProductsOrder", {
        products: products,
        category: category,
      });
      let data = [];
      products.forEach((product, index) => {
        data.push({
          product: product.id,
          order: index,
        });
      });
      return mixin.methods
        .request({
          method: "PUT",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/products/set/order/",
          data: { product_orders: data },
        })
        .then((res) => {})
        .catch((e) => {
          context.commit("localWithdrawCategoryProductsOrderUpdate", category);
        });
    },

    /* get categories' products and fill products array
            
            * for each category call category-product API and then find products and add them 
            * into lists of products. 
            * then commit them to its category 
        */
    fillProducts: (context) => {
      context.state.categories.forEach((category) => {
        return mixin.methods
          .request({
            method: "get",
            url: "api/v1/category/" + category.id + "/products/",
          })
          .then((res) => {
            let products = [];

            res.data.products.forEach((pro) => {
              products.push(
                context.rootState.productModule.products.find(
                  (product) => pro.pk == product.id
                )
              );
            });

            category.setProducts(products);
          })
          .catch((e) => {});
      });
    },
    addProductToCategory(context, { product, category }) {
      return mixin.methods
        .request({
          method: "PUT",
          url: "api/v1/category/" + category.id + "/product/add-remove/",
          data: { action: "ADD", product: product.id },
        })
        .then((res) => {
          context.rootState.errors = {};
          context.state.isAddProductToCategoryModalActive = false;
          category.products.push(product);
          Toast.open({
            queue: false,
            message: `محصول با موفقیت به دسته بندی اضافه شد`,
            type: "is-success",
          });
        })
        .catch((err) => {
          context.rootState.errors = (err.response && err.response.data) || { detail: ["خطا در ارتباط با سرور"] };
          Toast.open({
            queue: false,
            message: `مشکلی در اضافه کردن محصول به دسته بندی به وجود آمد`,
            type: "is-danger",
          });
        });
    },
  },
};
