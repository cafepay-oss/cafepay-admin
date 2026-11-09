export default {
  sidebarMenu: [
    "sideBar.management", [
      {
        to: "/cafe-management",
        icon: "view-dashboard-outline",
        label: "sideBar.cafeManagement"
      },
      {
        to: "/invoices",
        icon: "receipt",
        label: "sideBar.invoices"
      },
      {
        to: "/card-transfers",
        icon: "credit-card-outline",
        label: "sideBar.cardTransfers"
      },
      {
        to: "/preorder",
        icon: "clock-outline",
        label: "sideBar.preorder"
      },
    ],
    "sideBar.store", [{
        to: "/cafe/menus",
        icon: "book-open-page-variant",
        label: "sideBar.menus"
      },
      {
        to: "/cafe/products",
        icon: "coffee-outline",
        label: "sideBar.products"
      },
      {
        to: "/tables",
        icon: "table-large",
        label: "sideBar.tables"
      }
    ],
    "sideBar.informations", [
      {
        to: "/region-prices",
        label: "sideBar.regionPrices",
        icon: "truck-delivery"
      },
      {
        label: "sideBar.reports",
        icon: "chart-bar",
        menu: [{
            to: "/report/invoices",
            label: "sideBar.subReports.financial",
            icon: "cash-multiple",
          },
          {
            to: "/report/products",
            icon: "coffee-outline",
            label: "sideBar.subReports.products"
          },
          {
            to: "/report/orders",
            icon: "receipt",
            label: "sideBar.subReports.orders"
          },
          {
            to: "/report/customers",
            icon: "account-group",
            label: "sideBar.subReports.customers"
          },
        ]
      },
      {
        label: "sideBar.history",
        icon: "history",
        menu: [{
            to: "/bills-history",
            label: "sideBar.subHistory.orders",
            icon: "receipt"
          },
          {
            to: "/products-history",
            label: "sideBar.subHistory.products",
            icon: "coffee-outline"
          },
          {
            to: "/invoices-history",
            label: "sideBar.subHistory.transactions",
            icon: "cash-multiple"
          },
        ]
      },
      {
        to: "/analysis",
        label: "sideBar.analysis",
        icon: "chart-line"
      },
      {
        to: "/customers",
        label: "sideBar.customers",
        icon: "account-group"
      },
      {
        to: "/staff",
        label: "sideBar.employees",
        icon: "account-tie"
      },
      {
        to: "/about-cafe",
        label: "sideBar.aboutCafe",
        icon: "store"
      },
      {
        to: "/posts",
        label: "sideBar.posts",
        icon: "square-edit-outline"
      },
      {
        to: "/settings",
        icon: "settings",
        label: "sideBar.settings"
      },
      {
        to: "/support",
        icon: "headset",
        label: "sideBar.support"
      },
    ],
  ]
};
