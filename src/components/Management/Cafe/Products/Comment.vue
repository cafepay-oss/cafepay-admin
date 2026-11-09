<template>
  <div>
    <section class="comment section">
      <card-component>
        <article class="media">
          <figure class="media-left">
            <p class="image is-64x64">
              <img
                src="data:image/jpeg;base64,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"
              />
            </p>
          </figure>
          <div class="media-content">
            <div class="content">
              <p>
                <small> {{ comment.date.toLocaleDateString("fa-IR") }} </small>
                <strong> {{ comment.staff.full_name }} </strong>
                {{ comment.comment }}
              </p>
            </div>
          </div>
        </article>
        <!-- reply -->
        <article class="media reply">
          <figure class="media-left">
            <p class="image is-64x64">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5vDXJL8dZkED97kAmMcWXiJuMCDAjUIqeuhWChcl6hVIXGM2_&s"
              />
            </p>
          </figure>
          <div class="media-content">
            <div class="field">
              <p class="control">
                <textarea
                  class="textarea"
                  placeholder="پاسخ خود را بنویسید"
                ></textarea>
              </p>
            </div>
            <nav class="level">
              <div class="level-left">
                <div class="level-item">
                  <a class="button is-info">ثبت نظر</a>
                </div>
              </div>
            </nav>
          </div>
        </article>
      </card-component>
    </section>
  </div>
</template>

<script>
import CardComponent from "@/components/CardComponent";

export default {
  name: "comment",
  components: {
    CardComponent,
  },
  props: {
    comment: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {};
  },
};
</script>

<style lang="sass" scoped>
.section-header
  text-align: center
  padding-top: 1rem
  h1
    font-size: 1.2rem

.section
  padding-top: 1rem

.media-content
  text-align: start
  display: flex
  flex-direction: column

.reply
  margin-inline-end: 4rem

.content
  p
    margin: 0 1rem
    display: flex
    flex-direction: column
    font-weight: 300

.textarea
  margin: 0 1rem
</style>