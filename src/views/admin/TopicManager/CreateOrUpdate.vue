<script setup>
import { computed, inject, onMounted, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api, { fileToBase64 } from "@/utils";
import { toast } from "vue3-toastify";

const router = useRouter();
const route = useRoute();

const URL_API = inject("URL_API");
const handleErrorAPI = inject("handleErrorAPI");

const isCreate = computed(() => (route.query._id != "null" ? false : true));

const topicObj = reactive({
  _id: undefined,
  name: "",
  description: "",
  image: "",
});

const title = computed(() =>
  route.query._id != "null" ? "Sửa thông tin chủ đề" : "Thêm chủ đề"
);

watch(
  () => route.params._id,
  async () => {
    await init();
  },
  { deep: true }
);

const getTopicById = async (topic_id) => {
  try {
    const res = await api.get(`${URL_API}/api/topic/${topic_id}`);
    if (res?.status !== 200) {
      toast.error(res?.data?.message);
      return null;
    }
    const data = res?.data?.data;
    topicObj._id = data._id;
    topicObj.name = data.name;
    topicObj.description = data.description;
    topicObj.image = data.image;
    return res?.data?.data;
  } catch (error) {
    return handleErrorAPI(error);
  }
};

const init = async () => {
  if (!isCreate.value) {
    // get topic by id
    await getTopicById(route.query._id);
  }
};

const handleChangeFile = async (event) => {
  const file = event.target.files?.[0];
  if (file) {
    topicObj.image = await fileToBase64(file, true);
  }
};

const handleProcessDb = async () => {
  try {
    const res = await api.post(`${URL_API}/api/topic`, {
      ...topicObj,
    });
    if (res?.status !== 200 || (res?.data?.status && res?.data?.status !== 200)) {
      toast.error(res?.data?.message);
      return null;
    }
    console.log(res?.data);
    toast.success(res?.data?.message || "Thành công!");
    setTimeout(() => {
      router.replace(`/admin/topic?_id=${res?.data?.data?._id}`);
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
      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-3 row-span-4 form-group">
          <label for="image" class="form-label w-full h-full rounded-xl cursor-pointer">
            <img
              v-if="topicObj.image"
              :src="topicObj.image"
              :alt="topicObj.name"
              class="w-full h-full object-cover rounded-xl"
            />
            <span
              v-else
              class="block w-full min-h-[150px] bg-[#fff] rounded-xl"
              style="border: 2px dotted #a7a7a7"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="margin: 0px auto; opacity: 0.3; width: 40%"
              >
                <path
                  d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"
                ></path>
                <path d="m14 19.5 3-3 3 3"></path>
                <path d="M17 22v-5.5"></path>
                <circle cx="9" cy="9" r="2"></circle>
              </svg>
              <span class="block w-full text-center mt-2">Ảnh chủ đề</span>
            </span>
          </label>
          <input
            id="image"
            accept="image/*"
            @change="handleChangeFile"
            type="file"
            class="hidden"
          />
        </div>
        <div class="col-span-9 form-group">
          <label class="form-label">Tên chủ đề</label>
          <input
            type="text"
            v-model.trim="topicObj.name"
            class="form-control"
            placeholder="Tên chủ đề"
          />
        </div>
        <div class="col-span-9 form-group">
          <label class="form-label">Mô tả</label>
          <textarea
            class="form-control"
            v-model.trim="topicObj.description"
            placeholder="Mô tả"
          ></textarea>
        </div>
      </div>
      <div class="mt-5">
        <RouterLink
          to="/admin/topic"
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
