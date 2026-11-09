<template>
  <div v-if="post" class="container">
    <div class="post">
      <img
        v-if="!post.image"
        class="post__img"
        src="https://images.unsplash.com/photo-1561043433-e622fe868b6a?ixlib=rb-1.2.1&dpr=1&auto=format&fit=crop&w=525&q=60"
        alt
      />
      <img v-else class="post__img" :src="post.image" alt />

      <p class="post__type">{{ postTypes[post.type] }}</p>

      <p class="post__writer">
        <span>نویسنده:</span>
        {{ post.staff }}
      </p>

      <p class="post__pub_date">
        <span>تاریخ انتشار:</span>
        {{ post.date.toLocaleDateString("fa-IR") }}
      </p>

      <p class="post__description">
        <span>متن:</span>
        {{ post.description }}
      </p>

      <div class="post__likes">
        <p>250</p>
        <img
          src="../../public/img/icons/heart.png"
          alt="Smiley face"
          height="25"
          width="25"
        />
      </div>

      <b-tabs position="is-left" class="post__comments">
        <b-tab-item :label="commentsTab"></b-tab-item>
      </b-tabs>

      <comment
        class="post__comment"
        v-for="comment in post.comments"
        :key="comment.id"
        :comment="comment"
      />
    </div>
  </div>
</template>

<script>
import Comment from "../components/Management/Cafe/Products/Comment";

export default {
  name: "postCard",
  components: {
    Comment
  },
  data() {
    return {
      postTypes: {
        0: "رویداد",
        1: "اطلاعیه",
        2: "تخفیف",
        3: "متفرقه"
      },
      post: null
    };
  },
  computed: {
    commentsTab() {
      return `نظرات ${this.post.comments.length}`;
    }
  },
  mounted() {
    let interval = setInterval(() => {
      if (this.$store.state.postModule.posts.length > 0) {
        this.post = this.$store.state.postModule.posts.find(
          pst => pst.id == this.$attrs.id
        );
        clearInterval(interval);
      }
    }, 500);

    if (!this.$store.state.postModule.posts.length > 0) {
      this.$store.dispatch("postModule/getCafePosts");
    }

    this.$store.dispatch("postModule/getPostData", this.$attrs.id);
  }
};
</script>

<style lang="sass" scoped>

.container
  width: 100%
  display: grid
  justify-items: center

.post
  margin: 1rem
  padding: 0 0 0.3rem 0
  background-color: #fff
  box-shadow: 0 1px 2px #b8b8b8 !important
  border-radius: 5px

  padding: 1rem
  width: 70%

  display: grid

  grid-template-columns: 25% 25% 25% 25%
  grid-template-rows: 15rem

  grid-row-gap: 0.5rem

  &__img
    object-fit: cover
    width: 100%
    height: 100%
    border-radius: 5px
    box-shadow: 2px 2px 5px #b8b8b8
    grid-column: 1 / 5
    grid-row: 1 / span 1

  &__type
    padding: 0.5rem 1rem 0.1rem 1rem
    margin: -1rem 0.2rem
    border-bottom-left-radius: 5px
    border-bottom-right-radius: 5px
    background-color: #ff8c00
    box-shadow: 0 1px 2px #b8b8b8 !important

    color: #fff

    grid-column: 1 / 2
    grid-row: 1 / 2
    align-self: start
    justify-self: start

  &__writer
    padding: 0 .5rem
    font-size: 0.8rem
    font-weight: 300

    grid-column: 1 / 3
    align-self: start
    justify-self: start

  &__pub_date
    padding: 0 .5rem
    font-size: 0.8rem
    font-weight: 300

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

  &__likes
    grid-column: 1 / 5
    justify-self: end
    align-self: end

    margin: 0 0.3rem 0.5rem 0.6rem

    display: flex

    & p
      margin: 0 .4rem

  &__comments
    grid-column: 1 / 5
    margin-bottom: 0

  &__comment
    grid-column: 1 / 5
    padding: 0
    margin: -2.2rem -1rem
</style>
