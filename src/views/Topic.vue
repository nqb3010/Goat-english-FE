<script setup>
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import { inject, onMounted, ref } from 'vue'
import api from '@/utils'
import { toast } from 'vue3-toastify'
import _ from 'lodash'

const URL_API = inject('URL_API')
const handleErrorAPI = inject('handleErrorAPI')
const toggleClamp = inject('toggleClamp')

const user = ref()
const topics = ref([])
const topicsLearned = ref([])
const loadingUI = ref(false)

const init = async () => {
  try {
    loadingUI.value = true
    const userLocal = localStorage.getItem('user')
    if (userLocal) {
      user.value = JSON.parse(userLocal)
    }
    await getTopics()
    await getTopicsLearned()
  } catch (error) {
    handleErrorAPI(error)
  } finally {
    loadingUI.value = false
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
    topics.value = res?.data?.data?.topics || []
  } catch (error) {
    handleErrorAPI(error)
  }
}

// Hàm xử lý lấy dữ liệu các chủ đề đã học
const getTopicsLearned = async () => {
  try {
    const res = await api.get(`${URL_API}/api/user/get-topics-learned`)
    // send success
    if (res?.status !== 200) {
      toast.error(res?.data?.message)
      return
    }
    topicsLearned.value = res?.data?.data
    console.log(topicsLearned.value)
  } catch (error) {
    handleErrorAPI(error)
  }
}

const changeUserTopic = async (topic, type) => {
  try {
    const res = await api.post(`${URL_API}/api/user/change-topic`, {
      topic_id: topic._id,
      type,
    })
    // send success
    if (res?.status !== 200) {
      toast.error(res?.data?.message)
      return
    }
    location.href = '/dashboard'
  } catch (error) {
    handleErrorAPI(error)
  }
}

onMounted(() => {
  init()
})
</script>
<template>
  <div id="topic" class="flex">
    <Sidebar />
    <div class="topic-main w-full flex-1">
      <Header :user="user" />
      <div class="topic-content">
        <!-- loading -->
        <div v-if="loadingUI" class="flex justify-center">
          <span class="loading loading-dots loading-sm" style="animation: none; width: 80px"></span>
        </div>
        <template v-else>
          <div v-if="user?.topic_id" class="topic-row">
            <p class="title">Hiện đang học</p>
            <div class="list-topic">
              <div class="topic-item flex">
                <img class="topic-item__img object-cover" :src="user?.topic?.image" />
                <div class="px-5 py-8 flex flex-col flex-1 justify-between gap-2">
                  <p class="text-[20px] font-bold">{{ user?.topic?.name }}</p>
                  <p
                    class="line-clamp-2 leading-8 cursor-pointer"
                    @click="toggleClamp($event, 'line-clamp-2')"
                  >
                    {{ user?.topic?.description }}
                  </p>
                  <div class="flex justify-between items-center mt-5">
                    <span class="hidden icon cursor-pointer">
                      <svg
                        viewBox="0 0 24 25"
                        width="32px"
                        height="32px"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.846 12.6c0-.528-.187-.977-.563-1.346a1.87 1.87 0 0 0-1.374-.563c-.35 0-.671.086-.964.258a1.948 1.948 0 0 0-.687.697A1.82 1.82 0 0 0 3 12.6c0 .356.086.678.258.964.171.286.4.515.687.687.293.172.614.258.964.258.362 0 .687-.086.973-.258.293-.172.525-.4.697-.687.178-.286.267-.608.267-.964Zm7.063 0c0-.528-.188-.977-.563-1.346A1.816 1.816 0 0 0 12 10.691c-.35 0-.671.086-.964.258a1.948 1.948 0 0 0-.687.697 1.873 1.873 0 0 0-.248.954c0 .356.082.678.248.964.172.286.4.515.687.687.293.172.614.258.964.258.356 0 .678-.086.964-.258.286-.172.515-.4.687-.687.172-.286.258-.608.258-.964Zm7.091 0c0-.528-.188-.977-.563-1.346a1.816 1.816 0 0 0-1.346-.563 1.924 1.924 0 0 0-1.67.954 1.82 1.82 0 0 0-.258.955c0 .356.086.678.258.964.172.286.404.515.697.687.292.172.617.258.973.258.35 0 .668-.086.955-.258.292-.172.524-.4.696-.687.172-.286.258-.608.258-.964Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </span>
                    <RouterLink to="/dashboard" class="ms-auto btn-topic font-bold">
                      Tiếp tục học ›
                    </RouterLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="topic-row">
            <p class="title text-center">Vui lòng chọn một chủ đề để bắt đầu học</p>
          </div>
          <div class="topic-row pt-14">
            <p class="title">Chủ đề</p>
            <div v-if="topics.length > 0" class="list-topic">
              <template v-for="topic in topics">
                <div v-if="topic._id !== user?.topic_id" :key="topic._id" class="topic-item flex">
                  <img class="topic-item__img object-cover" :src="topic.image" />
                  <div class="px-5 py-8 flex flex-col flex-1 gap-4">
                    <p class="text-[20px] font-bold">{{ topic.name }}</p>
                    <p
                      class="line-clamp-2 leading-8 cursor-pointer"
                      @click="toggleClamp($event, 'line-clamp-2')"
                    >
                      {{ topic.description }}
                    </p>
                    <div
                      v-if="_.findIndex(topicsLearned, { topic_id: topic._id }) >= 0"
                      class="flex justify-between flex-1"
                    >
                      <button
                        @click="changeUserTopic(topic, 'continue')"
                        class="ms-auto btn-topic font-bold"
                      >
                        Tiếp tục học ›
                      </button>
                    </div>
                    <div v-else class="flex justify-between">
                      <button
                        @click="changeUserTopic(topic, 'start')"
                        class="btn-topic btn-start font-bold ms-auto"
                      >
                        Bắt đầu học
                      </button>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
