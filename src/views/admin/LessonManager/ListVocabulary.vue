<script setup>
import { ref, onMounted, inject, watch } from "vue";
import api from "@/utils";
import { toast } from "vue3-toastify";
import _ from "lodash";

const URL_API = inject("URL_API");
const handleErrorAPI = inject("handleErrorAPI");

const { vocabulariesLesson, topic_id } = defineProps(["vocabularies-lesson", "topic_id"]);
const emit = defineEmits(["select-vocabulary", "select-all-vocabulary"]);

const vocabularies = ref([]);
const pagination = ref({});
const page = ref(1);
const limit = ref(10);
const search = ref("");
const checkAll = ref(false);

watch(
  () => topic_id,
  async () => {
    page.value = 1;
    checkAll.value = false;
    search.value = "";
    await getAllByTopic();
  },
  { deep: true }
);

watch(page, async () => {
  checkAll.value = false;
  await getAllByTopic();
});

const getAllByTopic = async () => {
  try {
    if (!topic_id) {
      vocabularies.value = [];
      return null;
    } else {
      const res = await api.get(
        `${URL_API}/api/vocabulary/topic/${topic_id}?page=${page.value}&limit=${limit.value}&search=${search.value}`
      );
      if (res?.status !== 200) {
        toast.error(res?.data?.message);
        return null;
      }
      const data = res?.data?.data;
      vocabularies.value = data?.vocabularies || [];
      pagination.value = data?.pagination || {};
      console.log("vocabularies", vocabularies.value);
      console.log("vocabulariesLesson", vocabulariesLesson);
      return data;
    }
  } catch (error) {
    handleErrorAPI(error);
  }
};

const init = async () => {
  await getAllByTopic();
};

const isCheck = (vocabulary) => {
  return vocabulariesLesson.some(
    (item) => item?._id?.toString() == vocabulary?._id?.toString()
  );
};

const handleSelectAll = () => {
  if (checkAll.value) {
    emit("select-all-vocabulary", vocabularies.value);
  } else {
    emit("select-all-vocabulary", []);
  }
};

onMounted(() => {
  init();
});
</script>

<template>
  <div class="col-span-12 form-group">
    <label class="form-label flex justify-between items-center">
      <span>Danh sách từ vựng</span>
      <!-- <button
        type="button"
        class="btn btn-soft btn-success"
        style="font-size: 14px"
      >
        Thêm mới
      </button> -->
    </label>
    <div class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th class="text-center">
              <label>
                <input
                  type="checkbox"
                  class="checkbox"
                  v-model="checkAll"
                  @change="handleSelectAll"
                />
              </label>
            </th>
            <th>Từ vựng</th>
            <th>Dịch tiếng Việt</th>
            <th>Phiên âm</th>
            <th>Loại từ</th>
            <th>Chủ đề</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vocabulary in vocabularies" :key="vocabulary?._id">
            <th class="text-center">
              <label>
                <input
                  type="checkbox"
                  class="checkbox"
                  :checked="isCheck(vocabulary)"
                  @change="emit('select-vocabulary', vocabulary)"
                />
              </label>
            </th>
            <td>{{ vocabulary?.word }}</td>
            <td>{{ vocabulary?.vietnamese }}</td>
            <td>{{ vocabulary?.phonetic }}</td>
            <td>
              <span
                v-for="type in vocabulary?.type"
                :key="type"
                class="badge bg-primary me-1"
                >{{ type }}
              </span>
            </td>
            <td>
              <span>{{ vocabulary?.topic_id?.name }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- pagination -->
    <div class="flex justify-between items-center font-semibold bg-white py-2 px-4">
      <div class="join">
        <button @click.prevent="page -= 1" :disabled="page == 1" class="join-item btn">
          «
        </button>
        <button @click.prevent="" class="join-item btn">Trang {{ page }}</button>
        <button
          @click.prevent="page += 1"
          :disabled="page == pagination?.totalPages"
          class="join-item btn"
        >
          »
        </button>
      </div>
      <div class="text-[1rem]">Tổng số: {{ pagination?.totalRecords || 0 }}</div>
    </div>
  </div>
</template>
