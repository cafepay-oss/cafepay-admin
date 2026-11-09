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
                    <span>{{ $t("login.cafepay") }}</span>
                  </p>
                </header>

                <div v-if="localLoginEnabled" class="card-content" key="local-login">
                  <p class="mb-4">{{ $t('login.localAdministrator') }}</p>
                  <form @submit.prevent="submitLocalLogin">
                    <b-field :label="$t('login.username')">
                      <b-input v-model="localUsername" name="username" autocomplete="username" required />
                    </b-field>
                    <b-field :label="$t('login.password')">
                      <b-input v-model="localPassword" name="password" type="password" autocomplete="current-password" required />
                    </b-field>
                    <p v-if="localLoginError" class="has-text-danger" role="alert">{{ localLoginError }}</p>
                    <b-button native-type="submit" type="is-info" :loading="isLoading">
                      {{ $t('login.loginButton') }}
                    </b-button>
                  </form>
                </div>
                <div v-else class="card-content" key="phone-number">
                  <div class="STATE-send-phone-number" key="send-phone-number">
                    <form id="login-form" @submit.prevent="submitLoginForm">
                      <transition>
                        <b-field
                          v-if="state === 'phone-number'"
                          :label="$t('login.phoneNumberOrUsername')"
                          :type="{ 'is-danger': errors.phone_number}"
                          :message="errors.phone_number ? $t('login.wrongPhoneNumberOrUsername') : ''"
                        >
                          <b-input
                            placeholder="09..."
                            class="centered-input"
                            v-model="phoneNumber"
                            :maxlength="11"
                            @keyup.native.enter="sendPhoneNumber"
                          ></b-input>
                        </b-field>
                        
                        <span v-if="state === 'enter-code'">

                        <b-field
                          :label="$t('login.code')"
                          :type="{ 'is-danger': errors.code }"
                          :message="(errors.code) ? errors.code[0] : ''"
                        >
                          <b-input
                            placeholder="12345"
                            class="centered-input"
                            v-model="verificationCode"
                            @keyup.native.enter="verifyCode"
                          ></b-input>
                        </b-field>

                        <b-button 
                          :disabled="resendTime > 0"
                          class="send-again">
                          {{ $t('login.sendAgain') }} {{ (resendTime > 0) ? resendTime : '' }}
                        </b-button>
                        
                        </span>
                      </transition>

                      <hr />
                      <div class="field is-left">
                        <!---->
                        <div class="control">
                          <b-button
                            class="form-button"
                            v-if="state == 'enter-code'"
                            form="login-form"
                            :loading="isLoading"
                            @click="changePhoneNumber"
                            >{{ $t('login.changePhoneNumber') }}</b-button
                          >
                          <b-button
                            v-if="state == 'enter-code'"
                            class="form-button"
                            form="login-form"
                            :loading="isLoading"
                            type="is-info"
                            @click="verifyCode"
                            >{{ $t('login.loginButton') }}</b-button
                          >
                          <b-button
                            v-if="state == 'phone-number'"
                            class="form-button"
                            form="login-form"
                            :loading="isLoading"
                            type="is-info"
                            @click="sendPhoneNumber"
                            >{{ $t('login.submit') }}</b-button
                          >
                        </div>
                      </div>
                    </form>
                  </div>
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
    return {
      phoneNumber: "",
      localLoginEnabled: process.env.VUE_APP_CAFEPAY_LOCAL_RECOVERY === 'true',
      localUsername: "admin",
      localPassword: "",
      localLoginError: "",
      verificationCode: "",
      usernameCheck: true,
      passwordCheck: true,
      state: "phone-number",
      resendTime: 0
    };
  },
  methods: {
    submitLocalLogin() {
      this.localLoginError = "";
      this.$store.dispatch("accountModule/localLogin", {
        username: this.localUsername,
        password: this.localPassword
      }).catch(error => {
        this.localLoginError = error.response && error.response.data.detail
          ? error.response.data.detail : this.$t('login.pleaseCheckLoginInfo');
      });
    },
    redirectIfAuthenticated(){
      if(this.isAuthenticated){
        this.$router.replace('/')
      }
    },
    submitLoginForm(){
      // if(this.state === 'phone-number') {
      //   this.sendPhoneNumber()
      // } else if(this.state === 'enter-code') {
      //   this.verifyCode()
      // }
    },
    sendPhoneNumber() {
      this.state = "enter-code";
      this.$store.dispatch("accountModule/sendPhoneNumber", this.phoneNumber);
      this.runTimer();
    },
    verifyCode() {
      this.$store.dispatch("accountModule/login", {phone_number: this.phoneNumber, password: this.verificationCode});
    },
    changePhoneNumber() {
      this.$store.state.errors = []
      this.state = "phone-number";
    },
    runTimer() {
      this.resendTime = 120;
      let resendTimer = setInterval(() => {
        this.resendTime--;
        if (this.resendTime == 0) clearInterval(resendTimer);
      }, 1000)
    },
  },
  computed: {
    testVerificationCode() {
      return this.$store.state.accountModule.testVerificationCode  
    },
    errors() {
      return this.$store.state.errors;
    }
  },
  watch: {
    testVerificationCode(newValue, oldValue) { 
      if (newValue != '') {
        this.verificationCode = newValue
      }
    },
    errors(newValue, oldValue) {
      if (newValue.hasOwnProperty('phone_number')) {
          this.state = 'phone-number'
      }
    }
  },
  mounted() {
    this.redirectIfAuthenticated()
    const input = document.querySelector(".input");
    input.classList.add("modified-input");
  }
};
</script>

<style scoped lang="scss">

.is-fullheight{
  position: relative;
}

.button {
  margin-inline-start: 0.5rem;
}

.send-again {
  border: none !important;
  color: #008dca;
  margin-inline-start: -0.75em;
}
</style>
