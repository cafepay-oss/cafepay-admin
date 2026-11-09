<template>
  <div class="printer-groups">
    <hero-bar class="printer-groups__hero-bar">
      {{ $t("printerGroups.printerGroups") }}
      <b-button
        :loading="isLoading"
        class="button is-info"
        slot="right"
        @click="handleNewGroupClicked()"
        >{{ $t("printerGroups.newGroup") }}</b-button
      >
    </hero-bar>

    <b-modal
      :active.sync="$store.state.groupModule.isPrinterGroupsModalActive"
      class="footer-modal"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <GroupModal :group="selectedGroup" :edit="edit" />
    </b-modal>

    <section class="section is-main-section">
      <card-component
        class="has-table has-mobile-sort-spaced"
        :title="$t('printerGroups.groups')"
      >
        <div v-if="groups" class="groups">
          <Draggable
            v-model="group.products"
            tag="div"
            group="products"
            draggable=".groups__item__products"
            class="groups__item"
            v-for="group in groups"
            :key="group.pk"
            @change="event => changeProductGroup(event, group)"
          >
            <div slot="header" class="groups__item__header">
              <p class="groups__item__header__title">{{ group.title }}</p>
              <span class="groups__item__header__actions">
                <b-tooltip
                  v-if="group.pk"
                  class=" groups__item__header__actions__edit"
                  :label="$t('primary.edit')"
                  type="is-info"
                >
                  <button
                    @click="editGroup(group)"
                    class="button is-small is-info"
                  >
                    <b-icon icon="account-edit" size="is-small" />
                  </button>
                </b-tooltip>
                <b-tooltip
                  v-if="group.pk"
                  class=" groups__item__header__actions__delete"
                  :label="$t('primary.delete')"
                  type="is-danger"
                >
                  <button
                    @click="deleteGroup(group)"
                    class="button is-small is-danger"
                  >
                    <b-icon icon="trash-can" size="is-small" />
                  </button>
                </b-tooltip>
              </span>
            </div>
            <hr slot="header" class="is-info" />
            <GroupProductItem
              class="groups__item__products"
              v-for="product in group.products"
              :key="product.id"
              :product="product"
            ></GroupProductItem>
          </Draggable>
        </div>
      </card-component>
      <ModalBox
        v-if="selectedGroup"
        :is-active="deleteModal"
        :trash-object-name="selectedGroup.title"
        @confirm="trashConfirm"
        @cancel="trashCancel"
      />
    </section>
  </div>
</template>

<script>
import GroupProductItem from "@/components/Management/Cafe/Group/GroupProductItem";
import GroupModal from "@/components/Management/Cafe/Group/GroupModal";
import CardComponent from "@/components/CardComponent";
import ModalBox from "@/components/ModalBox";
import HeroBar from "@/components/HeroBar";
import Draggable from "vuedraggable";

export default {
  name: "PrinterGroups",
  components: {
    GroupProductItem,
    CardComponent,
    GroupModal,
    ModalBox,
    Draggable,
    HeroBar
  },
  data() {
    return {
      edit: false,
      selectedGroup: null
    };
  },
  methods: {
    handleNewGroupClicked() {
      this.edit = false;
      this.selectedGroup = null;
      this.$store.state.groupModule.isPrinterGroupsModalActive = true;
    },
    changeProductGroup(event, group) {
      if (event.added) {
        this.$store.dispatch("groupModule/changePrinterGroup", {
          group: group,
          product: event.added.element
        });
      }
    },
    editGroup(group) {
      this.edit = true;
      this.selectedGroup = group;
      this.$store.state.groupModule.isPrinterGroupsModalActive = true;
    },
    deleteGroup(group) {
      this.selectedGroup = group;
      this.trashConfirm();
    },
    trashConfirm() {
      this.$store.dispatch("groupModule/deleteGroup", this.selectedGroup.pk);
      this.selectedgroup = null;
      this.$store.state.groupModule.isDeletePrinterGroupsModalActive = false;
    },
    trashCancel() {
      this.$store.state.groupModule.isDeletePrinterGroupsModalActive = false;
    }
  },
  computed: {
    deleteModal() {
      return this.$store.state.groupModule.isDeletePrinterGroupsModalActive;
    },
    groups() {
      let groups = this.$store.state.groupModule.groups;
      let products = this.$store.state.productModule.products;

      groups.forEach(group => {
        group.products = [];
      });

      products.forEach(product => {
        if (product.group == null) {
          let relatedGroup = groups.find(grp => grp.pk == null);
          if (relatedGroup) {
            relatedGroup.products.push(product);
          }
        } else {
          let relatedGroup = groups.find(grp => grp.pk == product.group.pk);
          if (relatedGroup) {
            relatedGroup.products.push(product);
          } else {
            product.group = null
            let relatedGroup = groups.find(grp => grp.pk == null);
            if (relatedGroup) {
              relatedGroup.products.push(product);
            }
          }
        }
      });

      return groups;
    },
    products() {
      return this.$store.state.productModule.products;
    }
  },
  watch: {
    products: {
      deep: true,
      handler() {
        this.$forceUpdate();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.select .control {
  text-align: start !important;
}

.groups {
  display: flex;
  flex-wrap: wrap;

  &__item {
    padding: 1rem;
    margin: 0.3rem 0.2rem;
    flex: 1;
    min-width: 30%;
    max-width: 33%;
    min-height: 3rem;

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      &__title {
        font-size: 1.2rem;
        font-weight: 500;
        color: #000;
      }

      &__actions {
        display: flex;
        justify-content: center;
        align-items: center;

        & > * {
          margin-inline-start: 0.2rem;
        }
      }
    }

    hr {
      width: 100%;
      height: 0.1rem;
      margin: 0.5rem 0;
      background-color: rgb(163, 163, 163);
    }

    &__products {
      width: 100%;
      padding: 0.4rem 0.2rem 0.4rem 0;
      border-radius: 5px;

      &:hover {
        background-color: #f0f0ff;
      }
    }

    &__add-product {
      margin: 0.2rem 0;
      padding: 0.5rem 0;

      display: flex;
      align-self: center;
      justify-content: center;

      border: 1px dotted grey;
      border-radius: 5px;

      &:hover {
        cursor: pointer;
        background-color: #f0f0ff;
        border-color: #00b7ff;
      }
    }
  }

  &__add {
    display: flex;
    max-width: 33%;
    min-width: 32%;
    padding: 1rem;
    margin: 0.3rem 0.2rem;
    height: 150px;
    justify-content: center;
    align-items: center;
    border: 1px dashed grey;
    border-radius: 5px;

    &:hover {
      cursor: pointer;
      background-color: #f0f0ff;
      border-color: #00b7ff;
    }
  }
}
</style>
