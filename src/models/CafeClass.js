export default class Cafe {
  constructor(rawData = {}) {
    this.id = rawData.pk ? rawData.pk : rawData.id; // :)))
    this.name = rawData.name

    this.address = ''
    this.location = ''
    this.description = ''

    this.menuPricesOn = true
    this.menuItemsOn = true
    this.emails = []
    this.phone = null
    this.isClosed = false 
    this.cafepayFee = 0
    this.feePayer = null

    this.overallRating = {}
    this.avatar = ''
    this.images = []

    this.offPercent = 0

    this.activeHours = ''
    this.CEO = ''

    this.waiters = []

    this.that = {}
  }

  setBasicInfo(data) {
    this.id = data.pk
    this.name = data.name
    this.description = data.description
    this.location = data.location
    this.address = data.address
    this.menuPricesOn = data.menu_prices_on
    this.menuItemsOn = data.menu_items_on
    this.emails = data.emails
    this.phone = data.phone
    this.instagram = data.instagram
    this.overallRating = data.overall_rating
    this.avatar = data.avatar
    this.images = data.shop_images
    this.cafepayFee = data.cafepay_fee
    this.feePayer = data.fee_payer
    this.isClosed = data.is_closed
    return this
  }

  setAddress(address) {
    this.address = address
    return this
  }

  setLocation(location) {
    this.location = location
    return this
  }

  setDescription(description) {
    this.description = description
    return this
  }

  setOffPercent(offPercent) {
    this.offPercent = offPercent
    return this
  }

  localUpdateCafe(payload) {
    this.that = JSON.parse(JSON.stringify(this))

    this.name = payload.name
    this.phone = payload.phone
    this.address = payload.address
    this.location = payload.location
    this.instagram = payload.instagram
    this.offPercent = payload.offPercent
    this.description = payload.description
    this.activeHours = payload.activeHours
  }

  localDrawbackUpdate() {
    this.name = this.that.name
    this.phone = this.that.phone
    this.address = this.that.address
    this.location = this.that.location
    this.instagram = this.that.instagram
    this.offPercent = this.that.offPercent
    this.description = this.that.description
    this.activeHours = this.that.activeHours
  }
}
