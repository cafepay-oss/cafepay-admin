<template>
  <div class="guide">
    <div class="guide__context" :class="{ show: showGuide }">
      <div class="color-description" v-for="color in colors" :key="color.id">
        <div class="color-description__color" :class="color.color" aria-hidden="true"></div>
        <b-icon class="color-description__symbol" :icon="color.icon" size="is-small" aria-hidden="true" />
        <div class="color-description__description" :title="color.description">
          {{ color.label }}
        </div>
      </div>
    </div>
    <button type="button" class="guide__toggle" :aria-expanded="showGuide" @click="changeShowGuide()">
      <b-icon :icon="showGuide ? 'chevron-up' : 'chevron-down'" size="is-small" />
      <span>راهنمای وضعیت میزها</span>
    </button>
  </div>
</template>

<script>
export default {
  name: "ColorsGuide",
  data() {
    return {
      showGuide: true,
      colors: [
        {
          id: 0,
          color: "green",
          icon: "check-circle-outline",
          label: "پرداخت کامل و ارسال به آشپزخانه",
          description:
            "وضعیت این میز نیاز به بررسی ندارد، همه محصولات پرداختشان کامل شده و به آشپزخانه ارسال شده اند.",
        },
        {
          id: 1,
          color: "blue",
          icon: "plus-circle-outline",
          label: "سفارش جدید، در انتظار پرداخت",
          description:
            "محصول جدیدی به این میز اضافه شده اما پرداختی روی آن صورت نگرفته است.",
        },
        {
          id: 2,
          color: "yellow",
          icon: "clock-outline",
          label: "پرداخت کامل، آماده ارسال",
          description:
            "پرداخت یک محصول سر این کامل شده و آماده ارسال به آشپزخانه است.",
        },
        {
          id: 3,
          color: "red",
          icon: "alert-outline",
          label: "ارسال به آشپزخانه، پرداخت ناقص",
          description:
            "محصولی از این میز ارسال به آشپزخانه شده اما پرداخت آن ناقص است.",
        },
      ],
    };
  },
  methods: {
    changeShowGuide() {
      this.showGuide = !this.showGuide;
      window.storage.setItem("showCafeManagementGuide", this.showGuide);
    },
  },
  created() {
    if (window.storage.getItem("showCafeManagementGuide") === null) {
      this.showGuide = true;
    } else {
      this.showGuide =
        window.storage.getItem("showCafeManagementGuide") == "true";
    }
  },
};
</script>

<style lang="scss" scoped>
.guide {
  display: flex;
  align-items: start;
  justify-content: space-between;
  width: 100%;
  margin: -1.5rem 0rem 1rem;
  background-color: #fff;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;

  &__context {
    transform: scaleY(0);
    height: 0;
  }

  &__icon {
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      cursor: pointer;
    }
  }
}

.color-description {
  display: flex;
  align-items: center;

  &__color {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    border-radius: 100%;
    margin-inline-end: .5rem;
  }

  &__symbol {
    flex-shrink: 0;
    margin-inline-end: .5rem;
    color: #243447;
  }
}

.guide-icon {
  transition: all 0.3s ease;
}

.rotate {
  transform: rotate(180deg);
}

.show {
  transform: scaleY(1);
  height: unset;
}
</style>