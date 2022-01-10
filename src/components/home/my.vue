<template>
  <a-skeleton v-if="!login" active/>
  <div v-if="login">
    <a-divider orientation="left">个人设置</a-divider>
    <a-card>
      <!--    下部的图标-->
      <template #actions>
        <edit-outlined style="color: #1E90FF" key="edit" @click="showModal" />
        <logout-outlined style="color: #DC143C" key="logout" @click="logout" />
      </template>
      <a-card-meta v-model:title="info.name" v-model:description="info.describe" />
      <!--    统计信息-->
      <a-row v-if="show" style="margin-top: 20px">
        <a-col :span="12">
          <a-statistic title="剩余订单" :value="100" style="margin-right: 50px" />
        </a-col>
        <a-col :span="12">
          <a-statistic title="完成订单" :value="20" />
        </a-col>
      </a-row>
    </a-card>

    <a-modal
      v-model:visible="visible"
      title="修改信息"
      ok-text="确认"
      cancel-text="取消"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
    >
      <p>修改密码</p>
      <a-input-password v-model:value="info.newPassword" placeholder="输入内容" />
    </a-modal>
    <a-divider v-if="show" orientation="left">接单列表</a-divider>
    <a-empty v-if="!show" style="margin-top: 20px" description="暂无数据"/>
    <!--  表格-->
    <a-button type="primary" @click="start" :disabled="!hasSelected" v-if="show">结算工单</a-button>
    <div style="margin-top: 20px">
      <a-table
        size="small"
        :row-selection="rowSelection"
        v-if="show"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="pagination"
        :scroll="{ x: 1500 }"
        @change="handleTableChange"
        :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)"
        class="ant-table-striped"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-badge
              :status="record.status === '已接单' ? 'warning' : 'success'"
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
        </template>
      </a-table>
    </div>
  </div>
</template>
<script>
import { EditOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import { defineComponent, ref, reactive, computed } from 'vue'
import axios from 'axios'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { notification, message } from 'ant-design-vue'
import qs from 'qs'
import moment from 'moment'

export default defineComponent({
  components: {
    EditOutlined,
    LogoutOutlined
  },
  setup () {
    const info = reactive({
      name: '',
      describe: '',
      newPassword: ''
    })
    const pageTotal = ref(1)
    const pagecurrent = ref(1)
    const state = useStore()
    const router = useRouter()
    const login = ref(false)

    // 判断身份
    const show = ref(false)
    // 获取 token 的值
    state.commit('decodeToken')
    // 如果身份不符合部分信息不展示
    if (state.state.groUp === 2) {
      show.value = true
    }

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
      current: pagecurrent.value,
      pageSize: 10
    }))

    // 测试数据
    const dataSource = ref([])

    // 历史记录api
    const getOrder = () => {
      if (state.state.groUp === 2) {
        axios({
          method: 'get',
          url: 'api/user/get_order/',
          headers: { Authorization: 'bearer ' + state.state.token },
          params: { index: 1 }
        }).then((res) => {
          const { orderList, orderCount } = res.data.data
          pageTotal.value = orderCount
          dataSource.value = orderList
        })
      }
    }
    getOrder()

    // 翻页方法
    const handleTableChange = (pag) => {
      const index = pag.current
      axios({
        method: 'get',
        url: 'api/user/get_order/',
        headers: { Authorization: 'bearer ' + state.state.token },
        params: { index: index }
      }).then((res) => {
        const { orderList } = res.data.data
        dataSource.value = orderList
        pagecurrent.value = index
      })
    }

    // 对话框属性
    const visible = ref(false)
    const confirmLoading = ref(false)
    const showModal = () => {
      visible.value = true
    }
    const logout = () => {
      state.commit('removeToken')
      router.push('/login')
      message.success('退出成功')
    }

    // 修改密码
    const handleOk = () => {
      axios({
        method: 'post',
        url: 'api/user/change_password/',
        headers: { Authorization: 'bearer ' + state.state.token },
        data: qs.stringify({
          password: info.newPassword
        })
      })
        .then((res) => {
          if (res.data.code === 200) {
            bubbleNotice(res.data.message)
            state.commit('removeToken')
            router.push('/login')
          }
        })
        .catch(err => {
          if (err.response.status === 401) {
            state.commit('removeToken')
            router.push('/login')
            message.error('登录失效，请重新登录')
          }
        })
      visible.value = false
    }

    // 气泡通知
    const bubbleNotice = (message) => {
      notification.open({
        message: '通知',
        description: message
      })
    }

    // 个人信息
    axios({
      method: 'get',
      url: 'api/user/info/',
      headers: { Authorization: 'bearer ' + state.state.token }
    })
      .then((res) => {
        const { data } = res.data
        info.name = data.username
        info.describe = '身份: ' + data.groupName + ' ' + '注册时间: ' + data.registrationDate
        login.value = true
      })
      .catch(err => {
        if (err.response.status === 401) {
          state.commit('removeToken')
          router.push('/login')
          bubbleNotice('登录失效，请重新登录')
        }
      })

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

    return {
      visible,
      confirmLoading,
      showModal,
      handleOk,
      info,
      columns,
      dataSource,
      pagination,
      handleTableChange,
      logout,
      show,
      login,
      rowSelection,
      start,
      hasSelected
    }
  }

})
</script>
<style scoped>
.ant-table-striped :deep(.table-striped) td {
  background-color: #fafafa;
}
</style>
