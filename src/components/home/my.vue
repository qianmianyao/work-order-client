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
          <a-statistic title="本年度接单总量" :value="100" style="margin-right: 50px" />
        </a-col>
        <a-col :span="12">
          <a-statistic title="当月接单总量" :value="20" />
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
    <a-divider orientation="left">接单列表</a-divider>
    <a-empty v-if="!show" style="margin-top: 20px" description="暂无数据"/>
    <!--  表格-->
    <a-table
      v-if="show"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="pagination"
      :scroll="{ x: 1500 }"
      @change="handleTableChange"
    >
    </a-table>
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

    // 表头结构
    const columns = [
      {
        title: '车牌',
        dataIndex: 'Plate',
        fixed: 'left',
        width: '8%'
      },
      {
        title: '车主',
        dataIndex: 'Name',
        width: '5%'
      },
      {
        title: '报修人员',
        dataIndex: 'Users',
        width: '6%'
      },
      {
        title: '报修时间',
        dataIndex: 'SubmitTime',
        width: '15%'
      },
      {
        title: '维修人员',
        dataIndex: 'OrderUser'
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
        info.name = data.UserName
        info.describe = '身份: ' + data.GroupName + ' ' + '注册时间: ' + data.RegistrationDate
        login.value = true
      })
      .catch(err => {
        if (err.response.status === 401) {
          state.commit('removeToken')
          router.push('/login')
          bubbleNotice('登录失效，请重新登录')
        }
      })

    // 判断身份
    const show = ref(false)
    // 获取 token 的值
    state.commit('decodeToken')
    // 如果身份不符合部分信息不展示
    if (state.state.groUp === 2) {
      show.value = true
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
      login
    }
  }

})
</script>
