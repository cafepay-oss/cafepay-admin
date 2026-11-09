<template>
  <div class>
    <section class="section hero is-fullheight is-error-section">
      <div class="hero-body">
        <div class="container">
          <div class="columns is-centered">
            <div class="column is-two-fifths">
              <div class="card long-shadow has-card-header-background">
                <header class="card-header">
                  <p class="card-header-title">
                    <span>{{ $store.state.accountModule.cafes.length ? $t("stores.pleaseSelectYourStore") : "هیچ فروشگاهی برای این حساب ثبت نشده است" }}</span>
                  </p>
                </header>
                <div class="card-content">
                  <p
                    v-for="cafe in this.$store.state.accountModule.cafes"
                    :key="cafe.id"
                    @click="selectStore(cafe)"
                    class="store"
                  >
                    {{ cafe.name }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-foot has-text-centered">
        <div class="logo"></div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    selectStore(cafe) {
      this.$store.commit("accountModule/setActiveCafe", cafe); // set activeCafe
      this.$store.dispatch("accountModule/getCafeData");
      this.$router.push("/cafe-management");
    },
  },
};
</script>

<style scoped lang="scss">
.is-fullheight {
  position: relative;
}

.store {
  margin: 0.2rem 0rem;
  padding: 0.8rem 1rem;
  border: 1px solid #27272709;
  background: #27272706;
  border-radius: 7px;

  &:hover {
    cursor: pointer;
    transition: all 0.3s ease-out;
    padding-inline-start: 1.3rem;
    font-weight: 500;
  }
}

.card-content {
  max-height: 60vh;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
