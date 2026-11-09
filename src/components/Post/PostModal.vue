<template>
  <div>
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ title }}</p>
      </header>

      <section class="modal-card-body">
        <b-field v-if="!edit">
          <b-upload v-model="postForm.image" drag-drop>
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

        <div class="tags" v-if="!edit">
          <span v-if="postForm.image" class="tag is-primary">
            <button
              class="delete is-small"
              type="button"
              @click="deleteDropFile()"
            ></button>
            {{ postForm.image.name }}
          </span>
        </div>

        <b-field :label="$t('posts.modal.description')">
          <b-input
            type="textarea"
            maxlength="300"
            v-model="postForm.description"
          ></b-input>
        </b-field>

        <b-field :label="$t('posts.modal.postType')">
          <b-select
            :placeholder="$t('primary.select')"
            class="selector"
            v-model="postForm.type"
            required
          >
            <option
              v-for="type in this.postTypes"
              :key="type.id"
              :value="type.id"
            >
              {{ type.title }}
            </option>
          </b-select>
        </b-field>
      </section>
      <footer class="modal-card-foot">
        <b-button
          @click="submitPost"
          :loading="this.$store.state.accountModule.localLoading"
          class="button is-info"
          >{{ $t("primary.submit") }}</b-button
        >
        <button class="button" type="button" @click="$parent.close()">
          {{ $t("primary.cancel") }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
import FilePicker from "@/components/FilePicker";

export default {
  components: {
    FilePicker,
  },
  data() {
    return {
      postForm: {},
      postTypes: [
        {
          id: 0,
          title: this.$t("posts.event"),
        },
        {
          id: 1,
          title: this.$t("posts.notification"),
        },
        {
          id: 2,
          title: this.$t("posts.discount"),
        },
        {
          id: 3,
          title: this.$t("posts.miscellaneous"),
        },
      ],
    };
  },
  props: {
    post: {
      type: Object,
      default: {},
    },
    edit: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    title() {
      if (this.edit) return this.$t("posts.modal.editPost");
      else return this.$t("posts.modal.newPost");
    },
  },
  methods: {
    submitPost() {
      if (this.edit) {
        this.$store.dispatch("postModule/editPost", this.postForm);
      } else {
        this.$store.dispatch("postModule/createPost", this.postForm);
      }
      this.$parent.close();
    },
    setImage(file) {
      this.postForm.image = file;
    },
    deleteDropFile() {
      this.postForm.image = null;
    },
  },
  mounted() {
    if (this.edit) {
      this.postForm = JSON.parse(JSON.stringify(this.post));
    } else {
      this.postForm = {
        image: null,
        description: "",
        type: "",
      };
    }
  },
};
</script>

<style scoped>
.button {
  margin: 0 0.5rem;
  box-shadow: 0 2px 2px #b8b8b8 !important;
}

.modal-card {
  min-width: 50vw;
}

.selector {
  text-align: start;
}
</style>
