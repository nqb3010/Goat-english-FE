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

const password = ref("");
const passwordError = ref(false);
const confirmDelete = ref(false);

const validatePassword = () => {
  // chỉ cho phép chữ cái và số, không có khoảng trắng, từ 6 ký tự trở lên
  const regex = /^\S{6,}$/;
  passwordError.value = !regex.test(password.value);
};

const handleActionClick = async () => {
  loading.value = true;
  if (!passwordError.value && confirmDelete.value) {
    const result = confirm("Bạn có chắc chắn muốn xóa tài khoản của mình không?");
    if (result) {
      try {
        const res = await api.post(`${URL_API}/api/user/delete-account`, {
          password: password.value,
        });
        console.log(res);
        if (res.status !== 200) {
          toast.error(res.data?.message);
          loading.value = false;
          return;
        }
        if (res.data?.status !== 200) {
          toast.error(res.data?.message || "Xóa tài khoản thất bại");
          loading.value = false;
          return;
        }
        toast.success(res.data?.message || "Xóa tài khoản thành công");
        setTimeout(() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/login";
        }, 3000);
      } catch (error) {
        handleErrorAPI(error);
      } finally {
        loading.value = false;
      }
    } else {
      loading.value = false;
    }
  } else {
    toast.error("Vui lòng nhập mật khẩu hiện tại và xác nhận xóa tài khoản");
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
        <p
          class="text-[#3e3e3e] pb-[10px] leading-10"
          style="border-bottom: 1px dashed #e4e4e4"
        >
          Để đảm bảo mức độ bảo vệ dữ liệu cao nhất, việc xóa tài khoản của bạn sẽ xóa tất
          cả thông tin nhận dạng cá nhân được liên kết với tài khoản. Nó có một hành động
          không thể đảo ngược mà không thể hoàn tác.
        </p>
        <div class="flex items-center gap-3">
          <input
            type="checkbox"
            v-model="confirmDelete"
            class="checkbox checkbox-error"
            style="width: 20px; height: 20px"
            id="checkbox-delete-account"
          />
          <label
            for="checkbox-delete-account"
            class="text-[#3e3e3e] font-bold cursor-pointer leading-8"
          >
            Tôi chắc rằng tôi muốn xóa tài khoản của mình
          </label>
        </div>
      </div>
      <div class="flex flex-col gap-4 mt-8">
        <p class="mt-[8px] font-bold text-[#3e3e3e]">Mật khẩu hiện tại:</p>
        <div class="w-full">
          <label class="input validator">
            <input
              type="password"
              required
              v-model="password"
              @input="validatePassword"
              placeholder="Mật khẩu hiện tại"
              pattern="^\S{6,}$"
              title="Mật khẩu hiện tại"
            />
          </label>
          <p v-if="passwordError" class="validator-hint">
            Mật khẩu hiện tại không hợp lệ
          </p>
        </div>
      </div>
      <Button
        :item="{
          text: 'Xác nhận xóa',
          style: 'font-size: 1.8rem; color: #2c3445; background-color: #ff756b',
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
              class="bi bi-x"
              viewBox="0 0 16 16"
            >
              <path
                d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"
              />
            </svg>
          </span>
        </template>
      </Button>
    </div>
  </div>
</template>
