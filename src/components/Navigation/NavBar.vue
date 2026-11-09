<template>
  <nav v-show="isNavBarVisible" id="navbar-main" class="navbar" :style="$store.state.loadWholePage ? 'background-color: #eaeaea' : ''">
    <!-- <div class="navbar-brand">
      <a class="navbar-item is-hidden-desktop" @click.prevent="menuToggleMobile">
        <b-icon :icon="menuToggleMobileIcon" />
      </a>
      <div class="navbar-item">
        <div class="control">
          <input class="input" placeholder="Search everywhere..." />
        </div>
      </div>
      <div>کافه : {{ cafeName }}</div>
    </div>-->
    <div class="navbar-brand is-right">
      <!-- <a
        class="navbar-item navbar-item-menu-toggle is-hidden-desktop"
        @click.prevent="menuNavBarToggle"
      >
        <b-icon :icon="menuNavBarToggleIcon" custom-size="default" />
      </a>-->
      <button type="button" class="navbar-sidebar-collapse" aria-label="فهرست اصلی" aria-controls="main-navigation" @click="collapseSidebar">
        <b-icon icon="menu" size="is-small"></b-icon>
      </button>
      <div class="timer">
        <span class="timer__text">{{ $t("navigationBar.lastUpdate") }}</span>
        <div class="timer__last-update">
          {{
            new Date($store.state.lastUpdate).toLocaleTimeString().slice(0, 7)
          }}
        </div>
        <button type="button" class="navbar-refresh" aria-label="بروزرسانی اطلاعات" title="بروزرسانی اطلاعات" @click="refresh">
          <b-icon icon="refresh" :class="{ rotating: rotateAnimation }" />
        </button>
        <span class="timer__text">{{ $t("navigationBar.timeSpent") }}</span>
        <div class="timer__time-spent">{{ timer }}</div>
        <div class="field contact-support">
          پشتیبانی: <span class="contact-support__number">09171164374</span>
        </div>
      </div>
    </div>

    <button type="button" class="navbar-account-toggle" aria-label="حساب کاربری"
      :aria-expanded="isMenuNavBarActive" @click="menuNavBarToggle">
      <b-icon :icon="menuNavBarToggleIcon" />
    </button>
    <div
      class="navbar-menu fadeIn animated faster"
      :class="{ 'is-active': isMenuNavBarActive }"
    >
      <div class="navbar-start" v-if="!$store.state.loadWholePage">
        <div class="field open-close" dir="ltr">
          <b-switch
            @input="handleOpenCloseSwitch"
            :true-value="false"
            :false-value="true"
            v-model="isClosed"
            type="is-info"
          >
            {{ !isClosed ? $t('navigationBar.storeIsOpen') : $t('navigationBar.storeIsClose') }}
          </b-switch>
        </div>
        <nav-bar-menu class="has-divider has-user-avatar">
          <user-avatar
            :avatar="
              'https://avatars.dicebear.com/v2/bottts/' +
              $store.state.accountModule.user.fullName +
              '.svg'
            "
          />
          {{ this.$store.state.accountModule.user.fullName }}
          <div class="is-user-name">
            <span>{{ userName }}</span>
          </div>

          <div slot="dropdown" class="navbar-dropdown">
            <router-link class="navbar-item" to="/stores">
              <b-icon icon="store" custom-size="default"></b-icon>
              <span>{{ $t("navigationBar.myStores") }}</span>
            </router-link>
            <!-- <a class="navbar-item">
              <b-icon icon="settings" custom-size="default"></b-icon>
              <span>Settings</span>
            </a>
            <a class="navbar-item">
              <b-icon icon="email" custom-size="default"></b-icon>
              <span>Messages</span>
            </a> -->
            <hr class="navbar-divider" />
            <a class="navbar-item" @click="logout">
              <b-icon icon="logout" custom-size="default"></b-icon>
              <span>{{ $t("navigationBar.logout") }}</span>
            </a>
          </div>
        </nav-bar-menu>
      </div>
    </div>
  </nav>
</template>

<script>
  import {mapState} from "vuex";
  import NavBarMenu from "@/components/Navigation/NavBarMenu";
  import UserAvatar from "@/components/UserAvatar";

  import Vue from "vue";

  export default {
  name: "NavBar",
  components: {
    UserAvatar,
    NavBarMenu,
  },
  data() {
    return {
      timer: "",
      isMenuNavBarActive: false,
      rotateAnimation: false,
    };
  },

  mounted() {
    this.timerInterval = setInterval(() => {
      let countDownDate = new Date(this.$store.state.lastUpdate).getTime();
      let now = new Date().getTime();
      let distance = now - countDownDate;

      let hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((distance % (1000 * 60)) / 1000);

      this.timer = hours + ":" + minutes + ":" + seconds;
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.timerInterval);
  },
  computed: {
    isClosed: {
      get() {
        return this.$store.state.accountModule.activeCafe.isClosed
      },
      set(newValue) {
        this.$store.commit('accountModule/setIsClosed',  newValue)
      }
    },
    menuNavBarToggleIcon() {
      return this.isMenuNavBarActive ? "close" : "dots-vertical";
    },
    menuToggleMobileIcon() {
      return this.isAsideMobileExpanded ? "backburger" : "forwardburger";
    },
    ...mapState([
      "isNavBarVisible",
      "isAsideMobileExpanded",
      "userName",
      "cafeName",
    ]),
    socketConnection() {
      return this.$store.state.socket.isConnected;
    },
    collapsedSidebar() {
      return this.$store.state.collapsedSidebar;
    }
  },
  methods: {
    handleOpenCloseSwitch(value) {
      this.$store.dispatch('accountModule/isClosed', value)
      this.$store.state.accountModule.activeCafe.isClosed = value
    },
    menuToggleMobile() {
      this.$store.commit("asideMobileStateToggle");
    },
    menuNavBarToggle() {
      this.isMenuNavBarActive = !this.isMenuNavBarActive;
    },
    logout() {
      window.storage.clear();
      this.$buefy.snackbar.open({
        message: this.$t("navigationBar.logoutSuccessfully"),
        queue: false,
      });
      if(window.isElectron) {
        window.cafepayReload()
      } else {
        location.reload();
      }
    },
    refresh() {
      this.rotateAnimation = true;
      // this.$store.state.socket.isConnected = false;
      // Vue.prototype.$connect();
      if(window.isElectron) {
        window.cafepayReload()
      } else {
        location.reload();
      }
    },
    collapseSidebar() {
      if (window.matchMedia('(max-width: 1023px)').matches) {
        this.$store.commit('asideMobileStateToggle');
      } else {
        this.$store.state.collapsedSidebar = !this.$store.state.collapsedSidebar;
      }
    }
  },
  watch: {
    socketConnection(newValue) {
      if (newValue) {
        this.rotateAnimation = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>

.timer {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.8rem;
  
  &__time-spent {
    min-width: 33px;
    text-align: left;
    margin-inline-start: 0.5rem;
    margin-inline-end: 0.5rem;
  }

  &__text:first-child {
    display: inline;
    margin-inline-start: 1rem;
    margin-inline-end: 0.2rem;
    margin-top: 0;
    margin-bottom: 0;
  }

  &__refresh {
    margin: 0 0.5rem;

    &:hover {
      cursor: pointer;
    }
  }
}

.open-close {
  display: flex;
  align-items: center;
  height: 100%;
  margin-inline-start: 1rem;
}

.contact-support {
  font-size: 14px;
  &__number {
    letter-spacing: 1px;
  }
}
.rotating {
  animation: rotation 1s infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.navbar-sidebar-collapse {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2rem;

  background-color: #17191e;

  & .icon {
    transition: all 0.3s ease-in-out;
  }

  &:hover {
    cursor: pointer;
  }
}

.arrow-rotate {
  & .icon {
    transform: rotate(180deg);
  }
}

</style>