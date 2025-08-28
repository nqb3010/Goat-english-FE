<script setup>
import "@/assets/admin_css/index.css";
import { inject, onMounted, provide, ref } from "vue";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { RouterLink } from "vue-router";
import { useRoute } from "vue-router";
import api from "@/utils";

const URL_API = inject("URL_API");
const handleErrorAPI = inject("handleErrorAPI");

const route = useRoute();

dayjs.extend(utc);
dayjs.extend(timezone);

const formattedLocalTime = (isoDate, format = "DD-MM-YYYY") => {
  return dayjs.utc(isoDate).tz("Asia/Ho_Chi_Minh").format(format);
};

const isNotLogin = ref(true);
const setNotLogin = (value) => {
  isNotLogin.value = value;
};

provide("setNotLogin", setNotLogin);
provide("formattedLocalTime", formattedLocalTime);

const getInfoUser = async () => {
  const token = localStorage.getItem("token");
  if (!token) handleLogout();
  const user = localStorage.getItem("user");
  if (user) {
    const userData = JSON.parse(user);
    try {
      const response = await api.get(`${URL_API}/api/user/${userData._id}`);
      if (response.status === 200) {
        if (response.data?.data?.role === "admin") {
          isNotLogin.value = true;
        } else {
          isNotLogin.value = false;
          localStorage.clear();
          location.href = "/login";
        }
      } else {
        handleErrorAPI(response);
      }
    } catch (error) {
      handleErrorAPI(error);
    }
  }
};

const handleLogout = () => {
  localStorage.clear();
  location.href = "/login";
};

onMounted(async () => {
  await getInfoUser();
});
</script>

<template>
  <template v-if="isNotLogin">
    <input type="checkbox" id="nav-toggle" />
    <div class="sidebar" target="_sidebar">
      <div class="sidebar-brand">
        <a asp-controller="Home" asp-action="Index">
          <h2 class="lv2">
            <img src="" class="logo" />
            <a href="/admin/dashboard" class="text-logo" style="font-size: 2rem"
              >Goat English</a
            >
          </h2>
        </a>
      </div>
      <div class="sidebar-menu">
        <ul>
          <li>
            <router-link
              to="/admin/dashboard"
              page="home"
              title="Dasboard"
              class="sidebar-link"
              :class="{ active: route.name === 'DashboardAdmin' }"
            >
              <span>
                <i class="bi bi-house"></i>
              </span>
              <span>Dasboard</span>
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin/user"
              title="Quản lý người dùng"
              class="sidebar-link"
              :class="{ active: route.name === 'UserAdmin' }"
            >
              <span>
                <i class="bi bi-people"></i>
              </span>
              <span>Quản lý người dùng</span>
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin/topic"
              title="Quản lý chủ đề"
              class="sidebar-link"
              :class="{ active: route.name === 'TopicAdmin' }"
            >
              <span>
                <i class="bi bi-stack"></i>
              </span>
              <span>Quản lý chủ đề</span>
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin/progress"
              title="Quản lý lộ trình"
              class="sidebar-link"
              :class="{ active: route.name === 'ProgressAdmin' }"
            >
              <span>
                <i class="bi bi-graph-up-arrow"></i>
              </span>
              <span>Quản lý lộ trình</span>
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin/lesson"
              title="Quản lý bài học"
              class="sidebar-link"
              :class="{ active: route.name === 'LessonAdmin' }"
            >
              <span>
                <i class="bi bi-book"></i>
              </span>
              <span>Quản lý bài học</span>
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin/vocabulary"
              title="Quản lý bài học"
              class="sidebar-link"
              :class="{ active: route.name === 'VocabularyAdmin' }"
            >
              <span>
                <i class="bi bi-type"></i>
              </span>
              <span>Quản lý từ vựng</span>
            </router-link>
          </li>
          <!-- <li>
            <a page="quan-ly-kho-sach" title="Quản lý kho sách" class="sidebar-link">
              <span>
                <i class="bi bi-inbox"></i>
              </span>
              <span>Quản lý kho sách</span>
            </a>
            <ul class="subs-menu">
              <li class="sub-item">
                <a href="/quan-ly-kho-sach/nhap-sach" title="Nhập sách" class="sub-link">
                  Nhập sách
                </a>
              </li>
              <li class="sub-item">
                <a href="/quan-ly-kho-sach/huy-sach" title="Hủy sách" class="sub-link">
                  Hủy sách
                </a>
              </li>
              <li class="sub-item">
                <a href="/quan-ly-kho-sach/kiem-ke" title="Kiểm kê" class="sub-link">
                  Kiểm kê
                </a>
              </li>
            </ul>
          </li> -->
          <li>
            <router-link
              to="/admin/report"
              title="Báo cáo thống kê"
              class="sidebar-link"
              :class="{ active: route.name === 'ReportAdmin' }"
            >
              <span>
                <i class="bi bi-bar-chart-line"></i>
              </span>
              <span>Báo cáo thống kê</span>
            </router-link>
          </li>
          <li>
            <a href="/admin/logout" title="Thoát" @click.prevent="handleLogout">
              <span>
                <i class="bi bi-box-arrow-left"></i>
              </span>
              <span>Thoát</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div class="main-content">
      <header>
        <h2 class="lv2">
          <label for="nav-toggle">
            <span>
              <i class="bi bi-list"></i>
            </span>
          </label>
        </h2>
        <div class="search-wrapper d-none">
          <span>
            <i class="bi bi-search"></i>
          </span>
          <input type="search" placeholder="Search here" />
        </div>

        <div class="user-wrapper d-none">
          <img
            src="https://avatars.githubusercontent.com/u/105920262?v=4"
            alt=""
            width="30px"
            height="30px"
          />
          <div>
            <h4 class="lv4"></h4>
            <small></small>
          </div>
        </div>
      </header>
      <main>
        <div class="modal-bg d-none"></div>
        <router-view />
      </main>
    </div>
  </template>
  <template v-else>
    <router-view />
  </template>
</template>
