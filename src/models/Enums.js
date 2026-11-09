const TableTokenTypes = Object.freeze({
    MENU_ONLY: "0",
    NORMAL: "1",
    SELF_PICKUP: "2",
    SELF_SERVICE: "3",
    PAYMENT_ONLY: "4"
})

const PrinterTypesEnum = Object.freeze({
    KITCHEN: "0",
    CUSTOMER: "1"
})

const PrinterTemplateTypesEnum = Object.freeze({
    KITCHEN: "0",
    CUSTOMER: "1",
    REPORT: "2"
})

const PrinterPolicies = Object.freeze({
    ONE_PAGE: "0",
    GROUPED: "1"
})

const PrinterWidthEnum = Object.freeze({
    SIX_CM: "6cm",
    SEVEN_CM: "7cm",
    EIGHT_CM: "8cm"
})

const NotificationsTypeEnum = Object.freeze({
    FULL_PAYMENT: "0",
    CHANGE_ORDER: "1",
    NEW_CUSTOMER: "2",
    PRE_ORDER: "3"
})

export default {
    TableTokenTypes,
    PrinterTypesEnum,
    PrinterPolicies,
    PrinterWidthEnum,
    PrinterTemplateTypesEnum,
    NotificationsTypeEnum
}