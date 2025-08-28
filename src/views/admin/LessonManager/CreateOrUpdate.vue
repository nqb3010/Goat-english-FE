<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/utils";
import { toast } from "vue3-toastify";
import ListExercise from "./ListExercise.vue";
import _ from "lodash";
import ListVocabulary from "./ListVocabulary.vue";

const router = useRouter();
const route = useRoute();

const URL_API = inject("URL_API");
const handleErrorAPI = inject("handleErrorAPI");
const { topics } = defineProps(["topics"]);
const isCreate = computed(() => (route.query._id != "null" ? false : true));

const lessonObj = reactive({
  _id: null,
  title: "",
  description: "",
  order: 0,
  exercises: [],
  vocabularies: [],
  progress_id: "",
  status: "",
});

const topic_id = ref("");
const progresses = ref([]);

const title = computed(() =>
  route.query._id != "null" ? "Sửa thông tin bài học" : "Thêm mới bài học"
);

watch(
  () => route.params._id,
  async () => {
    await init();
  },
  { deep: true }
);

watch(topic_id, async () => {
  progresses.value = await getProgressByTopicId(topic_id.value);
  if (isCreate.value || progresses.value?.length == 0) {
    lessonObj.progress_id = "";
  }
});

const getProgressByTopicId = async (topic_id) => {
  try {
    const res = await api.get(`${URL_API}/api/progress/topic/${topic_id}`);
    if (res?.status !== 200) {
      toast.error(res?.data?.message);
      return null;
    }
    const data = res?.data?.data;
    return data;
  } catch (error) {
    return handleErrorAPI(error);
  }
};

const getLessonById = async (lesson_id) => {
  try {
    const res = await api.get(`${URL_API}/api/lesson/${lesson_id}`);
    if (res?.status !== 200) {
      toast.error(res?.data?.message);
      return null;
    }
    const data = res?.data?.data;
    if (!data) {
      toast.error("Bài học không tồn tại");
      return null;
    }
    topic_id.value = data?.topic?._id;
    lessonObj._id = data?._id;
    lessonObj.title = data?.title;
    lessonObj.description = data?.description;
    lessonObj.order = data?.order;
    lessonObj.exercises = data?.exercises;
    lessonObj.progress_id = data?.progress_id || data?.progress?._id || "";
    lessonObj.status = data?.status || "";
    lessonObj.vocabularies = data?.vocabularies;
    return data;
  } catch (error) {
    return handleErrorAPI(error);
  }
};

const init = async () => {
  if (!isCreate.value) {
    // get lesson by id
    await getLessonById(route.query._id);
  }
};

const handleProcessDb = async () => {
  try {
    // get all id vocabulary
    const idsVocabulary = lessonObj.vocabularies
      .filter((item) => item?.topic_id?._id == topic_id.value)
      .map((item) => item?._id);
    // get all id exercise
    lessonObj.exercises = lessonObj.exercises.map((item) => {
      return {
        ...item,
        type: item.type?._id,
        level: item.level?._id,
      };
    });
    const res = await api.post(`${URL_API}/api/lesson`, {
      ...lessonObj,
      vocabularies: idsVocabulary,
    });
    console.log(res);
    if (res?.status !== 200 || (res?.data?.status && res?.data?.status !== 200)) {
      toast.error(res?.data?.message);
      return;
    }
    toast.success(res?.data?.message || "Thành công!");
    setTimeout(() => {
      router.replace(`/admin/lesson?_id=${res?.data?.data?._id}`);
    }, 1000);
  } catch (error) {
    return handleErrorAPI(error);
  }
};

const handleAddExercise = (data) => {
  // update
  if (data?._id && data?._id != "") {
    const indexItem = _.findIndex(lessonObj.exercises, { _id: data?._id });
    if (indexItem == -1) {
      toast.error("Bài tập không được tìm thấy");
      return;
    }
    lessonObj.exercises[indexItem] = {
      ...data,
    };
  } else {
    lessonObj.exercises.push({ ...data, _id: lessonObj.exercises.length.toString() });
  }
};

const handleDeleteExercise = (exercise_id) => {
  const indexItem = _.findIndex(lessonObj.exercises, { _id: exercise_id });
  if (indexItem == -1) {
    toast.error("Bài tập không được tìm thấy");
    return;
  }
  lessonObj.exercises.splice(indexItem, 1);
};

const handleSelectVocabulary = (vocabulary) => {
  const indexItem = _.findIndex(
    lessonObj.vocabularies,
    (item) => item?._id == vocabulary?._id
  );
  if (indexItem == -1) {
    lessonObj.vocabularies.push(vocabulary);
  } else {
    lessonObj.vocabularies.splice(indexItem, 1);
  }
};

const handleSelectAllVocabulary = (data) => {
  lessonObj.vocabularies = data;
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
        <div class="col-span-12 form-group">
          <label class="form-label">Tiêu đề bài học</label>
          <input
            v-model="lessonObj.title"
            type="text"
            class="form-control"
            placeholder="Tiêu đề bài học"
          />
        </div>
        <div class="col-span-4 form-group">
          <label class="form-label">Chủ đề</label>
          <select
            v-model="topic_id"
            class="select select-neutral form-control w-full border-[#dee2e6]"
          >
            <option disabled selected value="">Chủ đề</option>
            <option v-for="topic in topics" :key="topic?._id" :value="topic._id">
              {{ topic.name }}
            </option>
          </select>
        </div>
        <div class="col-span-4 form-group">
          <label class="form-label">Lộ trình</label>
          <select
            v-model="lessonObj.progress_id"
            class="select select-neutral form-control w-full border-[#dee2e6]"
          >
            <option disabled selected value="">Lộ trình</option>
            <option
              v-for="progress in progresses"
              :key="progress?._id"
              :value="progress._id"
            >
              {{ progress.name }}
            </option>
          </select>
        </div>
        <div class="col-span-4 form-group">
          <label class="form-label">Trạng thái</label>
          <select
            v-model="lessonObj.status"
            class="select select-neutral form-control w-full border-[#dee2e6]"
          >
            <option disabled selected value="">Trạng thái</option>
            <option value="draft">Nháp</option>
            <option value="publish">Xuất bản</option>
          </select>
        </div>
        <div class="col-span-12 form-group">
          <label class="form-label">Mô tả</label>
          <textarea
            v-model="lessonObj.description"
            class="form-control"
            placeholder="Mô tả"
          ></textarea>
        </div>
        <ListVocabulary
          :vocabularies-lesson="lessonObj.vocabularies"
          :topic_id="topic_id"
          @select-vocabulary="handleSelectVocabulary"
          @select-all-vocabulary="handleSelectAllVocabulary"
        />
        <ListExercise
          :exercises="lessonObj.exercises"
          @addExercise="handleAddExercise"
          @deleteExercise="handleDeleteExercise"
        />
      </div>
      <div class="mt-5">
        <RouterLink
          to="/admin/lesson"
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
