<template>
  <a-divider orientation="left">派单列表</a-divider>
  <!--<a-skeleton active v-if="true"/>-->
  <!-- 派单表格 -->
  <a-button type="primary" @click="start" :disabled="!hasSelected">分配维修人员</a-button>
  <div style="margin-top: 20px">
  <a-table
    :columns="columns"
    :scroll="{ x: 1500 }"
    :data-source="dataSource"
    :row-selection="rowSelection"
    :pagination="pagination"
    @change="handleTableChange"
    :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)"
    class="ant-table-striped"
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
  </div>
</template>

<script>
import { defineComponent, ref, reactive, computed } from 'vue'
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
        title: 'ID',
        dataIndex: 'key',
        key: 'key',
        width: '3%'
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
    const getOrder = () => {
      axios({
        method: 'get',
        url: 'api/get_order_list/',
        params: { index: 1 }
      })
        .then(res => {
          const { sendOrder, pageTotal } = res.data.data
          dataSource.value = sendOrder
          total.value = pageTotal
        })
    }
    getOrder()
    // 分配订单
    const states = reactive({
      selectedRowKeys: []
    })
    const hasSelected = computed(() => states.selectedRowKeys.length > 0)
    const start = () => {
      for (const id of states.selectedRowKeys) {
        console.log(id)
      }
    }
    const rowSelection = {
      onChange: selectedRowKeys => {
        states.selectedRowKeys = selectedRowKeys
        console.log(selectedRowKeys)
      },
      // 已完成的单不可再提交
      getCheckboxProps: record => ({
        disabled: record.status === '维修中',
        name: record.status
      }),
      columnWidth: '2%'
    }
    // 分页
    const total = ref(1)
    const pageCurrent = ref(1)
    const pagination = computed(() => ({
      total: total.value,
      current: pageCurrent.value,
      pageSize: 10
    }))
    // 翻页方法
    const handleTableChange = (page) => {
      const index = page.current
      axios({
        method: 'get',
        url: 'api/get_order_list/',
        params: { index: index }
      })
        .then(res => {
          const { sendOrder } = res.data.data
          pageCurrent.value = index
          dataSource.value = sendOrder
        })
    }

    return {
      columns,
      dataSource,
      rowSelection,
      hasSelected,
      start,
      pagination,
      handleTableChange
    }
  }
})
</script>
<style scoped>
.ant-table-striped :deep(.table-striped) td {
  background-color: #fafafa;
}
</style>
