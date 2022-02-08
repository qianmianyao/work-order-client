<template>
  <a-skeleton active v-if="!login"/>
  <div v-if="login">
    <!-- 派单表格 -->
    <a-button type="primary" @click="showModal" :disabled="!hasSelected" v-if="buttonShow">
      分配维修人员
<!--      分派对话框-->
    </a-button>
    <a-modal
      v-model:visible="visible"
      title="分配订单"
      @ok="handleOk"
      width="50%"
      ok-text="分配给他"
      cancelText="取消"
    >
      <a-textarea v-model:value="explain" placeholder="请填写派单说明" :rows="4" />
      <div v-for="({username}, index) of userList" :key="index" style="margin-top: 20px">
        <a-radio-group v-model:value="groupValue">
          <a-radio :value="username" :style="radioStyle">{{ username }}</a-radio>
        </a-radio-group>
      </div>
    </a-modal>
    <div style="margin-top: 20px">
      <a-table
        size="small"
        :columns="columns"
        :scroll="{ x: 1500 }"
        :data-source="dataSource"
        :row-selection="rowSelection"
        :pagination="pagination"
        @change="handleTableChange"
        :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)"
        class="ant-table-striped"
        :loading="loading"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-badge
              :status="record.status === '待派单' ? 'processing' : record.status === '维修中' ? 'warning' : 'success'"
              v-bind:text="record.status"
            />
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
      <div v-for="(item, index) of imgList" :key="index + item">
        <a-image :src="item" style="margin-top: 10px"/>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, computed } from 'vue'
import moment from 'moment'
import axios from 'axios'
import qs from 'qs'
import { message, Empty } from 'ant-design-vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default defineComponent({
  props: {
    status: undefined,
    buttonShow: undefined,
    row: undefined
  },
  setup (props) {
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
        title: '详情图片',
        key: 'img',
        width: '8%'
      },
      {
        title: '终端型号',
        dataIndex: 'terminalDrive',
        key: 'terminalDrive',
        width: '7%'
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
        params: { index: 1, status: props.status }
      })
        .then(res => {
          const { sendOrder, pageTotal } = res.data.data
          dataSource.value = sendOrder
          total.value = pageTotal
          login.value = true
        })
    }
    getOrder()
    // 分配订单
    const states = reactive({
      selectedRowKeys: []
    })
    const explain = ref('')
    const state = useStore()
    const router = useRouter()
    const hasSelected = computed(() => states.selectedRowKeys.length > 0)
    const start = () => {
      for (const id of states.selectedRowKeys) {
        axios({
          method: 'post',
          url: 'api/assign_order/',
          headers: { Authorization: 'bearer ' + state.state.token },
          data: qs.stringify({
            work_order_id: id,
            username: groupValue.value,
            explain: explain.value
          })
        })
          .then(res => {
            message.success(res.data.message, 2)
            getOrder()
          })
          .catch(err => {
            if (err.response.status === 401) {
              state.commit('removeToken')
              router.push('/login')
              message.error('登录失效，请重新登录')
            }
          })
      }
    }

    const rowSelection = {
      onChange: selectedRowKeys => {
        states.selectedRowKeys = selectedRowKeys
      },
      // 已完成的单不可再提交
      getCheckboxProps: record => ({
        disabled: props.row,
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
      loading.value = true
      const index = page.current
      axios({
        method: 'get',
        url: 'api/get_order_list/',
        params: { index: index, status: 1 }
      })
        .then(res => {
          loading.value = false
          const { sendOrder } = res.data.data
          pageCurrent.value = index
          dataSource.value = sendOrder
        })
    }
    // 翻页加载
    const loading = ref(false)
    // 分配订单弹窗
    const visible = ref(false)
    const showModal = () => {
      visible.value = true
    }
    const handleOk = () => {
      start()
      visible.value = false
    }
    // 获取所有的维修组用户
    const groupValue = ref(false)
    const userList = ref([])
    const radioStyle = reactive({
      display: 'flex',
      height: '30px',
      lineHeight: '30px'
    })
    axios({
      method: 'get',
      url: 'api/user/maintain_user/'
    })
      .then(res => {
        const { userList: user } = res.data.data
        userList.value = user
      })
    // 骨架屏
    const login = ref(false)
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
      dataSource,
      rowSelection,
      hasSelected,
      start,
      pagination,
      handleTableChange,
      loading,
      showModal,
      visible,
      handleOk,
      groupValue,
      radioStyle,
      userList,
      login,
      imgVisible,
      imgShowModal,
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      imgNull,
      imgHandleOk,
      explain,
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
