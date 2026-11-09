<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">{{ $tc("cafeManagement.editOrder", 2) }}</p>
    </header>
    <section class="modal-card-body">
      <span class="add-product-modal">
        <section class="add-product-modal__categories">
          <b-button
            class="add-product-modal__categories__category"
            v-for="category in menu.categories"
            :key="category.id"
            :class="{ 'is-info': selectedCategory == category }"
            @click="selectedCategory = category"
            >{{ truncate(category.name, 18) }}</b-button
          >
        </section>
        <section class="add-product-modal__menu-products">
          <span v-for="product in selectedCategory.products" :key="product.id">
            <b-button
              v-if="!product.deleted"
              class="add-product-modal__menu-products__product"
              @click="addNewProductToTable(product)"
              >{{ truncate(product.name, 35) }}</b-button
            >
          </span>
        </section>
        <section class="add-product-modal__table-products">
          <table-product-card
            class="add-product-modal__table-products__product"
            v-for="staffChangeOrder in staffChangesOrders"
            :key="staffChangeOrder.product.id"
            :order="staffChangeOrder"
            @deleteProductFromTable="
              deleteNewProductFromTable(staffChangeOrder.product)
            "
            @addProductToTable="addNewProductToTable(staffChangeOrder.product)"
          ></table-product-card>
          <div v-for="customer in table.customers" :key="customer.id">
            <p class="add-product-modal__table-products__customer">
              {{ customer.fullName }}
            </p>
            <table-product-card
              class="add-product-modal__table-products__product"
              v-for="order in customer.orders"
              :key="order.id"
              :order="order"
              :table="table"
              :customer="customer"
              @deleteProductFromTable="deleteProductFromTable(order, customer)"
              @addProductToTable="addProductToTable(order, customer)"
            ></table-product-card>
          </div>
        </section>
      </span>
    </section>
    <footer class="modal-card-foot">
      <b-button
        class="button"
        type="button"
        :loading="isLoading"
        @click="$parent.close()"
        >{{ $t("primary.close") }}</b-button
      >
      <b-button
        class="button"
        type="button is-primary"
        :disabled="!changes.length && !staffChanges.length"
        @click="sendBulkData()"
        :loading="$store.state.tableModule.localLoading"
        >{{ $t("primary.submit") }}</b-button
      >
    </footer>
  </div>
</template>

<script>
import TableProductCard from "@/components/Management/Table/TableProductCard";

export default {
  name: "table-product-modal",
  components: {
    TableProductCard,
  },
  data() {
    return {
      menu: null,
      selectedCategory: null,
      unsavedProducts: [],

      /*  staff changes means new orders that staff has been added  
          to table but changes means changes that staff has been made
          on previous orders that has been on table */
      staffChangesOrders: [],
      staffChanges: [],

      changes: [],

      deletedOrdersFromKitchen: [],
    };
  },
  props: {
    table: {
      type: Object,
      required: true,
    },
  },
  beforeMount() {
    this.menu = this.$store.state.menuModule.menus.find(
      (menu) => menu.isActive
    );
    this.selectedCategory = this.menu.categories[0];
  },
  methods: {
    truncate(str, length) {
      if (str.length > length) {
        return str.substring(0, length) + "...";
      }
      return str;
    },
    sendBulkData() {
      let addChanges = this.changes.filter((change) => change.count > 0);
      addChanges = addChanges.concat(this.staffChanges);
      let removeChanges = this.changes.filter((change) => change.count < 0);
      removeChanges.forEach((removeChange) => {
        removeChange.count *= -1;
      });
      this.$store.state.tableModule.localLoading = 2;
      this.$store.dispatch("tableModule/addBulkProduct", {
        table: this.table.id,
        changes: addChanges,
      });
      this.$store.dispatch("tableModule/removeBulkProduct", {
        table: this.table.id,
        changes: removeChanges,
      });

      if (this.deletedOrdersFromKitchen.length > 0) {
        this.printDeletedOrdersFromKitchen(this.deletedOrdersFromKitchen);
      }
    },
    addProductToTable(product, customer) {
      let relatedProduct = this.changes.find((change) => {
        return (
          change.product == product.product.id &&
          change.user_profile == customer.id
        );
      });
      if (relatedProduct) {
        relatedProduct.count++;
        if (!relatedProduct.count) {
          this.changes = this.changes.filter(
            (change) =>
              change.product != relatedProduct.product ||
              change.user_profile != customer.id
          );
        }
      } else {
        this.changes.push({
          pbr_pk: product.id,
          product: product.product.id,
          count: 1,
          user_profile: customer.id,
          is_staff: customer.isStaff,
        });
      }
      if (product.sentToKitchen) {
        let relatedDeletedOrdersFromKitchen = this.deletedOrdersFromKitchen.find(
          (deletedOrderFromKitchen) =>
            deletedOrderFromKitchen.product.id == product.product.id
        );

        if (relatedDeletedOrdersFromKitchen) {
          relatedDeletedOrdersFromKitchen.count++;
          if (!relatedDeletedOrdersFromKitchen.count) {
            this.deletedOrdersFromKitchen = this.deletedOrdersFromKitchen.filter(
              (deletedOrderFromKitchen) =>
                deletedOrderFromKitchen.product.id != product.product.id
            );
          }
        }
      }
    },
    deleteProductFromTable(product, customer) {
      let relatedProduct = this.changes.find((change) => {
        return (
          change.product == product.product.id &&
          change.user_profile == customer.id
        );
      });

      if (relatedProduct) {
        relatedProduct.count--;
        if (!relatedProduct.count) {
          this.changes = this.changes.filter(
            (change) =>
              change.product != relatedProduct.product ||
              change.user_profile != customer.id
          );
        }
        if (relatedProduct.count < 0) {
          if (relatedProduct.sentToKitchen) {
            let relatedDeletedOrdersFromKitchen = this.deletedOrdersFromKitchen.find(
              (deletedOrderFromKitchen) =>
                deletedOrderFromKitchen.product.id == product.product.id
            );
      
            if (relatedDeletedOrdersFromKitchen) {
              relatedDeletedOrdersFromKitchen.count--;
            } 
          }
        }
      } else {
        this.changes.push({
          pbr_pk: product.id,
          product: product.product.id,
          count: -1,
          user_profile: customer.id,
          is_staff: customer.isStaff,
        });

        if (product.sentToKitchen) {
          this.deletedOrdersFromKitchen.push({
            product: product.product,
            count: -1,
          });
        }
      }
    },
    addNewProductToTable(product) {
      let relatedStaffChange = this.staffChanges.find((staffChange) => {
        return staffChange.product == product.id;
      });
      let relatedStaffChangesOrder = this.staffChangesOrders.find(
        (staffChangesOrder) => {
          return staffChangesOrder.product.id == product.id;
        }
      );

      if (relatedStaffChange) {
        relatedStaffChange.count++;
        relatedStaffChangesOrder.count++;
        relatedStaffChangesOrder.paymentInfo.net_amount +=
          product.original_price;
        relatedStaffChangesOrder.paymentInfo.total_amount +=
          product.original_price;
        relatedStaffChangesOrder.paymentInfo.total_count++;
      } else {
        this.staffChanges.push({
          product: product.id,
          count: 1,
          is_staff: true,
        });
        this.staffChangesOrders.push({
          count: 1,
          discount: 0,
          id: 1,
          is_staff: true,
          originalPrice: product.original_price,
          paymentInfo: {
            net_amount: product.original_price, // off price should be deploy
            net_payed_amount: 0,
            payed_amount: 0,
            payed_amount_cash: 0,
            payed_amount_online: 0,
            payed_amount_pos: 0,
            refund_amount: 0,
            total_amount: product.original_price,
            total_count: 1,
          },
          product: product,
          sentToKitchen: false,
          unitAmount: product.original_price,
        });
      }
    },
    deleteNewProductFromTable(product) {
      let relatedStaffChange = this.staffChanges.find((staffChange) => {
        return staffChange.product == product.id;
      });
      let relatedStaffChangesOrder = this.staffChangesOrders.find(
        (staffChangesOrder) => {
          return staffChangesOrder.product.id == product.id;
        }
      );

      if (relatedStaffChange) {
        relatedStaffChange.count--;
        relatedStaffChangesOrder.count--;
        relatedStaffChangesOrder.paymentInfo.net_amount -=
          product.original_price;
        relatedStaffChangesOrder.paymentInfo.total_amount -=
          product.original_price;
        relatedStaffChangesOrder.paymentInfo.total_count--;

        if (relatedStaffChange.count == 0) {
          this.staffChanges = this.staffChanges.filter(
            (staffChange) => staffChange != relatedStaffChange
          );
          this.staffChangesOrders = this.staffChangesOrders.filter(
            (staffChangesOrder) => staffChangesOrder != relatedStaffChangesOrder
          );
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-card {
  min-width: 70vw;
}

.en {
  & .add-product-modal {
    &__categories {
      border-right: 1px solid rgb(165, 165, 165);
    }
    &__menu-products {
      border-right: 1px solid rgb(165, 165, 165);
    }
  }
}
.fa {
  & .add-product-modal {
    &__categories {
      border-left: 1px solid rgb(165, 165, 165);
    }
    &__menu-products {
      border-left: 1px solid rgb(165, 165, 165);
    }
  }
}

.modal-card {
  min-width: 75vw !important;
  width: auto;
}

.modal-card-body {
  max-height: 70vh;
}

.add-product-modal {
  display: flex;
  flex-direction: row;
  z-index: 50;
  max-height: 60vh;

  &__categories {
    display: flex;
    flex-direction: column;

    overflow-y: auto;

    &::-webkit-scrollbar {
      display: none;
    }

    &__category {
      height: 6rem;
      margin: 0.25rem 0;
      width: 11rem;

      & > * {
        max-width: 2rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  &__menu-products {
    display: flex;
    flex-direction: column;

    overflow-y: auto;

    &::-webkit-scrollbar {
      display: none;
    }

    &__product {
      width: 22rem;
      height: 2.5rem;
      margin: 0rem !important;
      text-align: start !important;
      padding-inline-start: 1rem !important;
      justify-content: right;
    }
  }
  &__table-products {
    overflow-y: auto;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__table-products {
    width: 34vw;

    &__customer {
      display: block;
      text-align: center;
      margin-top: 0.5rem;
    }
  }
}
.button {
  margin: 0;
  border-radius: 0;
  border: 1px solid rgba(0, 0, 0, 0.096);
  border-width: 1px 0 1px 0;
}

footer {
  .button {
    margin: 0 10px;
    border-radius: 0;
    border: 1px solid rgba(0, 0, 0, 0.096);
    border-width: 1px 0 1px 0;
  }
}
.animation-content {
  max-width: unset !important;
}
</style>