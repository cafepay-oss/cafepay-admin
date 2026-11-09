<template>
  <div>
    <hero-bar>
      محدوده های ارسال
    </hero-bar>
    <section class="section is-main-section">
      <div
        class="card" style="padding: 10px;"
      >
        <header>افزودن محدوده</header>
        <p style="padding: 10px 0px; font-size: 12px;">محدوده های اضافه نشده، اینجا نمایش داده می شوند</p>

        <b-field class="region-form-row">
          <span class="control" style="padding-top: 5px; padding-right: 7px; padding-left: 7px;">
            بر اساس شعاع فاصله تا رستوران:
          </span>
          <b-input
            dir="ltr"
            type="number"
            step="0.01"
            v-model="maxRadius"
            style="width: 80px; margin-left: 10px;"
          />
          <b-button
            @click="addRegionsByRadius"
            class="button is-info">
            افزودن به لیست
          </b-button>
        </b-field>
        <b-field dir="rtl">
            <b-taginput
                v-model="regionsToAdd"
                :data="filteredUnavailableRegions"
                autocomplete
                :allow-new="false"
                :open-on-focus="true"
                :on-paste-separators="[',']"
                field="name"
                icon="map"
                :attached="true"
                placeholder="نام منطقه ها را وارد کنید"
                @typing="getFilteredRegions">
            </b-taginput>
        </b-field>
        <b-field class="region-form-row">
          <span class="control" style="padding-top: 5px; padding-right: 7px; padding-left: 7px;">
            هزینه ارسال:
          </span>
          <b-input
            dir="ltr"
            type="number"
            min="0"
            max="10000000"
            step="500"
            v-model="newRegionsPrice"
            style="width: 80px;"
          />
          <p class="control" style="padding-top: 5px; padding-right: 7px; padding-left: 7px;">
            تومان
          </p>
        </b-field>
          <b-button
            @click="addRegions"
            class="button is-info">
            ثبت محدوده ها
          </b-button>
      </div>
    </section>

    <section class="section is-main-section tables" v-if="regionPricesForEdit.length > 0">
      <header>محدوده های فعال</header>
    </section>
    <section style="min-height: 90vh" class="section is-main-section tables" v-if="regionPricesForEdit.length > 0">
      <b-field style="width: 100%; padding: 0px 10px;">
        <b-input
          placeholder="جستجو..."
          icon="magnify"
          expanded
          v-model="regionPriceSearchFilter"
        />
      </b-field>
      <template
        v-for="regionPrice in regionPricesForEdit"
      >
        <div class="card region-price-card" :key="regionPrice.pk" v-show="regionPrice.region.name.includes(regionPriceSearchFilter)">
          <p class="region-price-card__title">{{ regionPrice.region.name }}</p>
          <div class="region-price-card__price">
            <label :for="'region-price-' + regionPrice.pk">هزینه ارسال</label>
            <b-field>
              <b-input
                :id="'region-price-' + regionPrice.pk"
                dir="ltr"
                type="number"
                min="0"
                max="10000000"
                step="500"
                expanded
                v-model="regionPrice.price"
              />
              <span class="control region-price-card__unit">تومان</span>
            </b-field>
          </div>
          <div class="region-price-card__actions">
            <b-button
              :disabled="regionPrice.price == regionPrices.find(rp => rp.pk == regionPrice.pk).price"
              @click.prevent="editRegionPrice(regionPrice)"
              class="is-success"
              :loading="regionPrice.updating"
              :aria-label="'ثبت هزینه ارسال ' + regionPrice.region.name"
              title="ثبت هزینه ارسال"
            >
              <b-icon icon="check" size="is-small" />
              <span>ثبت</span>
            </b-button>
            <b-button
              @click.prevent="deleteRegionPrice(regionPrice)"
              class="is-danger is-outlined"
              :loading="regionPrice.updating"
              :aria-label="'حذف محدوده ' + regionPrice.region.name"
              title="حذف محدوده"
            >
              <b-icon icon="trash-can-outline" size="is-small" />
              <span>حذف</span>
            </b-button>
            <a
              :href="'https://www.google.com/maps/search/' + regionPrice.region.lat + ',' + regionPrice.region.lon"
              target="_blank"
              rel="noopener noreferrer"
              class="button is-info is-outlined"
              :aria-label="'نمایش ' + regionPrice.region.name + ' روی نقشه'"
              title="مشاهده روی نقشه"
            >
              <b-icon icon="map-marker-outline" size="is-small" />
              <span>نقشه</span>
            </a>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script>
import HeroBar from "@/components/HeroBar";
import PostModal from "@/components/Post/PostModal";
import PostCard from "@/components/Post/PostCard";
import ModalBox from "@/components/ModalBox";
import { ToastProgrammatic as Toast } from "buefy";

export default {
  name: "Posts",
  components: {
    HeroBar,
    PostModal,
    ModalBox,
    PostCard,
  },
  computed: {
    cafe(){
      return this.$store.state.accountModule.activeCafe;
    },
    unavailableRegions(){
      return this.regions.filter(r => !this.regionPrices.find(rp => rp.region == r.pk))
    },
    regionPrices(){
      return this.$store.getters['regionModule/regionPrices']
    },
    cities(){
      return this.$store.getters['regionModule/cities']
    },
    regions(){
      if(!this.cities) {
        return []
      }
      return this.cities.reduce((accumulator, currentValue) => accumulator.concat(currentValue.regions), [])
    }
  },
  watch: {
    regionPrices(){ this.loadRegionPrices() },
    cities(){ this.loadRegionPrices() },
    unavailableRegions(newValue) { this.filteredUnavailableRegions = newValue }
  },
  data() {
    return {
      regionPriceSearchFilter: '',
      newRegionsPrice: 0,
      filteredUnavailableRegions: [],
      regionsToAdd: [],
      regionPricesForEdit: [],
      isPostModalActive: false,
      edit: false,
      post: {},
      isModalActive: false,
      maxRadius: 0.01,
    };
  },
  methods: {
    addRegionsByRadius(){
      const dist = (x1, x2, y1, y2) => Math.sqrt( Math.pow((Number(x1)-Number(x2)), 2) + Math.pow((Number(y1)-Number(y2)), 2) )
      this.regionsToAdd = this.unavailableRegions.filter(d => dist(d.lat, this.cafe.location.split(",")[0], d.lon, this.cafe.location.split(",")[1]) < this.maxRadius)
    },
    addRegions(){
      let regionPriceData = this.regionsToAdd.reduce((accumulator, currentValue) => accumulator.concat([{region: currentValue.pk, price: this.newRegionsPrice}]), [])
      this.request({
          url: "api/v1/cafe/" + this.cafe.id + "/region-price/bulk/create/",
          method: "POST",
          data: {region_prices: regionPriceData}
        })
        .then(res => {
          this.$store.dispatch("regionModule/getRegionPrices");
          this.regionsToAdd = [];
          Toast.open({
            queue: false,
            message: "محدوده با موفقیت اضافه شد",
            type: "is-success"
          });
        })
        .catch(err => {
          Toast.open({
            queue: false,
            message: "مشکلی در افزودن محدوده به وجود آمد",
            type: "is-danger"
          });
        });
    },
    getFilteredRegions(text) {
        this.filteredUnavailableRegions = this.unavailableRegions.filter((option) => {
            return option.name
                .toString()
                .toLowerCase()
                .indexOf(text.toLowerCase()) >= 0
        })
    },
    loadRegionPrices(){
      if(!this.regionPrices || !this.regions) {
        return;
      }
      this.regionPricesForEdit = [];
      for(let i = 0; i < this.regionPrices.length; i++) {
        let rp = this.regionPrices[i];
        this.regionPricesForEdit.push({
          pk: rp.pk,
          region: this.regions.find(r => r.pk == rp.region),
          price: rp.price,
          updating: false
        })
      }
      this.regionPricesForEdit.sort((a, b) => a.pk - b.pk)
    },
    newPost() {
      this.$store.state.regionModule.isRegionModalActive = true;
    },
    editRegionPrice(regionPrice) {
      if(regionPrice.updating) {
        return
      }
      regionPrice.updating = true
      this.request({
          url: "api/v1/region-price/" + regionPrice.pk + "/",
          method: "PATCH",
          data: { price: regionPrice.price}
        })
        .then(res => {
          this.$store.dispatch("regionModule/getRegionPrices");
          Toast.open({
            queue: false,
            message: "محدوده با موفقیت ویرایش شد",
            type: "is-success"
          });
        })
        .catch(err => {
          Toast.open({
            queue: false,
            message: "مشکلی در ویرایش محدوده به وجود آمد",
            type: "is-danger"
          });
        });
    },
    deleteRegionPrice(regionPrice) {
      if(regionPrice.updating) {
        return
      }
      regionPrice.updating = true
      this.request({
        url: "api/v1/region-price/" + regionPrice.pk + "/",
        method: "DELETE"
      })
      .then(res => {
        this.$store.dispatch("regionModule/getRegionPrices");
        Toast.open({
          queue: false,
          message: "محدوده با موفقیت حذف شد",
          type: "is-success"
        });
      })
      .catch(err => {
        Toast.open({
          queue: false,
          message: "مشکلی در ویرایش محدوده به وجود آمد",
          type: "is-danger"
        });
      });
    },
    trashConfirm() {
      this.$store.dispatch("postModule/deletePost", this.post);
      this.isModalActive = false;
    },
    trashCancel() {
      this.isModalActive = false;
    },
  },
  mounted() {
    this.loadRegionPrices()
    this.filteredUnavailableRegions = this.unavailableRegions
  },
};
</script>

<style lang="scss" scoped>
.section {
  padding-top: 2rem;
  padding-bottom: 1rem;
}

.hero-button {
  margin: 0 5px;
  box-shadow: 0 2px 2px #b8b8b8 !important;
}

.region-form-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .5rem;
}

.tables {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  align-items: start;
  gap: 1rem;

  > .field { grid-column: 1 / -1; }
}

.region-price-card {
  display: grid;
  gap: 1rem;
  min-width: 0;
  width: 100%;
  padding: 1rem;

  &__title {
    font-size: 1rem;
    font-weight: 500;
    overflow-wrap: anywhere;
  }

  &__price {
    min-width: 0;

    > label {
      display: block;
      margin-bottom: .4rem;
      font-size: .85rem;
    }
  }

  &__unit {
    display: flex;
    align-items: center;
    padding-inline-start: .75rem;
  }

  &__actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: .4rem;

    > .button {
      min-width: 0;
      min-height: 2.75rem;
      height: auto;
      padding: .45rem .35rem !important;
      font-size: .8rem !important;
    }
  }
}

@media (max-width: 480px) {
  .tables {
    grid-template-columns: minmax(0, 1fr);
  }
}

.button {
  margin: 0 !important;
}
</style>
