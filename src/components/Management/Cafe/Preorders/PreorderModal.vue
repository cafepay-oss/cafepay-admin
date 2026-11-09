<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">{{ $t('preorders.newPreorder') }}</p>
    </header>
    <section class="modal-card-body \">
      <b-field
        :label="$t('primary.phoneNumber')"
        :type="{ 'is-danger': errors.phone_number }"
        :message="errors.phone_number ? errors.phone_number[0] : ''"
      >
        <b-input v-model="preorderForm.phone_number"></b-input>
      </b-field>

      <b-field :label="$t('preorders.modal.customerOrder')">
        <section class="preorder-modal">
          <section class="preorder-modal__categories">
            <b-button
              class="preorder-modal__categories__category"
              v-for="category in menu.categories"
              :key="category.id"
              :class="{ 'is-info': selectedCategory == category }"
              @click="selectedCategory = category"
              >{{ truncate(category.name, 18) }}</b-button
            >
          </section>
          <section class="preorder-modal__menu-products">
            <span
              v-for="product in selectedCategory.products"
              :key="product.id"
            >
              <b-button
                v-if="!product.deleted"
                class="preorder-modal__menu-products__product"
                @click="addNewProductToTable(product)"
                >{{ truncate(product.name, 35) }}</b-button
              >
            </span>
          </section>
          <section class="preorder-modal__table-products">
            <table-product-card
              class="preorder-modal__table-products__product"
              v-for="staffChangeOrder in staffChangesOrders"
              :key="staffChangeOrder.product.id"
              :order="staffChangeOrder"
              @deleteProductFromTable="
                deleteNewProductFromTable(staffChangeOrder.product)
              "
              @addProductToTable="
                addNewProductToTable(staffChangeOrder.product)
              "
            ></table-product-card>
          </section>
        </section>
      </b-field>

      <b-field :label="$t('preorders.modal.readyTime')">
        <date-picker
          :placeholder="$t('primary.datetime')"
          color="#03a9f4"
          v-model="preorderForm.pickup_time"
          class="picker"
          type="datetime"
          format="YYYY-MM-DDTHH:mm"
          display-format="jYYYY-jMM-jDD HH:mm"
          clearable
          :timezone="true"
          :locale="$t('locale')"
        />
      </b-field>
    </section>
    <footer class="modal-card-foot">
      <b-button
        :loading="isLoading"
        @click="submitPreorder()"
        class="button is-info"
        >{{ $t('primary.submit') }}</b-button
      >
      <b-button
        :loading="isLoading"
        class="button"
        type="button"
        @click.native="$parent.close()"
        >{{ $t('primary.close') }}</b-button
      >
    </footer>
  </div>
</template>

<script>
import TableProductCard from "@/components/Management/Table/TableProductCard";

export default {
  name: "PreorderModal",
  components: {
    TableProductCard,
  },
  data() {
    return {
      preorderForm: {
        pickup_time: "",
        phone_number: "",
      },

      menu: null,
      selectedCategory: null,

      /*  staff changes means new orders that staff has been added  
          to table but changes means changes that staff has been made
          on previous orders that has been on table */
      staffChangesOrders: [],
      staffChanges: [],
    };
  },
  methods: {
    truncate(str, length) {
      if (str.length > length) {
        return str.substring(0, length) + "...";
      }
      return str;
    },
    submitPreorder() {
      this.$store.dispatch("preorderModule/submitPreorder", this.preorderForm);
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
      } else {
        this.changes.push({
          product: product.product.id,
          count: -1,
          user_profile: customer.id,
          is_staff: customer.isStaff,
        });
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
          is_staff: false,
        });
        this.staffChangesOrders.push({
          count: 1,
          discount: 0,
          id: 1,
          is_staff: false,
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
    submitPreorder() {
      this.$store.dispatch("preorderModule/submitPreorder", {
        preorderForm: this.preorderForm,
        preorders: this.staffChanges,
      });
    },
  },
  beforeMount() {
    this.menu = this.$store.state.menuModule.menus.find(
      (menu) => menu.isActive
    );
    this.selectedCategory = this.menu.categories[0];
  },
};
</script>

<style scoped lang="scss">
.modal-card {
  min-width: 50vw;
}

.selector {
  text-align: right;
}

.en {
  & .preorder-modal {
    &__categories {
      border-right: 1px solid rgb(165, 165, 165);
    }
    &__menu-products {
      border-right: 1px solid rgb(165, 165, 165);
    }
  }
}
.fa {
  & .preorder-modal {
    &__categories {
      border-left: 1px solid rgb(165, 165, 165);
    }
    &__menu-products {
      border-left: 1px solid rgb(165, 165, 165);
    }
  }
}

.preorder-modal {
  display: flex;
  flex-direction: row;

  max-height: 35vh;

  &__categories {
    display: flex;
    flex-direction: column;

    overflow-y: auto;

    &::-webkit-scrollbar {
      display: none;
    }

    &__category {
      height: 5rem;
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
      width: 21rem;
      height: 2.5rem;
      margin: 0rem !important;
      text-align: right !important;
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
    width: 33vw;

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
</style>