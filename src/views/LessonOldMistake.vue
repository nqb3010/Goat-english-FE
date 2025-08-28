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
import { toRefs } from 'vue'

const URL_API = inject('URL_API')
const handleErrorAPI = inject('handleErrorAPI')
const getInfoUser = inject('getInfoUser')

const props = defineProps(['exercises'])
const emit = defineEmits(['close'])

const { exercises } = toRefs(props)
const indexExercise = ref(0)
const userAnswer = ref([])

const user = ref()
const progressLesson = computed(() => {
  return (indexExercise.value / exercises.value?.length) * 100
})

const init = async () => {
  user.value = await getInfoUser()
  exercises.value = _.shuffle(exercises.value)
}

const nextExercise = async (result) => {
  userAnswer.value.push(result)
  indexExercise.value += 1
  if (indexExercise.value >= exercises.value?.length) {
    emit('close', userAnswer.value)
  }
}

const close = () => {
  emit('close', userAnswer.value)
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
          <span>
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
            English - Ôn tập lỗi sai
          </p>
        </div>
        <div>
          <span @click="close" class="cursor-pointer">
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
    <div class="lesson-body max-w-[85rem] mx-auto p-[32px]">
      <div class="pb-[2rem]">
        <progress
          class="progress h-[20px] text-[#fb0] bg-[#e7eaf0]"
          :value="progressLesson"
          max="100"
        ></progress>
      </div>
      <!-- Body -->
      <div class="flex justify-between gap-6">
        <!-- Chọn câu trả phù hợp -->
        <template v-if="exercises?.length > 0 && exercises?.[indexExercise]">
          <Vocabulary
            v-if="!exercises?.[indexExercise]?.exercise?.type?.ma_muc"
            :vocabulary="exercises?.[indexExercise]?.exercise"
            @next-exercise="nextExercise"
          />
          <FillInTheBlank
            v-else-if="exercises?.[indexExercise]?.exercise?.type?.ma_muc == '01'"
            :exercise="exercises?.[indexExercise]?.exercise"
            @next-exercise="nextExercise"
          />
          <ChooseAnswer
            v-else-if="exercises?.[indexExercise]?.exercise?.type?.ma_muc == '02'"
            :exercise="exercises?.[indexExercise]?.exercise"
            @next-exercise="nextExercise"
          />
          <ListenAndSentences
            v-else-if="exercises?.[indexExercise]?.exercise?.type?.ma_muc == '03'"
            :exercise="exercises?.[indexExercise]?.exercise"
            @next-exercise="nextExercise"
          />
          <CompleteSentences
            v-else-if="exercises?.[indexExercise]?.exercise?.type?.ma_muc == '07'"
            :exercise="exercises?.[indexExercise]?.exercise"
            @next-exercise="nextExercise"
          />
          <ListenAndChoose
            v-else-if="exercises?.[indexExercise]?.exercise?.type?.ma_muc == '08'"
            :exercise="exercises?.[indexExercise]?.exercise"
            @next-exercise="nextExercise"
          />
        </template>
      </div>
    </div>
  </div>
</template>
