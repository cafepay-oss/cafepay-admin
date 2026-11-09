export default class PreOrder {
  constructor(rawData = {}) {
    this.id = rawData.pk;
    this.product = rawData.product;
    this.count = rawData.count;
    this.discount = rawData.discount;
    this.originalPrice = rawData.original_price;
    this.isStaff = rawData.is_staff;
    this.unitAmount = rawData.unit_amount;
    this.paymentInfo = rawData.payment_info;
    this.privateId = rawData.private_id;
    this.pbrId = rawData.private_id;
    this.sentToKitchen = rawData.sent_to_kitchen;
    this.preferredPaymentMethod = rawData.preferred_payment_method;

    this.pickupTime = rawData.pickup_time;
    this.accepted = rawData.is_accepted;
    this.isReady = rawData.is_ready;
    this.isDelivered = rawData.is_delivered;

  }
}