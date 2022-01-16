<template>
  <a-skeleton active v-if="!login"/>
  <div v-if="login">
    <a-button type="primary" @click="start" :disabled="!hasSelected">结算工单</a-button>
    <div style="margin-top: 20px">
      <a-table
        size="small"
        :row-selection="rowSelection"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="pagination"
        :scroll="{ x: 1500 }"
        @change="handleTableChange"
        :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)"
        class="ant-table-striped"
        :loading="loading"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-badge
              :status="record.status === '维修中' ? 'warning' : 'success'"
              v-bind:text="record.status"
            />
          </template>
          <template v-else-if="column.key === 'accomplishTime'">
            <span v-if="record.accomplishTime === null">还未完成</span>
          </template>
          <template v-else-if="column.key === 'describe'">
            <a-collapse ghost>
              <a-collapse-panel key="1" header="查看详情">
                <p>{{ record.describe }}</p>
              </a-collapse-panel>
            </a-collapse>
          </template>
          <template v-else-if="column.key === 'img'">
            <a-button :mask="true" type="link" @click="imgShowModal(record.key)">点击展示图片</a-button>
          </template>
        </template>
      </a-table>
    </div>
    <a-modal
      v-model:visible="imgVisible"
      title="图片详情"
      ok-text="确认"
      cancel-text="取消"
      @ok="imgHandleOk"
      @cancel="imgHandleOk"
    >
      <a-empty v-if="imgNull" :image="simpleImage" />
      <a-image :src="imgUrl"></a-image>
    </a-modal>
  </div>
</template>

<script>
import { defineComponent, computed, reactive, ref } from 'vue'
import { useStore } from 'vuex'
import moment from 'moment'
import axios from 'axios'
import { Empty, message } from 'ant-design-vue'
import qs from 'qs'
export default defineComponent({
  setup () {
    const pageTotal = ref(1)
    const pageCurrent = ref(1)
    const state = useStore()

    // 表头结构
    const columns = [
      {
        title: '订单状态',
        dataIndex: 'status',
        key: 'status',
        width: '6%',
        fixed: 'left'
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
        width: '8%'
      },
      {
        title: '所属公司',
        dataIndex: 'company',
        key: 'company',
        width: '8%'
      },
      {
        title: '车主',
        dataIndex: 'driversName',
        key: 'driversName',
        width: '5%'
      },
      {
        title: '联系电话',
        dataIndex: 'mobile',
        key: 'mobile',
        width: '8%'
      },
      {
        title: '维修设备',
        dataIndex: 'terminalDrive',
        key: 'terminalDrive',
        width: '5%'
      },
      {
        title: '报修原因',
        dataIndex: 'cause',
        key: 'cause',
        width: '5%'
      },
      {
        title: '报修详情描述',
        dataIndex: 'describe',
        key: 'describe',
        width: '8%'
      },
      {
        title: '详情图片',
        key: 'img',
        width: '8%'
      },
      {
        title: '派单人',
        dataIndex: 'sendOrderUserId',
        key: 'sendOrderUserId',
        width: '5%'
      },
      {
        title: '订单完成时间',
        dataIndex: 'accomplishTime',
        key: 'accomplishTime',
        width: '13%',
        customRender: ({ text }) => {
          return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : ''
        }
      }
    ]

    // 分页
    const pagination = computed(() => ({
      total: pageTotal.value,
      current: pageCurrent.value,
      pageSize: 10
    }))

    // 测试数据
    const dataSource = ref([])
    const login = ref(false)
    // 历史记录api
    const getOrder = () => {
      axios({
        method: 'get',
        url: 'api/user/get_order/',
        headers: { Authorization: 'bearer ' + state.state.token },
        params: { index: 1, status: 2 }
      }).then((res) => {
        const { orderList, orderCount } = res.data.data
        pageTotal.value = orderCount
        dataSource.value = orderList
        login.value = true
      })
    }
    getOrder()

    // 翻页方法
    const loading = ref(false)
    const handleTableChange = (pag) => {
      loading.value = true
      const index = pag.current
      axios({
        method: 'get',
        url: 'api/user/get_order/',
        headers: { Authorization: 'bearer ' + state.state.token },
        params: { index: index }
      }).then((res) => {
        loading.value = true
        const { orderList } = res.data.data
        dataSource.value = orderList
        pageCurrent.value = index
      })
    }

    // 订单完成
    const states = reactive({
      selectedRowKeys: []
    })
    const hasSelected = computed(() => states.selectedRowKeys.length > 0)
    const start = () => {
      for (const id of states.selectedRowKeys) {
        completeOrder(id)
        getOrder()
      }
    }
    const rowSelection = {
      onChange: (selectedRowKeys) => {
        states.selectedRowKeys = selectedRowKeys
      },
      // 已完成的单不可再提交
      getCheckboxProps: record => ({
        disabled: record.status === '已完成',
        name: record.status
      }),
      columnWidth: '2%'
    }

    // 确认订单接口
    const completeOrder = id => {
      axios({
        method: 'post',
        url: 'api/complete_order/',
        headers: { Authorization: 'bearer ' + state.state.token },
        data: qs.stringify({
          id
        })
      })
        .then(res => {
          if (res.data.code === 200) {
            message.success(res.data.message)
          }
        })
    }

    // 图片显示
    const imgVisible = ref(false)
    const imgUrl = ref('')
    const imgNull = ref(false)
    const imgHandleOk = () => {
      imgUrl.value = ''
      imgVisible.value = false
    }
    const imgShowModal = (imgId) => {
      imgVisible.value = true
      axios({
        method: 'get',
        url: `api/return_img/${imgId}`
      })
        .then(res => {
          imgUrl.value = `api/return_img/${imgId}`
          imgNull.value = false
        }).catch(err => {
          if (err.response.status === 404) {
            imgNull.value = true
          }
        })
    }
    return {
      columns,
      rowSelection,
      hasSelected,
      start,
      handleTableChange,
      pagination,
      dataSource,
      loading,
      login,
      imgShowModal,
      imgHandleOk,
      imgVisible,
      imgUrl,
      imgNull,
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE
    }
  }
})
</script>

<style scoped>
.ant-table-striped :deep(.table-striped) td {
  background-color: #fafafa;
}
</style>
