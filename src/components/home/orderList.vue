<template>
  <a-divider orientation="left">派单列表</a-divider>
<!--  <a-skeleton active v-if="true"/>-->
  <!-- 派单表格 -->
  <a-table
    :columns="columns"
    :scroll="{ x: 1000 }"
    :data-source="dataSource"
    :pagination="pagination"
    @change="handleTableChange"
  >
    <template #bodyCell="{columns}">
      <template v-if="columns.key === 'assignOrder'">
        <a>分派任务</a>
      </template>
    </template>
  </a-table>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
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
        width: '8%'
      },
      {
        title: '车牌',
        dataIndex: 'plate',
        key: 'plate',
        width: '8%'
      },
      {
        title: '报修原因',
        dataIndex: 'cause',
        key: 'cause',
        width: '8%'
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
        width: '8%'
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
        width: '8%'
      },
      {
        title: '报修时间',
        key: 'submitOrderTime',
        width: '8%',
        customRender: ({ text }) => {
          return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : ''
        }
      },
      {
        title: '派单',
        key: 'assignOrder'
      }
    ]
    // 获取派单列表
    const dataSource = ref([])
    const pageCurrent = ref(1)
    const pageTotal = ref(1)
    axios({
      method: 'get',
      url: 'api/get_order_list/',
      params: { index: 1 }
    })
      .then(res => {
        const { sendOrder } = res.data.data
        console.log(sendOrder)
        dataSource.value = sendOrder
        // pageTotal.value = page
      })
    // 分页
    const pagination = computed(() => ({
      total: pageTotal.value,
      current: pageCurrent.value,
      pageSize: 10
    }))
    // 翻页方法
    const handleTableChange = (pag) => {
      const index = pag.current
      axios({
        method: 'get',
        url: 'api/get_order_list/',
        params: { index: index }
      }).then((res) => {
        const { pageTotal } = res.data.data
        console.log(pageTotal)
        dataSource.value = pageTotal
        pageCurrent.value = index
      })
    }
    return {
      columns,
      dataSource,
      handleTableChange,
      pagination
    }
  }
})
</script>
