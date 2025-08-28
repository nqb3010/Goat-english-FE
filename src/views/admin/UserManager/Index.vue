<script setup>
import { inject, onMounted, ref, watch } from 'vue'
import CreateOrUpdate from './CreateOrUpdate.vue'

import { useRoute } from 'vue-router'
import api, { updateQueryParams } from '@/utils'
import { toast } from 'vue3-toastify'
const route = useRoute()

const URL_API = inject('URL_API')
const handleErrorAPI = inject('handleErrorAPI')

const users = ref([])
const search = ref(route.query?.search || '')
const page = ref(Number(route.query?.page) || 1)
const limit = 10
const pagination = ref({
  currentPage: page.value,
  totalRecords: 0,
  totalPages: 1,
})

const init = async () => {
  if (!route.query?._id) {
    users.value = await getUsers()
  }
}

watch(page, async (value) => {
  updateQueryParams({ page: value })
  await getUsers()
})

watch(
  () => route.params._id,
  async () => {
    await init()
  },
  { deep: true },
)

const getUsers = async () => {
  try {
    const res = await api.get(
      `${URL_API}/api/user?page=${page.value}&limit=${limit}&search=${search.value}`,
    )
    // send success
    if (res?.status !== 200) {
      toast.error(res?.data?.message)
      return
    }
    console.log(res?.data?.data)
    pagination.value = res?.data?.data?.pagination || {
      currentPage: page.value,
      totalRecords: 0,
      totalPages: 1,
    }
    return res?.data?.data?.users || []
  } catch (error) {
    handleErrorAPI(error)
  }
}

const handleDelete = async (user_id) => {
  const result = confirm('Xác nhận xóa chủ đề')
  if (result) {
    const toastId = toast.loading('Đang xóa...')
    try {
      const res = await api.delete(`${URL_API}/api/user/${user_id}`)
      // send success
      if (res?.status !== 200 || (res?.data?.status && !res?.data?.status !== 200)) {
        toast.update(toastId, {
          render: res?.data?.message || 'Có lỗi xảy ra!',
          type: 'error',
          isLoading: false,
          autoClose: 2000,
        })
        return
      }
      toast.update(toastId, {
        render: res?.data?.message || 'Xóa thành công!',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      })
      await init()
    } catch (error) {
      handleErrorAPI(error, toastId)
    }
  }
}

const handleSearchUser = async () => {
  if (search.value.trim() === '') {
    toast.error('Vui lòng nhập từ khóa tìm kiếm')
    return
  }
  updateQueryParams({ search: search.value, page: 1 })
  const toastId = toast.loading('Đang tìm kiếm...')
  try {
    const res = await api.get(
      `${URL_API}/api/user?page=${page.value}&limit=${limit}&search=${search.value}`,
    )
    // send success
    if (res?.status !== 200) {
      toast.update(toastId, {
        render: res?.data?.message || 'Có lỗi xảy ra!',
        type: 'error',
        isLoading: false,
        autoClose: 2000,
      })
      return
    }
    toast.update(toastId, {
      render: res?.data?.message || 'Tìm kiếm thành công!',
      type: 'success',
      isLoading: false,
      autoClose: 2000,
    })
    pagination.value = res?.data?.data?.pagination || {
      currentPage: page.value,
      totalRecords: 0,
      totalPages: 1,
    }
    return res?.data?.data?.users || []
  } catch (error) {
    handleErrorAPI(error, toastId)
  }
}

onMounted(() => {
  init()
})
</script>

<template>
  <template v-if="route.query?._id">
    <CreateOrUpdate />
  </template>
  <template v-else>
    <h2 class="lv2">Danh sách người dùng</h2>
    <div class="text-start d-flex justify-content-between" style="margin: 12px 0">
      <RouterLink to="?_id=null" class="btn btn-outline-primary">
        <i class="bi bi-plus-circle"></i>&nbsp; Tạo mới
      </RouterLink>
      <div class="search-block w-25">
        <div class="input-group">
          <span class="input-group-text search-icon" @click="handleSearchUser">
            <i class="bi bi-search"></i>
          </span>
          <input
            type="text"
            class="form-control search-user"
            placeholder="Search"
            v-model="search"
            @keyup.enter="handleSearchUser"
          />
        </div>
      </div>
    </div>
    <table class="table table-hover">
      <thead>
        <tr class="table-primary">
          <th scope="col" class="text-center">STT</th>
          <th scope="col">Username</th>
          <th scope="col">Email</th>
          <th scope="col">Role</th>
          <th scope="col" class="text-center">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, index) in users" :key="user._id">
          <td class="text-center">{{ (page - 1) * limit + index + 1 }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td class="flex justify-center gap-2">
            <RouterLink :to="`?_id=${user._id}`" class="btn btn-outline-primary" title="Sửa">
              <i class="bi bi-gear"></i>
            </RouterLink>
            <button
              type="button"
              @click.prevent="handleDelete(user._id)"
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
        <button @click.prevent="" class="join-item btn">Trang {{ page }}</button>
        <button @click="page += 1" :disabled="page == pagination?.totalPages" class="join-item btn">
          »
        </button>
      </div>
      <div class="text-[1rem]">Tổng số: {{ pagination?.totalRecords || 0 }}</div>
    </div>
  </template>
</template>
