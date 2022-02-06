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
        <a-button
          :disabled="disabled"
          type="primary"
          html-type="submit"
          class="login-form-button"
          @click="login"
          :loading="loading"
        >
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
import axios from 'axios'
import qs from 'qs'
import { message } from 'ant-design-vue'
import { useStore } from 'vuex'
export default defineComponent({
  components: {
    UserOutlined,
    LockOutlined
  },

  setup () {
    const formState = reactive({
      username: '',
      password: ''
    })
    const loading = ref(false)

    const onFinish = values => {
      console.log('Success:', values)
    }

    const onFinishFailed = errorInfo => {
      console.log('Failed:', errorInfo)
    }

    const disabled = computed(() => {
      return !(formState.username && formState.password)
    })

    // 跳转
    const router = useRouter()
    const push = () => {
      router.push({ path: '/search' })
    }

    const state = useStore()

    // 登录事件
    const login = () => {
      loading.value = true
      axios({
        method: 'post',
        url: 'api/user/login/',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: qs.stringify({
          username: formState.username,
          password: formState.password
        })
      })
        .then((res) => {
          loading.value = false
          if (res.data.code === 401) {
            message.error('账号或者密码错误')
          }
          if (res.data.code === 200) {
            message.success('登录成功', 2)
            // eslint-disable-next-line camelcase
            const { access_token } = res.data.data
            // 保存 token
            state.commit('setToken', access_token)
            if (state.state.token) {
              push()
            }
          }
        })
        .catch(err => {
          const mes = err.response.statusText
          message.error(mes)
          loading.value = false
        })
    }
    return {
      formState,
      onFinish,
      onFinishFailed,
      disabled,
      login,
      loading
    }
  }

})
</script>
<style>
</style>
