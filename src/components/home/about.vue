<template>
  <a-typography>
    <a-typography-title :level="3">开发简介</a-typography-title>
    <a-typography-paragraph>
      本站使用前后端分离技术开发，实现高内聚低耦合，单个功能出现故障不会影响其他功能使用，不管是新功能增加还是后续维护都实现模块化。
    </a-typography-paragraph>
    <a-typography-paragraph>
      前端使用
      <a-typography-link href="https://vuejs.org/">
        Vue 3.0
      </a-typography-link> +
      <a-typography-link href="https://www.antdv.com/docs/vue/introduce/">
        ant design
      </a-typography-link>
      进行开发，前端打包更小，性能优越，对于服务器资源要求极少
    </a-typography-paragraph>
    <a-typography-paragraph>
      后端使用
      <a-typography-link href="https://www.python.org/">
      Python3.8
      </a-typography-link> + 异步框架
      <a-typography-link href="https://fastapi.tiangolo.com/">
        FastApi
      </a-typography-link>
      进行开发，FastApi 在各项性能指标，都有非常明显的性能优势。
    </a-typography-paragraph>
    <a-divider />
    <a-typography-title :level="3">Thanks</a-typography-title>
    <a-typography-paragraph>
      Thanks <a-typography-link href="https://www.jetbrains.com/?from=mirai">JetBrains</a-typography-link>
      Provide Free License Support
      <a-typography-link href="https://github.com/qianmianyao/work-order-client">WorkOrderSystem</a-typography-link>
      Project
    </a-typography-paragraph>
    <img src="../../assets/jb_beam.png" style="width: 80px">
    <a-divider />
    <a-typography-title :level="3">更新信息</a-typography-title>
  </a-typography>
  <div style="margin-top: 20px">
    <a-timeline>
      <a-timeline-item color="green">
        <template #dot><clock-circle-outlined style="font-size: 16px" /></template>
        修改部分界面 Version 1.0.6-update 2022-03-22
      </a-timeline-item>
      <a-timeline-item color="green">
        <template #dot><clock-circle-outlined style="font-size: 16px" /></template>
        基础功能全部开发完毕，更新第一个正式版 Version 1.0.5-update 2022-02-25
      </a-timeline-item>
      <a-timeline-item>
        <template #dot><clock-circle-outlined style="font-size: 16px" /></template>
        上线测试服务器 2022-02-22
      </a-timeline-item>
      <a-timeline-item>
        <template #dot><clock-circle-outlined style="font-size: 16px" /></template>
        更新Logo 2022-02-18
      </a-timeline-item>
      <a-timeline-item>
        <template #dot><clock-circle-outlined style="font-size: 16px" /></template>
        项目创建 2021-12-28
      </a-timeline-item>
    </a-timeline>
  </div>
</template>

<script>
import { ClockCircleOutlined } from '@ant-design/icons-vue'
import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    ClockCircleOutlined
  },
  setup () {
    return {
    }
  }
})
</script>
