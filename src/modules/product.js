/** VUEX module for product management in cafe management app **/

import { ToastProgrammatic as Toast } from "buefy";

import mixin from "../mixin";
import Product from "../models/ProductClass";

export default {
  namespaced: true,
  // -----------------------------------------------------------------
  state: {
    products: [], // produtcClass instance
    newProduct: false,
    isProductModalActive: false,
  },
  // -----------------------------------------------------------------
  getters: {},
  // -----------------------------------------------------------------
  mutations: {
    /* create product instance and commit them to state */
    setProducts(state, productsData) {
      let products = [];

      productsData.forEach((product) => {
        products.push(new Product(product));
      });

      state.products = products;
      state.newProduct = true;
    },
    setProduct(state, payload) {
      let relatedProduct = state.products.find(
        (product) => product.id == payload.pk
      );
      relatedProduct.name = payload.name;
      relatedProduct.available = payload.available;
      relatedProduct.discription = payload.discription;
      relatedProduct.discount = payload.discount;
      relatedProduct.original_price = payload.original_price;
      relatedProduct.overallRating = payload.overall_rating;
      relatedProduct.count = payload.count;
      relatedProduct.category = payload.category;
      relatedProduct.images = payload.images;
      relatedProduct.deleted = payload.is_deleted;
    },
    setProductImage(state, payload) {
      let relatedProduct = state.products.find(
        (product) => product.id == payload.product.pk
      );
      relatedProduct.images.unshift(payload.image);
    },
  },
  // -----------------------------------------------------------------
  actions: {
    /* get products of cafe and initialize product's data */
    getProducts: (context) => {
      return mixin.methods
        .request({
          method: "GET",
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/product/list/",
        })
        .then((res) => {
          context.commit("setProducts", res.data);
        })
        .catch(() => {});
    },
    /* change availablity of products in cafe */
    changeAvailablity: (context, product) => {
      return mixin.methods
        .request({
          method: "put",
          url: "api/v1/product/" + product.id + "/toggle-availability/",
        })
        .then((res) => {})
        .catch((err) => {
          product.available = !product.available;
          Toast.open({
            queue: false,
            message: `!مشکلی در تغییر وضعیت محصول "${product.name}" به وجود آمد`,
            type: "is-danger",
          });
        });
    },
    /* Delete Product

      * call delete product API if it was success full we delete the product from its category  
    */
    deleteProduct: (context, product) => {
      product.deleted = true;

      return mixin.methods
        .request({
          url: "api/v1/product/" + product.id + "/",
          method: "DELETE",
        })
        .then((res) => {
          Toast.open({
            queue: false,
            message: `"${product.name}" با موفقیت حذف شد `,
            type: "is-success",
          });

          context.rootState.categoryModule.categories.forEach((category) => {
            category.products = category.products.filter(
              (pro) => pro.id != product.id
            );
          });
        })
        .catch((err) => {
          Toast.open({
            queue: false,
            message: `"${product.name}" با موفقیت حذف نشد `,
            type: "is-danger",
          });
          product.deleted = false;
        });
    },
    /* Edit Product

      * at first find the product and edit it locally
      * then call the edit product API
      * if it was okay toast it 
      * else drawback the local changes 
      */
    editProduct: (context, { product, image }) => {
      let relatedProduct = context.state.products.find(
        (pro) => pro.id == product.id
      );

      let categoryObject = context.rootState.categoryModule.categories.find(
        (category) => category.id == product.category
      );

      product.category = {
        cafe: context.rootState.accountModule.activeCafe.id,
        pk: categoryObject.id,
        staff: categoryObject.staff,
        title: categoryObject.name,
      };

      relatedProduct.localUpdateProduct(product);

      product.category = product.category.pk;

      return mixin.methods
        .request({
          url: "api/v1/product/" + product.id + "/",
          method: "PUT",
          data: product,
        })
        .then((res) => {
          context.rootState.errors = {};

          if (product.prevCategory != product.category) {
            let prevCategoryObject = context.rootState.categoryModule.categories.find(
              (category) => category.id == product.prevCategory
            );
            prevCategoryObject.products = prevCategoryObject.products.filter(
              (pro) => pro.id != product.id
            );

            product.category = {
              cafe: context.rootState.accountModule.activeCafe.id,
              pk: categoryObject.id,
              staff: categoryObject.staff,
              title: categoryObject.name,
            };

            categoryObject.products.push(relatedProduct);
          }
          if (image) {
            context.dispatch("uploadProductImage", {
              image: image,
              product: res.data,
            });
          } else {
            context.state.isProductModalActive = false;
            Toast.open({
              queue: false,
              message: `"${product.name}" با موفقیت ویرایش شد`,
              type: "is-success",
            });
          }
        })
        .catch((err) => {
          context.rootState.errors = (err.response && err.response.data) || { detail: ["خطا در ارتباط با سرور"] };
          Toast.open({
            queue: false,
            message: `خطا در ویرایش "${product.name}"`,
            type: "is-danger",
          });
          relatedProduct.drawbackLocalUpdate();
        });
    },
    /* Create Product

      * at first create the temporary product locally
      * then call the create product API
      * if it was okay: pop the temporary product and create and push new product from API response date
      * else delete the local temporary product 
    */
    createProduct: (context, { product, image }) => {
      let category = context.rootState.categoryModule.categories.find(
        (category) => category.id == product.category
      );

      return mixin.methods
        .request({
          url:
            "api/v1/cafe/" +
            context.rootState.accountModule.activeCafe.id +
            "/product/add/",
          method: "POST",
          data: product,
        })
        .then((res) => {
          context.rootState.errors = {};
          res.data.category = {
            cafe: context.rootState.accountModule.activeCafe.id,
            pk: category.id,
            staff: category.staff,
            title: category.name,
          };

          let newProductObject = new Product(res.data);
          category.products.push(newProductObject);
          context.state.products.push(newProductObject);
          if (image) {
            context.dispatch("uploadProductImage", {
              image: image,
              product: res.data,
            });
          } else {
            context.state.isProductModalActive = false;
            context.rootState.categoryModule.isAddProductToCategoryModalActive = false;
            Toast.open({
              queue: false,
              message: `"${product.name}" با موفقیت ساخته شد`,
              type: "is-success",
            });
          }
        })
        .catch((err) => {
          context.rootState.errors = (err.response && err.response.data) || { detail: ["خطا در ارتباط با سرور"] };
          Toast.open({
            queue: false,
            message: `خطا در ساخت محصول جدید`,
            type: "is-danger",
          });
        });
    },
    uploadProductImage: (context, { image, product }) => {
      var imageData = new FormData();
      imageData.append("image", image);
      Toast.open({
        queue: false,
        message: "در حال ارسال عکس، شکیبا باشید ",
        type: "is-info",
      });
      return mixin.methods
        .request({
          url: "api/v1/product/" + product.pk + "/image/add/",
          method: "post",
          data: imageData,
        })
        .then(function (res) {
          context.rootState.isLoading = false;
          context.state.isProductModalActive = false;
          context.rootState.categoryModule.isAddProductToCategoryModalActive = false;

          res.data.product = product;
          context.dispatch("setProductImageAsAvatar", res.data);
          Toast.open({
            queue: false,
            message: `عکس "${product.name}" با موفقیت ارسال شد`,
            type: "is-success",
          });
        })
        .catch(function (err) {
          context.rootState.isLoading = false;
          Toast.open({
            queue: false,
            message: `خطا در ارسال عکس "${product.name}"`,
            type: "is-danger",
          });
        });
    },
    setProductImageAsAvatar(context, payload) {
      return mixin.methods
        .request({
          url: "api/v1/product/image/" + payload.pk + "/mark-avatar/",
          method: "PUT",
        })
        .then((res) => {
          context.dispatch("getProduct", payload.product);
        })
        .catch((err) => {});
    },
    getProduct(context, payload) {
      return mixin.methods
        .request({
          url: "api/v1/product/" + payload.pk + "/",
          method: "GET",
        })
        .then((res) => {
          context.commit("setProduct", res.data);
        })
        .catch(() => {});
    },
    setProductAvatarImage(context, { product, image }) {
      Toast.open({ queue: false, message: "در حال به روز رسانی" });

      let currentAvatar = product.images.find((img) => img.is_avatar);
      if (currentAvatar) {
        return mixin.methods
          .request({
            url: "api/v1/product/image/" + currentAvatar.pk + "/",
            method: "PATCH",
            data: {
              is_avatar: false,
            },
          })
          .then(function (res) {
            currentAvatar.is_avatar = false;
          })
          .catch(function (err) {
            Toast.open({
              queue: false,
              message: "لطفا مجددا تلاش کنید",
              type: "is-danger",
            });
          });
      }

      return mixin.methods
        .request({
          url: "api/v1/product/image/" + image.pk + "/",
          method: "PATCH",
          data: {
            is_avatar: true,
          },
        })
        .then(function (res) {
          product.images.find((img) => img.pk == image.pk).is_avatar = true;
          Toast.open({ queue: false, message: "به روز رسانی انجام شد" });
        })
        .catch(function (err) {
          Toast.open({
            queue: false,
            message: "لطفا مجددا تلاش کنید",
            type: "is-danger",
          });
        });
    },
    deleteProductImage(context, { product, image }) {
      Toast.open({ queue: false, message: "در حال حذف عکس" });
      return mixin.methods
        .request({
          url: "api/v1/product/image/" + image.pk + "/",
          method: "DELETE",
        })
        .then(function (res) {
          product.images = product.images.filter((img) => img != image);
          Toast.open({ queue: false, message: "به روز رسانی انجام شد" });
        })
        .catch(function (err) {
          Toast.open({
            queue: false,
            message: "لطفا مجددا تلاش کنید",
            type: "is-danger",
          });
        });
    },
  },
};
