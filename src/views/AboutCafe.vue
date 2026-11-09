<template>
  <div>
    <modal-box
      :is-active="$store.state.cafeModule.deleteImageModalActive"
      trash-object-name="عکس"
      @confirm="trashConfirm"
      @cancel="trashCancel"
    />
    <!-- <title-bar :title-stack="titleStack"/> -->
    <hero-bar>
      {{ $t("aboutStore.about") }} {{ this.cafe.name }}
      <b-button
        :loading="isLoading"
        slot="right"
        @click="submit"
        class="button is-info"
        >{{ $t("aboutStore.submitEdit") }}</b-button
      >
    </hero-bar>
    <section class="section is-main-section">
      <card-component icon="ballot">
        <form @submit.prevent="submit">
          <b-field :label="$t('aboutStore.aboutStore')">
            <b-input
              type="textarea"
              icon="info"
              :placeholder="$t('primary.description')"
              name="description"
              v-model="cafe.description"
            />
          </b-field>

          <b-field :label="$t('aboutStore.address')">
            <b-input
              icon="map-marker"
              :placeholder="$t('aboutStore.address')"
              name="address"
              v-model="cafe.address"
            />
          </b-field>

          <b-field :label="$t('aboutStore.contacts')">
            <b-input
              icon="phone-classic"
              :placeholder="$t('aboutStore.contacts')"
              name="phone"
              v-model="cafe.phone"
            />
          </b-field>

          <b-field :label="$t('aboutStore.instagram')">
            <b-input
              dir="ltr"
              icon="at"
              placeholder="Example: cafepay"
              name="instagram"
              v-model="cafe.instagram"
            />
          </b-field>

          <b-field :label="$t('aboutStore.storePhotos')">
            <div class="cafe-images">
              <div
                v-for="image in $store.state.accountModule.activeCafe.images"
                :key="image.pk"
                class="cafe-images__image"
              >
                <img :src="image.image" alt="تصویر فروشگاه" />
                <div class="cafe-images__actions">
                  <button
                    type="button"
                    class="button is-outlined"
                    :class="image.is_avatar ? 'is-success' : 'is-info'"
                    :aria-pressed="image.is_avatar"
                    :aria-label="image.is_avatar ? 'لغو انتخاب آواتار فروشگاه' : 'انتخاب آواتار فروشگاه'"
                    :title="image.is_avatar ? 'لغو انتخاب آواتار فروشگاه' : 'انتخاب آواتار فروشگاه'"
                    @click="image.is_avatar ? handleUnsetAvatarClicked(image) : handleSetAvatarClicked(image)"
                  >
                    <b-icon icon="account-circle-outline" size="is-small" />
                    <span>آواتار</span>
                  </button>
                  <button
                    type="button"
                    class="button is-outlined"
                    :class="image.is_header ? 'is-success' : 'is-info'"
                    :aria-pressed="image.is_header"
                    :aria-label="image.is_header ? 'لغو انتخاب تصویر اصلی فروشگاه' : 'انتخاب تصویر اصلی فروشگاه'"
                    :title="image.is_header ? 'لغو انتخاب تصویر اصلی فروشگاه' : 'انتخاب تصویر اصلی فروشگاه'"
                    @click="image.is_header ? handleUnsetHeaderClicked(image) : handleSetHeaderClicked(image)"
                  >
                    <b-icon icon="image-outline" size="is-small" />
                    <span>تصویر اصلی</span>
                  </button>
                  <button
                    type="button"
                    class="button is-danger is-outlined cafe-images__delete"
                    aria-label="حذف تصویر فروشگاه"
                    title="حذف تصویر فروشگاه"
                    @click="handleDeleteImage(image)"
                  >
                    <b-icon icon="trash-can-outline" size="is-small" />
                    <span>{{ $t("primary.delete") }}</span>
                  </button>
                </div>
              </div>
            </div>
          </b-field>

          <b-field
            label=""
            :type="{ 'is-danger': errors.image }"
            :message="errors.image ? errors.image[0] : ''"
          >
            <b-upload v-model="dropFile" drag-drop>
              <section class="section">
                <div class="content has-text-centered">
                  <p>
                    <b-icon icon="upload" size="is-large"></b-icon>
                  </p>
                  <p>{{ $t("primary.uploadOrDragAndDrop") }}</p>
                </div>
              </section>
            </b-upload>
          </b-field>
          <div v-if="dropFile" class="tags" dir="ltr">
            <span class="tag is-info">
              {{ dropFile.name }}
              <button
                class="delete is-small"
                type="button"
                @click="dropFile = null"
              ></button>
            </span>
          </div>

          <!-- <b-field grouped>
            <b-field label="درصد تخفیف">
              <b-input
                type="number"
                placeholder="درصد تخفیف"
                v-model="cafe.offPercent"
                name="off-percent"
              />
            </b-field>
          </b-field> -->

          <!-- <b-field label=" ساعات کاری همه روزه" horizontal>
            <b-field label="از" horizontal>
              <date-picker v-model="time" type="time" />
            </b-field>
            <b-field label="الی" horizontal>
              <date-picker v-model="time" type="time" />
            </b-field>
          </b-field> -->

          <!-- <b-field label="Department" horizontal>
            <b-select placeholder="Select a department" v-model="cafe.department" required>
              <option v-for="(department, index) in departments" :key="index" :value="department">
                {{ department }}
              </option>
            </b-select>
          </b-field>
          <hr>
          <b-field label="Subject" message="Message subject" horizontal>
            <b-input placeholder="e.g. Partnership proposal" v-model="cafe.subject" required />
          </b-field>
          <b-field label="Question" message="Your question. Max 255 characters" horizontal>
            <b-input type="textarea" placeholder="Explain how we can help you" v-model="cafe.question" maxlength="255" required/>
          </b-field>
          <hr>
          <b-field horizontal>
            <b-field grouped>
              <div class="control">
                <b-button native-type="submit" type="is-primary">Submit</b-button>
              </div>
              <div class="control">
                <b-button type="is-primary is-outlined" @click="reset">Reset</b-button>
              </div>
            </b-field>
          </b-field>-->
        </form>
      </card-component>
      <!-- <card-component title="Custom elements" icon="ballot-outline">
        <b-field label="Checkbox" class="has-check" horizontal>
          <checkbox-picker
            :options="{lorem:'Lorem', ipsum:'Ipsum', dolore:'Dolore'}"
            v-model="customElementsForm.checkbox"
            type="is-primary"
          />
        </b-field>
        <hr />
        <b-field label="Radio" class="has-check" horizontal>
          <radio-picker :options="{one:'One',two:'Two'}" v-model="customElementsForm.radio"></radio-picker>
        </b-field>
        <hr />
        <b-field label="Switch" horizontal>
          <b-switch v-model="customElementsForm.switch">Default</b-switch>
        </b-field>
        <hr />
        <b-field label="File" horizontal>
          <file-picker v-model="customElementsForm.file" />
        </b-field>
      </card-component>-->
    </section>
  </div>
</template>

<script>
import TitleBar from "@/components/TitleBar";
import CardComponent from "@/components/CardComponent";
import mapValues from "lodash/mapValues";
import CheckboxPicker from "@/components/CheckboxPicker";
import RadioPicker from "@/components/RadioPicker";
import FilePicker from "@/components/FilePicker";
import HeroBar from "@/components/HeroBar";
import ModalBox from "@/components/ModalBox";

export default {
  name: "AboutCafe",
  components: {
    HeroBar,
    FilePicker,
    RadioPicker,
    CheckboxPicker,
    CardComponent,
    TitleBar,
    ModalBox
  },
  data() {
    return {
      seletedImage: {},
      productForm: {},
      dropFile: null,
      cafe: {
        name: null,
        description: null,
        address: null,
        location: null,
        offPercent: null,
        images: null,
        activeHours: null,
        instagram: null,
        phone: null
      },
      customElementsForm: {
        checkbox: [],
        radio: null,
        switch: true,
        file: null
      },
      departments: ["Business Development", "Marketing", "Sales"]
    };
  },
  computed: {
    titleStack() {
      return ["Admin", "Forms"];
    }
  },
  mounted() {
    this.cafe.name = this.$store.state.accountModule.activeCafe.name;
    this.cafe.description = this.$store.state.accountModule.activeCafe.description;
    this.cafe.address = this.$store.state.accountModule.activeCafe.address;
    this.cafe.location = this.$store.state.accountModule.activeCafe.location;
    this.cafe.offPercent = this.$store.state.accountModule.activeCafe.offPercent;
    this.cafe.images = this.$store.state.accountModule.activeCafe.images;
    this.cafe.activeHours = this.$store.state.accountModule.activeCafe.activeHours;
    this.cafe.instagram = this.$store.state.accountModule.activeCafe.instagram;
    this.cafe.phone = this.$store.state.accountModule.activeCafe.phone;
  },
  methods: {
    submit() {
      this.$store.dispatch("accountModule/updateCafeInfo", this.cafe);
      if (this.dropFile) {
        this.$store.dispatch("cafeModule/addCafeImage", this.dropFile);
        this.dropFile = null;
      }
    },
    reset() {
      this.form = mapValues(this.form, item => {
        if (item && typeof item === "object") {
          return [];
        }
        return null;
      });

      this.$buefy.snackbar.open({
        message: "Reset successfully",
        queue: false
      });
    },
    handleDeleteImage(image) {
      this.seletedImage = image;
      this.$store.state.cafeModule.deleteImageModalActive = true;
    },
    handleSetAvatarClicked(image) {
      if (!image.is_avatar) {
        this.$store.dispatch("cafeModule/setCafeAvatarImage", image);
      }
    },
    handleUnsetAvatarClicked(image) {
      if (image.is_avatar) {
        this.$store.dispatch("cafeModule/unsetCafeAvatarImage", image);
      }
    },
    handleSetHeaderClicked(image) {
      if (!image.is_header) {
        this.$store.dispatch("cafeModule/setCafeHeaderImage", image);
      }
    },
    handleUnsetHeaderClicked(image) {
      if (image.is_header) {
        this.$store.dispatch("cafeModule/unsetCafeHeaderImage", image);
      }
    },
    trashConfirm() {
      this.$store.dispatch("cafeModule/deleteCafeImage", this.seletedImage.pk);
    },
    trashCancel() {
      this.$store.state.cafeModule.deleteImageModalActive = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.cafe-images {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;

  &__image {
    flex: 0 1 16rem;
    width: 100%;
    min-width: 0;

    > img {
      display: block;
      width: 100%;
      height: 10rem;
      object-fit: cover;
      border-radius: .4rem;
    }
  }

  &__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: .5rem;
    margin-top: .5rem;

    > .button {
      min-width: 0;
      min-height: 2.75rem;
      height: auto;
      margin: 0;
      padding: .5rem;
      white-space: normal;
    }
  }

  &__delete {
    grid-column: 1 / -1;
  }
}

.b-tooltip:hover {
  transform: translateY(0px) !important;
}
</style>
