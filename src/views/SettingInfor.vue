<script setup>
import { ref, onMounted, watch, toRefs, inject } from "vue";
import Button from "@/components/Button.vue";
import api from "@/utils";
import { toast } from "vue3-toastify";

const URL_API = inject("URL_API");
const handleErrorAPI = inject("handleErrorAPI");

const props = defineProps(["user"]);
const { user } = toRefs(props);
const loading = ref(false);

const email = ref(user.value.email || "");
const emailError = ref(false);
const username = ref(user.value.username || "");
const usernameError = ref(false);
const otpCode = ref("");
const showOtpInput = ref(false);
const otpError = ref(false);

watch(user, () => {
  email.value = user.value.email;
  username.value = user.value.username;
});

const validateEmail = () => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  emailError.value = !regex.test(email.value);
};

const validateUsername = () => {
  const regex = /^[A-Za-z][A-Za-z0-9-]*$/;
  usernameError.value = !regex.test(username.value);
};

const validateOtp = () => {
  // chỉ cho phép chữ số và 6 ký tự
  const regex = /^[0-9]{6}$/;
  otpError.value = !regex.test(otpCode.value);
};

const handleActionClick = async () => {
  loading.value = true;
  if (usernameError.value || emailError.value || otpError.value) {
    loading.value = false;
    return;
  }
  const toastId = toast.loading("Đang xử lý...");
  try {
    const res = await api.post(`${URL_API}/api/user/update-infor`, {
      username: username.value,
      email: email.value,
      otpCode: otpCode.value,
    });
    console.log(res);
    if (res.status !== 200) {
      toast.update(toastId, {
        render: res?.data?.message || "Có lỗi xảy ra",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
      loading.value = false;
      return;
    }
    if (res.data?.otpCode) {
      otpCode.value = "";
      showOtpInput.value = true;
      toast.update(toastId, {
        render: res.data?.message,
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } else {
      if (res.data?.status !== 200) {
        toast.update(toastId, {
          render: res?.data?.message || "Có lỗi xảy ra",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        toast.update(toastId, {
          render: res?.data?.message || "Cập nhật thành công",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    }
  } catch (error) {
    handleErrorAPI(error, toastId);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // console.error('user', props.user)
});
</script>

<template>
  <div class="setting-infor setting-container">
    <div class="mt-5 w-[95%] md:w-[60%] bg-white mx-auto p-5">
      <div class="flex flex-col sm:flex-row gap-5">
        <p class="mt-[8px] font-semibold text-[#808080] w-full sm:w-[20%] sm:text-right">
          Username
        </p>
        <div class="w-full">
          <label class="input validator">
            <svg
              class="h-[1em] opacity-50"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g
                stroke-linejoin="round"
                stroke-linecap="round"
                stroke-width="2.5"
                fill="none"
                stroke="currentColor"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </g>
            </svg>
            <input
              type="input"
              required
              v-model="username"
              @input="validateUsername"
              placeholder="Username"
              pattern="[A-Za-z][A-Za-z0-9\-]*"
              minlength="3"
              maxlength="30"
              title="Chỉ chữ cái, số hoặc dấu gạch ngang"
            />
          </label>
          <p v-if="usernameError" class="validator-hint">
            Phải có từ 3 đến 30 ký tự chỉ chứa chữ cái, số hoặc dấu gạch ngang
          </p>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row gap-5 mt-6">
        <p class="mt-[8px] font-semibold text-[#808080] w-full sm:w-[20%] sm:text-right">
          Email
        </p>
        <div class="w-full">
          <label class="input validator">
            <svg
              class="h-[1em] opacity-50"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g
                stroke-linejoin="round"
                stroke-linecap="round"
                stroke-width="2.5"
                fill="none"
                stroke="currentColor"
              >
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </g>
            </svg>
            <input
              type="email"
              v-model="email"
              @input="validateEmail"
              placeholder="mail@site.com"
              required
            />
          </label>
          <div v-if="emailError" class="validator-hint hidden">
            Nhập địa chỉ email hợp lệ
          </div>
        </div>
      </div>
      <div v-if="showOtpInput" class="flex flex-col sm:flex-row gap-5 mt-6">
        <p class="mt-[8px] font-semibold text-[#808080] w-full sm:w-[20%] sm:text-right">
          Nhập mã OTP
        </p>
        <div class="w-full">
          <label class="input validator">
            <input
              type="text"
              v-model="otpCode"
              @input="validateOtp"
              placeholder="Nhập mã OTP"
              required
              pattern="^[0-9]{6}$"
            />
          </label>
          <p v-if="otpError" class="validator-hint">Mã OTP không hợp lệ</p>
        </div>
      </div>
      <Button
        :item="{
          text: showOtpInput ? 'Xác nhận' : 'Lưu',
        }"
        :loading="loading"
        class="btn-next btn-primary-custom text-white w-full py-6 sm:py-8 mt-20 rounded-lg font-bold sm:btn-sm md:btn-md lg:btn-lg"
        @click="handleActionClick"
      >
        <template #icon>
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              class="bi bi-check"
              viewBox="0 0 16 16"
            >
              <path
                d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"
              />
            </svg>
          </span>
        </template>
      </Button>
    </div>
  </div>
</template>
