<template>
  <div>
    <b-table
      :loading="isLoading"
      :striped="true"
      :hoverable="true"
      :data="staff"
      default-sort="status"
    >
      <template slot-scope="props">
        <b-table-column
          cell-class="has-no-head-mobile is-image-cell"
          width="50"
        >
          <div class="image">
            <img
              :src="
                'https://avatars.dicebear.com/v2/bottts/' +
                props.row.user_profile.full_name +
                '.svg'
              "
              class="is-rounded"
            />
          </div>
        </b-table-column>

        <b-table-column :label="$t('primary.name')" field="first_name">
          {{
            props.row.user_profile.first_name +
            " " +
            props.row.user_profile.last_name
          }}
        </b-table-column>

        <b-table-column :label="$t('employees.role')" field="role" sortable>
          {{ props.row.role.display_name }}
        </b-table-column>

        <b-table-column :label="$t('primary.phoneNumber')" field="phone_number">
          {{ props.row.user_profile.phone_number }}
        </b-table-column>

        <b-table-column
          :label="$t('primary.status')"
          field="status"
          sortable
          :class="{
            red: props.row.status == 2,
            green: props.row.status == 1,
            yellow: props.row.status == 0,
          }"
        >
          {{
            props.row.status == 1
              ? $t("employees.confirmed")
              : props.row.status == 0
              ? $t("employees.pending")
              : $t("employees.deleted")
          }}
        </b-table-column>

        <!-- <b-table-column
          class="is-actions-cell"
          field="product-methods"
          label="عملیات ها"
          numeric
          centered
        >
          <b-tooltip class="buttons" label="ویرایش" type="is-info">
            <button
              @click.prevent="$emit('editStaff', props.row)"
              class="button is-small is-info"
            >
              <b-icon icon="pencil-outline" size="is-small" />
            </button>
          </b-tooltip>
          <b-tooltip class="buttons" label="غیر فعال سازی" type="is-danger">
            <button
              @click.prevent="deactivateStaff(props.row)"
              class="button is-small is-danger"
            >
              <b-icon icon="diameter-variant" size="is-small" />
            </button>
          </b-tooltip>  
        </b-table-column> -->
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
  name: "StaffTable",
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
    staff() {
      return this.$store.state.cafeModule.cafeStaff;
    },
    trashObjectName() {
      if (this.trashObject) {
        return this.trashObject.name;
      }
      return null;
    },
  },
  methods: {
    deactivateStaff(staff) {
      this.$store.dispatch("cafeModule/deactivateStaff", staff.pk);
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

.red {
  color: red !important;
}

.green {
  color: green !important;
}

.yellow {
  color: rgb(196, 196, 35) !important;
}
</style>