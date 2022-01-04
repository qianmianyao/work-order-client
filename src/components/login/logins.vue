<template>
  <div :style="{ background: '#fff', padding: '24px', minHeight: '280px' }">
    <a-form
      style="margin: 0 auto"
      :model="formState"
      name="normal_login"
      class="login-form"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
    >
      <a-form-item
        name="username"
        :rules="[{ required: true, message: '请输入您的用户名!' }]"
      >
        <a-input v-model:value="formState.username" placeholder="你的用户名">
          <template #prefix>
            <UserOutlined class="site-form-item-icon" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        name="password"
        :rules="[{ required: true, message: '请输入您的密码!' }]"
      >
        <a-input-password v-model:value="formState.password" placeholder="你的密码">
          <template #prefix>
            <LockOutlined class="site-form-item-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item>
        <a-button :disabled="disabled" type="primary" html-type="submit" class="login-form-button"
                  @click="login">
          登录
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { defineComponent, reactive, computed, ref } from 'vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
export default defineComponent({
  components: {
    UserOutlined,
    LockOutlined
  },

  setup () {
    const formState = reactive({
      username: '',
      password: '',
      remember: true
    })

    const onFinish = values => {
      console.log('Success:', values)
    }

    const onFinishFailed = errorInfo => {
      console.log('Failed:', errorInfo)
    }

    const disabled = computed(() => {
      return !(formState.username && formState.password)
    })
    // 登录事件
    const router = useRouter()
    const login = () => {
      localStorage.isLogin = true
      router.push({ path: '/maintain' })
    }
    return {
      formState,
      onFinish,
      onFinishFailed,
      disabled,
      login,
      selectedKeys: ref(['1'])
    }
  }

})
</script>
<style>
</style>
