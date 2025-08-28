<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/utils";
import { toast } from "vue3-toastify";

const router = useRouter();
const route = useRoute();

const URL_API = inject("URL_API");
const handleErrorAPI = inject("handleErrorAPI");
const { topics } = defineProps(["topics"]);

const isCreate = computed(() => (route.query._id != "null" ? false : true));

const progressObj = reactive({
  _id: null,
  name: "",
  description: "",
  order: 0,
  icon: "",
  topic_id: "",
});

const title = computed(() =>
  route.query._id != "null" ? "Sửa thông tin lộ trình" : "Thêm mới lộ trình"
);

watch(
  () => route.params._id,
  async () => {
    await init();
  },
  { deep: true }
);

const getProgressById = async (topic_id) => {
  try {
    const res = await api.get(`${URL_API}/api/progress/${topic_id}`);
    if (res?.status !== 200) {
      toast.error(res?.data?.message);
      return null;
    }
    const data = res?.data?.data;
    progressObj._id = data._id;
    progressObj.name = data.name;
    progressObj.description = data.description;
    progressObj.topic_id = data.topic_id;
    progressObj.order = data.order;
    progressObj.icon = data.icon;
    return res?.data?.data;
  } catch (error) {
    return handleErrorAPI(error);
  }
};

const init = async () => {
  if (!isCreate.value) {
    // get topic by id
    await getProgressById(route.query._id);
  }
};

const handleProcessDb = async () => {
  try {
    const res = await api.post(`${URL_API}/api/progress`, {
      ...progressObj,
    });
    if (res?.status !== 200 || (res?.data?.status && res?.data?.status !== 200)) {
      toast.error(res?.data?.message);
      return null;
    }
    toast.success(res?.data?.message || "Thành công!");
    setTimeout(() => {
      router.replace(`/admin/progress?_id=${res?.data?.data?._id}`);
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
  <form method="post" class="form mt-4" autocomplete="off">
    <fieldset>
      <div class="grid grid-cols-12 gap-2">
        <div class="col-span-6 form-group">
          <label class="form-label">Tên lộ trình</label>
          <input
            v-model="progressObj.name"
            type="text"
            class="form-control"
            placeholder="Tên lộ trình"
          />
        </div>
        <div class="col-span-6 form-group">
          <label class="form-label">Chủ đề</label>
          <select
            v-model="progressObj.topic_id"
            class="select select-neutral form-control w-full border-[#dee2e6]"
          >
            <option disabled selected value="">Chủ đề</option>
            <option v-for="topic in topics" :key="topic?._id" :value="topic._id">
              {{ topic.name }}
            </option>
          </select>
        </div>
        <div class="col-span-6 form-group">
          <label class="form-label">Icon</label>
          <input
            v-model="progressObj.icon"
            type="text"
            class="form-control"
            placeholder="Icon"
          />
        </div>
        <div class="col-span-6 form-group">
          <label class="form-label">Thứ tự hiển thị</label>
          <input
            v-model="progressObj.order"
            type="number"
            class="form-control"
            placeholder="Thứ tự hiển thị"
          />
        </div>
        <div class="col-span-12 form-group">
          <label class="form-label">Mô tả</label>
          <textarea
            v-model="progressObj.description"
            class="form-control"
            placeholder="Mô tả"
          ></textarea>
        </div>
      </div>
      <div class="mt-5">
        <RouterLink
          to="/admin/progress"
          class="btn btn-outline-primary"
          style="margin-right: 4px"
          >Quay lại</RouterLink
        >
        <button type="button" @click="handleProcessDb" class="btn btn-success">
          <i class="bi bi-plus-circle"></i>&nbsp; {{ isCreate ? "Lưu" : "Cập nhật" }}
        </button>
      </div>
    </fieldset>
  </form>
</template>
