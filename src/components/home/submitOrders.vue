<template>
  <a-input-search placeholder="输入车牌查找" v-model:value="search" enter-button @search="onSearch(null)"/>
  <div v-if="cardShow">
    <a-divider style="margin-top: 20px" orientation="left">结果</a-divider>
    <a-card :loading="cardLoading" style="margin-top: 24px;">
      <template #actions>
        <edit-outlined key="edit" style="color: #1E90FF" @click="repairs"/>
        <unordered-list-outlined key="info" style="color: #008000" @click="historyInfo" />
      </template>
      <a-card-meta :title="infoList.plate" description="点击下方按钮查看车辆详细或者报修">
      </a-card-meta>
    </a-card>
    <a-divider style="margin-top: 24px" orientation="left">关联结果</a-divider>
    <span v-for="(value, i) of allPlateInfo" :key="value + i">
      <a-tag color="blue" @click="changeTag(value)"  style="margin-top: 10px">{{ value }}</a-tag>
    </span>
  </div>

  <a-empty v-if="!cardShow" description="暂无数据" style="margin-top: 80px;" />
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
      <a-collapse v-model:activeKey="activeKey" ghost>
        <template #expandIcon="{ isActive }">
          <caret-right-outlined :rotate="isActive ? 90 : 0" />
        </template>
        <a-collapse-panel key="1" header="车辆详情信息">
          <a-descriptions :column="1" size="small">
            <a-descriptions-item label="车牌">{{ infoList.plate }}</a-descriptions-item>
            <a-descriptions-item label="组名称">{{ infoList.group }}</a-descriptions-item>
            <a-descriptions-item label="单位名称">{{ infoList.company }}</a-descriptions-item>
            <a-descriptions-item label="车辆设备">{{ infoList.terminal_drive }}</a-descriptions-item>
          </a-descriptions>
        </a-collapse-panel>
        <a-collapse-panel key="2" header="报修操作">
          <a-descriptions :column="1" size="small" layout="vertical">
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
            <a-descriptions-item label="报修图片上传">
              <!--图片上传组件-->
              <a-upload :file-list="fileList" :remove="handleRemove" :before-upload="beforeUpload">
                <a-button style="width: 200px">
                  <upload-outlined></upload-outlined>
                  上传图片
                </a-button>
              </a-upload>
            </a-descriptions-item>
          </a-descriptions>
        </a-collapse-panel>
      </a-collapse>
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
            {{ item.status }}<a-divider type="vertical" />
            <alert-outlined style="color: #1E90FF" /> {{ item.cause }}<a-divider type="vertical" />
            <user-outlined style="color: #1E90FF" /> {{ item.username }}<a-divider type="vertical" />
            <clock-circle-outlined style="color: #1E90FF" /> {{ item.accomplishTime ? moment(item.accomplishTime).format('YYYY-MM-DD') : '没有完成时间' }}
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
  UploadOutlined,
  BarsOutlined,
  EditOutlined,
  UnorderedListOutlined,
  AlertOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CaretRightOutlined
} from '@ant-design/icons-vue'
import { defineComponent, ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { info, submitOrder, searchPlate } from '@/js/request/submitRequests'
export default defineComponent({
  components: {
    BarsOutlined,
    EditOutlined,
    UnorderedListOutlined,
    AlertOutlined,
    UserOutlined,
    ClockCircleOutlined,
    CaretRightOutlined,
    UploadOutlined
  },
  setup () {
    const search = ref('')
    // 车辆详情
    const infoList = reactive({
      plate: '',
      name: '',
      terminal_drive: '',
      phone: '',
      group: '',
      company: '',
      rowUpdateTime: ''
    })
    // 报修提交的数据
    const repairForm = reactive({
      cause: '',
      describe: ''
    })

    const cardShow = ref(false)
    const state = useStore()
    const router = useRouter()
    const allPlateInfo = ref()
    // 点击标签的回调
    const changeTag = (value) => {
      onSearch(value)
    }

    const cardLoading = ref(false)
    // 获取车辆详情
    const onSearch = (plate) => {
      if (search.value === 'eggs') {
        router.push('/about')
        return
      }
      if (search.value.length < 4) {
        message.warning('请至少输入4位字符')
      } else {
        let plateValue = search.value
        if (plate !== null) {
          plateValue = plate
        }
        cardLoading.value = true
        searchPlate(plateValue, cardShow, cardLoading, allPlateInfo, infoList, state, router)
      }
    }

    // 报修对话框
    // 图片上传
    const fileList = ref([])
    const beforeUpload = file => {
      fileList.value = [...fileList.value, file]
      return false
    }
    const repairsVisible = ref(false)
    const repairs = () => {
      if (state.state.groUp === 1 || state.state.groUp === 6 || state.state.groUp === 3) {
        repairsVisible.value = true
      } else {
        message.warning('您没有权限报修')
      }
    }
    const repairsOk = () => {
      const formData = new FormData()
      formData.append('plate', infoList.plate)
      formData.append('cause', repairForm.cause)
      formData.append('describe', repairForm.describe)
      fileList.value.forEach(file => {
        formData.append('file', file)
      })
      // 报修单提交请求
      submitOrder(formData, confirmLoading, repairsVisible, repairForm, fileList, state, router)
    }

    // 删除图片
    const handleRemove = file => {
      const index = fileList.value.indexOf(file)
      const newFileList = fileList.value.slice()
      newFileList.splice(index, 1)
      fileList.value = newFileList
    }

    const confirmLoading = ref(false)
    const vehicleHistory = ref()
    const infoVisible = ref(false)
    // 获取历史报修记录
    const historyInfo = () => {
      info(infoVisible, infoList, vehicleHistory, state)
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
        value: '天线故障',
        label: '天线故障'
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
    const activeKey = ref(['1'])
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
      historyInfo,
      infoOk,
      cause,
      handleChange,
      repairForm,
      vehicleHistory,
      moment,
      fileList,
      beforeUpload,
      handleRemove,
      allPlateInfo,
      changeTag,
      cardLoading,
      activeKey
    }
  }
})
</script>
