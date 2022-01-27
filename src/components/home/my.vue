<template>
  <a-skeleton v-if="!login" active/>
  <div v-if="login">
    <a-divider orientation="left">个人设置</a-divider>
    <a-card>
      <!--    下部的图标-->
      <template #actions>
        <edit-outlined style="color: #1E90FF" key="edit" @click="showModal" />
        <logout-outlined style="color: #DC143C" key="logout" @click="logout" />
        <FileExcelOutlined style="color: green" key="download" @click="window" />
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
      :confirm-loading="confirmLoading"
      @ok="handleOk"
    >
      <p>修改密码</p>
      <a-input-password v-model:value="info.newPassword" placeholder="输入内容" />
<!--报表导出-->
    </a-modal>
    <a-modal
      v-model:visible="downloadShow"
      @ok="exportStatement('api/statement/')"
      title="报表导出"
      :confirm-loading="downLoading"
      :ok-text="exportText"
    >
      <div>
        <a-range-picker
          :bordered="false"
          v-model:value="date"
          @change="getTime"
          allowClear
          size="middle"
          inputReadOnly
        />
        <a-button type="dashed" style="float: right" @click="exportStatement('api/all_statement/')">导出全部报表</a-button>
      </div>
      <br/>
      <a-divider orientation="left" plain>说明</a-divider>
      <info-circle-outlined style="color: #FFA500; margin-top: 20px"/>
      请注意，底部的导出只能导出售后已经结单完毕的数据，右侧的导出可以导出所有报修的数据
    </a-modal>
<!--    维修用户已完成的订单-->
    <maintenance-record status="3" v-if="identity === 2" :buttonShow="false" />
<!--    派单用户已经派发的订单-->
    <SendSingleRecord status="2" v-if="identity === 3" :buttonShow="false" :row="true"/>
<!--    客服已经报修的订单-->
    <SendSingleRecord status="1" v-if="identity === 1" :buttonShow="false" :row="true" />
    <a-empty v-if="identity === 6" style="margin-top: 100px" />
  </div>
</template>
<script>
import { EditOutlined, LogoutOutlined, FileExcelOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'
import { defineComponent, ref, reactive } from 'vue'
import axios from 'axios'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { notification, message } from 'ant-design-vue'
import qs from 'qs'
import fileDownload from 'js-file-download'
import MaintenanceRecord from '@/components/home/childComponents/maintenanceRecord'
import SendSingleRecord from '@/components/home/childComponents/sendSingleRecord'

export default defineComponent({
  components: {
    EditOutlined,
    LogoutOutlined,
    FileExcelOutlined,
    InfoCircleOutlined,
    MaintenanceRecord,
    SendSingleRecord
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
    const window = () => {
      downloadShow.value = true
    }
    // 时间组件
    const date = ref()
    let start = ''
    let end = ''
    const getTime = (_, dateString) => {
      start = dateString[0]
      end = dateString[1]
    }

    const exportText = ref('导出')
    const downLoading = ref(false)

    // 导出报表
    const exportStatement = (url) => {
      downLoading.value = true
      exportText.value = '导出中...'
      axios({
        method: 'get',
        url: url,
        responseType: 'blob',
        params: {
          start_time: start,
          end_time: end
        }
      }).then(res => {
        const disposition = res.headers['content-disposition'].split('/')
        const fileName = decodeURIComponent(disposition[disposition.length - 1])
        fileDownload(res.data, fileName)
        downLoading.value = false
        message.success(fileName + '导出成功')
        exportText.value = '导出完毕'
        setTimeout(() => {
          exportText.value = '导出'
        }, 2000)
      })
        .catch(err => {
          if (err.response.status === 500) {
            message.error('文件导出失败')
            exportText.value = '导出'
            downLoading.value = false
          }
        })
    }

    // 身份
    const identity = ref(state.state.groUp)

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
      window,
      downloadShow,
      getTime,
      date,
      exportStatement,
      downLoading,
      exportText,
      state,
      identity
    }
  }

})
</script>
<style scoped>
.ant-table-striped :deep(.table-striped) td {
  background-color: #fafafa;
}
</style>
