<template>
  <a-divider orientation="left">派单列表</a-divider>
  <!--<a-skeleton active v-if="true"/>-->
  <!-- 派单表格 -->
  <a-table
    :columns="columns"
    :scroll="{ x: 1500 }"
    :data-source="dataSource"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'status'">
        <a-badge
          :status="record.status === '待派单' ? 'processing' : record.status === '维修中' ? 'warning' : 'success'"
          v-bind:text="record.status"
        />
      </template>
    </template>
  </a-table>
</template>

<script>
import { defineComponent, ref } from 'vue'
import moment from 'moment'
import axios from 'axios'

export default defineComponent({
  setup () {
    // 表头结构
    const columns = [
      {
        title: '订单状态',
        dataIndex: 'status',
        key: 'status',
        width: '6%'
      },
      {
        title: '车牌',
        dataIndex: 'plate',
        key: 'plate',
        width: '6%'
      },
      {
        title: '报修原因',
        dataIndex: 'cause',
        key: 'cause',
        width: '6%'
      },
      {
        title: '详细描述',
        dataIndex: 'describe',
        key: 'describe',
        width: '8%'
      },
      {
        title: '终端型号',
        dataIndex: 'terminalDrive',
        key: 'terminalDrive',
        width: '5%'
      },
      {
        title: '车主',
        dataIndex: 'driversName',
        key: 'driversName',
        width: '5%'
      },
      {
        title: '公司',
        dataIndex: 'company',
        key: 'company',
        width: '8%'
      },
      {
        title: '联系电话',
        dataIndex: 'mobile',
        key: 'mobile',
        width: '8%'
      },
      {
        title: '报修人',
        dataIndex: 'username',
        key: 'username',
        width: '5%'
      },
      {
        title: '报修时间',
        key: 'submitOrderTime',
        width: '10%',
        customRender: ({ text }) => {
          return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : ''
        }
      }
    ]
    // 获取派单列表
    const dataSource = ref([])
    axios({
      method: 'get',
      url: 'api/get_order_list/',
      params: { index: 1 }
    })
      .then(res => {
        const { sendOrder } = res.data.data
        dataSource.value = sendOrder
      })
    return {
      columns,
      dataSource
    }
  }
})
</script>
