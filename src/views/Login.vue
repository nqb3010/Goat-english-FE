<script setup>
import { useLayoutStore } from "@/stores/layout";
import { onMounted, reactive, ref, inject, nextTick } from "vue";
import Button from "../components/Button.vue";
import { toast } from "vue3-toastify";
import axios from "axios";

const layout = useLayoutStore();

const URL_API = inject("URL_API");
const handleErrorAPI = inject("handleErrorAPI");

const loading = ref(false);
const showPassword = ref(false);

const data = reactive({
  username: "",
  password: "",
});

const init = async () => {
  const token = localStorage.getItem("token");
  if (token) {
    location.href = "/dashboard";
  }
};

const handleKeyup = async (event) => {
  if (event.key === 'Enter') {
    // Delay nhỏ để đảm bảo v-model đã cập nhật
    setTimeout(() => {
      handleLogin();
    }, 10);
  }
};

const handleLogin = async () => {
  // Đợi nextTick để đảm bảo v-model đã cập nhật
  await nextTick();
  
  // Validation trước khi gửi request
  if (!data.username || !data.password) {
    toast.error("Vui lòng nhập đầy đủ username và password");
    return;
  }

  if (data.username.trim() === "" || data.password.trim() === "") {
    toast.error("Username và password không được để trống");
    return;
  }

  const toastId = toast.loading("Đang xử lý...");
  try {
    loading.value = true;
    const res = await axios.post(`${URL_API}/api/auth/login`, {
      username: data.username.trim(),
      password: data.password.trim(),
    });
    const dataRes = res.data;
    // send success
    if (dataRes?.status === 200) {
      toast.update(toastId, {
        render: dataRes?.message || "Đăng nhập thành công",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      // luu token
      localStorage.setItem("token", dataRes?.data?.token);
      let urlTarget = "/dashboard";
      if (dataRes?.data?.role === "admin") {
        urlTarget = "/admin/dashboard";
      }
      // redirect
      setTimeout(() => {
        location.href = urlTarget;
      }, 1000);
    } else {
      // toast.error(dataRes?.message);
      toast.update(toastId, {
        render: dataRes?.message,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  } catch (error) {
    handleErrorAPI(error, toastId);
    // console.error(error);
    // error?.response?.data?.errors?.forEach((error) => {
    //   toast.error(error?.message);
    // });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  init();
  layout.show();
});
</script>

<template>
  <div id="login">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
      <div class="bg-circle circle-3"></div>
    </div>
    
    <div class="login-content page-container">
      <h1 class="title-lv1 text-center font-bold mb-10">Đăng nhập</h1>
      <div class="signin-input__with-icon">
        <input
          type="text"
          class="signin-input"
          style="padding: 14px 20px"
          placeholder="Username"
          v-model.trim="data.username"
          @keyup="handleKeyup"
        />
        <img
          src="../components/icons/close.svg"
          @click="data.username = ''"
          class="signin-icon signin-icon__email"
        />
      </div>
      <div class="signin-input__with-icon">
        <input
          :type="showPassword ? 'text' : 'password'"
          class="signin-input"
          placeholder="Password"
          v-model.trim="data.password"
          @keyup="handleKeyup"
        />
        <span
          v-if="showPassword"
          @click="showPassword = false"
          class="signin-icon signin-icon__email"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            fill="currentColor"
            class="bi bi-eye-slash"
            viewBox="0 0 16 16"
          >
            <path
              d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"
            />
            <path
              d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"
            />
            <path
              d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"
            />
          </svg>
        </span>
        <span v-else @click="showPassword = true" class="signin-icon signin-icon__email">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            fill="currentColor"
            class="bi bi-eye"
            viewBox="0 0 16 16"
          >
            <path
              d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"
            />
            <path
              d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"
            />
          </svg>
        </span>
      </div>
      <div class="signin-input__with-icon">
        <Button
          :item="{ text: 'Đăng nhập', style: 'font-size: 1.8rem' }"
          :loading="loading"
          class="btn-next btn-primary-custom text-white w-full py-8 mt-8 rounded-lg font-bold sm:btn-sm md:btn-md lg:btn-lg"
          @click="handleLogin"
        />
      </div>
      <div class="signin-input__with-icon text-center">
        <router-link
          to="/forgot-password"
          class="hover:decoration-slate-950 hover:underline"
        >
          Quên mật khẩu?
        </router-link>
      </div>
      <div
        class="signin-input__with-icon pt-3 text-center"
        style="border-top: 1px solid #ccc"
      >
        <Button
          :item="{
            text: 'Tạo tài khoản mới',
            style: 'font-size: 1.8rem; width: 70%',
            href: '/signup',
          }"
          class="btn-next btn-secondary-custom text-white py-6 mt-4 rounded-lg font-bold sm:btn-sm md:btn-md lg:btn-lg"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-primary-custom {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  color: white !important;
  border: none !important;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-primary-custom:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(30, 41, 59, 0.25);
}

.btn-primary-custom::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-primary-custom:hover::before {
  left: 100%;
}

.btn-secondary-custom {
  background: linear-gradient(135deg, #42b883 0%, #369870 100%) !important;
  color: white !important;
  border: none !important;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-secondary-custom:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(66, 184, 131, 0.25);
}

.btn-secondary-custom::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-secondary-custom:hover::before {
  left: 100%;
}

/* Reduce bottom spacing */
.signin-input__with-icon:last-child {
  margin-bottom: 0.5rem !important;
}

.signin-input__with-icon {
  margin-bottom: 1rem;
}

/* Optimize login page height */
.login-content {
  padding-bottom: 1rem !important;
  position: relative;
  z-index: 1;
  padding-left: 2rem;
  padding-right: 2rem;
}

#login {
  min-height: calc(100vh - 4rem) !important;
  padding-bottom: 1rem !important;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
  width: 100vw; /* Full viewport width */
  margin-left: calc(-50vw + 50%); /* Center trong container */
}

/* Animated Background matching Home.vue */
.animated-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05));
  animation: float 8s ease-in-out infinite;
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -200px;
  right: -200px;
  animation-delay: 0s;
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -150px;
  left: -150px;
  animation-delay: 3s;
}

.circle-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 6s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-30px) scale(1.1);
  }
}

/* Fix for circle-3 animation */
.circle-3 {
  animation: floatCenter 8s ease-in-out infinite;
  animation-delay: 6s;
}

@keyframes floatCenter {
  0%,
  100% {
    transform: translate(-50%, -50%) translateY(0px) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-30px) scale(1.1);
  }
}

.login-content {
  position: relative;
  z-index: 1;
}
</style>
