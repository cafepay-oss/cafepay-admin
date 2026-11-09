import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";

Vue.use(Router);

export default new Router({
  base: process.env.BASE_URL,
  mode: "history",
  routes: [{
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/login",
      name: "login",
      component: () =>
        import ( /* webpackChunkName: "tables" */ "./views/Login.vue")
    },
    {
      path: "/tables",
      name: "tables",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import ( /* webpackChunkName: "tables" */ "./views/Tables.vue")
    },
    {
      path: "/forms",
      name: "forms",
      component: () =>
        import ( /* webpackChunkName: "forms" */ "./views/Forms.vue")
    },
    {
      path: "/profile",
      name: "profile",
      component: () =>
        import ( /* webpackChunkName: "profile" */ "./views/Profile.vue")
    },
    {
      path: "/client/new",
      name: "client.new",
      component: () =>
        import ( /* webpackChunkName: "client-form" */ "./views/Cafe/ProductForm.vue")
    },
    {
      path: "/cafe-management",
      name: "cafeManagement",
      component: () =>
        import ( /* webpackChunkName: "client-form" */ "./views/CafeManagement.vue")
    },
    {
      path: "/invoices",
      name: "Invoices",
      component: () =>
        import ( /* webpackChunkName: "invoices" */ "./views/Invoices.vue")
    },
    {
      path: "/card-transfers",
      name: "CardTransfers",
      component: () => import("./views/CardTransfers.vue")
    },
    {
      path: "/preorder",
      name: "Preorder",
      component: () =>
        import ( /* webpackChunkName: "invoices" */ "./views/Preorder.vue")
    },
    {
      path: "/manual-invoice",
      name: "ManualInvoice",
      component: () =>
        import ( /* webpackChunkName: "invoices" */ "./views/ManualInvoice.vue")
    },
    {
      path: "/stores",
      name: "stores",
      component: () =>
        import ( /* webpackChunkName: "client-form" */ "./views/Stores.vue")
    },
    {
      path: "/staff",
      name: "staff",
      component: () =>
        import ( /* webpackChunkName: "staff" */ "./views/Staff.vue")
    },
    {
      path: "/analysis",
      name: "Analysis",
      component: () =>
        import ( /* webpackChunkName: "Analysis" */ "./views/Analysis.vue")
    },
    {
      path: "/customers",
      name: "customers",
      component: () =>
        import ( /* webpackChunkName: "customers" */ "./views/Customers.vue")
    },
    {
      path: "/cafe/products",
      name: "cafe-products",
      component: () =>
        import ( /* webpackChunkName: "client-form" */ "./views/Cafe/Products.vue")
    },
    {
      path: "/cafe/menus",
      name: "cafe-menus",
      component: () =>
        import ( /* webpackChunkName: "client-form" */ "./views/Cafe/Menus.vue")
    },
    {
      path: "/about-cafe",
      name: "AboutCafe",
      component: () =>
        import ( /* webpackChunkName: "about-cafe" */ "./views/AboutCafe.vue")
    },
    {
      path: "/region-prices",
      name: "RegionPrices",
      component: () =>
        import ( /* webpackChunkName: "client-form" */ "./views/RegionPrices.vue")
    },
    {
      path: "/posts",
      name: "posts",
      component: () =>
        import ( /* webpackChunkName: "client-form" */ "./views/Posts.vue")
    },
    {
      path: "/bills-history",
      name: "bills-history",
      component: () =>
        import ( /* webpackChunkName: "client-form" */ "./views/BillsHistory.vue")
    },
    {
      path: "/products-history",
      name: "products-history",
      component: () =>
        import ( /* webpackChunkName: "client-form" */ "./views/ProductsHistory.vue")
    },
    {
      path: "/invoices-history",
      name: "invoices-history",
      component: () =>
        import ( /* webpackChunkName: "InvoicesHistory" */ "./views/InvoicesHistory.vue")
    },
    {
      path: "/cafe/product/:id/",
      name: "product",
      component: () =>
        import ( /* webpackChunkName: "client-form" */ "./views/Cafe/ProductPage.vue"),
      props: true
    },
    {
      path: "/cafe/post/:id/",
      name: "post",
      component: () =>
        import ( /* webpackChunkName: "client-form" */ "./views/PostPage.vue"),
      props: true
    },
    {
      path: "/report/invoices",
      name: "InvoiceReport",
      component: () =>
        import ( /* webpackChunkName: "InvoiceReport" */ "./views/Reports/InvoiceReport.vue")
    },
    {
      path: "/report/products",
      name: "products-report",
      component: () =>
        import ( /* webpackChunkName: "forms" */ "./views/Reports/ProductReport.vue")
    },
    {
      path: "/report/orders",
      name: "orders-report",
      component: () =>
        import ( /* webpackChunkName: "forms" */ "./views/Reports/OrderReport.vue")
    },
    {
      path: "/roles",
      name: "roles",
      component: () =>
        import ( /* webpackChunkName: "roles" */ "./views/Roles.vue")
    },
    {
      meta: {
        title: "Edit client"
      },
      path: "/client/:id",
      name: "client.edit",
      component: () =>
        import ( /* webpackChunkName: "client-form" */ "./views/ClientForm.vue"),
      props: true
    },
    {
      path: "/report/customers",
      name: "customers-report",
      component: () =>
        import ( /* webpackChunkName: "forms" */ "./views/Reports/CustomerReport.vue")
    },
    {
      path: "/settings",
      name: "settings",
      component: () =>
        import ( /* webpackChunkName: "settings" */ "./views/Settings.vue")
    },
    {
      path: "/printer-groups",
      name: "PrinterGroups",
      component: () =>
        import ( /* webpackChunkName: "PrinterGroups" */ "./views/PrinterGroups.vue")
    },
    {
      path: "/support",
      name: "support",
      component: () =>
        import ( /* webpackChunkName: "support" */ "./views/Support.vue")
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  }
});