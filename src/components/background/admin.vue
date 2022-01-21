<template>
  <a-collapse v-model:activeKey="activeKey" ghost>
    <template #expandIcon="{ isActive }">
      <caret-right-outlined :rotate="isActive ? 90 : 0" />
    </template>
    <a-collapse-panel key="1" header="全局账户管理">
      <p>账户管理</p>
    </a-collapse-panel>
    <a-collapse-panel key="2" header="全局注册码">
      <a-button type="primary" style="margin-bottom: 20px" @click="updateToken">生成新的全局注册码</a-button>
      <a-typography-paragraph copyable>
        <a-typography-text code>
          {{ registrationCode }}
        </a-typography-text>
      </a-typography-paragraph>
      <a-typography-paragraph>
        <history-outlined  style="color: green"/> 最近更新时间: <span style="color: green">{{ moment(updateTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
        <br/>
        <info-circle-outlined style="color: #DC143C"/> 为了防止无关人员注册，注册需要使用此全局注册码，注册码可以进行更新，更新后原有的注册码将会失效，请勿泄漏
      </a-typography-paragraph>
    </a-collapse-panel>
  </a-collapse>
</template>
<script>
import { defineComponent, ref, watch } from 'vue'
import { CaretRightOutlined, InfoCircleOutlined, HistoryOutlined } from '@ant-design/icons-vue'
import axios from 'axios'
import { useStore } from 'vuex'
import { message } from 'ant-design-vue'
import moment from 'moment'
export default defineComponent({
  components: {
    CaretRightOutlined,
    InfoCircleOutlined,
    HistoryOutlined
  },
  setup () {
    const state = useStore()
    // 折叠框
    const activeKey = ref(['1'])
    watch(activeKey, val => {
      console.log(val)
    })

    // 获取全局注册码
    const registrationCode = ref('')
    const updateTime = ref('')
    const getToken = (status) => {
      axios({
        method: 'get',
        url: 'api/admin/recode/',
        headers: { Authorization: 'bearer ' + state.state.token },
        params: { status }
      })
        .then(res => {
          const { key: token, update: time } = res.data.data
          registrationCode.value = token
          updateTime.value = time
        })
    }
    getToken(2)

    // 更新全局注册码
    const updateToken = () => {
      getToken(1)
      message.success('全局验证码更新成功')
    }
    return {
      activeKey,
      registrationCode,
      updateToken,
      updateTime,
      moment
    }
  }

})
</script>
