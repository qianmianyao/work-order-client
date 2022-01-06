<template>
  <a-divider orientation="left">个人设置</a-divider>
  <a-card>
    <template #actions>
      <edit-outlined key="edit" @click="showModal" />
    </template>
    <a-card-meta v-model:title="info.name" v-model:description="info.describe">
    </a-card-meta>
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
<!--  <a-empty style="margin-top: 20px" description="暂无数据"/>-->
<!--  表格-->
  <a-table
    :columns="columns"
    :dataSource="dataSource"
    :pagination="pagination"
    :scroll="{ x: 1500, y: 300 }"
  >
  </a-table>
</template>
<script>
import { EditOutlined } from '@ant-design/icons-vue'
import { defineComponent, ref, reactive, computed } from 'vue'
import axios from 'axios'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { notification } from 'ant-design-vue'
import qs from 'qs'
export default defineComponent({
  components: {
    EditOutlined
  },
  setup () {
    const info = reactive({
      name: '',
      describe: '',
      newPassword: ''
    })
    const pageTotal = ref(1)
    const state = useStore()
    const router = useRouter()

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
        dataIndex: 'SubmitTime'
      }
    ]
    // 测试数据
    const dataSource = []

    // 分页
    const pagination = computed(() => ({
      total: pageTotal.value,
      current: 1,
      pageSize: 10
    }))

    // 请求历史记录
    axios({
      method: 'get',
      url: 'api/user/get_order/',
      headers: { Authorization: 'bearer ' + state.state.token },
      params: { index: 1 }
    })
      .then((res) => {
        // eslint-disable-next-line camelcase
        const { order_list, order_count } = res.data.data
        // eslint-disable-next-line camelcase
        pageTotal.value = order_count
        // eslint-disable-next-line camelcase
        console.log(order_list)
      })

    // 对话框属性
    const visible = ref(false)
    const confirmLoading = ref(false)
    const showModal = () => {
      visible.value = true
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
            bubbleNotice('登录失效，请重新登录')
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
    axios({
      method: 'get',
      url: 'api/user/info/',
      headers: { Authorization: 'bearer ' + state.state.token }
    })
      .then((res) => {
        const { data } = res.data
        info.name = data.UserName
        info.describe = '身份: ' + data.GroupName + ' ' + '注册时间: ' + data.RegistrationDate
      })
      .catch(err => {
        if (err.response.status === 401) {
          state.commit('removeToken')
          router.push('/login')
          bubbleNotice('登录失效，请重新登录')
        }
      })

    return {
      visible,
      confirmLoading,
      showModal,
      handleOk,
      info,
      dataSource,
      columns,
      pagination
    }
  }

})
</script>
