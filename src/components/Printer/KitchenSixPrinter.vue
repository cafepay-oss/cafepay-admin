<template>
    <div :id="'printer-template-' + printTemplateData.uuid">
        <div style="text-align: center; font-size: 16px; font-weight: bold;
        border-bottom: 2px solid black; padding: 0.2cm;">{{
          $store.state.accountModule.activeCafe.name
        }}</div>
    <div style="background-color: #bbbbbb; text-align: center; font-size: 13px;
        border-bottom: 2px solid black; padding: 0.1cm;">{{ printTemplateData.group }}</div>
    <div style="font-size: 10px; direction: rtl;
        border-bottom: 2px solid black; padding: 0.1cm;">
        <div style="display: flex; padding: 0.1cm;">
            <div style="width: 60%;">
                شماره: <span style="font-weight: bold; font-size: 12px;">{{
                  printTemplateData.table.id
                }}</span>
            </div>
            <div style="width: 40%;">
            کاربر: {{ $store.state.accountModule.user.fullName }}
            </div>
        </div>
        <div style="display: flex; padding: 0.1cm;">
            <div style="width: 60%;">
                تاریخ: <span>{{ new Date().toLocaleDateString("fa-IR") }}</span>
            </div>
            <div style="width: 40%;">
                ساعت: <span>{{ new Date().toLocaleTimeString("fa-IR") }}</span>
            </div>
        </div>
    </div>
    <div style="text-align: center; font-size: 16px; font-weight: bold;
        padding: 0.2cm;">{{ printTemplateData.table.name }}</div>
    <table style="direction: rtl; border-bottom: 2px solid black; font-size: 9px; border-collapse: collapse;">
        <tr>
            <th>
                عنوان
            </th>
            <th>
                تعداد
            </th>
        </tr>

        <tr :key="order.name" v-for="order in printTemplateData.data">
            <td>
                {{order.name}}
            </td>
            <td>
                {{order.number}}
            </td>
        </tr>
    </table>
        <div v-if="printTemplateData.table.description" style="background-color: #fff; font-size: 11px;
            text-align: right; direction: rtl;
            padding: 0.1cm;">توضیحات: {{ printTemplateData.table.description }}</div>
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