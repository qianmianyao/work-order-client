<template>
  <a-input-search placeholder="输入车牌查找历史信息" v-model:value="search" enter-button @search="onSearch"/>
  <a-empty v-if="!show" style="padding-top: 80px" />
  <div style="margin: 20px 0 10px 10px">
<!--    列表组件-->
    <a-list
      item-layout="horizontal"
      :data-source="data"
      :pagination="pagination"
      :loading="loading"
      v-if="show"
    >
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta
            :description="'订单状态: ' + item.status + ' ' + '报修时间: ' + moment(item.submitOrderTime).format('YYYY-MM-DD HH:mm:ss')"
          >
            <template #title>
              <a @click="pushPlate(item.id)">{{ item.plate }}</a>
            </template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import axios from 'axios'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import moment from 'moment'
export default defineComponent({
  setup () {
    // 搜索栏的值
    const search = ref('')
    // 列表展示数据
    const data = ref()
    // 数据总数
    // const pageTotal = ref(1)
    // 加载过程
    const loading = ref(false)

    const show = ref(false)

    // 获取后端的车牌报修历史数据
    const onSearch = () => {
      if (search.value.length < 4) {
        message.warning('请至少输入4位字符')
        show.value = false
      } else {
        loading.value = true
        axios({
          method: 'get',
          url: 'api/vehicle_history_info/',
          params: { plate: search.value.toUpperCase() }
        })
          .then(res => {
            loading.value = false
            if (res.data.code === 404) {
              message.error('数据库暂无当前车辆报修信息')
            } else {
              const { plateAll } = res.data.data
              data.value = plateAll
              show.value = true
            }
          })
      }
    }

    // 分页
    // TODO: 这里获取的是所有数据，然后前端来处理分页，性能需要优化，后续改成后端处理分页
    const pagination = {
      onChange: page => {
        console.log(page)
      },
      pageSize: 10
    }

    const plateInfo = ref(false)

    const router = useRouter()

    const pushPlate = (plate) => {
      router.push({ path: `/plate/${plate}` })
    }

    return {
      search,
      onSearch,
      data,
      pagination,
      loading,
      plateInfo,
      pushPlate,
      show,
      moment
    }
  }
})
</script>

<style scoped>

</style>
