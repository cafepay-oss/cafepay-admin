<template>
  <div>
    <modal-box
      :is-active="isModalActive"
      :trash-object-name="trashObjectName"
      @confirm="trashConfirm"
      @cancel="trashCancel"
    />
    <b-table
      :loading="isLoading"
      :striped="true"
      :hoverable="true"
      :data="roles"
      default-sort="last_name"
    >
      <template slot-scope="props">
        <b-table-column label="عنوان" field="name">
          {{ props.row.display_name }}
        </b-table-column>

        <b-table-column label="دسترسی ها" field="name" width="800">
          تغییر منو، تغییر محصولات، تغییر منو، تغییر محصولات، تغییر منو، تغییر
          محصولات، تغییر منو، تغییر محصولات، تغییر منو، تغییر محصولات، تغییر
          منو، تغییر محصولات، تغییر منو، تغییر محصولات، تغییر منو، تغییر
          محصولات، تغییر منو، تغییر محصولات،
        </b-table-column>

        <!-- <b-table-column label="نام خانوادگی" field="last_name">
          {{ props.row.user_profile.last_name }}
        </b-table-column>

        <b-table-column label="سمت" field="role" sortable>
          {{ props.row.role.display_name }}
        </b-table-column>

        <b-table-column label="شماره تماس" field="phone_number">
          {{ props.row.user_profile.phone_number }}
        </b-table-column>

        <b-table-column label="وضعیت" field="status">
          {{
            props.row.status == 1
              ? "تایید شده"
              : props.row.status == 0
              ? "در انتظار تایید"
              : "حذف شده"
          }}
        </b-table-column> -->

        <b-table-column
          class="is-actions-cell"
          field="product-methods"
          label="عملیات ها"
          numeric
          centered
        >
          <b-tooltip class="buttons" label="ویرایش" type="is-info">
            <button class="button is-small is-info">
              <b-icon icon="pencil-outline" size="is-small" />
            </button>
          </b-tooltip>
          <b-tooltip class="buttons" label="حذف" type="is-danger">
            <button
              @click.prevent="trashModal(props.row)"
              class="button is-small is-danger"
            >
              <b-icon icon="trash-can" size="is-small" />
            </button>
          </b-tooltip>
        </b-table-column>
      </template>

      <section class="section" slot="empty">
        <div class="content has-text-grey has-text-centered">
          <template v-if="isLoading">
            <p>
              <b-icon icon="dots-horizontal" size="is-large" />
            </p>
            <p>{{ $t("primary.loading") }}</p>
          </template>
          <template v-else>
            <p>
              <b-icon icon="emoticon-sad" size="is-large" />
            </p>
            <p>{{ $t("primary.noInformation") }}</p>
          </template>
        </div>
      </section>
    </b-table>
  </div>
</template>

<script>
import axios from "axios";
import ModalBox from "@/components/ModalBox";

export default {
  name: "RolesTable",
  components: { ModalBox },
  data() {
    return {
      isModalActive: false,
      trashObject: null,
      paginated: false,
      perPage: 10,
      checkedRows: [],
    };
  },
  computed: {
    roles() {
      return this.$store.state.cafeModule.cafeRoles;
    },
    trashObjectName() {
      if (this.trashObject) {
        return this.trashObject.name;
      }
      return null;
    },
  },
  methods: {
    trashModal(trashObject) {
      this.trashObject = trashObject;
      this.isModalActive = true;
    },
    trashConfirm() {
      this.isModalActive = false;
      this.$buefy.snackbar.open({
        message: "Confirmed",
        queue: false,
      });
    },
    trashCancel() {
      this.isModalActive = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.buttons {
  margin: 0 0.2rem;
}

.button {
  box-shadow: 0 2px 2px #b8b8b8 !important;
}

.b-tooltip {
  & button {
    border-radius: 2px;
    margin: 0;

    & .icon {
      font-size: 0.95rem;
    }
  }
}
</style>