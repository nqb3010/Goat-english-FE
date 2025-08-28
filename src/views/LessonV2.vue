<script setup>
import ListenAndSentences from '@/components/lessons/ListenAndSentences.vue'
import Vocabulary from '@/components/lessons/Vocabulary.vue'
import ChooseAnswer from '@/components/lessons/ChooseAnswer.vue'
import FillInTheBlank from '@/components/lessons/FillInTheBlank.vue'
import CompleteSentences from '@/components/lessons/CompleteSentences.vue'
import ListenAndChoose from '@/components/lessons/ListenAndChoose.vue'
import { computed, inject, onMounted, ref } from 'vue'
import _ from 'lodash'
import api from '@/utils'
import { toast } from 'vue3-toastify'

const URL_API = inject('URL_API')
const handleErrorAPI = inject('handleErrorAPI')
const getInfoUser = inject('getInfoUser')

const { lesson_id } = defineProps(['lesson_id'])

const loadingUI = ref(false)
const fireworksContainer = ref(null)

const user = ref()
const lesson = ref()
const exercises = ref([])
const vocabularies = ref([])
const lessonsLength = ref(0)
const indexExercise = ref(0)
const userAnswer = ref([])
const progressLesson = computed(() => {
  return (indexExercise.value / lessonsLength.value) * 100
})

const init = async () => {
  try {
    loadingUI.value = true
    user.value = await getInfoUser()
    // get data lesson
    await getDataLesson(lesson_id)
  } catch (error) {
    handleErrorAPI(error)
  } finally {
    loadingUI.value = false
  }
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
    vocabularies.value = lesson.value?.vocabularies
    exercises.value = _.shuffle(lesson.value?.exercises)
    // exercises.value = lesson.value?.exercises
    exercises.value = vocabularies.value.concat(exercises.value)
    lessonsLength.value = exercises.value ? exercises.value?.length : 0
    if (lessonsLength.value === 0) {
      toast.error('Không có bài tập nào trong bài học này')
      return
    }
    console.log('lesson.value', lesson.value)
  } catch (error) {
    handleErrorAPI(error)
  }
}

const doneSubmit = ref(false)
const nextExercise = async (result) => {
  userAnswer.value.push(result)
  indexExercise.value += 1
  if (indexExercise.value >= lessonsLength.value) {
    // submit lesson
    const toastId = toast.loading('Đang nộp bài...')
    try {
      doneSubmit.value = false
      const data = {
        user_id: user.value?._id,
        lesson_id: lesson.value?._id,
        topic_id: user.value?.topic_id,
        progress_id: lesson.value?.progress_id,
        score: 50,
        detail: userAnswer.value,
      }
      const res = await api.post(`${URL_API}/api/user/submit-lesson`, {
        data,
      })
      if (res?.status !== 200) {
        toast.update(toastId, {
          render: res?.data?.message || 'Có lỗi xảy ra',
          type: 'error',
          isLoading: false,
          autoClose: 2000,
        })
        return
      }
      toast.update(toastId, {
        render: 'Nộp bài thành công',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      })
      doneSubmit.value = true
      autoFireworks()
      setTimeout(() => {
        location.href = '/dashboard'
      }, 3000)
    } catch (error) {
      handleErrorAPI(error, toastId)
    }
    return
  }
}

const handleCloseLesson = () => {
  location.href = '/dashboard'
}

function createFirework(x, y) {
  const container = fireworksContainer.value
  const colors = ['#ff4d4d', '#ffd700', '#00ccff', '#66ff66', '#ff66ff']

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div')
    particle.classList.add('particle')
    particle.style.background = colors[Math.floor(Math.random() * colors.length)]

    const angle = Math.random() * 2 * Math.PI
    const distance = Math.random() * 100 + 50
    const dx = Math.cos(angle) * distance + 'px'
    const dy = Math.sin(angle) * distance + 'px'

    particle.style.setProperty('--x', dx)
    particle.style.setProperty('--y', dy)
    particle.style.left = `${x}px`
    particle.style.top = `${y}px`

    container.appendChild(particle)

    setTimeout(() => {
      particle.remove()
    }, 1000)
  }
}

function autoFireworks() {
  setInterval(() => {
    const x = Math.random() * window.innerWidth
    const y = (Math.random() * window.innerHeight) / 2
    createFirework(x, y)
  }, 500)
}

onMounted(() => {
  init()
})
</script>

<template>
  <div id="lesson-v2">
    <header class="p-5 bg-[#5de7c0]">
      <div class="flex items-center justify-between gap-3 sm:h-[72px] max-w-[100rem] mx-auto">
        <div class="flex items-center gap-3">
          <span class="hidden sm:block">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="w-[30px] h-[30px] text-white"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="m20.737 7.121.007-.011a1.713 1.713 0 0 0-.261-2.127l-1.397-1.396a2.074 2.074 0 0 0-1.977-.52c-1.466.383-2.911.792-4.356 1.228-2.475.748-4.526 2.63-6.893 3.67-.468.207-.654.409-1.024.719-.438.368-2.114 1.255-1.796 1.95.158.345 1.044.543 1.416.513.615-.05 1.267-.485 1.786-.81.546-.341 1.274-1.022 1.98-.975.02.244-.912.756-1.14.944-.428.35-.833.726-1.2 1.13-.566.622-1.159 1.213-1.704 1.848-.703.819.215.92.956.97.7.046.996-.516 1.488-.872.685-.495 1.29-1.1 1.985-1.604.332-.241.756-.612 1.158-.705-.243.767-.766 1.452-.98 2.259-.12.453-.093.611.227 1.022.634.818 1.398 1.682 2.248 2.282.226.16.725.555 1.042.385.274-.148.334-.862.252-1.126-.17-.546-.73-1.141-1.03-1.643-.262-.439-.383-.612-.152-1.057.208-.4.364-.773.574-1.17.648-1.228 2.595-1.596 3.765-.755.375.27.154.395.041.776-.1.34-.078.687-.109 1.033-.034.388-.09.647-.271.981-.189.35-.455.696-.558 1.081-.164.613.081 1.354.91 1.218 1.141-.188 1.993-1.986 2.398-2.82.134-.275.308-.65.457-.917.564-1.016.7-1.966 1.044-3.049a11.38 11.38 0 0 1 1.114-2.452ZM12.686 18.4c-.163-.69-1.054-.738-1.341-.127-.158.335-.151.77-.192 1.133-.046.403-.09.739.09 1.12a.825.825 0 0 0 1.42.127c.397-.564.18-1.629.023-2.253Z"
                fill="currentColor"
              ></path>
            </svg>
          </span>
          <p
            class="text-[1.6rem] sm:text-[2.4rem] leading-10 font-semibold text-[#313033] line-clamp-2"
          >
            English - {{ lesson?.title }}
          </p>
        </div>
        <div>
          <span class="cursor-pointer" onclick="my_modal_5.showModal()">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="w-[32px] h-[32px] text-[#00a778]"
            >
              <path
                d="m5.264 6.465 12.263 12.282c.112.113.24.188.382.225.15.037.299.037.448 0a.832.832 0 0 0 .393-.225.765.765 0 0 0 .224-.381.833.833 0 0 0-.01-.45.805.805 0 0 0-.214-.381L6.475 5.253a.866.866 0 0 0-.83-.225.765.765 0 0 0-.381.225.734.734 0 0 0-.236.381.913.913 0 0 0 0 .45c.045.142.123.269.236.381Zm0 11.07a.845.845 0 0 0-.236.382.913.913 0 0 0 0 .449c.037.15.116.277.236.381a.764.764 0 0 0 .381.225.865.865 0 0 0 .83-.225L18.75 6.465a.882.882 0 0 0 .213-.382c.045-.15.049-.299.011-.449a.765.765 0 0 0-.224-.381.832.832 0 0 0-.393-.225.91.91 0 0 0-.448 0 .834.834 0 0 0-.382.225L5.264 17.535Z"
                fill="currentColor"
              ></path>
            </svg>
          </span>
        </div>
      </div>
    </header>
    <!-- body -->
    <div
      class="lesson-body max-w-[85rem] mx-auto px-[1.2rem] py-[2.4rem] sm:px-[3.2rem] sm:py-[3.2rem]"
    >
      <div class="pb-[2rem]">
        <progress
          class="progress h-[1rem] sm:h-[2rem] text-[#fb0] bg-[#e7eaf0]"
          :value="progressLesson"
          max="100"
        ></progress>
      </div>
      <!-- loading -->
      <div v-if="loadingUI" class="flex justify-center">
        <span class="loading loading-dots loading-sm" style="animation: none; width: 80px"></span>
      </div>
      <template v-else>
        <!-- Body -->
        <div class="flex justify-between gap-6">
          <!-- Chọn câu trả phù hợp -->
          <template v-if="exercises?.length > 0 && exercises?.[indexExercise]">
            <Vocabulary
              v-if="!exercises?.[indexExercise].type?.ma_muc"
              :vocabulary="exercises?.[indexExercise]"
              @next-exercise="nextExercise"
            />
            <FillInTheBlank
              v-else-if="exercises?.[indexExercise].type?.ma_muc == '01'"
              :exercise="exercises?.[indexExercise]"
              @next-exercise="nextExercise"
            />
            <ChooseAnswer
              v-else-if="exercises?.[indexExercise].type?.ma_muc == '02'"
              :exercise="exercises?.[indexExercise]"
              @next-exercise="nextExercise"
            />
            <ListenAndSentences
              v-else-if="exercises?.[indexExercise].type?.ma_muc == '03'"
              :exercise="exercises?.[indexExercise]"
              @next-exercise="nextExercise"
            />
            <CompleteSentences
              v-else-if="exercises?.[indexExercise].type?.ma_muc == '07'"
              :exercise="exercises?.[indexExercise]"
              @next-exercise="nextExercise"
            />
            <ListenAndChoose
              v-else-if="exercises?.[indexExercise].type?.ma_muc == '08'"
              :exercise="exercises?.[indexExercise]"
              @next-exercise="nextExercise"
            />
          </template>
        </div>
      </template>
    </div>
    <!-- modal exit -->
    <dialog id="my_modal_5" class="modal modal-bottom sm:modal-middle text-[15px]">
      <div class="modal-box">
        <h3 class="font-bold">Xác nhận thoát bài học!</h3>
        <p class="mt-4 leading-8">
          Nếu bạn thoát, tất cả tiến trình của bạn sẽ không được lưu lại.
        </p>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-ghost" style="font-size: 14px">Đóng</button>
            <button
              class="btn btn-soft btn-success ms-5"
              style="font-size: 14px"
              @click="handleCloseLesson"
            >
              Đồng ý
            </button>
          </form>
        </div>
      </div>
    </dialog>

    <div
      v-show="doneSubmit"
      class="modal-bg modal-old__mistake fixed flex justify-center items-center inset-0 h-[100vh] w-[100vw] z-[9999]"
    >
      <div>
        <div class="fireworks-container" ref="fireworksContainer"></div>
      </div>
    </div>
  </div>
</template>
