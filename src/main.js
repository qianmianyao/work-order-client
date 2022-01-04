import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import { createApp } from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'

const app = createApp(App).use(store).use(router).use(Antd).use(VueAxios, axios)

app.mount('#app')
