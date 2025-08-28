<script setup>
import { inject, onMounted, reactive, ref, watch } from 'vue'
import { toast } from 'vue3-toastify'
import CreateOrUpdate from './CreateOrUpdate.vue'
import api, { updateQueryParams } from '@/utils'
import { useRoute } from 'vue-router'

const route = useRoute()

const URL_API = inject('URL_API')
const handleErrorAPI = inject('handleErrorAPI')
const formattedLocalTime = inject('formattedLocalTime')

const progresses = ref([])
const page = ref(Number(route.query?.page) || 1)
const pagination = ref()
const search = ref(route.query?.search || '')
const limit = 10
const filter = reactive({
  topic_id: route.query?.topic_id || '',
})
const topics = ref()

const init = async () => {
  // get topics
  topics.value = await getTopics()
  if (!route.query?._id) {
    if (filter.topic_id) {
      await handleFilterByTopic()
    } else {
      await getProgresses(page.value, search.value)
    }
  }
}

watch(page, async (value) => {
  updateQueryParams({ page: value })
  await getProgresses(value)
})

watch(
  () => route.query._id,
  async () => {
    await init()
  },
  { deep: true },
)

const getTopics = async () => {
  try {
    const res = await api.get(`${URL_API}/api/topic`)
    // send success
    if (res?.status !== 200) {
      toast.error(res?.data?.message)
      return
    }
    return res?.data?.data?.topics || []
  } catch (error) {
    handleErrorAPI(error)
  }
}

const getProgresses = async (page, search = '') => {
  try {
    const res = await api.get(
      `${URL_API}/api/progress?page=${page}&search=${search}&limit=${limit}`,
    )
    // send success
    if (res?.status !== 200) {
      toast.error(res?.data?.message)
      return
    }
    pagination.value = res?.data?.data?.pagination
    progresses.value = res?.data?.data?.progresses
  } catch (error) {
    handleErrorAPI(error)
  }
}

const handleDelete = async (progress_id) => {
  const result = confirm('Xác nhận xóa lộ trình')
  if (result) {
    try {
      const res = await api.delete(`${URL_API}/api/progress/${progress_id}`)
      // send success
      if (res?.status !== 200 || (res?.data?.status && !res?.data?.status !== 200)) {
        toast.error(res?.data?.message)
        return
      }
      toast.success(res?.data?.message || 'Thành công!')
      await init()
    } catch (error) {
      handleErrorAPI(error)
    }
  }
}

const handleFilterByTopic = async () => {
  try {
    updateQueryParams({ topic_id: filter.topic_id })
    if (!filter.topic_id) return
    const res = await api.get(`${URL_API}/api/progress/topic/${filter.topic_id}`)
    // send success
    if (res?.status !== 200) {
      toast.error(res?.data?.message)
      return
    }
    progresses.value = res?.data?.data
  } catch (error) {
    handleErrorAPI(error)
  }
}

const searchData = async () => {
  page.value = 1
  updateQueryParams({ search: search.value })
  await getProgresses(page.value, search.value)
}

onMounted(() => {
  init()
})
</script>

<template>
  <template v-if="route.query?._id">
    <CreateOrUpdate :topics="topics" />
  </template>
  <template v-else>
    <h2 class="lv2">
      Danh sách lộ trình - <span> Page {{ page }}</span>
    </h2>
    <div class="text-start d-flex justify-content-between" style="margin: 12px 0">
      <RouterLink to="?_id=null" class="btn btn-outline-primary">
        <i class="bi bi-plus-circle"></i>&nbsp; Tạo mới
      </RouterLink>
      <div class="search-block w-25">
        <div class="input-group">
          <span class="input-group-text search-icon" @click="searchData">
            <i class="bi bi-search"></i>
          </span>
          <input
            type="text"
            v-model.trim="search"
            class="form-control search-user"
            placeholder="Search"
            @keyup.enter="searchData"
          />
        </div>
      </div>
    </div>
    <div class="flex justify-end mb-2">
      <select
        @change="handleFilterByTopic"
        v-model="filter.topic_id"
        class="select select-neutral w-3/12 border-[#dee2e6]"
      >
        <option selected value="">Chủ đề</option>
        <option v-for="topic in topics" :key="topic?._id" :value="topic._id">
          {{ topic.name }}
        </option>
      </select>
    </div>
    <table class="table table-hover">
      <thead>
        <tr class="table-primary">
          <th scope="col">STT</th>
          <th scope="col">Tên lộ trình</th>
          <th scope="col">Mô tả</th>
          <th scope="col">Chủ đề</th>
          <th scope="col">Ngày tạo</th>
          <th scope="col">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(progress, index) in progresses" :key="progress?._id">
          <td class="text-center">{{ (page - 1) * limit + index + 1 }}</td>
          <td>{{ progress?.name }}</td>
          <td>{{ progress?.description }}</td>
          <td>{{ progress?.topic_id?.name }}</td>
          <td class="text-nowrap">{{ formattedLocalTime(progress?.createdAt) }}</td>
          <td class="flex flex-col gap-2">
            <RouterLink :to="`?_id=${progress._id}`" class="btn btn-outline-primary" title="Sửa">
              <i class="bi bi-gear"></i>
            </RouterLink>
            <button
              type="button"
              @click.prevent="handleDelete(progress._id)"
              class="btn btn-outline-danger"
              title="Xóa"
            >
              <i class="bi bi-trash3"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="flex justify-between items-center font-semibold bg-white p-2">
      <div class="join">
        <button @click="page -= 1" :disabled="page == 1" class="join-item btn">«</button>
        <button class="join-item btn">Trang {{ page }}</button>
        <button @click="page += 1" :disabled="page == pagination?.totalPages" class="join-item btn">
          »
        </button>
      </div>
      <div class="text-[1rem]">Tổng số: {{ pagination?.totalRecords || 0 }}</div>
    </div>
  </template>
</template>
