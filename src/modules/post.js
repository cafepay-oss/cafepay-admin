import mixin from "../mixin";

import { ToastProgrammatic as Toast } from "buefy";

import Post from "../models/PostClass";
import Comment from "../models/CommentClass";

export default {
  namespaced: true,
  // -----------------------------------------------------------------
  state: {
    posts: [], // cafe posts

    localLoading: false, // loading mode

    isPostModalActive: false
  },
  // -----------------------------------------------------------------
  getters: {},
  // -----------------------------------------------------------------
  mutations: {
    setCafePosts(state, postsData) {
      let posts = [];

      postsData.forEach(post => {
        posts.unshift(new Post(post));
      });

      posts = posts.sort((a, b) => b.id - a.id);

      state.posts = posts;
    },
    setPostComments(state, [commentsData, postId]) {
      let comments = [];

      commentsData.forEach(comment => {
        comments.unshift(new Comment(comment));
      });

      comments = comments.sort((a, b) => b.id - a.id);

      state.posts.find(pst => pst.id == postId).comments = comments;
    }
  },
  // -----------------------------------------------------------------
  actions: {
    /* get cafe posts and mutate cafe posts state */
    getCafePosts(context) {
      context.state.localLoading = false; // active loading mode

      mixin.methods
        .request({
          url: "api/v1/cafe/" + context.rootState.accountModule.activeCafe.id + "/post/list/",
          method: "GET"
        })
        .then(res => {
          context.state.localLoading = false; // deactive loading mode

          context.commit("setCafePosts", res.data);
        })
        .catch(err => {
          context.state.localLoading = false; // deactive loading mode

          context.dispatch("getCafePosts");
        });
    },
    /* Create Post 
		
			*	send multiparted request 
			* if it was okay we add a new post to posts list from request response
			* else if it was not okay toast it
			* todo: add sending status 
		*/
    createPost: (context, post) => {
      context.state.localLoading = true; // active loading mode

      let formData = new FormData();
      formData.append("image", post.image);
      formData.append("description", post.description);
      formData.append("type", post.type);

      mixin.methods.request({
          url: "api/v1/cafe/" + context.rootState.accountModule.activeCafe.id + "/post/add/",
          method: "POST",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          }
        })
        .then(function(res) {
          context.state.localLoading = false; // deactive loading mode
          context.state.posts.unshift(new Post(res.data));
        })
        .catch(function(err) {
          context.state.localLoading = false; // deactive loading mode
          Toast.open({
            queue: false,
            message: "مشکلی در ارسال پست به وجود آمد",
            type: "is-danger"
          });
        });
    },
    /* Delete Post

			* delete coresponding post localy if it was not okay drawback changes
		*/
    deletePost(context, post) {
      context.state.localLoading = true; // active loading mode

      let temp = context.state.posts.find(pst => pst.id == post.id);
      let index = context.state.posts.findIndex(pst => pst.id == post.id);

      context.state.posts = context.state.posts.filter(
        pst => pst.id != post.id
      );

      mixin.methods
        .request({
          url: "api/v1/post/" + post.id + "/",
          method: "DELETE",
          data: post
        })
        .then(res => {
          context.state.localLoading = false; // deactive loading mode

          Toast.open({ queue: false, message: "پست با موفقیت حذف شد", type: "is-success" });
        })
        .catch(err => {
          context.state.localLoading = false; // deactive loading mode

          context.state.posts.splice(index, 0, temp);

          Toast.open({
            queue: false,
            message: "مشکلی در حذف پست به وجود آمد",
            type: "is-danger"
          });
        });
    },
    /* EditPost 
		
			* edit coresponding post localy if it was not okay drawback changes
		*/
    editPost(context, post) {
      context.state.localLoading = true; // active loading mode

      let temp = context.state.posts.find(pst => pst.id == post.id);
      temp.localUpdatePost(post);

      mixin.methods
        .request({
          url: "api/v1/post/" + post.id + "/",
          method: "PUT",
          data: post
        })
        .then(res => {
          context.state.localLoading = false; // deactive loading mode

          Toast.open({
            queue: false,
            message: "پست با موفقیت ویرایش شد",
            type: "is-success"
          });
        })
        .catch(err => {
          context.state.localLoading = false; // deactive loading mode

          temp.drawbackLocalUpdate();

          Toast.open({
            queue: false,
            message: "مشکلی در ویرایش پست به وجود آمد",
            type: "is-danger"
          });
        });
    },
    /* Get Posts Data
		
			* get posts comments
			* todo: get posts likes
		*/
    getPostData(context, postId) {
      context.state.localLoading = false; // active loading mode

      mixin.methods
        .request({
          url: "api/v1/post/" + postId + "/comment/list/",
          method: "GET"
        })
        .then(res => {
          context.state.localLoading = false; // deactive loading mode

          context.commit("setPostComments", [res.data, postId]);
        })
        .catch(err => {
          context.state.localLoading = false; // deactive loading mode

          context.dispatch("getPostData", postId);
        });
    }
  }
};