<template>
  <a-input-search placeholder="输入车牌查找" v-model:value="search" enter-button @search="onSearch"/>
  <a-divider orientation="left">结果</a-divider>
  <a-card v-if="cardShow" style="margin-top: 24px;">
    <template #actions>
      <edit-outlined key="edit" style="color: #1E90FF" @click="repairs"/>
      <unordered-list-outlined key="info" style="color: #008000" @click="info" />
    </template>
    <a-card-meta :title="infoList.plate" description="点击下方按钮查看车辆详细或者报修">
    </a-card-meta>
  </a-card>
  <a-empty v-if="!cardShow" description="暂无数据" style="margin-top: 60px;" />
<!--报修的对话框-->
  <div>
    <a-modal
      v-model:visible="repairsVisible"
      title="报修"
      :confirm-loading="confirmLoading"
      ok-text="提交"
      cancel-text="取消"
      @ok="repairsOk"
    >
      <!--报修提交组件-->
      <a-descriptions
        title="车辆信息"
        layout="vertical"
        bordered
        :column="1"
      >
        <a-descriptions-item label="车牌">{{ infoList.plate }}</a-descriptions-item>
        <a-descriptions-item label="单位名称">{{ infoList.group }}</a-descriptions-item>
        <a-descriptions-item label="车辆设备">
          <a-input v-model:value="repairForm.terminal_drive" placeholder="车辆的终端型号" />
        </a-descriptions-item>
        <a-descriptions-item label="报修原因">
          <a-space>
            <a-select
              placeholder="选择报修原因"
              :options="cause"
              @change="handleChange"
            />
          </a-space>
        </a-descriptions-item>
        <a-descriptions-item label="报修详情描述">
          <a-textarea v-model:value="repairForm.describe" placeholder="请输入车辆故障的具体原因以及故障所在地" :rows="4" />
        </a-descriptions-item>
        <a-descriptions-item label="详情图片">
          <!--图片上传组件-->
          <a-upload-dragger :file-list="fileList" :before-upload="beforeUpload">
            <p class="ant-upload-drag-icon" style="margin-top: 12px">
              <inbox-outlined/>
            </p>
            <p class="ant-upload-text">上传需要维修车辆的相关照片</p>
            <p class="ant-upload-hint" style="margin-bottom: 12px">请注意，只支持一张照片上传</p>
          </a-upload-dragger>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
<!--车辆历史维修记录对话框-->
  <div>
    <a-modal
      v-model:visible="infoVisible"
      title="详情"
      ok-text="确认"
      cancel-text="取消"
      :confirm-loading="confirmLoading"
      @ok="infoOk"
    >
      <!--车辆历史维修记录-->
      <a-list size="small" bordered :data-source="vehicleHistory">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-badge :status="statusColor(item.status)" />{{ item.status }}<a-divider type="vertical" />
            <alert-outlined style="color: #1E90FF" /> {{ item.cause }}<a-divider type="vertical" />
            <user-outlined style="color: #1E90FF" /> {{ item.username }}
            <span v-if="item.accomplishTime !== null" >
              <a-divider type="vertical" />
              <clock-circle-outlined style="color: #1E90FF" /> {{
                item.accomplishTime ? moment(item.accomplishTime).format('YYYY-MM-DD') : ''
              }}</span>
          </a-list-item>
        </template>
        <template #header>
          <h4><bars-outlined style="color: #1E90FF" /> 当前车辆维修历史记录</h4>
        </template>
      </a-list>
    </a-modal>
  </div>
</template>

<script>
import moment from 'moment'
import {
  InboxOutlined,
  BarsOutlined,
  AlertOutlined,
  EditOutlined,
  UnorderedListOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'
import { defineComponent, ref, reactive } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
export default defineComponent({
  components: {
    InboxOutlined,
    BarsOutlined,
    AlertOutlined,
    ClockCircleOutlined,
    UserOutlined,
    EditOutlined,
    UnorderedListOutlined
  },
  setup () {
    const search = ref('')
    // 车辆详情
    const infoList = reactive({
      plate: '',
      name: '',
      phone: '',
      group: '',
      rowUpdateTime: ''
    })
    // 报修提交的数据
    const repairForm = reactive({
      cause: '',
      describe: '',
      terminal_drive: ''
    })

    const cardShow = ref(false)
    const state = useStore()
    const router = useRouter()

    // 获取车辆详情
    const onSearch = () => {
      axios({
        method: 'get',
        url: 'api/search/',
        headers: { Authorization: 'bearer ' + state.state.token },
        params: { plate: search.value }
      })
        .then(res => {
          if (res.data.code === 404) {
            message.warning(res.data.message)
          } else if (res.data.code === 401) {
            message.warning('抱歉，维修人员无法搜索车辆')
          } else {
            const { data } = res.data
            infoList.plate = data.plate
            infoList.name = data.name
            infoList.phone = data.phone
            infoList.group = data.group
            infoList.rowUpdateTime = data.rowUpdateTime
            cardShow.value = true
          }
        })
        .catch(err => {
          if (err.response.status === 401) {
            state.commit('removeToken')
            router.push('/login')
            message.error('登录失效，请重新登录')
          }
        })
    }

    // 报修对话框
    const fileList = ref([])
    const beforeUpload = file => {
      fileList.value = [file]
      return false
    }
    const repairsVisible = ref(false)
    const repairs = () => {
      repairsVisible.value = true
    }
    const repairsOk = () => {
      const formData = new FormData()
      formData.append('plate', infoList.plate)
      formData.append('cause', repairForm.cause)
      formData.append('describe', repairForm.describe)
      formData.append('terminal_drive', repairForm.terminal_drive)
      fileList.value.forEach(file => {
        formData.append('file', file)
      })
      // 报修单提交请求
      axios({
        method: 'post',
        url: 'api/maintain/',
        headers: {
          Authorization: 'bearer ' + state.state.token,
          'Content-Type': 'multipart/form-data'
        },
        data: formData
      })
        .then(res => {
          confirmLoading.value = true
          if (res.data.code === 200) {
            confirmLoading.value = false
            repairsVisible.value = false
            message.success(res.data.message)
            repairForm.describe = ''
            repairForm.terminal_drive = ''
            fileList.value = []
          }
        })
        .catch(err => {
          if (err.response.status === 401) {
            state.commit('removeToken')
            router.push('/login')
            message.error('登录失效，请重新登录')
          }
        })
    }

    const confirmLoading = ref(false)
    // 车辆报修历史记录
    const color = ref('')
    const statusColor = (status) => {
      if (status === '已完成') {
        color.value = 'success'
        return color.value
      } else if (status === '维修中') {
        color.value = 'warning'
        return color.value
      }
    }
    const vehicleHistory = ref([])
    const infoVisible = ref(false)
    const info = () => {
      infoVisible.value = true
      axios({
        method: 'get',
        url: 'api/vehicle_history/',
        headers: { Authorization: 'bearer ' + state.state.token },
        params: { plate: infoList.plate }
      })
        .then(res => {
          vehicleHistory.value = res.data.data.history
        })
    }

    const infoOk = () => {
      infoVisible.value = false
    }

    // 报修原因
    const cause = reactive([
      {
        value: '不上线',
        label: '不上线'
      },
      {
        value: '不导航',
        label: '不导航'
      },
      {
        value: '无线故障',
        label: '无线故障'
      },
      {
        value: 'SD卡故障',
        label: 'SD卡故障'
      },
      {
        value: '客户主动要求检测',
        label: '4G主机问题'
      },
      {
        value: '报停重新开通',
        label: '报停重新开通'
      },
      {
        value: '摄像头故障',
        label: '摄像头故障'
      },
      {
        value: '主动报修',
        label: '主动报修'
      },
      {
        value: '行驶记录仪问题',
        label: '行驶记录仪问题'
      },
      {
        value: '北斗模块故障',
        label: '北斗模块故障'
      },
      {
        value: '其他',
        label: '其他'
      }
    ])

    // 获取选项的值
    const handleChange = value => {
      repairForm.cause = value
    }
    return {
      onSearch,
      search,
      infoList,
      cardShow,
      repairsVisible,
      infoVisible,
      repairs,
      repairsOk,
      confirmLoading,
      info,
      infoOk,
      cause,
      handleChange,
      repairForm,
      vehicleHistory,
      moment,
      statusColor,
      fileList,
      beforeUpload
    }
  }
})
</script>
