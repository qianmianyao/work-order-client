<template>
  <a-skeleton v-if="!login" active/>
  <div v-if="login">
    <a-divider orientation="left">个人设置</a-divider>
    <a-card>
      <!--    下部的图标-->
      <template #actions>
        <edit-outlined style="color: #1E90FF" key="edit" @click="showModal" />
        <logout-outlined style="color: #DC143C" key="logout" @click="logout" />
        <FileExcelOutlined style="color: green" key="download" @click="download" />
      </template>
      <a-card-meta v-model:title="info.name" v-model:description="info.describe" />
      <!--    统计信息-->
      <a-row v-if="show" style="margin-top: 20px">
        <a-col :span="12">
          <a-statistic title="剩余订单" :value="pending" style="margin-right: 50px" />
        </a-col>
        <a-col :span="12">
          <a-statistic title="完成订单" :value="complete" />
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
    <a-empty style="margin-top: 20px" description="暂无数据"/>
    <a-modal v-model:visible="downloadShow" title="报表导出">
      <report />
    </a-modal>
  </div>
</template>
<script>
import { EditOutlined, LogoutOutlined, FileExcelOutlined } from '@ant-design/icons-vue'
import { defineComponent, ref, reactive } from 'vue'
import axios from 'axios'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { notification, message } from 'ant-design-vue'
import qs from 'qs'
import report from '@/components/home/childComponents/report'

export default defineComponent({
  components: {
    EditOutlined,
    LogoutOutlined,
    FileExcelOutlined,
    report
  },
  setup () {
    const info = reactive({
      name: '',
      describe: '',
      newPassword: ''
    })
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

    // 订单完成信息
    const complete = ref(0)
    const pending = ref(0)
    axios({
      method: 'get',
      url: 'api/user/order_count/',
      headers: { Authorization: 'bearer ' + state.state.token }
    })
      .then(res => {
        const { complete: c, pending: p } = res.data.data
        complete.value = c
        pending.value = p
      })

    // 报表导出按钮
    const downloadShow = ref(false)
    const download = () => {
      downloadShow.value = true
    }

    return {
      visible,
      confirmLoading,
      showModal,
      handleOk,
      info,
      logout,
      show,
      login,
      pending,
      complete,
      download,
      downloadShow
    }
  }

})
</script>
<style scoped>
.ant-table-striped :deep(.table-striped) td {
  background-color: #fafafa;
}
</style>
