<template>
  <a-skeleton v-if="!login" active/>
  <div v-if="login">
    <a-divider orientation="left">身份信息</a-divider>
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
      @ok="statement('api/api/v1/export/maintain_excel/')"
      title="报表导出"
      ok-text="导出已完成订单(完整)"
      :ok-button-props="{ disabled: buttonOptional }"
    >
      <div>
        <a-descriptions bordered :column="1" layout="vertical" size="small">
          <a-descriptions-item label="选择时间">
            <a-range-picker
              :bordered="false"
              v-model:value="date"
              @change="getTime"
              allowClear
              size="middle"
              inputReadOnly
            />
          </a-descriptions-item>
          <!--选择分组-->
          <a-descriptions-item label="选择组">
            <a-select
              show-search
              v-model:value="groupValue"
              style="width: 180px"
              placeholder="输入关键词获取公司"
              :default-active-first-option="false"
              :show-arrow="true"
              :filter-option="false"
              :not-found-content="null"
              :options="groupData"
              @search="groupSearch"
              @change="groupChange"
            />
          </a-descriptions-item>
          <!--选择分组-->
          <a-descriptions-item label="导出方式">
            <a-button
              type="primary"
              @click="statement('api/api/v1/export/simple_all_excel/')"
              :disabled="buttonOptional"
            >
              导出全部订单(简洁)
            </a-button>
            <br>
            <a-button
              type="primary"
              style="margin-top: 10px"
              :disabled="buttonOptional"
              @click="statement('api/api/v1/export/all_excel/')"
            >导出全部订单(完整)</a-button>
            <br>
            <a-button
              type="primary"
              style="margin-top: 10px"
              :disabled="buttonOptional"
              @click="statement('api/api/v1/export/simple_maintain_excel/')"
            >导出已完成订单(简洁)</a-button>
          </a-descriptions-item>
        </a-descriptions>
      </div>
      <br/>
      <a-divider orientation="left" plain>说明</a-divider>
      <info-circle-outlined style="color: #FFA500; margin-top: 20px"/>
      请注意，底部的导出只能导出<span style="color: red">选定日期内</span>售后已经完成的数据，右侧的导出可以导出<span style="color: red">选定日期内</span>所有报修的数据(包含: 已提交，已派单，已完成)
      ，注意选定日期需要加 1， 如 14 号到 16 号的数据，选择日期请选择 14 号至 17 号。
    </a-modal>
<!--    维修用户已完成的订单-->
    <maintenance-record status="3" v-if="identity === 2 || identity === 6" :buttonShow="false" />
<!--    派单用户已经派发的订单-->
    <SendSingleRecord status="2" v-if="identity === 3" :buttonShow="false" :row="true"/>
<!--    客服已经报修的订单-->
    <SendSingleRecord status="1" v-if="identity === 1" :buttonShow="false" :row="true" />
  </div>
</template>
<script>
import { EditOutlined, LogoutOutlined, FileExcelOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'
import { defineComponent, ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import MaintenanceRecord from '@/components/home/childComponents/maintenanceRecord'
import SendSingleRecord from '@/components/home/childComponents/sendSingleRecord'
import {
  getUserInfo,
  getUserOrder,
  exportStatement,
  alterPassword,
  getAllGroupName
} from '@/js/request/myRequests'

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
    // 退出登录
    const logout = () => {
      state.commit('removeToken')
      router.push('/login')
      message.success('退出成功')
    }

    // 修改密码
    const handleOk = () => {
      alterPassword(state, info, router, visible)
    }

    // 获取用户信息请求
    getUserInfo(info, login, state, router)

    // 订单完成信息
    const complete = ref(0)
    const pending = ref(0)
    getUserOrder(state, complete, pending)

    // 报表导出按钮
    const downloadShow = ref(false)
    const window = () => {
      downloadShow.value = true
    }

    // 时间组件
    const date = ref()
    let start = ''
    let end = ''

    // 日期变化回调
    const buttonOptional = ref(true)
    const getTime = (_, dateString) => {
      start = dateString[0]
      end = dateString[1]
      buttonOptional.value = false
    }

    // 导出报表
    const group = ref()
    // 模糊查询所有组
    const groupValue = ref()
    const groupData = ref([])
    const groupDataAll = ref([])
    const groupSearch = val => {
      groupData.value = []
      if (val !== '') {
        getAllGroupName(val, groupDataAll, groupData)
      }
    }
    const groupChange = val => {
      groupValue.value = val
      getAllGroupName(val, groupDataAll, groupData)
      group.value = groupValue.value + '%'
    }

    // 订单导出请求
    const statement = (url) => {
      exportStatement(url, start, end, group)
      console.log(group.value)
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
      statement,
      state,
      identity,
      buttonOptional,
      groupData,
      groupSearch,
      groupValue,
      groupChange
    }
  }

})
</script>
<style scoped>
.ant-table-striped :deep(.table-striped) td {
  background-color: #fafafa;
}
</style>
