<template>
  <a-skeleton active v-if="!login"/>
  <div v-if="login">
    <a-button type="primary" @click="start" :disabled="!hasSelected" v-if="buttonShow">结算工单</a-button>
    <a-modal
      ok-text="确认"
      cancel-text="取消"
      v-model:visible="settlement"
      title="请填写完成订单说明"
      :confirm-loading="confirmLoading"
      @ok="settlementOk">
      <a-textarea v-model:value="explainValue" placeholder="请输入详细的报修完毕说明" :rows="4" />
    </a-modal>
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
      <div v-for="(item, index) of imgList" :key="index + '-' + item">
        <a-image :src="item" style="margin-top: 10px"/>
      </div>
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
  props: {
    status: undefined,
    buttonShow: undefined
  },
  setup (props) {
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
        width: '7%'
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
        width: '9%'
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
        title: '补充信息',
        dataIndex: 'sendExplain',
        key: 'sendExplain',
        width: '10%'
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

    // 数据
    const dataSource = ref([])
    const login = ref(false)
    // 待维修api
    const getOrder = () => {
      axios({
        method: 'get',
        url: 'api/user/get_order/',
        headers: { Authorization: 'bearer ' + state.state.token },
        params: { index: 1, status: props.status }
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
    // 获取选择的行的值
    const rowSelection = {
      onChange: selectedRowKeys => {
        states.selectedRowKeys = selectedRowKeys
      },
      // 已完成的单不可再提交
      getCheckboxProps: record => ({
        disabled: record.status === '已完成',
        name: record.status
      }),
      columnWidth: '2%'
    }
    const confirmLoading = ref(false) // loading
    const settlement = ref(false) // 弹出报修框
    const explainValue = ref('')
    const start = () => {
      settlement.value = true
    }
    const states = reactive({
      selectedRowKeys: []
    })
    const hasSelected = computed(() => states.selectedRowKeys.length > 0)
    const settlementOk = () => {
      confirmLoading.value = true
      for (const id of states.selectedRowKeys) {
        axios({
          method: 'post',
          url: 'api/complete_order/',
          headers: { Authorization: 'bearer ' + state.state.token },
          data: qs.stringify({
            id,
            explain: explainValue.value
          })
        })
          .then(res => {
            if (res.data.code === 200) {
              settlement.value = false
              confirmLoading.value = false
              message.success(res.data.message)
              getOrder()
              // 订单提交完毕后置空选中项，避免可以再次提交
              states.selectedRowKeys = []
            }
          })
      }
    }

    // 图片显示
    const imgList = ref([])
    const imgVisible = ref(false)
    const imgNull = ref(false)
    const imgHandleOk = () => {
      imgVisible.value = false
      imgList.value = []
    }
    // 获取图片的 id
    const imgShowModal = (imgId) => {
      imgVisible.value = true
      axios.get('api/img_list/', { params: { work_order_id: imgId } }).then(res => {
        const { img_id: imgId } = res.data.data
        if (imgId.length === 0) {
          imgNull.value = true
        } else {
          for (const imgUrl of imgId) {
            imgNull.value = false
            imgList.value.push('api/return_img/' + imgUrl.id)
          }
        }
      }
      )
    }
    return {
      columns,
      rowSelection,
      hasSelected,
      start,
      settlement,
      settlementOk,
      explainValue,
      handleTableChange,
      confirmLoading,
      pagination,
      dataSource,
      loading,
      login,
      imgShowModal,
      imgHandleOk,
      imgVisible,
      imgNull,
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      imgList
    }
  }
})
</script>

<style scoped>
.ant-table-striped :deep(.table-striped) td {
  background-color: #fafafa;
}
</style>
