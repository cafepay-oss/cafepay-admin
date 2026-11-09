export default class Post {
  constructor(rawData = {}) {
    this.id = rawData.pk
    this.image = rawData.image
    this.description = rawData.description
    this.staff = rawData.staff.full_name
    this.date = new Date(rawData.date)

    this.type = rawData.type

    this.comments = []
    this.likes = []

    this.that = {}
  }

  setComments(comments) {
    this.comments = comments
  }

  setLikes(likes) {
    this.likes = likes
  }
  
  localUpdatePost(payload) {
    this.that = JSON.parse(JSON.stringify(this))

    this.type = payload.type
    this.description = payload.description
  }

  drawbackLocalUpdate() {
    this.type = this.that.type
    this.description = this.that.description
  }
}
