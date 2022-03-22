<template>
  <a-result v-if="resultShow" title="当前订单还未完成，结算订单后才可以查看详情" />

  <a-descriptions v-if="resultShow1" :title="plateInfo.plate + ': 车辆维修历史详情'" bordered>
    <a-descriptions-item label="车牌">{{ plateInfo.plate }}</a-descriptions-item>
    <a-descriptions-item label="报修原因">{{ plateInfo.cause }}</a-descriptions-item>
    <a-descriptions-item label="报修详情">
      <a @click="infoModal('报修详情', plateInfo.describe)">点击查看详情</a>
    </a-descriptions-item>
    <a-descriptions-item label="终端型号">{{ plateInfo.terminalDrive }}</a-descriptions-item>
    <a-descriptions-item label="终端ID">{{ plateInfo.terminalID }}</a-descriptions-item>
    <a-descriptions-item label="设备安装时间">{{ plateInfo.vehicleMadeDate }}</a-descriptions-item>
    <a-descriptions-item label="车主名称">{{ plateInfo.driversName }}</a-descriptions-item>
    <a-descriptions-item label="车主联系方式">{{ plateInfo.mobile }}</a-descriptions-item>
    <a-descriptions-item label="车辆所属公司">{{ plateInfo.company }}</a-descriptions-item>
    <a-descriptions-item label="报修人员">{{ plateInfo.username }}</a-descriptions-item>
    <a-descriptions-item label="报修提交时间">{{ moment(plateInfo.submitOrderTime).format('YYYY-MM-DD HH:mm:ss') }}</a-descriptions-item>
    <a-descriptions-item label="派单人员">{{ plateInfo.sendOrderUserId }}</a-descriptions-item>
    <a-descriptions-item label="派单人员处理意见">
      <a @click="infoModal('派单人员处理意见', plateInfo.sendExplain)">点击查看详情</a>
    </a-descriptions-item>
    <a-descriptions-item label="接单人员">{{ plateInfo.orderUserId }}</a-descriptions-item>
    <a-descriptions-item label="接单时间">{{ moment(plateInfo.orderTime).format('YYYY-MM-DD HH:mm:ss') }}</a-descriptions-item>
    <a-descriptions-item label="订单完成说明">{{ plateInfo.completeStateDescription }}</a-descriptions-item>
    <a-descriptions-item label="订单完成时间">{{ moment(plateInfo.accomplishTime).format('YYYY-MM-DD HH:mm:ss') }}</a-descriptions-item>
    <a-descriptions-item label="报修详情图片">
      <a @click="imgShowModal(plateInfo.id, null)">点击查看图片</a>
    </a-descriptions-item>
    <a-descriptions-item label="维修结算图片">
      <a @click="imgShowModal(null, plateInfo.completePicture)">点击查看图片</a>
    </a-descriptions-item>
  </a-descriptions>
  <a-button type="link" @click="backup" style="margin-top: 20px"><double-left-outlined />返回订单搜索</a-button>
  <a-modal
    v-model:visible="imgVisible"
    title="图片详情"
    ok-text="确认"
    cancel-text="取消"
    @ok="imgHandleOk"
    @cancel="imgHandleOk"
  >
    <a-empty v-if="imgNull" :image="simpleImage" />
    <div v-for="(item, index) of imgList" :key="index + '-' + item">
      <a-image :src="item" style="margin-top: 10px"/>
    </div>
  </a-modal>
</template>

<script>
import { defineComponent, ref, h } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import moment from 'moment'
import { DoubleLeftOutlined } from '@ant-design/icons-vue'
import { Empty, Modal } from 'ant-design-vue'
export default defineComponent({
  components: {
    DoubleLeftOutlined
  },
  setup () {
    const router = useRouter()
    // 结果展示
    const resultShow = ref(false)
    const resultShow1 = ref(false)
    // 获取路径中的车牌
    const { id } = router.currentRoute.value.params
    const plateInfo = ref({
      plate: ''
    })
    axios({
      method: 'get',
      url: `api/api/v1/vehicle/history_info/${id}`
    }).then(res => {
      const { code } = res.data
      if (code === 1 || code === 2) {
        resultShow.value = true
      } else {
        resultShow1.value = true
        plateInfo.value = res.data.data.info
      }
    })
    const backup = () => {
      router.push({ path: '/search' })
    }
    // 详情弹窗
    const infoModal = (title, value) => {
      Modal.info({
        title: title,
        content: h('div', {}, [h('p', value)])
      })
    }
    // 图片显示
    const imgList = ref([])
    const imgVisible = ref(false)
    const imgNull = ref(false)
    const imgHandleOk = () => {
      imgVisible.value = false
      imgList.value = []
    }
    // 获取图片的 id
    const imgShowModal = (imgId, completePicture) => {
      imgVisible.value = true
      axios.get('api/img_list/', { params: { work_order_id: imgId, completePicture: completePicture } }).then(res => {
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
      id,
      resultShow,
      resultShow1,
      plateInfo,
      moment,
      backup,
      infoModal,
      imgHandleOk,
      imgShowModal,
      imgVisible,
      imgNull,
      imgList,
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE
    }
  }
})
</script>
