<script setup>
import { inject, onMounted, reactive, ref, watch } from 'vue'
import CreateOrUpdate from './CreateOrUpdate.vue'
import { useRoute } from 'vue-router'
import api, { updateQueryParams } from '@/utils'
import { toast } from 'vue3-toastify'
const route = useRoute()

const URL_API = inject('URL_API')
const handleErrorAPI = inject('handleErrorAPI')

const vocabularies = ref([])
const topics = ref()
const page = ref(Number(route.query?.page) || 1)
const pagination = ref()
const search = ref(route.query?.search || '')
const limit = 10
const filter = reactive({
  topic_id: route.query?.topic_id || '',
})

const init = async () => {
  // get topics
  topics.value = await getTopics()
  if (!route.query?._id) {
    if (filter.topic_id) {
      await getAllByTopic(filter.topic_id)
    } else {
      await getVocabularies(page.value, search.value)
    }
  }
}

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

watch(
  () => route.params._id,
  async () => {
    await init()
  },
  { deep: true },
)

watch(
  () => filter.topic_id,
  async () => {
    page.value = 1
    updateQueryParams({ topic_id: filter.topic_id })
    if (filter.topic_id) {
      await getAllByTopic(filter.topic_id)
    } else {
      await getVocabularies(page.value, search.value)
    }
  },
  { deep: true },
)

watch(page, async (value) => {
  updateQueryParams({ page: value })
  if (filter.topic_id) {
    await getAllByTopic(filter.topic_id)
  } else {
    await getVocabularies(value, search.value)
  }
  // updateQueryParams({ page: value });
  // await getVocabularies(page.value);
})

const getVocabularies = async (page, search = '') => {
  try {
    const res = await api.get(
      `${URL_API}/api/vocabulary?page=${page}&search=${search}&limit=${limit}`,
    )
    // send success
    if (res?.status !== 200) {
      toast.error(res?.data?.message)
      return
    }
    const data = res?.data?.data
    pagination.value = data?.pagination
    vocabularies.value = data?.vocabularies
    return res?.data?.data
  } catch (error) {
    handleErrorAPI(error)
  }
}

const getAllByTopic = async (topic_id) => {
  try {
    const res = await api.get(
      `${URL_API}/api/vocabulary/topic/${topic_id}?page=${page.value}&limit=${limit}&search=${search.value}`,
    )
    // send success
    if (res?.status !== 200) {
      toast.error(res?.data?.message)
      return
    }
    vocabularies.value = res?.data?.data?.vocabularies
    pagination.value = res?.data?.data?.pagination
    return res?.data?.data
  } catch (error) {
    handleErrorAPI(error)
  }
}

const handleDelete = async (vocabulary_id) => {
  const result = confirm('Xác nhận xóa từ vựng')
  if (result) {
    try {
      const res = await api.delete(`${URL_API}/api/vocabulary/${vocabulary_id}`)
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

const searchData = async () => {
  page.value = 1
  updateQueryParams({ search: search.value })
  await getVocabularies(page.value, search.value)
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
    <h2 class="lv2">Danh sách từ vựng</h2>
    <div class="text-start d-flex items-center gap-3" style="margin: 12px 0">
      <RouterLink to="?_id=null" class="btn btn-outline-primary">
        <i class="bi bi-plus-circle"></i>&nbsp; Tạo mới
      </RouterLink>
      <div class="search-block w-25 ms-auto">
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
      <div class="flex justify-end">
        <select
          @change="handleFilterByTopic"
          v-model="filter.topic_id"
          class="select select-neutral border-[#dee2e6]"
        >
          <option selected value="">Chủ đề</option>
          <option v-for="topic in topics" :key="topic?._id" :value="topic._id">
            {{ topic.name }}
          </option>
        </select>
      </div>
    </div>
    <table class="table table-hover">
      <thead>
        <tr class="table-primary">
          <th scope="col" class="text-center">STT</th>
          <th scope="col">Từ vựng</th>
          <th scope="col">Phiên âm</th>
          <th scope="col">Tiếng Việt</th>
          <th scope="col">Loại từ</th>
          <th scope="col">Ví dụ sử dụng</th>
          <th scope="col" class="text-center">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(vocabulary, index) in vocabularies" :key="vocabulary?._id">
          <td class="text-center">{{ (page - 1) * limit + index + 1 }}</td>
          <td>{{ vocabulary?.word }}</td>
          <td>
            <span class="badge bg-primary me-1">{{ vocabulary?.phonetic }} </span>
          </td>
          <td>{{ vocabulary?.vietnamese }}</td>
          <td>
            <span v-for="type in vocabulary?.type" :key="type" class="badge bg-primary me-1"
              >{{ type }}
            </span>
          </td>
          <td>
            <span
              v-for="example in vocabulary?.examples"
              :key="example"
              class="badge bg-secondary h-full mt-1 text-wrap"
              style="text-align: left; display: flex"
            >
              {{ example?.sentence }}
              <br />
              {{ example?.translation }}
            </span>
          </td>
          <td class="flex flex-col gap-2">
            <RouterLink :to="`?_id=${vocabulary?._id}`" class="btn btn-outline-primary" title="Sửa">
              <i class="bi bi-gear"></i>
            </RouterLink>
            <button
              type="button"
              @click.prevent="handleDelete(vocabulary?._id)"
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
