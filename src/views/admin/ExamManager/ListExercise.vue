<script setup>
import { ref, reactive, onMounted, inject, watch } from 'vue'
import api from '@/utils'
import { toast } from 'vue3-toastify'
import _ from 'lodash'

const URL_API = inject('URL_API')
const handleErrorAPI = inject('handleErrorAPI')

const { exercises } = defineProps(['exercises'])
const emit = defineEmits(['addExercise', 'deleteExercise'])

const modeEditorOption = ref(0) // 0: view, 1: add or update
const showModelExercise = ref(false)

const types = ref([])
const levels = ref([])

const exerciseObj = reactive({
  _id: '',
  question: '',
  type: null,
  level: null,
  options: [],
  audio: '',
  correct_answer: '',
  explain_answer: '',
  explain_answer_vn: '',
})

const optionObj = reactive({
  _id: '',
  ma_dap_an: '',
  noi_dung: '',
})

const typeActive = ref()

watch(
  () => exerciseObj.type,
  (value) => {
    typeActive.value = getTypeById(value)
  },
)

const getTypes = async () => {
  try {
    const res = await api.get(`${URL_API}/api/exercise-type`)
    // send success
    if (res?.status !== 200) {
      toast.error(res?.data?.message)
      return
    }
    return res?.data?.data
  } catch (error) {
    handleErrorAPI(error)
  }
}

const getLevels = async () => {
  try {
    const res = await api.get(`${URL_API}/api/exercise-level`)
    // send success
    if (res?.status !== 200) {
      toast.error(res?.data?.message)
      return
    }
    return res?.data?.data
  } catch (error) {
    handleErrorAPI(error)
  }
}

const handleInsertOption = () => {
  // update
  if (optionObj._id) {
    const indexItem = _.findIndex(exerciseObj.options, { _id: optionObj._id })
    console.log(exerciseObj.options[indexItem])
    exerciseObj.options[indexItem] = {
      ...exerciseObj.options[indexItem],
      ma_dap_an: optionObj.ma_dap_an,
      noi_dung: optionObj.noi_dung,
    }
  } else {
    exerciseObj.options.push({
      _id: exerciseObj.options?.length?.toString(),
      ma_dap_an: optionObj.ma_dap_an,
      noi_dung: optionObj.noi_dung,
    })
  }
  optionObj._id = ''
  optionObj.ma_dap_an = ''
  optionObj.noi_dung = ''
  modeEditorOption.value = 0
}

const handleUpdateOption = (option) => {
  optionObj._id = option._id
  optionObj.ma_dap_an = option.ma_dap_an
  optionObj.noi_dung = option.noi_dung
  modeEditorOption.value = 1
}

const handleDeleteOption = (option) => {
  const result = confirm('Xác nhận xóa lựa chọn')
  if (result) {
    exerciseObj.options = exerciseObj.options.filter((item) => item.ma_dap_an !== option.ma_dap_an)
  }
}

const handleCloseModeEditor = () => {
  optionObj._id = ''
  optionObj.ma_dap_an = ''
  optionObj.noi_dung = ''
  modeEditorOption.value = 0
}

const getTypeById = (id) => {
  const type = _.find(types.value, { _id: id })
  return type
}

const getLevelById = (id) => {
  const level = _.find(levels.value, { _id: id })
  return level
}

const handleAddExerciseToList = () => {
  exerciseObj.type = getTypeById(exerciseObj.type)
  exerciseObj.level = getLevelById(exerciseObj.level)
  emit('addExercise', exerciseObj)
  showModelExercise.value = false
}

const handleUpdateExercise = (exercise) => {
  showModelExercise.value = true
  exerciseObj._id = exercise?._id
  exerciseObj.question = exercise?.question
  exerciseObj.type = exercise?.type?._id
  exerciseObj.level = exercise?.level?._id
  exerciseObj.options = exercise?.options
  exerciseObj.audio = exercise?.audio
  exerciseObj.correct_answer = exercise?.correct_answer
  exerciseObj.explain_answer = exercise?.explain_answer
  exerciseObj.explain_answer_vn = exercise?.explain_answer_vn
}

const handleClickAddExercise = () => {
  showModelExercise.value = true
  exerciseObj._id = ''
  exerciseObj.question = ''
  exerciseObj.type = null
  exerciseObj.level = null
  exerciseObj.options = []
  exerciseObj.audio = ''
  exerciseObj.correct_answer = ''
  exerciseObj.explain_answer = ''
  exerciseObj.explain_answer_vn = ''
}

const handleDeleteExercise = (exercise_id) => {
  const result = confirm('Xác nhận xóa câu hỏi')
  if (result) {
    emit('deleteExercise', exercise_id)
  }
}

onMounted(async () => {
  types.value = await getTypes()
  levels.value = await getLevels()
  console.log('exercises', exercises)
})
</script>

<template>
  <div class="col-span-12 form-group">
    <label class="form-label flex justify-between items-center">
      <span>Danh sách câu hỏi thi</span>
      <button
        @click.prevent="handleClickAddExercise"
        type="button"
        class="btn btn-soft btn-success"
        style="font-size: 14px"
      >
        Thêm mới
      </button>
    </label>
    <div class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <!-- <th class="text-center">
                    <label>
                      <input type="checkbox" class="checkbox" />
                    </label>
                  </th> -->
            <th class="text-center">STT</th>
            <th>Câu hỏi</th>
            <th>Đáp án</th>
            <th>Loại câu hỏi</th>
            <th>Cấp độ câu hỏi</th>
            <th class="text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(exercise, index) in exercises" :key="exercise._id">
            <!-- <th class="text-center">
                    <label>
                      <input type="checkbox" class="checkbox" />
                    </label>
                  </th> -->
            <th class="text-center">{{ index + 1 }}</th>
            <td>{{ exercise.question }}</td>
            <td>{{ exercise.correct_answer }}</td>
            <td>{{ exercise?.type?.ten_muc }}</td>
            <td>{{ exercise?.level?.ten_muc }}</td>
            <td class="flex justify-center">
              <span class="cursor-pointer" @click="handleUpdateExercise(exercise, index)">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="24" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M3 6v2h11V6zm0 4v2h11v-2zm17 .1c-.1 0-.3.1-.4.2l-1 1l2.1 2.1l1-1c.2-.2.2-.6 0-.8l-1.3-1.3c-.1-.1-.2-.2-.4-.2m-1.9 1.8l-6.1 6V20h2.1l6.1-6.1zM3 14v2h7v-2z"
                  ></path>
                </svg>
              </span>
              <span class="cursor-pointer" @click="handleDeleteExercise(exercise._id)">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-red-700"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-if="showModelExercise" class="modal-bg">
    <div class="modal-content" style="width: 60%; max-width: 900px; max-height: 80vh;">
      <div class="header">
        <h5 class="modal-title">Tạo câu hỏi thi</h5>
        <div @click.prevent="showModelExercise = false" class="icon-close">
          <i class="bi bi-x"></i>
        </div>
      </div>
      <div class="body mt-2" style="max-height: 60vh; overflow-y: auto; padding-right: 10px;">
        <div class="grid grid-cols-12 gap-y-2 gap-x-3">
          <div class="form-group col-span-12">
            <label class="form-label">Nội dung câu hỏi</label>
            <input
              v-model="exerciseObj.question"
              type="text"
              class="form-control"
              placeholder="Nhập nội dung câu hỏi"
            />
          </div>
          <div class="form-group col-span-6">
            <label class="form-label">Loại câu hỏi</label>
            <select
              v-model="exerciseObj.type"
              class="select select-neutral form-control w-full border-[#dee2e6]"
            >
              <option disabled selected value="null">Loại câu hỏi</option>
              <option v-for="type in types" :key="type?._id" :value="type?._id">
                {{ type?.ten_muc }}
              </option>
            </select>
          </div>
          <div class="form-group col-span-6">
            <label class="form-label">Cấp độ</label>
            <select
              v-model="exerciseObj.level"
              class="select select-neutral form-control w-full border-[#dee2e6]"
            >
              <option disabled selected value="null">Cấp độ</option>
              <option v-for="level in levels" :key="level?._id" :value="level?._id">
                {{ level?.ten_muc }}
              </option>
            </select>
          </div>
          <template v-if="typeActive?.ma_muc == '08'">
            <div class="form-group col-span-12">
              <label class="form-label">Audio</label>
              <input
                v-model.trim="exerciseObj.audio"
                type="text"
                class="form-control"
                placeholder="Link audio"
              />
            </div>
          </template>
          <template
            v-if="
              typeActive?.ma_muc == '03' || typeActive?.ma_muc == '05' || typeActive?.ma_muc == '06'
            "
          >
            <div class="form-group col-span-12">
              <label class="form-label">Audio</label>
              <input
                v-model.trim="exerciseObj.audio"
                type="text"
                class="form-control"
                placeholder="Link audio"
              />
            </div>
            <div class="form-group col-span-12">
              <label class="form-label">Đáp án đúng</label>
              <input
                v-model.trim="exerciseObj.correct_answer"
                type="text"
                class="form-control"
                placeholder="Nhập đáp án đúng"
              />
            </div>
          </template>
          <template v-else-if="typeActive?.ma_muc === '04' || typeActive?.ma_muc === '07'">
            <div class="form-group col-span-12">
              <label class="form-label">Đáp án đúng</label>
              <input
                v-model.trim="exerciseObj.correct_answer"
                type="text"
                class="form-control"
                placeholder="Nhập đáp án đúng"
              />
            </div>
          </template>
          <template v-else>
            <template v-if="typeActive?.ma_muc === '01' || typeActive?.ma_muc === '08'">
              <div class="form-group col-span-12">
                <label class="form-label">Đáp án đúng</label>
                <input
                  v-model.trim="exerciseObj.correct_answer"
                  type="text"
                  class="form-control"
                  placeholder="Nhập đáp án đúng"
                />
              </div>
            </template>
            <div class="col-span-12 form-group">
              <label class="form-label flex justify-between items-center">
                <span>Danh sách đáp án</span>
                <button
                  v-if="modeEditorOption === 0"
                  type="button"
                  class="btn btn-soft btn-success py-0"
                  style="font-size: 14px; height: 26px"
                  @click.prevent="modeEditorOption = 1"
                >
                  Thêm mới
                </button>
                <div v-else class="flex items-center gap-2">
                  <button
                    @click.prevent="handleCloseModeEditor"
                    type="button"
                    class="btn btn-soft btn-info py-0"
                    style="font-size: 14px; height: 26px"
                  >
                    Quay lại
                  </button>
                  <button
                    @click.prevent="handleInsertOption"
                    type="button"
                    class="btn btn-soft btn-success py-0"
                    style="font-size: 14px; height: 26px"
                  >
                    Lưu lại
                  </button>
                </div>
              </label>
              <div v-if="modeEditorOption === 1" class="grid grid-cols-12 gap-2 mb-2">
                <div class="form-group col-span-2">
                  <label class="form-label">Mã đáp án</label>
                  <input
                    v-model.trim="optionObj.ma_dap_an"
                    type="text"
                    class="form-control"
                    placeholder="Nhập mã đáp án"
                  />
                </div>
                <div class="form-group col-span-10">
                  <label class="form-label">Nội dung đáp án</label>
                  <input
                    v-model.trim="optionObj.noi_dung"
                    type="text"
                    class="form-control"
                    placeholder="Nhập nội dung đáp án"
                  />
                </div>
              </div>
              <div class="overflow-x-auto">
                <table class="table">
                  <thead>
                    <tr>
                      <th class="text-center">STT</th>
                      <th>Mã đáp án</th>
                      <th>Nội dung đáp án</th>
                      <th class="text-center">Đáp án đúng</th>
                      <th class="text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(option, index) in exerciseObj.options" :key="index">
                      <td class="text-center">{{ index + 1 }}</td>
                      <td>{{ option?.ma_dap_an }}</td>
                      <td>{{ option?.noi_dung }}</td>
                      <td class="text-center">
                        <input
                          type="radio"
                          name="option_radio"
                          :value="option.noi_dung"
                          v-model="exerciseObj.correct_answer"
                        />
                      </td>
                      <td class="flex justify-center gap-1">
                        <span class="cursor-pointer" @click="handleUpdateOption(option)">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="24"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="currentColor"
                              d="M3 6v2h11V6zm0 4v2h11v-2zm17 .1c-.1 0-.3.1-.4.2l-1 1l2.1 2.1l1-1c.2-.2.2-.6 0-.8l-1.3-1.3c-.1-.1-.2-.2-.4-.2m-1.9 1.8l-6.1 6V20h2.1l6.1-6.1zM3 14v2h7v-2z"
                            ></path>
                          </svg>
                        </span>
                        <span class="cursor-pointer" @click="handleDeleteOption(option)">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="text-red-700"
                          >
                            <path d="M18 6 6 18"></path>
                            <path d="m6 6 12 12"></path>
                          </svg>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </template>
          <div class="col-span-12 form-group">
            <label class="form-label">Giải thích đáp án</label>
            <textarea
              v-model.trim="exerciseObj.explain_answer"
              class="form-control"
              placeholder="Giải thích đáp án"
            ></textarea>
          </div>
          <div class="col-span-12 form-group">
            <label class="form-label">Giải thích đáp án Tiếng Việt</label>
            <textarea
              v-model.trim="exerciseObj.explain_answer_vn"
              class="form-control"
              placeholder="Giải thích đáp án Tiếng Việt"
            ></textarea>
          </div>
        </div>
      </div>
      <div class="bottom">
        <button
          @click.prevent="handleAddExerciseToList"
          type="button"
          class="btn btn-outline-primary"
        >
          Lưu câu hỏi
        </button>
      </div>
    </div>
  </div>
</template>
