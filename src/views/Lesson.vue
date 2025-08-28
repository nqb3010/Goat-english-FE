<script setup>
import { inject, onMounted, reactive, ref } from 'vue'
import _ from 'lodash'
import api from '@/utils'
import { toast } from 'vue3-toastify'

const URL_API = inject('URL_API')
const handleErrorAPI = inject('handleErrorAPI')
const getInfoUser = inject('getInfoUser')

const { lesson_id } = defineProps(['lesson_id'])

const user = ref()
const lesson = ref()

const init = async () => {
  user.value = await getInfoUser()
  // get data lesson
  await getDataLesson(lesson_id)
}

const getDataLesson = async (lesson_id) => {
  try {
    const res = await api.get(`${URL_API}/api/lesson/${lesson_id}`)
    // send success
    if (res?.status !== 200) {
      toast.error(res?.data?.message)
      return
    }
    lesson.value = res?.data?.data
    lessonsLength.value = lesson.value?.exercises ? lesson.value?.exercises?.length : 0
    console.log(lesson.value)
  } catch (error) {
    handleErrorAPI(error)
  }
}

onMounted(() => {
  init()
})

const lessonIndex = ref(0)
const processValue = ref(0)
// dữ liệu trả lời của người dùng
const userAnswer = reactive({})
const showResult = ref(false)
const lessonsLength = ref(0)

// Hàm xử lý dữ liệu hành động câu trả lời của người dùng
const handleActionUserAnswer = ({ id = '', type = '', answer, multiple_correct = false }) => {
  // Đảm bảo `id` có giá trị hợp lệ
  if (!id) return
  // type multiple_choice
  if ((type === '01' || type === '03') && !showResult.value) {
    // Nếu userAnswer[id] chưa tồn tại, tạo một object mới
    if (!userAnswer[id]) {
      userAnswer[id] = {
        correct_answer: null,
        answers: [],
      }
    }
    const exercise = lesson.value?.exercises[lessonIndex.value]
    userAnswer[id].correct_answer = exercise?.correct_answer
    // Nếu không phải nhiều lựa chọn, chỉ lưu một đáp án
    if (!multiple_correct) {
      userAnswer[id].answers = [answer]
    } else {
      // Đảm bảo answers là một mảng trước khi push
      if (!Array.isArray(userAnswer[id].answers)) {
        userAnswer[id].answers = []
      }
      userAnswer[id].answers.push(answer)
    }
  }
}

// Hàm xử lý khi câu trả lời là input
const handleChangeInputAnswer = ({ id = '', type = '', multiple_correct = false }) => {
  const value = event.target.value
  if (value) {
    if (!showResult.value) {
      // Nếu userAnswer[id] chưa tồn tại, tạo một object mới
      if (!userAnswer[id]) {
        userAnswer[id] = {
          correct_answer: null,
          answers: [],
        }
      }
      const exercise = lesson.value?.exercises[lessonIndex.value]
      userAnswer[id].correct_answer = exercise?.correct_answer
      if (!multiple_correct) {
        userAnswer[id].answers = [value]
      }
      // chua xu ly nhieu dap an
    }
  }
  // console.log("value", userAnswer[id]);
}

// Hàm xử lý phát audio với câu hỏi nghe
const handlePlayAudio = ({ id = '', audio = '' }) => {
  if (audio) {
    const audioObj = new Audio(audio)
    audioObj.play()
  }
}

// Hàm xử lý kết quả
const checkAnserUser = ({ id = '', type = '' }) => {
  // chua xu ly nhieu dap an
  showResult.value = true
  userAnswer[id].correct = false
  const exercise = lesson.value?.exercises[lessonIndex.value]
  // neu ko co nhieu lua chon
  if (!exercise?.multiple_correct) {
    // not correct
    if (exercise?.correct_answer === userAnswer[id]?.answers[0]) {
      userAnswer[id].correct = true
    }
  }
  // if đáp án sai thì thêm lại vào list để làm lại
  if (!userAnswer[id].correct) {
    const newLesson = { ...exercise }
    newLesson.repeat = true
    newLesson._id = _.uniqueId(`lesson_${id}_`)
    lesson.value?.exercises?.push(newLesson)
    return
  }
  processValue.value += 100 / lessonsLength.value
}

// Hàm xử lý khi chuyển tiếp câu hỏi
const handleNextQuestion = async () => {
  const exercises = lesson.value?.exercises
  if (exercises[lessonIndex.value]?._id === exercises[exercises?.length - 1]?._id) {
    console.log('LESSON COMPLETED', userAnswer)
    try {
      const newUserAnswer = []
      for (const key in userAnswer) {
        newUserAnswer.push({
          exercise_id: key,
          user_answer: userAnswer[key]?.answers,
          correct: userAnswer[key]?.correct,
          correct_answer: userAnswer[key]?.correct_answer,
        })
      }
      const res = await api.post(`${URL_API}/api/user/submit-lesson`, {
        data: {
          userAnswer: newUserAnswer,
          lesson_id: lesson.value?._id,
          topic_id: user.value.topic_id,
        },
      })
      // send success
      if (res?.status !== 200) {
        toast.error(res?.data?.message)
        return
      }
      console.log(res)
    } catch (error) {
      handleErrorAPI(error)
    }
    return
  }
  lessonIndex.value += 1
  showResult.value = false
  console.log('user lesson', userAnswer)
}

// Bỏ qua bài học
const closeLesson = () => {
  const result = confirm('Xác nhận thoát')
  if (result) {
    location.href = '/dashboard'
  }
}
</script>

<template>
  <div id="lesson">
    <!-- header -->
    <div class="lesson-header pt-14 px-14 flex justify-between items-center gap-10">
      <span @click="closeLesson" class="cursor-pointer"
        ><img src="../components/icons/close_icon.svg"
      /></span>
      <div class="w-full">
        <progress
          class="progress progress-success w-full"
          :value="processValue"
          max="100"
        ></progress>
      </div>
      <div class="flex items-center gap-3">
        <span><img src="../components/icons/heart_icon.svg" /></span>
        <!-- <span><img src="../components/icons/lesson_header_icon.svg" /></span> -->
      </div>
    </div>
    <!-- body -->
    <div class="lesson-body px-14">
      <div class="content-lesson">
        <div class="lesson-detail">
          <!-- Lỗi sai cũ -->
          <div
            v-if="lesson?.exercises[lessonIndex]?._id?.startsWith('lesson_')"
            class="flex items-center gap-4 text-[#ff9600] font-bold"
          >
            <svg height="32" width="32" style="color: #ff9600" viewBox="0 0 33 32">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M16.4988 27.9976C23.1255 27.9976 28.4976 22.6255 28.4976 15.9988C28.4976 9.37204 23.1255 4 16.4988 4C9.87204 4 4.5 9.37204 4.5 15.9988C4.5 22.6255 9.87204 27.9976 16.4988 27.9976ZM18.7016 8.57097C19.0921 8.18045 19.7253 8.18045 20.1158 8.57097L22.4442 10.8994C22.8201 11.2753 22.8342 11.8758 22.4866 12.2686C22.4706 12.2867 22.4539 12.3043 22.4366 12.3213L20.1158 14.6421C19.7253 15.0326 19.0921 15.0326 18.7016 14.6421C18.3111 14.2516 18.3111 13.6184 18.7016 13.2279L19.3225 12.6069H13.5872C12.8536 12.6069 12.2588 13.2017 12.2588 13.9354V15.0996C12.2588 15.6519 11.8111 16.0996 11.2588 16.0996C10.7065 16.0996 10.2588 15.6519 10.2588 15.0996V13.9354C10.2588 12.0971 11.749 10.6069 13.5872 10.6069H19.3233L18.7016 9.98518C18.3111 9.59466 18.3111 8.96149 18.7016 8.57097ZM21.7368 15.2632C22.2891 15.2632 22.7368 15.7109 22.7368 16.2632V17.4274C22.7368 19.2657 21.2466 20.7559 19.4084 20.7559H13.6724L14.2943 21.3778C14.6849 21.7683 14.6849 22.4015 14.2943 22.792C13.9038 23.1825 13.2707 23.1825 12.8801 22.792L10.5517 20.4635C10.3563 20.2682 10.2587 20.0119 10.2588 19.7559C10.2588 19.4695 10.3792 19.2112 10.5721 19.0289L12.8801 16.7209C13.2707 16.3303 13.9038 16.3303 14.2943 16.7209C14.6849 17.1114 14.6849 17.7446 14.2943 18.1351L13.6736 18.7559H19.4084C20.142 18.7559 20.7368 18.1611 20.7368 17.4274V16.2632C20.7368 15.7109 21.1845 15.2632 21.7368 15.2632Z"
                fill="#FF9600"
              ></path>
            </svg>
            <span class="uppercase">Lỗi sai trước đây</span>
          </div>
          <!-- Độ khó câu hỏi -->
          <div v-if="lesson?.exercises[lessonIndex]?.level_ma_muc" class="flex items-center gap-4">
            <span class="icon">
              <svg
                height="32"
                width="32"
                style="color: rgb(var(--color-cardinal)); overflow: visible"
                viewBox="0 0 33 32"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M16.5 28C23.1274 28 28.5 22.6274 28.5 16C28.5 9.37258 23.1274 4 16.5 4C9.87258 4 4.5 9.37258 4.5 16C4.5 22.6274 9.87258 28 16.5 28ZM19.7384 8.863C20.1567 8.44476 20.8348 8.44476 21.253 8.863L23.6992 11.3091C24.1174 11.7274 24.1174 12.4055 23.6992 12.8237C23.2809 13.242 22.6028 13.242 22.1846 12.8237L19.7384 10.3776C19.3202 9.95934 19.3202 9.28124 19.7384 8.863ZM16.7918 9.59953C17.2101 9.18129 17.8882 9.18129 18.3064 9.59953L23.357 14.6501C23.7752 15.0684 23.7752 15.7465 23.357 16.1647C22.9387 16.5829 22.2606 16.5829 21.8424 16.1647L16.7918 11.1141C16.3736 10.6959 16.3736 10.0178 16.7918 9.59953ZM18.4493 14.5937C18.8675 15.012 18.8675 15.6901 18.4493 16.1083L16.668 17.8896C16.2498 18.3078 15.5717 18.3078 15.1534 17.8896C14.7352 17.4713 14.7352 16.7932 15.1534 16.375L16.9347 14.5937C17.3529 14.1755 18.031 14.1755 18.4493 14.5937ZM11.6766 16.2296C11.2584 15.8113 10.5803 15.8113 10.162 16.2296C9.74379 16.6478 9.74379 17.3259 10.162 17.7441L15.2126 22.7947C15.6309 23.213 16.309 23.213 16.7272 22.7947C17.1454 22.3765 17.1454 21.6984 16.7272 21.2801L11.6766 16.2296ZM10.9401 19.1762C10.5218 18.7579 9.84374 18.7579 9.4255 19.1762C9.00726 19.5944 9.00726 20.2725 9.4255 20.6908L11.8716 23.1369C12.2899 23.5551 12.968 23.5551 13.3862 23.1369C13.8045 22.7187 13.8045 22.0406 13.3862 21.6223L10.9401 19.1762Z"
                  fill="#FF4B4B"
                ></path>
              </svg>
            </span>
            <p class="text-[#ff4b4b] font-bold text-3xl">
              Bài tập {{ lesson?.exercises[lessonIndex]?.level_ten_muc }}
            </p>
          </div>
          <!-- lesson type điền vào chỗ trống  -->
          <template v-if="lesson?.exercises[lessonIndex]?.type_ma_muc === '01'">
            <div class="flex flex-col flex-1 question_type__02">
              <!-- Tiêu đề câu hỏi -->
              <p class="title text-5xl font-bold mt-8">Điền vào chỗ trống</p>
              <!-- Nội dung câu hỏi -->
              <div class="question-content">
                <template
                  v-for="(item, index) in lesson?.exercises[lessonIndex]?.question"
                  :key="index"
                >
                  <span v-if="item.text === '_'" class="gach-duoi"></span>
                  <span v-else class="text" :class="{ translates: item?.translates }">{{
                    item.text
                  }}</span>
                </template>
              </div>
              <!-- Danh sách lựa chọn -->
              <div class="question-options text-[18px] flex items-center justify-center">
                <!-- <div class="flex items-center justify-center gap-4">
                  <button class="btn-action">Do</button>
                  <button class="btn-action">Are</button>
                </div> -->
                <div class="flex flex-col gap-4 flex-1">
                  <button
                    v-for="(option, index) in lesson?.exercises[lessonIndex]?.options"
                    :key="index"
                    class="flex items-center btn-type__2 w-full px-6 h-[58px] rounded-2xl"
                    :class="{
                      active:
                        userAnswer[lesson?.exercises[lessonIndex]?._id]?.answers.includes(option),
                    }"
                    @click="
                      handleActionUserAnswer({
                        id: lesson?.exercises[lessonIndex]?._id,
                        type: lesson?.exercises[lessonIndex]?.type_ma_muc,
                        answer: option,
                        multiple_correct: lesson?.exercises[lessonIndex]?.multiple_correct,
                      })
                    "
                  >
                    <span
                      class="flex items-center justify-center me-3 w-[30px] h-[30px] rounded-xl"
                      style="border: 1px solid #ccc"
                      >{{ index + 1 }}</span
                    ><span class="mx-auto">{{ option }}</span>
                  </button>
                </div>
              </div>
            </div>
          </template>
          <!-- lesson type nhập từ còn thiếu  -->
          <template v-else-if="lesson?.exercises[lessonIndex]?.type_ma_muc === '04'">
            <div class="flex flex-col flex-1 question_type__01">
              <!-- Tiêu đề câu hỏi -->
              <p class="title text-5xl font-bold mt-8">Nhập từ còn thiếu</p>
              <!-- Nội dung câu hỏi -->
              <div class="question-content">
                <template
                  v-for="(item, index) in lesson?.exercises[lessonIndex].question"
                  :key="index"
                >
                  <span class="text" :class="{ translates: item.translates }"
                    >{{ item.text }}
                    <ul v-if="item.translates" class="list-translate_word">
                      <li
                        v-for="(translate, index) in item.translates"
                        :key="index"
                        class="translate_word"
                      >
                        {{ translate }}
                      </li>
                    </ul>
                  </span>
                </template>
              </div>
              <div
                class="question-options cursor-pointer min-h-[170px] rounded-lg bg-[#f7f7f7] my-auto p-3"
                style="border: 2px solid #e5e5e5"
              >
                <div class="flex items-center flex-wrap gap-2.5 text-[18px]">
                  <template
                    v-for="(item, index) in lesson?.exercises[lessonIndex].answer"
                    :key="index"
                  >
                    <input
                      v-if="item.text === '_'"
                      type="input"
                      class="border-none w-[120px] outline-none"
                      @input="
                        handleChangeInputAnswer({
                          id: lesson?.exercises[lessonIndex]._id,
                          type: lesson?.exercises[lessonIndex].type_ma_muc,
                          multiple_correct: lesson?.exercises[lessonIndex].multiple_correct,
                        })
                      "
                    />
                    <span v-else class="text">{{ item.text }}</span>
                  </template>
                </div>
              </div>
            </div>
          </template>
          <!-- lesson type Viết lại bằng tiếng Anh  -->
          <template v-else-if="lesson?.exercises[lessonIndex]?.type_ma_muc === '05'">
            <div class="flex flex-col flex-1 question_type__03">
              <!-- Tiêu đề câu hỏi -->
              <p class="title text-5xl font-bold mt-8">Viết lại bằng tiếng Anh</p>
              <!-- Nội dung câu hỏi -->
              <div class="question-content">
                <template
                  v-for="(item, index) in lesson?.exercises[lessonIndex].question"
                  :key="index"
                >
                  <span class="text" :class="{ translates: item.translates }"
                    >{{ item.text }}
                    <ul v-if="item.translates" class="list-translate_word">
                      <li
                        v-for="(translate, index) in item.translates"
                        :key="index"
                        class="translate_word"
                      >
                        {{ translate }}
                      </li>
                    </ul>
                  </span>
                </template>
              </div>
              <div
                class="question-options flex text-[18px] cursor-pointer min-h-[170px] rounded-lg bg-[#f7f7f7] my-auto"
                style="border: 2px solid #e5e5e5"
              >
                <textarea
                  class="border-none resize-none flex-1 p-3 outline-none w-full"
                  placeholder="Nhập bằng Tiếng Anh"
                  @input="
                    handleChangeInputAnswer({
                      id: lesson?.exercises[lessonIndex]._id,
                      type: lesson?.exercises[lessonIndex].type_ma_muc,
                      multiple_correct: lesson?.exercises[lessonIndex].multiple_correct,
                    })
                  "
                ></textarea>
              </div>
            </div>
          </template>
          <!-- lesson type Nhập lại nội dung bạn vừa nghe  -->
          <template v-else-if="lesson?.exercises[lessonIndex]?.type_ma_muc === '06'">
            <div class="flex flex-col flex-1 question_type__04">
              <!-- Tiêu đề câu hỏi -->
              <p class="title text-5xl font-bold mt-8">Nhập lại nội dung bạn vừa nghe</p>
              <!-- Nội dung câu hỏi -->
              <div class="question-content justify-center">
                <div class="flex items-center justify-center bg-[#1cb0f6] rounded-3xl text-white">
                  <button
                    @click="
                      handlePlayAudio({
                        id: lesson?.exercises[lessonIndex]._id,
                        audio: lesson?.exercises[lessonIndex].audio,
                      })
                    "
                    class="w-[100px] h-[100px] p-8"
                  >
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        viewBox="0 0 94 73"
                        width="50"
                        height="40"
                        preserveAspectRatio="xMidYMid meet"
                        style="
                          width: 100%;
                          height: 100%;
                          transform: translate3d(0px, 0px, 0px);
                          content-visibility: visible;
                        "
                      >
                        <defs>
                          <clipPath id="__lottie_element_2153">
                            <rect width="94" height="73" x="0" y="0"></rect>
                          </clipPath>
                          <clipPath id="__lottie_element_2155">
                            <path d="M0,0 L1000,0 L1000,1038 L0,1038z"></path>
                          </clipPath>
                          <clipPath id="__lottie_element_2160">
                            <path d="M0,0 L1338,0 L1338,738 L0,738z"></path>
                          </clipPath>
                        </defs>
                        <g clip-path="url(#__lottie_element_2153)">
                          <g
                            clip-path="url(#__lottie_element_2155)"
                            transform="matrix(0.26499998569488525,0,0,0.26499998569488525,-84.5,-101.53498840332031)"
                            opacity="1"
                            style="display: block"
                          >
                            <g
                              transform="matrix(1.3600000143051147,0,0,1.3600000143051147,516.219970703125,522.4000244140625)"
                              opacity="0.9069389991639046"
                              style="display: block"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="miter"
                                fill-opacity="0"
                                stroke-miterlimit="4"
                                class="animated-speaker-icon-lottie"
                                stroke="rgb(255,255,255)"
                                stroke-opacity="1"
                                stroke-width="22.485592375331898"
                                d=" M48.88100051879883,-88.13400268554688 C79.822998046875,-70.9219970703125 100.77899932861328,-37.88800048828125 100.77899932861328,0 C100.77899932861328,37.9109992980957 79.7979965209961,70.96199798583984 48.82500076293945,88.16500091552734"
                              ></path>
                            </g>
                            <g
                              transform="matrix(1.3600000143051147,0,0,1.3600000143051147,516.219970703125,522.4000244140625)"
                              opacity="1"
                              style="display: block"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="miter"
                                fill-opacity="0"
                                stroke-miterlimit="4"
                                class="animated-speaker-icon-lottie"
                                stroke="rgb(255,255,255)"
                                stroke-opacity="1"
                                stroke-width="20.500305987715482"
                                d=" M24.131000518798828,-42.808998107910156 C39.055999755859375,-34.37099838256836 49.14099884033203,-18.354000091552734 49.14099884033203,0 C49.14099884033203,18.386999130249023 39.02000045776367,34.42900085449219 24.049999237060547,42.854000091552734"
                              ></path>
                            </g>
                            <g
                              clip-path="url(#__lottie_element_2160)"
                              transform="matrix(1.0370399951934814,0,0,0.9629600048065186,136.53640747070312,163.66775512695312)"
                              opacity="1"
                              style="display: block"
                            >
                              <g
                                transform="matrix(1,0,0,1,260.93701171875,373.6780090332031)"
                                opacity="1"
                                style="display: block"
                              >
                                <g opacity="1" transform="matrix(6,0,0,6,0,0)">
                                  <path
                                    class="animated-speaker-icon-lottie"
                                    fill="rgb(255,255,255)"
                                    fill-opacity="1"
                                    d=" M-8.293000221252441,-11.675000190734863 C-8.293000221252441,-11.675000190734863 -0.12300000339746475,-11.675000190734863 -0.12300000339746475,-11.675000190734863 C2.9070000648498535,-11.675000190734863 5.367000102996826,-9.21500015258789 5.367000102996826,-6.184999942779541 C5.367000102996826,-6.184999942779541 5.367000102996826,6.425000190734863 5.367000102996826,6.425000190734863 C5.367000102996826,9.454999923706055 2.9070000648498535,11.914999961853027 -0.12300000339746475,11.914999961853027 C-0.12300000339746475,11.914999961853027 -8.293000221252441,11.914999961853027 -8.293000221252441,11.914999961853027 C-11.322999954223633,11.914999961853027 -13.782999992370605,9.454999923706055 -13.782999992370605,6.425000190734863 C-13.782999992370605,6.425000190734863 -13.782999992370605,-6.184999942779541 -13.782999992370605,-6.184999942779541 C-13.782999992370605,-9.21500015258789 -11.322999954223633,-11.675000190734863 -8.293000221252441,-11.675000190734863z M-4.980999946594238,-11.656999588012695 C-4.980999946594238,-11.656999588012695 10.218999862670898,-22.32699966430664 10.218999862670898,-22.32699966430664 C11.24899959564209,-23.047000885009766 12.659000396728516,-22.797000885009766 13.369000434875488,-21.777000427246094 C13.638999938964844,-21.39699935913086 13.779000282287598,-20.937000274658203 13.779000282287598,-20.476999282836914 C13.779000282287598,-20.476999282836914 13.779000282287598,20.472999572753906 13.779000282287598,20.472999572753906 C13.779000282287598,21.722999572753906 12.769000053405762,22.732999801635742 11.519000053405762,22.732999801635742 C11.059000015258789,22.732999801635742 10.609000205993652,22.593000411987305 10.218999862670898,22.322999954223633 C10.218999862670898,22.322999954223633 -4.980999946594238,11.652999877929688 -4.980999946594238,11.652999877929688 C-5.580999851226807,11.232999801635742 -5.940999984741211,10.543000221252441 -5.940999984741211,9.803000450134277 C-5.940999984741211,9.803000450134277 -5.940999984741211,-9.807000160217285 -5.940999984741211,-9.807000160217285 C-5.940999984741211,-10.536999702453613 -5.580999851226807,-11.22700023651123 -4.980999946594238,-11.656999588012695z"
                                  ></path>
                                  <g opacity="1" transform="matrix(1,0,0,1,0,0)"></g>
                                </g>
                              </g>
                            </g>
                          </g>
                        </g>
                      </svg>
                    </span>
                  </button>
                </div>
              </div>

              <div
                class="question-options flex text-[18px] cursor-pointer min-h-[170px] rounded-lg bg-[#f7f7f7] my-auto"
                style="border: 2px solid #e5e5e5"
              >
                <textarea
                  class="border-none resize-none flex-1 p-3 outline-none w-full"
                  placeholder="Nhập bằng Tiếng Anh"
                  @input="
                    handleChangeInputAnswer({
                      id: lesson?.exercises[lessonIndex]._id,
                      type: lesson?.exercises[lessonIndex].type_ma_muc,
                      multiple_correct: lesson?.exercises[lessonIndex]?.multiple_correct,
                    })
                  "
                ></textarea>
              </div>
            </div>
          </template>
          <!-- lesson type Nghe và chọn đáp án đúng  -->
          <template v-else-if="lesson?.exercises[lessonIndex]?.type_ma_muc === '03'">
            <div class="flex flex-col flex-1 question_type__02">
              <!-- Tiêu đề câu hỏi -->
              <p class="title text-5xl font-bold mt-8">
                {{ lesson?.exercises[lessonIndex]?.type_ten_muc }}
              </p>
              <!-- Nội dung câu hỏi -->
              <div class="question-content">
                <template
                  v-for="(item, index) in lesson?.exercises[lessonIndex].question"
                  :key="index"
                >
                  <span class="text" :class="{ translates: item.translates }"
                    >{{ item.text }}
                    <ul v-if="item.translates" class="list-translate_word">
                      <li
                        v-for="(translate, index) in item.translates"
                        :key="index"
                        class="translate_word"
                      >
                        {{ translate }}
                      </li>
                    </ul>
                  </span>
                </template>
              </div>
              <!-- Danh sách lựa chọn -->
              <div class="question-options text-[18px] flex items-center justify-center">
                <div class="flex items-center flex-col gap-4 flex-1">
                  <button
                    v-for="(option, index) in lesson?.exercises[lessonIndex]?.options"
                    :key="index"
                    class="flex items-center justify-between btn-type__2 w-2/6 px-6 h-[58px] rounded-2xl"
                    :class="{
                      active: userAnswer[lesson?.exercises[lessonIndex]?._id]?.answers.includes(
                        option.value,
                      ),
                    }"
                    @click="
                      (handlePlayAudio({
                        id: lesson?.exercises[lessonIndex]?._id,
                        audio: option.audio,
                      }),
                      handleActionUserAnswer({
                        id: lesson?.exercises[lessonIndex]?._id,
                        type: lesson?.exercises[lessonIndex]?.type_ma_muc,
                        answer: option.value,
                        multiple_correct: lesson?.exercises[lessonIndex]?.multiple_correct,
                      }))
                    "
                  >
                    <span
                      class="flex items-center justify-center me-3 w-[30px] h-[30px] rounded-xl"
                      style="border: 1px solid #ccc"
                      >{{ index + 1 }}
                    </span>
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        viewBox="0 0 94 73"
                        width="26"
                        height="26"
                        preserveAspectRatio="xMidYMid meet"
                        style="transform: translate3d(0px, 0px, 0px); content-visibility: visible"
                        class="bg-[#1cb0f6] w-full h-full p-3 rounded-2xl"
                      >
                        <defs>
                          <clipPath id="__lottie_element_2153">
                            <rect width="94" height="73" x="0" y="0"></rect>
                          </clipPath>
                          <clipPath id="__lottie_element_2155">
                            <path d="M0,0 L1000,0 L1000,1038 L0,1038z"></path>
                          </clipPath>
                          <clipPath id="__lottie_element_2160">
                            <path d="M0,0 L1338,0 L1338,738 L0,738z"></path>
                          </clipPath>
                        </defs>
                        <g clip-path="url(#__lottie_element_2153)">
                          <g
                            clip-path="url(#__lottie_element_2155)"
                            transform="matrix(0.26499998569488525,0,0,0.26499998569488525,-84.5,-101.53498840332031)"
                            opacity="1"
                            style="display: block"
                          >
                            <g
                              transform="matrix(1.3600000143051147,0,0,1.3600000143051147,516.219970703125,522.4000244140625)"
                              opacity="0.9069389991639046"
                              style="display: block"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="miter"
                                fill-opacity="0"
                                stroke-miterlimit="4"
                                class="animated-speaker-icon-lottie"
                                stroke="rgb(255,255,255)"
                                stroke-opacity="1"
                                stroke-width="22.485592375331898"
                                d=" M48.88100051879883,-88.13400268554688 C79.822998046875,-70.9219970703125 100.77899932861328,-37.88800048828125 100.77899932861328,0 C100.77899932861328,37.9109992980957 79.7979965209961,70.96199798583984 48.82500076293945,88.16500091552734"
                              ></path>
                            </g>
                            <g
                              transform="matrix(1.3600000143051147,0,0,1.3600000143051147,516.219970703125,522.4000244140625)"
                              opacity="1"
                              style="display: block"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="miter"
                                fill-opacity="0"
                                stroke-miterlimit="4"
                                class="animated-speaker-icon-lottie"
                                stroke="rgb(255,255,255)"
                                stroke-opacity="1"
                                stroke-width="20.500305987715482"
                                d=" M24.131000518798828,-42.808998107910156 C39.055999755859375,-34.37099838256836 49.14099884033203,-18.354000091552734 49.14099884033203,0 C49.14099884033203,18.386999130249023 39.02000045776367,34.42900085449219 24.049999237060547,42.854000091552734"
                              ></path>
                            </g>
                            <g
                              clip-path="url(#__lottie_element_2160)"
                              transform="matrix(1.0370399951934814,0,0,0.9629600048065186,136.53640747070312,163.66775512695312)"
                              opacity="1"
                              style="display: block"
                            >
                              <g
                                transform="matrix(1,0,0,1,260.93701171875,373.6780090332031)"
                                opacity="1"
                                style="display: block"
                              >
                                <g opacity="1" transform="matrix(6,0,0,6,0,0)">
                                  <path
                                    class="animated-speaker-icon-lottie"
                                    fill="rgb(255,255,255)"
                                    fill-opacity="1"
                                    d=" M-8.293000221252441,-11.675000190734863 C-8.293000221252441,-11.675000190734863 -0.12300000339746475,-11.675000190734863 -0.12300000339746475,-11.675000190734863 C2.9070000648498535,-11.675000190734863 5.367000102996826,-9.21500015258789 5.367000102996826,-6.184999942779541 C5.367000102996826,-6.184999942779541 5.367000102996826,6.425000190734863 5.367000102996826,6.425000190734863 C5.367000102996826,9.454999923706055 2.9070000648498535,11.914999961853027 -0.12300000339746475,11.914999961853027 C-0.12300000339746475,11.914999961853027 -8.293000221252441,11.914999961853027 -8.293000221252441,11.914999961853027 C-11.322999954223633,11.914999961853027 -13.782999992370605,9.454999923706055 -13.782999992370605,6.425000190734863 C-13.782999992370605,6.425000190734863 -13.782999992370605,-6.184999942779541 -13.782999992370605,-6.184999942779541 C-13.782999992370605,-9.21500015258789 -11.322999954223633,-11.675000190734863 -8.293000221252441,-11.675000190734863z M-4.980999946594238,-11.656999588012695 C-4.980999946594238,-11.656999588012695 10.218999862670898,-22.32699966430664 10.218999862670898,-22.32699966430664 C11.24899959564209,-23.047000885009766 12.659000396728516,-22.797000885009766 13.369000434875488,-21.777000427246094 C13.638999938964844,-21.39699935913086 13.779000282287598,-20.937000274658203 13.779000282287598,-20.476999282836914 C13.779000282287598,-20.476999282836914 13.779000282287598,20.472999572753906 13.779000282287598,20.472999572753906 C13.779000282287598,21.722999572753906 12.769000053405762,22.732999801635742 11.519000053405762,22.732999801635742 C11.059000015258789,22.732999801635742 10.609000205993652,22.593000411987305 10.218999862670898,22.322999954223633 C10.218999862670898,22.322999954223633 -4.980999946594238,11.652999877929688 -4.980999946594238,11.652999877929688 C-5.580999851226807,11.232999801635742 -5.940999984741211,10.543000221252441 -5.940999984741211,9.803000450134277 C-5.940999984741211,9.803000450134277 -5.940999984741211,-9.807000160217285 -5.940999984741211,-9.807000160217285 C-5.940999984741211,-10.536999702453613 -5.580999851226807,-11.22700023651123 -4.980999946594238,-11.656999588012695z"
                                  ></path>
                                  <g opacity="1" transform="matrix(1,0,0,1,0,0)"></g>
                                </g>
                              </g>
                            </g>
                          </g>
                        </g>
                      </svg>
                    </span>
                    <span></span>
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <!-- bottom -->
    <div class="lesson-bottom">
      <div
        v-if="!showResult"
        class="flex justify-between items-center h-[140px] max-w-[1080px] px-14 mx-auto"
      >
        <button
          class="btn-action"
          @click="
            (handleActionUserAnswer({
              id: lesson?.exercises[lessonIndex]?._id,
              type: lesson?.exercises[lessonIndex]?.type_ma_muc,
              multiple_correct: lesson?.exercises[lessonIndex]?.multiple_correct,
              answer: '',
            }),
            checkAnserUser({
              id: lesson?.exercises[lessonIndex]?._id,
              type: lesson?.exercises[lessonIndex]?.type_ma_muc,
            }))
          "
        >
          BỎ QUA
        </button>
        <button
          class="btn-action btn-check"
          :class="{ disabled: !userAnswer[lesson?.exercises[lessonIndex]?._id] }"
          @click="
            checkAnserUser({
              id: lesson?.exercises[lessonIndex]?._id,
              type: lesson?.exercises[lessonIndex]?.type_ma_muc,
            })
          "
        >
          KIỂM TRA
        </button>
      </div>
      <div
        v-else
        class="flex justify-between items-center h-[140px] max-w-[1080px] px-14 mx-auto"
        :class="[
          userAnswer[lesson?.exercises[lessonIndex]?._id]?.correct
            ? 'bg-[#d7ffb8] text-[#58a700]'
            : 'bg-[#ffdfe0]  text-[#ea2b2b]',
        ]"
      >
        <div class="flex items-center gap-4 font-bold text-[20px]">
          <div class="flex items-center justify-center w-[80px] h-[80px] bg-white rounded-full">
            <img
              v-if="userAnswer[lesson?.exercises[lessonIndex]?._id]?.correct"
              src="https://d35aaqx5ub95lt.cloudfront.net/images/bed2a542bc7eddc78e75fbe85260b89e.svg"
            />
            <img
              v-else
              src="https://d35aaqx5ub95lt.cloudfront.net/images/9a4bf74a74e801ca35402f2c2837e24c.svg"
            />
          </div>
          <div
            v-if="userAnswer[lesson?.exercises[lessonIndex]?._id]?.correct"
            class="flex flex-col gap-4"
          >
            <p>Chính xác!</p>
          </div>
          <div v-else class="flex flex-col gap-4">
            <p>Đáp án đúng:</p>
            <p class="text-[17px] font-normal">
              {{ lesson?.exercises[lessonIndex]?.correct_text }}
            </p>
          </div>
        </div>
        <button @click="handleNextQuestion" class="btn-action btn-check uppercase">Tiếp tục</button>
      </div>
    </div>
  </div>
</template>
