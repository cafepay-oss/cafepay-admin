<template>
  <div class="post">
    <img
      v-if="!post.image"
      class="post__img"
      src="https://images.unsplash.com/photo-1561043433-e622fe868b6a?ixlib=rb-1.2.1&dpr=1&auto=format&fit=crop&w=525&q=60"
      alt
    />
    <img v-else class="post__img" :src="post.image" alt />

    <p class="post__type">{{ postTypes[post.type] }}</p>

    <p class="post__writer">{{ post.staff }}</p>

    <p class="post__pub_date">
      {{ post.date.toLocaleDateString("fa-IR") }}
    </p>

    <p class="post__description">{{ post.description }}</p>

    <b-tooltip
      class="buttons post__edit"
      :label="$t('primary.edit')"
      type="is-info"
    >
      <button @click="editPost" class="button is-small is-info">
        <b-icon icon="account-edit" size="is-small" />
      </button>
    </b-tooltip>

    <b-tooltip
      class="buttons post__delete"
      :label="$t('primary.delete')"
      type="is-danger"
    >
      <button @click.prevent="deletePost" class="button is-small is-danger">
        <b-icon icon="trash-can" size="is-small" />
      </button>
    </b-tooltip>

    <!-- <div class="post__likes">
      <p>250</p>
      <img
        src="../../../public/img/icons/heart.png"
        alt="Smiley face"
        height="25"
        width="25"
      />
    </div>

    <div class="post__comments">
      <p>42</p>
      <img
        src="../../../public/img/icons/comment.png"
        alt="Smiley face"
        height="25"
        width="25"
      />
    </div> -->
  </div>
</template>

<script>
export default {
  name: "postCard",
  data() {
    return {
      postTypes: {
        0: this.$t("posts.event"),
        1: this.$t("posts.discount"),
        2: this.$t("posts.notification"),
        3: this.$t("posts.miscellaneous"),
      },
    };
  },
  props: {
    post: {
      type: Object,
      default: {},
    },
  },
  methods: {
    editPost() {
      this.$emit("edit");
    },
    deletePost() {
      this.$emit("delete");
    },
  },
};
</script>

<style lang="sass" scoped>
.post
  margin: 1rem
  padding: 0 0 0.3rem 0
  background-color: #fff
  box-shadow: 0 1px 2px #b8b8b8 !important
  border-radius: 5px

  display: grid

  grid-template-columns: 25% 25% 25% 25%
  grid-template-rows: 15rem

  grid-row-gap: 0.5rem

  &__img
    object-fit: cover
    width: 100%
    height: 100%
    grid-column: 1 / 5
    grid-row: 1 / span 1

  &__type
    padding: 0.5rem 1rem 0.1rem 1rem
    margin: 0 0.2rem
    border-bottom-left-radius: 5px
    border-bottom-right-radius: 5px
    background-color: #1a9fbd
    box-shadow: 0 1px 2px #b8b8b8 !important

    color: #fff

    grid-column: 1 / 2
    grid-row: 1 / 2
    align-self: start
    justify-self: start

  &__writer
    padding: 0 .5rem
    font-size: 0.9rem
    font-weight: 400

    grid-column: 1 / 3
    align-self: start
    justify-self: start

  &__pub_date
    padding: 0 .5rem
    font-size: 0.9rem
    font-weight: 400

    grid-column: 3 / 5
    align-self: start
    justify-self: start

  &__description
    padding: 0 .5rem 0.5rem 0.4rem
    font-size: 1rem
    font-weight: 300

    grid-column: 1 / 5
    align-self: center
    justify-self: start

  &__edit
    margin: 0 0.3rem 0.5rem 0.3rem
    width: 25px
    height: 25px
    justify-self: end
    align-self: end
    grid-column: 3 / 4

  &__delete
    margin: 0 0.3rem 0.5rem 0.3rem
    width: 25px
    height: 25px
    justify-self: start
    align-self: end
    grid-column: 4 / 5

  &__likes
    justify-self: end
    align-self: end

    margin: 0 0.3rem 0.5rem 0.3rem

    display: flex

    & p
      margin: 0 .4rem

  &__comments
    justify-self: start
    align-self: end

    margin: 0 0.3rem 0.5rem 0.3rem

    display: flex
    & p
      margin: 0 .4rem

    &__icon
      width: 25px
      height: 25px
</style>
