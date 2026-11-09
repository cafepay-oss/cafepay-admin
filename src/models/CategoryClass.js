export default class Category {
  constructor(rawData = {}) {
    this.id = rawData.pk
    this.is_delete = rawData.is_delete
    this.name = rawData.title
    this.staff = rawData.staff
    this.description = rawData.description

    this.products = []

  }

  updateCategory(data) {
    this.name = data.title
    this.staff = data.staff
    this.description = data.description
  }

  setProducts(products) {
    this.products = products
  }
}
