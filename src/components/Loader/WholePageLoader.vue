<template>
  <div class="loading">
    <h3>{{ message }}</h3>
    <vue-loading
      type="balls"
      color="#0e99c7"
      :size="{ width: '50px', height: '50px' }"
    ></vue-loading>
  </div>
</template>

<script>
import { VueLoading } from "vue-loading-template";
export default {
  components: {
    VueLoading,
  },
  props: {
    message: {
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.loading {
  position: fixed;
  background: rgba($color: #000000, $alpha: 0.9);
  left: 0;
  top: 0;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  margin-top: 49px;
  width: 100%;
  height: 100%;

  z-index: 100;

  & > h3 {
    color: #0e99c7;
    font-weight: 600;
    font-size: 1.3rem;
  }

  & > * {
    margin: 0 !important;
  }
}
</style>
