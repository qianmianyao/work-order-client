<template>
  <a-card>
    <template #actions>
      <edit-outlined key="edit" @click="showModal" />
    </template>
    <a-card-meta v-model:title="info.name" v-model:description="info.describe">
    </a-card-meta>
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
    <a-input-password v-model:value="info.alterName" placeholder="输入内容" />
    <p style="margin-top: 24px;">修改描述</p>
    <a-textarea v-model:value="info.alterDescribe" placeholder="输入内容" :rows="4" />
  </a-modal>
  <a-empty style="margin-top: 20px" description="暂无数据"/>
</template>
<script>
import { EditOutlined } from '@ant-design/icons-vue'
import { defineComponent, ref, reactive } from 'vue'
export default defineComponent({
  components: {
    EditOutlined
  },
  setup () {
    const info = reactive({
      name: '周鹏',
      describe: '这里是描述',
      alterName: '',
      alterDescribe: ''
    })
    const visible = ref(false)
    const confirmLoading = ref(false)

    const showModal = () => {
      visible.value = true
    }

    const handleOk = () => {
      visible.value = false
      info.name = info.alterName
      info.describe = info.alterDescribe
    }

    return {
      visible,
      confirmLoading,
      showModal,
      handleOk,
      info
    }
  }

})
</script>
