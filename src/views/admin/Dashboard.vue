<script setup>
import api from "@/utils";
import { inject, onMounted, ref } from "vue";
import { toast } from "vue3-toastify";

const URL_API = inject("URL_API");
const handleErrorAPI = inject("handleErrorAPI");

const dataDashboard = ref();

const getData = async () => {
  try {
    const res = await api.get(`${URL_API}/api/admin/dashboard`);
    // send success
    if (res?.status !== 200) {
      toast.error(res?.data?.message);
      return;
    }
    return res?.data?.data;
  } catch (error) {
    handleErrorAPI(error);
  }
};

onMounted(async () => {
  dataDashboard.value = await getData();
  console.log(dataDashboard.value);
});
</script>

<template>
  <div class="cards">
    <div class="card-single">
      <div>
        <h1>{{ dataDashboard?.countUser }}</h1>
        <span>Người dùng</span>
      </div>
      <div>
        <span><i class="bi bi-people"></i></span>
      </div>
    </div>
    <div class="card-single">
      <div>
        <h1>{{ dataDashboard?.countVocabulary }}</h1>
        <span>Từ vựng</span>
      </div>
      <div>
        <span><i class="bi bi-type"></i></span>
      </div>
    </div>
    <div class="card-single">
      <div>
        <h1>{{ dataDashboard?.countTopic }}</h1>
        <span>Chủ đề</span>
      </div>
      <div>
        <span><i class="bi bi-stack"></i></span>
      </div>
    </div>
    <div class="card-single">
      <div>
        <h1>{{ dataDashboard?.countLesson }}</h1>
        <span>Bài học</span>
      </div>
      <div>
        <span><i class="bi bi-book"></i></span>
      </div>
    </div>
  </div>
  <div class="recent-grid">
    <div class="books">
      <div class="card">
        <div class="card-header">
          <h3 class="lv3">Bài học mới</h3>
          <button>
            <router-link to="/admin/lesson" title="Xem tất cả bài học">
              Xem tất cả<span class="las la-arrow-right"></span>
            </router-link>
          </button>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table width="100%">
              <thead>
                <tr>
                  <td>Tiêu đề</td>
                  <td>Chủ đề</td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="lesson in dataDashboard?.lessons" :key="lesson._id">
                  <td>
                    <span>{{ lesson?.title }}</span>
                  </td>
                  <td>{{ lesson?.progress_id?.topic_id?.name }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="customers">
      <div class="card">
        <div class="card-header">
          <h3 class="lv3">Người dùng mới</h3>
          <button>
            <router-link to="/admin/user" title="Xem tất cả người dùng">
              Xem tất cả<span class="las la-arrow-right"></span>
            </router-link>
          </button>
        </div>
        <div class="card-body">
          <div class="customer" v-for="user in dataDashboard?.users" :key="user._id">
            <div class="info">
              <img
                v-if="user?.avatar"
                :src="user?.avatar"
                class="logo"
                width="40px"
                height="40px"
              />
              <div v-else class="avatar avatar-placeholder">
                <div
                  class="bg-neutral text-neutral-content w-24 rounded-full"
                  style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: #e5e7eb;
                    margin-right: 12px;
                  "
                >
                  <span class="text-3xl">{{ user?.username?.slice(0, 1) }}</span>
                </div>
              </div>
              <div>
                <h4 class="lv4">{{ user?.email }}</h4>
                <small>{{ user?.username }}</small>
              </div>
            </div>
            <!-- <div class="contact">
              <span><i class="bi bi-person-circle"></i></span>
              <span><i class="bi bi-chat-square-text"></i></span>
              <span><i class="bi bi-telephone"></i></span>
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
