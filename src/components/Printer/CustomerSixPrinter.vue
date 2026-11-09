<template>
    <div :id="'printer-template-' + printTemplateData.uuid">
        <div style="text-align: center; font-size: 16px; font-weight: bold;
        border-bottom: 2px solid black; padding: 0.2cm;">{{
          $store.state.accountModule.activeCafe.name
        }}</div>
    <div style="background-color: #999999; text-align: center; font-size: 13px;
        border-bottom: 2px solid black; padding: 0.1cm;">{{printTemplateData.group}}</div>
    <div style="font-size: 10px; direction: rtl;
        border-bottom: 2px solid black; padding: 0.1cm;">
        <div style="display: flex; padding: 0.1cm;">
            <div style="width: 60%;">
                شماره: <span style="font-weight: bold; font-size: 12px;">{{
                  printTemplateData.table.id
                }}</span>
            </div>
            <div style="width: 40%;">
            کاربر: {{$store.state.accountModule.user.fullName}}
            </div>
        </div>
        <div style="display: flex; padding: 0.1cm;">
            <div style="width: 60%;">
                تاریخ: <span>{{new Date().toLocaleDateString("fa-IR")}}</span>
            </div>
            <div style="width: 40%;">
                ساعت: <span>{{new Date().toLocaleTimeString("fa-IR")}}</span>
            </div>
        </div>
    </div>
    <div style="text-align: center; font-size: 16px; font-weight: bold;
        padding: 0.2cm;">{{printTemplateData.table.name}}</div>
    <table style="direction: rtl; border-bottom: 2px solid black; font-size: 9px; border-collapse: collapse;">
        <tr>
            <th>
                عنوان
            </th>
            <th>
                تعداد
            </th>
            <th>
                فی
            </th>
            <th>
                قیمت کل
            </th>
        </tr>
        
        <tr :key="order.name" v-for="order in printTemplateData.data">
          <td>
              {{order.name}}
          </td>
          <td>
              {{order.number}}
          </td>
          <td>
              {{(order.price / order.number) | myCurrency2}}
          </td>
          <td>
              {{(order.price) | myCurrency2}}
          </td>
      </tr>
    </table>
    <div v-if="printTemplateData.address" style="background-color: #fff; font-size: 11px;
        text-align: right; direction: rtl; border-bottom: 2px solid black;
        padding: 0.1cm;">آدرس: {{ printTemplateData.address.address }}</div>
    <div style="background-color: #ffffff; text-align: center; font-size: 10px; font-weight: normal;
        border-bottom: 2px solid black; padding: 0.15cm;">مجموع: {{(sum) | myCurrency}}</div>
    <div v-if="printTemplateData.cafepayFee" style="background-color: #aaaaaa; text-align: center; font-size: 10px; font-weight: normal;
        border-bottom: 2px solid black; padding: 0.15cm;">خدمات: {{(sum * printTemplateData.cafepayFee) | myCurrency}}</div>
    <div v-if="printTemplateData.deliveryFee != null" style="background-color: #aaaaaa; text-align: center; font-size: 10px; font-weight: normal;
        border-bottom: 2px solid black; padding: 0.15cm;">هزینه ارسال: <template v-if="printTemplateData.deliveryFee">{{ printTemplateData.deliveryFee | myCurrency }}</template><template v-else>رایگان</template></div>
    <div style="background-color: #aaaaaa; text-align: center; font-size: 13px; font-weight: bold;
        border-bottom: 2px solid black; padding: 0.15cm;">جمع کل: {{(sum * (1 + printTemplateData.cafepayFee)) + (printTemplateData.deliveryFee ? printTemplateData.deliveryFee : 0) | myCurrency}}</div>
    <div style="background-color: hsl(0, 0%, 60%); text-align: center; font-size: 11px;
        padding: 0.1cm;">cafepay.app کافه پی</div>
    </div>
</template>

<script>
export default {
    computed: {
        sum(){
            let sum = 0;
            this.printTemplateData.data.forEach(order => {
                sum += order.price;
            });
            return sum
        }
    },
    props: ['printTemplateData']
}
</script>

<style>

</style>