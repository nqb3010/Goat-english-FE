<script setup>
import SettingInfor from "./SettingInfor.vue";
import Header from "@/components/Header.vue";
import { inject, onMounted, ref } from "vue";
import SettingPassword from "./SettingPassword.vue";
import SettingDeleteAcount from "./SettingDeleteAcount.vue";
import Sidebar from "@/components/Sidebar.vue";

const URL_API = inject("URL_API");
const handleErrorAPI = inject("handleErrorAPI");
const getInfoUser = inject("getInfoUser");

const user = ref({});
const loading = ref(false);

const tabIndex = ref(1);

const init = async () => {
  user.value = await getInfoUser();
  console.log(user.value);
};

onMounted(() => {
  init();
});
</script>

<template>
  <Sidebar :className="'fixed hidden'" />
  <div id="setting" class="setting">
    <Header :user="user" :className="'btn-menu-open'" />
    <div class="setting-content">
      <div class="bg-white" style="border-bottom: solid 1px #e6e6e6">
        <div
          class="flex items-center p-5 lg:px-0 justify-center md:justify-start setting-container"
        >
          <h2 class="title hidden md:block text-[2.5rem] text-[#3e3e3e] font-bold">
            Cài đặt
          </h2>
          <div class="tabs flex items-center justify-center gap-3 ms-0 md:ms-20">
            <button
              @click="tabIndex = 1"
              type="button"
              class="btn-tab"
              :class="{ active: tabIndex == 1 }"
            >
              <span class="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-person-fill-gear"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-9 8c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4m9.886-3.54c.18-.613 1.048-.613 1.229 0l.043.148a.64.64 0 0 0 .921.382l.136-.074c.561-.306 1.175.308.87.869l-.075.136a.64.64 0 0 0 .382.92l.149.045c.612.18.612 1.048 0 1.229l-.15.043a.64.64 0 0 0-.38.921l.074.136c.305.561-.309 1.175-.87.87l-.136-.075a.64.64 0 0 0-.92.382l-.045.149c-.18.612-1.048.612-1.229 0l-.043-.15a.64.64 0 0 0-.921-.38l-.136.074c-.561.305-1.175-.309-.87-.87l.075-.136a.64.64 0 0 0-.382-.92l-.148-.045c-.613-.18-.613-1.048 0-1.229l.148-.043a.64.64 0 0 0 .382-.921l-.074-.136c-.306-.561.308-1.175.869-.87l.136.075a.64.64 0 0 0 .92-.382zM14 12.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0"
                  />
                </svg>
              </span>
              <span>Hồ sơ</span>
            </button>
            <button
              @click="tabIndex = 2"
              type="button"
              class="btn-tab"
              :class="{ active: tabIndex == 2 }"
            >
              <span class="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-person-fill-lock"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-9 8c0 1 1 1 1 1h5v-1a2 2 0 0 1 .01-.2 4.49 4.49 0 0 1 1.534-3.693Q8.844 9.002 8 9c-5 0-6 3-6 4m7 0a1 1 0 0 1 1-1v-1a2 2 0 1 1 4 0v1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zm3-3a1 1 0 0 0-1 1v1h2v-1a1 1 0 0 0-1-1"
                  />
                </svg>
              </span>
              <span>Mật khẩu</span>
            </button>
            <button
              @click="tabIndex = 3"
              type="button"
              class="btn-tab"
              :class="{ active: tabIndex == 3 }"
            >
              <span class="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  fill="currentColor"
                  class="bi bi-x"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"
                  />
                </svg>
              </span>
              <span>Xóa tài khoản</span>
            </button>
          </div>
        </div>
      </div>
      <div class="body-content">
        <template v-if="tabIndex == 1">
          <SettingInfor :user="user" />
        </template>
        <template v-else-if="tabIndex == 2">
          <SettingPassword :user="user" />
        </template>
        <template v-else-if="tabIndex == 3">
          <SettingDeleteAcount :user="user" />
        </template>
      </div>
    </div>
  </div>
</template>
