<template>
  <a-collapse v-model:activeKey="activeKey" ghost>
    <template #expandIcon="{ isActive }">
      <caret-right-outlined :rotate="isActive ? 90 : 0" />
    </template>
    <a-collapse-panel key="1" header="全局账户管理">
      <p>账户管理</p>
    </a-collapse-panel>
    <a-collapse-panel key="2" header="全局注册码">
      <a-button type="primary" style="margin-bottom: 20px">生成新的全局注册码</a-button>
      <a-typography-paragraph copyable>
        <a-typography-text code>
          5GWC4Y-XJT78P-WVHC6B-WDTMDBA
        </a-typography-text>
      </a-typography-paragraph>
      <a-typography-paragraph>
        <info-circle-outlined style="color: #DC143C"/> 为了防止无关人员注册，注册需要使用此全局注册码，注册码可以进行更新，更新后原有的注册码将会失效，请勿泄漏
      </a-typography-paragraph>
    </a-collapse-panel>
  </a-collapse>
</template>
<script>
import { defineComponent, ref, watch } from 'vue'
import { CaretRightOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'
export default defineComponent({
  components: {
    CaretRightOutlined,
    InfoCircleOutlined
  },
  setup () {
    const activeKey = ref(['1'])
    watch(activeKey, val => {
      console.log(val)
    })
    return {
      activeKey
    }
  }

})
</script>
