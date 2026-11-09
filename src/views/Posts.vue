<template>
  <div>
    <hero-bar>
      {{ $t("posts.posts") }}
      <b-button
        :loading="isLoading"
        class="button is-info"
        slot="right"
        @click="newPost"
        >{{ $t("posts.newPost") }}</b-button
      >
    </hero-bar>

    <modal-box
      :is-active="isModalActive"
      trash-object-name="پست"
      @confirm="trashConfirm"
      @cancel="trashCancel"
    />

    <b-modal
      :active.sync="$store.state.postModule.isPostModalActive"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <post-modal :post="post" :edit="edit" />
    </b-modal>

    <div class="posts-list">
      <post-card
        v-for="post in this.$store.state.postModule.posts"
        :key="post.id"
        :post="post"
        @edit="editPost(post)"
        @delete="deletePost(post)"
      />
    </div>
  </div>
</template>

<script>
import HeroBar from "@/components/HeroBar";
import PostModal from "@/components/Post/PostModal";
import PostCard from "@/components/Post/PostCard";
import ModalBox from "@/components/ModalBox";

export default {
  name: "Posts",
  components: {
    HeroBar,
    PostModal,
    ModalBox,
    PostCard,
  },
  data() {
    return {
      isPostModalActive: false,
      edit: false,
      post: {},
      isModalActive: false,
    };
  },
  methods: {
    newPost() {
      this.edit = false;
      this.$store.state.postModule.isPostModalActive = true;
    },
    editPost(post) {
      this.post = post;
      this.edit = true;
      this.$store.state.postModule.isPostModalActive = true;
    },
    deletePost(post) {
      this.post = post;
      this.isModalActive = true;
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
    this.$store.dispatch("postModule/getCafePosts");
  },
};
</script>

<style scoped>
.button {
  margin: 0 1rem;
  box-shadow: 0 2px 2px #b8b8b8 !important;
}

.posts-list {
  display: grid;
  margin: 1rem 2rem;
  grid-template-columns: repeat(2, 1fr);
}
</style>
