<script setup>
import api from "@/utils";
import { computed, inject, onMounted, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue3-toastify";

const router = useRouter();
const route = useRoute();

const URL_API = inject("URL_API");
const handleErrorAPI = inject("handleErrorAPI");

const isCreate = computed(() => (route.query._id != "null" ? false : true));

const userObj = reactive({
  _id: null,
  username: "",
  email: "",
  role: null,
});

const title = computed(() =>
  route.query._id != "null" ? "Sửa thông tin người dùng" : "Thêm người dùng"
);

watch(
  () => route.params._id,
  async () => {
    await init();
  },
  { deep: true }
);

const getUserById = async (topic_id) => {
  try {
    const res = await api.get(`${URL_API}/api/user/${topic_id}`);
    if (res?.status !== 200) {
      toast.error(res?.data?.message);
      return null;
    }
    const data = res?.data?.data;
    userObj._id = data._id;
    userObj.username = data.username;
    userObj.email = data.email;
    userObj.role = data.role;
    return res?.data?.data;
  } catch (error) {
    return handleErrorAPI(error);
  }
};

const init = async () => {
  if (!isCreate.value) {
    // get user by id
    await getUserById(route.query._id);
  }
};

const handleProcessDb = async () => {
  try {
    const res = await api.post(`${URL_API}/api/user`, {
      ...userObj,
    });
    if (res?.status !== 200 || (res?.data?.status && res?.data?.status !== 200)) {
      toast.error(res?.data?.message);
      return null;
    }
    console.log(res?.data);
    toast.success(res?.data?.message || "Thành công!");
    setTimeout(() => {
      router.replace(`/admin/user?_id=${res?.data?.data?._id}`);
    }, 1000);
  } catch (error) {
    return handleErrorAPI(error);
  }
};

onMounted(() => {
  init();
});
</script>

<template>
  <h2 class="lv2">{{ title }}</h2>
  <form method="post" class="form" autocomplete="off">
    <fieldset>
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-6 form-group mt-4">
          <label class="form-label">Username</label>
          <input
            v-model="userObj.username"
            type="text"
            class="form-control"
            required
            placeholder="Username"
          />
        </div>
        <div class="col-span-6 form-group mt-4">
          <label class="form-label">Email</label>
          <input
            v-model="userObj.email"
            type="email"
            class="form-control"
            required
            placeholder="Enter email"
            name="email"
          />
        </div>
        <div class="col-span-6">
          <select
            v-model="userObj.role"
            class="select select-neutral form-control w-full border-[#dee2e6]"
          >
            <option disabled selected value="null">Role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <div class="mt-5">
        <router-link
          to="/admin/user"
          class="btn btn-outline-primary"
          style="margin-right: 4px"
          >Quay lại</router-link
        >
        <button type="button" @click="handleProcessDb" class="btn btn-success">
          <i class="bi bi-plus-circle"></i>&nbsp; {{ isCreate ? "Lưu" : "Cập nhật" }}
        </button>
      </div>
    </fieldset>
  </form>
</template>
