<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api, { fileToBase64 } from "@/utils";
import { toast } from "vue3-toastify";
import ListExercise from "./ListExercise.vue";
import _ from "lodash";

const router = useRouter();
const route = useRoute();

const URL_API = inject("URL_API");
const handleErrorAPI = inject("handleErrorAPI");
const isCreate = computed(() => (route.query._id != "null" ? false : true));

const examObj = reactive({
  _id: null,
  name: "",
  description: "",
  image: "",
  total_questions: 0,
  duration: 0,
  exercises: [],
  status: "draft",
});

const title = computed(() =>
  route.query._id != "null" ? "Sửa thông tin bài thi" : "Thêm mới bài thi"
);

const questionsStatus = computed(() => {
  const current = examObj.exercises.length;
  const total = examObj.total_questions;
  return {
    current,
    total,
    isComplete: current === total,
    isOverLimit: current > total,
    canAddMore: current < total
  };
});

watch(
  () => route.params._id,
  async () => {
    await init();
  },
  { deep: true }
);

// Watch for changes in total_questions
watch(
  () => examObj.total_questions,
  (newVal, oldVal) => {
    if (newVal < examObj.exercises.length) {
      toast.warning(`Số lượng câu hỏi hiện tại (${examObj.exercises.length}) vượt quá giới hạn mới (${newVal}). Vui lòng xóa bớt câu hỏi.`);
    }
  }
);

const getExamById = async (exam_id) => {
  try {
    const res = await api.get(`${URL_API}/api/exam/${exam_id}`);
    if (res?.status !== 200) {
      toast.error(res?.data?.message);
      return null;
    }
    const data = res?.data?.data;
    if (!data) {
      toast.error("Bài thi không tồn tại");
      return null;
    }
    examObj._id = data?._id;
    examObj.name = data?.name;
    examObj.description = data?.description;
    examObj.image = data?.image || "";
    examObj.total_questions = data?.total_questions || 0;
    examObj.duration = data?.duration || 0;
    examObj.exercises = data?.exercises;
    examObj.status = data?.status || "draft";
    return data;
  } catch (error) {
    return handleErrorAPI(error);
  }
};

const init = async () => {
  if (!isCreate.value) {
    // get exam by id
    await getExamById(route.query._id);
  }
};

const handleProcessDb = async () => {
  try {
    // Validate số lượng câu hỏi
    if (examObj.exercises.length !== examObj.total_questions) {
      toast.error(`Số lượng câu hỏi hiện tại (${examObj.exercises.length}) không khớp với số lượng yêu cầu (${examObj.total_questions}). Vui lòng thêm hoặc xóa câu hỏi cho đúng.`);
      return;
    }
    
    // process exercises data
    examObj.exercises = examObj.exercises.map((item) => {
      return {
        ...item,
        type: item.type?._id,
        level: item.level?._id,
      };
    });
    const res = await api.post(`${URL_API}/api/exam`, examObj);
    console.log(res);
    if (res?.status !== 200 || (res?.data?.status && res?.data?.status !== 200)) {
      toast.error(res?.data?.message);
      return;
    }
    toast.success(res?.data?.message || "Thành công!");
    setTimeout(() => {
      router.replace(`/admin/exam?_id=${res?.data?.data?._id}`);
    }, 1000);
  } catch (error) {
    return handleErrorAPI(error);
  }
};

const handleAddExercise = (data) => {
  // update
  if (data?._id && data?._id != "") {
    const indexItem = _.findIndex(examObj.exercises, { _id: data?._id });
    if (indexItem == -1) {
      toast.error("Câu hỏi không được tìm thấy");
      return;
    }
    examObj.exercises[indexItem] = {
      ...data,
    };
  } else {
    // Kiểm tra số lượng câu hỏi tối đa
    if (examObj.exercises.length >= examObj.total_questions) {
      toast.error(`Không thể thêm câu hỏi. Đã đạt giới hạn ${examObj.total_questions} câu hỏi.`);
      return;
    }
    examObj.exercises.push({ ...data, _id: examObj.exercises.length.toString() });
    toast.success(`Đã thêm câu hỏi (${examObj.exercises.length}/${examObj.total_questions})`);
  }
};

const handleDeleteExercise = (exercise_id) => {
  const indexItem = _.findIndex(examObj.exercises, { _id: exercise_id });
  if (indexItem == -1) {
    toast.error("Bài tập không được tìm thấy");
    return;
  }
  examObj.exercises.splice(indexItem, 1);
};

const handleSelectVocabulary = (vocabulary) => {
  // Không cần vocabulary cho exam
};

const handleSelectAllVocabulary = (data) => {
  // Không cần vocabulary cho exam
};

const handleUploadImage = async (e) => {
  try {
    const file = e.target.files[0];
    if (!file) return;
    
    // Convert file to base64 với MIME type
    examObj.image = await fileToBase64(file, true);
    toast.success('Upload ảnh thành công!');
  } catch (error) {
    toast.error('Có lỗi xảy ra khi upload ảnh');
    handleErrorAPI(error);
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
      <div class="grid grid-cols-12 gap-4">
        <!-- Thông tin cơ bản -->
        <div class="col-span-12">
          <h3 class="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">Thông tin cơ bản</h3>
        </div>
        
        <div class="col-span-6 form-group">
          <label class="form-label">Tên bài thi *</label>
          <input
            v-model="examObj.name"
            type="text"
            class="form-control"
            placeholder="Nhập tên bài thi"
            required
          />
        </div>
        
        <div class="col-span-6 form-group">
          <label class="form-label">Trạng thái</label>
          <select
            v-model="examObj.status"
            class="select select-neutral form-control w-full border-[#dee2e6]"
          >
            <option value="draft">Bản nháp</option>
            <option value="publish">Đã xuất bản</option>
          </select>
        </div>
        
        <div class="col-span-12 form-group">
          <label class="form-label">Mô tả bài thi</label>
          <textarea
            v-model="examObj.description"
            class="form-control resize-none"
            placeholder="Nhập mô tả chi tiết về nội dung, mục tiêu và yêu cầu của bài thi..."
            rows="4"
          ></textarea>
          <div class="mt-1" style="font-size: 11px; color: #9ca3af;">
            Mô tả này sẽ hiển thị cho học viên khi họ xem thông tin bài thi
          </div>
        </div>

        <div class="col-span-12 form-group">
          <label class="form-label">Ảnh đại diện bài thi</label>
          <div class="flex items-start gap-4">
            <div class="flex-1">
              <input
                type="file"
                class="form-control"
                accept="image/*"
                @change="handleUploadImage"
              />
              <div class="mt-1" style="font-size: 11px; color: #9ca3af;">
                Định dạng: JPG, PNG, GIF. Kích thước tối đa: 5MB. Tỷ lệ khuyến nghị: 16:9
              </div>
            </div>
            <div v-if="examObj.image" class="flex-shrink-0">
              <img 
                :src="examObj.image" 
                alt="Ảnh bài thi" 
                class="w-24 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
              />
              <button 
                type="button" 
                @click="examObj.image = ''"
                class="mt-1" style="font-size: 11px;"
              >
                Xóa ảnh
              </button>
            </div>
            <div v-else class="flex-shrink-0 w-24 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Cấu hình bài thi -->
        <div class="col-span-12 mt-4">
          <h3 class="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">Cấu hình bài thi</h3>
        </div>
        
        <div class="col-span-6 form-group">
          <label class="form-label">Số lượng câu hỏi *</label>
          <input
            v-model.number="examObj.total_questions"
            type="number"
            class="form-control"
            placeholder="Nhập số câu hỏi"
            min="1"
            required
          />
        </div>
        
        <div class="col-span-6 form-group">
          <label class="form-label">Thời gian làm bài (phút) *</label>
          <input
            v-model.number="examObj.duration"
            type="number"
            class="form-control"
            placeholder="Nhập thời gian (phút)"
            min="1"
            required
          />
        </div>

        <!-- Danh sách câu hỏi -->
        <div class="col-span-12 mt-4">
          <div class="flex justify-between items-center border-b pb-2">
            <h3 class="text-lg font-semibold text-gray-700">Danh sách câu hỏi</h3>
            <div class="flex items-center gap-2">
              <span 
                class="px-3 py-1 rounded-full text-sm font-medium"
                :class="{
                  'bg-green-100 text-green-700': questionsStatus.isComplete,
                  'bg-red-100 text-red-700': questionsStatus.isOverLimit,
                  'bg-yellow-100 text-yellow-700': !questionsStatus.isComplete && !questionsStatus.isOverLimit
                }" style="font-size: 15px;"
              >
                {{ questionsStatus.current }}/{{ questionsStatus.total }} câu hỏi
              </span>
              <span 
                v-if="questionsStatus.isOverLimit"
                class="text-xs text-red-600" style="font-size: 15px;"
              >
                Vượt quá giới hạn!
              </span>
              <span 
                v-else-if="!questionsStatus.isComplete"
                class="text-xs text-yellow-600" style="font-size: 15px"
              >
                Còn thiếu {{ questionsStatus.total - questionsStatus.current }} câu
              </span>
              <span 
                v-else
                class="text-xs text-green-600" style="font-size: 15px;"
              >
                Đủ câu hỏi
              </span>
            </div>
          </div>
        </div>
        
        <div class="col-span-12">
          <ListExercise
            :exercises="examObj.exercises"
            @addExercise="handleAddExercise"
            @deleteExercise="handleDeleteExercise"
          />
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="mt-6 pt-4 border-t">
        <div class="flex gap-3">
          <RouterLink
            to="/admin/exam"
            class="btn btn-outline-secondary px-4 py-2"
            >
            <i class="bi bi-arrow-left me-1"></i>
            Quay lại
          </RouterLink>
          <button 
            type="button" 
            @click="handleProcessDb" 
            class="btn btn-success px-4 py-2"
            :disabled="!examObj.name || !examObj.total_questions || !examObj.duration"
          >
            <i class="bi bi-check-circle me-1"></i>
            {{ isCreate ? "Tạo bài thi" : "Cập nhật" }}
          </button>
        </div>
      </div>
    </fieldset>
  </form>
</template>
