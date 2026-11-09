<template>
    <div :id="'printer-template-' + printTemplateData.uuid">
        <div style="text-align: center; font-size: 16px; font-weight: bold;
        border-bottom: 2px solid black; padding: 0.2cm;">{{
          $store.state.accountModule.activeCafe.name
        }}</div>
    <div style="background-color: #999999; text-align: center; font-size: 13px;
        border-bottom: 2px solid black; padding: 0.1cm;">گزارش فروش</div>
    <div style="font-size: 10px; direction: rtl;
        border-bottom: 2px solid black; padding: 0.1cm;">
        <div style="display: flex; padding: 0.1cm;">
            <div style="width: 50%;">
                از: <span>{{ printTemplateData.data.reportConfig.startDate}}</span>
            </div>
            <div style="width: 50%;">
                تا: <span>{{ printTemplateData.data.reportConfig.endDate}}</span>
            </div>
        </div>
        <div style="display: flex; padding: 0.1cm;">
            <div style="width: 50%;">
                از: <span>{{ printTemplateData.data.reportConfig.startTime}}</span>
            </div>
            <div style="width: 50%;">
                تا: <span>{{ printTemplateData.data.reportConfig.endTime}}</span>
            </div>
        </div>
    </div>
    <table style="direction: rtl; border-bottom: 2px solid black; font-size: 9px; border-collapse: collapse;">
        <tr>
            <th>
                عنوان
            </th>
            <th>
                تعداد
            </th>
            <th>
                پرداخت شده
            </th>
            <th>
                آنلاین
            </th>
        </tr>

        <tr :key="productSalesData.product.id" v-for="productSalesData in printTemplateData.data.productSalesDataArray">
          <td>
              {{ productSalesData.product.name }}
          </td>
          <td>
              {{ productSalesData.payment_info.total_count }}
          </td>
          <td>
              {{ (productSalesData.payment_info.net_payed_amount) | myCurrency2 }}
          </td>
          <td>
              {{ (productSalesData.payment_info.payed_amount_online) | myCurrency2 }}
          </td>
      </tr>
    </table>
    <div style="font-size: 9px; padding: 5px; text-align: right">
        تعداد کل: {{ printTemplateData.data.overallData.total_count }} عدد <br />
        پرداخت شده کارتخوان: {{ printTemplateData.data.overallData.payed_amount_pos | myCurrency }} <br />
        پرداخت شده نقد: {{ printTemplateData.data.overallData.payed_amount_cash | myCurrency }} <br />
        پرداخت شده آنلاین: {{ printTemplateData.data.overallData.payed_amount_online | myCurrency }} <br />
        مجموع پرداخهت شده: {{ printTemplateData.data.overallData.net_payed_amount | myCurrency }} <br />
        بازپرداخت: {{ printTemplateData.data.overallData.refund_amount | myCurrency }} <br />
        مبلغ کل: {{ printTemplateData.data.overallData.total_amount | myCurrency }} <br />
    </div>
    <div style="background-color: hsl(0, 0%, 60%); text-align: center; font-size: 11px;
        padding: 0.1cm;">cafepay.app کافه پی</div>
    </div>
</template>

<script>
export default {
    props: ['printTemplateData']
}
</script>

<style>

</style>