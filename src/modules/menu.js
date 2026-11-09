/** VUEX module for menu management in cafe management app **/
import { ToastProgrammatic as Toast } from "buefy";

import mixin from "../mixin";

import Category from "../models/CategoryClass";
import Menu from "../models/MenuClass";

export default {
  namespaced: true,
  // -----------------------------------------------------------------
  state: {
    menus: [], // menuClass instance
    newMenu: false,
    isModalActive: false,
    isMenuModalActive: false,
    isCategoryMenuModalActive: false,
  },
  // -----------------------------------------------------------------
  getters: {},
  // -----------------------------------------------------------------
  mutations: {
    /* create menu instance and commit them to state */
    setMenus(state, menusData) {
      let menus = [];

      menusData.forEach((menu) => {
        menus.push(new Menu(menu));
      });

      state.menus = menus;
      state.newMenu = true;
    },
  },
  // -----------------------------------------------------------------
  actions: {
    /* get menus of cafe and initialize categories' data */
    getMenus: (context) => {
      return mixin.methods
        .request({
          method: "GET",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/menu/list/",
        })
        .then((res) => {
          context.commit("setMenus", res.data);
        })
        .catch(() => {});
    },
    /* get menus' categories and fill categories array

				* for each menu call menu-category API and then find categories and add them 
				* into lists of categories. 
				* then commit them to its menu 
				* 
				* menu-category API differs from category-product API ( tell sina and change it later )
		*/
    fillCategories: (context) => {
      return mixin.methods
        .request({
          method: "GET",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/category-based-menu/list/",
        })
        .then((res) => {
          res.data.forEach((object) => {
            let categories = [];

            object.categories.forEach((cat) => {
              categories.push(
                context.rootState.categoryModule.categories.find(
                  (category) => cat.pk == category.id
                )
              );
            });

            let menu = context.rootState.menuModule.menus.find(
              (menu) => menu.id == object.pk
            );

            menu.setCategories(categories);
          });
        })
        .catch((e) => {});
    },
    /* Create Menu */
    createMenu: (context, payload) => {
      // context.state.menus.push(new Menu(payload));

      return mixin.methods
        .request({
          method: "POST",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/menu/add/",
          data: payload,
        })
        .then((res) => {
          // context.state.menus.pop();
          context.state.menus.push(new Menu(res.data));
          context.state.isMenuModalActive = false;
          if (context.rootState.errors.name) {
            delete context.rootState.errors.name;
          }
          Toast.open({
            queue: false,
            message: "منو جدید با موفقیت ساخته شد",
            type: "is-success",
          });
        })
        .catch((err) => {
          context.rootState.errors = (err.response && err.response.data) || { detail: ["خطا در ارتباط با سرور"] };
          Toast.open({
            queue: false,
            message: "مشکلی در ساخت منو به وجود آمد",
            type: "is-danger",
          });
        });
    },

    createCategoryToMenu: (context, payload) => {
      let menu = context.state.menus.find((menu) => menu.id == payload.menu.id);

      return mixin.methods
        .request({
          method: "POST",
          url: "api/v1/cafe/" + context.rootState.accountModule.activeCafe.id + "/category/add/",
          data: payload.category,
        })
        .then((res) => {
          context.state.isCategoryMenuModalActive = false;
          let newCategory = new Category(res.data);
          context.rootState.categoryModule.categories.push(newCategory);
          menu.categories.push(newCategory);
          context.rootState.errors = {};
          Toast.open({
            queue: false,
            message: "دسته بندی با موفقیت ساخته شد",
            type: "is-success",
          });
        })
        .catch((err) => {
          context.rootState.errors = (err.response && err.response.data) || { detail: ["خطا در ارتباط با سرور"] };
          Toast.open({
            queue: false,
            message: "مشکلی در ساخت دسته بندی به وجود آمد",
            type: "is-danger",
          });
        });
    },

    addCategoryToMenu: (context, payload) => {
      let menu = context.state.menus.find((menu) => menu.id == payload.menu.id);
      let category = context.rootState.categoryModule.categories.find(
        (cat) => cat.id == payload.category.id
      );

      let productsId = [];
      category.products.forEach((product) => {
        productsId.push(product.id);
      });

      let data = {
        action: "ADD",
        products: productsId,
      };

      menu.categories.push(category);

      return mixin.methods
        .request({
          method: "PUT",
          url: "api/v1/menu/" + menu.id + "/product/bulk/add-remove/",
          data: data,
        })
        .then((res) => {
          context.rootState.errors = {};
          context.state.isCategoryMenuModalActive = false;

          Toast.open({
            queue: false,
            message: "دسته بندی با موفقیت اضافه شد",
            type: "is-success",
          });
        })
        .catch((err) => {
          context.rootState.errors = (err.response && err.response.data) || { detail: ["خطا در ارتباط با سرور"] };
          menu.categories = menu.categories.filter(
            (cat) => cat.id != category.id
          );

          Toast.open({
            queue: false,
            message: "مشکلی در اضافه کردن دسته بندی به وجود آمد",
            type: "is-danger",
          });
        });
    },
    deleteCategoryFromMenu: (context, payload) => {
      let menu = context.state.menus.find((menu) => menu.id == payload.menu.id);
      let category = context.rootState.categoryModule.categories.find(
        (cat) => cat.id == payload.category.id
      );

      let productsId = [];
      category.products.forEach((product) => {
        productsId.push(product.id);
      });

      let data = {
        action: "REMOVE",
        products: productsId,
      };

      menu.categories = menu.categories.filter((cat) => cat.id != category.id);

      return mixin.methods
        .request({
          method: "PUT",
          url: "api/v1/menu/" + menu.id + "/product/bulk/add-remove/",
          data: data,
        })
        .then((res) => {
          context.rootState.errors = {};
          context.state.isDeleteCategoryFromMenuModalActive = false;

          Toast.open({
            queue: false,
            message: "دسته بندی با موفقیت حذف شد",
            type: "is-success",
          });
        })
        .catch((err) => {
          context.rootState.errors = (err.response && err.response.data) || { detail: ["خطا در ارتباط با سرور"] };
          menu.categories.push(category);

          Toast.open({
            queue: false,
            message: "مشکلی در حذف کردن دسته بندی به وجود آمد",
            type: "is-danger",
          });
        });
    },
    sendActiveMenu: (context, payload) => {
      let menu = context.state.menus.find((menu) => menu.id == payload.id);
      let preActiveMenu = null;

      context.state.menus.forEach((men) => {
        if (men.isActive) {
          preActiveMenu = men;
        }
        men.isActive = false;
      });

      menu.isActive = true;

      return mixin.methods
        .request({
          method: "PUT",
          url: "api/v1/menu/" + menu.id + "/toggle/activation/",
          data: menu,
        })
        .then((res) => {
          Toast.open({
            queue: false,
            message: "منوی فعال فروشگاه با موفقیت تغییر یافت",
            type: "is-success",
          });
        })
        .catch((e) => {
          menu.isActive = false;
          if (preActiveMenu) preActiveMenu.isActive = true;
          Toast.open({
            queue: false,
            message: "مشکلی در فعال کردن به وجود آمد",
            type: "is-danger",
          });
        });
    },

    deleteMenu: (context, payload) => {
      let index = context.state.menus.findIndex(
        (menu) => menu.id == payload.id
      );
      let menu = context.state.menus.find((menu) => menu.id == payload.id);
      context.state.menus = context.state.menus.filter(
        (menu) => menu.id != payload.id
      );

      return mixin.methods
        .request({
          method: "DELETE",
          url: "api/v1/menu/" + menu.id + "/",
          data: menu,
        })
        .then((res) => {
          context.state.isModalActive = false;
          Toast.open({
            queue: false,
            message: "منو با موفقیت حذف شد",
            type: "is-success",
          });
        })
        .catch((e) => {
          context.state.menus.splice(index, 0, menu);
          Toast.open({
            queue: false,
            message: "مشکلی در حذف کردن به وجود آمد",
            type: "is-danger",
          });
        });
    },

    editMenu: (context, payload) => {
      let menu = context.state.menus.find((menu) => menu.id == payload.id);
      menu.localUpdateMenu(payload);

      return mixin.methods
        .request({
          method: "PUT",
          url: "api/v1/menu/" + menu.id + "/",
          data: menu,
        })
        .then((res) => {
          context.state.isMenuModalActive = false;
          if (context.rootState.errors.name) {
            delete context.rootState.errors.name;
          }
          Toast.open({
            queue: false,
            message: "نام منو با موفقیت تغییر یافت",
            type: "is-success",
          });
        })
        .catch((err) => {
          context.rootState.errors = (err.response && err.response.data) || { detail: ["خطا در ارتباط با سرور"] };
          menu.drawbackLocalUpdate();
          Toast.open({
            queue: false,
            message: "مشکلی در ویرایش کردن به وجود آمد",
            type: "is-danger",
          });
        });
    },
  },
};
