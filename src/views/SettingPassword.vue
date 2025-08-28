<script setup>
import { ref, onMounted, toRefs, inject } from "vue";
import Button from "@/components/Button.vue";
import api from "@/utils";
import { toast } from "vue3-toastify";

const URL_API = inject("URL_API");
const handleErrorAPI = inject("handleErrorAPI");

const props = defineProps(["user"]);
const { user } = toRefs(props);
const loading = ref(false);

const oldPassword = ref("");
const oldPasswordError = ref(false);
const newPassword = ref("");
const newPasswordError = ref(false);
const confirmPassword = ref("");
const confirmPasswordError = ref(false);

const validateOldPassword = () => {
  // chỉ cho phép chữ cái và số, không có khoảng trắng, từ 6 ký tự trở lên
  const regex = /^\S{6,}$/;
  oldPasswordError.value = !regex.test(oldPassword.value);
};

const validateNewPassword = () => {
  // chỉ cho phép chữ cái và số, không có khoảng trắng, từ 6 ký tự trở lên
  const regex = /^\S{6,}$/;
  newPasswordError.value = !regex.test(newPassword.value);
};

const validateConfirmPassword = () => {
  confirmPasswordError.value = confirmPassword.value !== newPassword.value;
};

const handleActionClick = async () => {
  loading.value = true;
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    toast.error("Vui lòng nhập đầy đủ thông tin");
    loading.value = false;
    return;
  }
  if (oldPasswordError.value || newPasswordError.value || confirmPasswordError.value) {
    loading.value = false;
    return;
  }
  try {
    const res = await api.post(`${URL_API}/api/user/change-password`, {
      oldPassword: oldPassword.value,
      newPassword: newPassword.value,
    });
    if (res.status !== 200) {
      toast.error(res?.data?.message);
      loading.value = false;
      return;
    }
    if (res.data?.status !== 200) {
      toast.error(res.data?.message);
      loading.value = false;
      return;
    } else {
      toast.success(res.data?.message);
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  } catch (error) {
    handleErrorAPI(error);
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
      <h3
        class="text-[1.8rem] text-[#3e3e3e] text-center font-bold pb-[10px] mb-[15px]"
        style="border-bottom: 1px dashed #e4e4e4"
      >
        Thay đổi mật khẩu
      </h3>
      <div class="flex flex-col gap-4">
        <p class="mt-[8px] font-bold text-[#3e3e3e]">Mật khẩu cũ:</p>
        <div class="w-full">
          <label class="input validator">
            <input
              type="password"
              required
              v-model="oldPassword"
              @input="validateOldPassword"
              placeholder="Mật khẩu cũ"
              pattern="^\S{6,}$"
              title="Mật khẩu cũ"
            />
          </label>
          <p v-if="oldPasswordError" class="validator-hint">Mật khẩu cũ không hợp lệ</p>
        </div>
      </div>
      <div class="mt-5">
        <p class="text-[#3e3e3e] font-bold mb-3">Mật khẩu mới:</p>
        <ul class="list-disc ml-5 ps-10 text-[#808080] text-[1.4rem] leading-8">
          <li>Mật khẩu của bạn phải chứa ít nhất 6 ký tự.</li>
          <li>Mật khẩu của bạn không được chứa các ký tự khoảng trắng.</li>
        </ul>
      </div>
      <div class="flex gap-8 mt-4">
        <div class="w-full">
          <label class="input validator">
            <input
              type="password"
              v-model="newPassword"
              @input="validateNewPassword"
              placeholder="Mật khẩu mới"
              pattern="^\S{6,}$"
              required
            />
          </label>
          <div v-if="newPasswordError" class="validator-hint hidden">
            Mật khẩu mới không hợp lệ
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <p class="mt-[8px] font-bold text-[#3e3e3e]">Xác nhận mật khẩu mới:</p>
        <div class="w-full">
          <label class="input validator">
            <input
              type="password"
              required
              v-model="confirmPassword"
              @input="validateConfirmPassword"
              placeholder="Xác nhận mật khẩu mới"
              pattern="^\S{6,}$"
              title="Xác nhận mật khẩu mới"
            />
          </label>
          <p class="validator-hint">Mật khẩu xác nhận không hợp lệ</p>
          <p
            v-if="confirmPasswordError"
            class="text-[#ff637d]"
            style="margin-top: calc(0.25rem * 2)"
          >
            Mật khẩu xác nhận không khớp với mật khẩu mới
          </p>
        </div>
      </div>
      <Button
        :item="{
          text: 'Lưu thay đổi',
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
