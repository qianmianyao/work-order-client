<template>
  <a-input-search placeholder="输入车牌查找" v-model:value="search" enter-button @search="onSearch"/>
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
<!--      描述列表组件-->
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
              style="width: 200px"
              @change="handleChange"
            />
          </a-space>
        </a-descriptions-item>
        <a-descriptions-item label="报修详情描述">
          <a-textarea v-model:value="repairForm.describe" placeholder="输入内容" :rows="4" />
        </a-descriptions-item>
<!--        图片上传-->
        <a-descriptions-item label="详情图片">
          <a-upload v-model:file-list="fileList" action="https://www.mocky.io/v2/5cc8019d300000980a055e76">
            <a-button>
              <upload-outlined></upload-outlined>
              故障照片
            </a-button>
          </a-upload>
        </a-descriptions-item>
<!--        图片上传-->
      </a-descriptions>
<!--      描述列表组件-->
    </a-modal>
  </div>
<!--详细的对话框-->
  <div>
    <a-modal
      v-model:visible="infoVisible"
      title="详情"
      ok-text="确认"
      cancel-text="取消"
      :confirm-loading="confirmLoading"
      @ok="infoOk"
    >
      <a-descriptions
        title="车辆信息"
        layout="vertical"
        bordered
        :column="1"
      >
        <a-descriptions-item label="车牌">{{ infoList.plate }}</a-descriptions-item>
        <a-descriptions-item label="车主">{{ infoList.name }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ infoList.phone }}</a-descriptions-item>
        <a-descriptions-item label="所在组">{{ infoList.group }}</a-descriptions-item>
        <a-descriptions-item label="设备安装日期">{{ infoList.rowUpdateTime }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script>
import { EditOutlined, UnorderedListOutlined, UploadOutlined } from '@ant-design/icons-vue'
import { defineComponent, ref, reactive } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
export default defineComponent({
  components: {
    EditOutlined,
    UnorderedListOutlined,
    UploadOutlined
  },
  setup () {
    const search = ref('')
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

    // 对话框
    // 报修
    const repairsVisible = ref(false)
    const repairs = () => {
      repairsVisible.value = true
    }
    const repairsOk = () => {
      // 报修单提交请求
      axios({
        method: 'post',
        url: 'api/maintain/',
        headers: {
          Authorization: 'bearer ' + state.state.token
        },
        data: {
          plate: infoList.plate,
          cause: repairForm.cause,
          describe: repairForm.describe,
          terminal_drive: repairForm.terminal_drive
        }
      })
        .then(res => {
          confirmLoading.value = true
          if (res.data.code === 200) {
            confirmLoading.value = false
            repairsVisible.value = false
            message.success(res.data.message)
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
    // 详情
    const infoVisible = ref(false)
    const info = () => {
      infoVisible.value = true
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

    // TODO: 上传功能

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
      repairForm
    }
  }
})
</script>
