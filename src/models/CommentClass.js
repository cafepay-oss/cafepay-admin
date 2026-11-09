export default class Comment {
  constructor (rawData = {}) {
    this.id = rawData.pk
    this.comment = rawData.comment
    this.date = new Date(rawData.date)
    this.postId = rawData.post    
    this.staff = rawData.user

    this.answers = null
  }
}
