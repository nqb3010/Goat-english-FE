<script setup>
import { onMounted, ref, watch } from 'vue'
import { playAudio } from '../../utils/index'

const props = defineProps({
  exercise: { type: Object, required: true },
})

const dataResult = ref()
const showResult = ref(false)

const emit = defineEmits(['nextExercise'])

watch(
  () => props.exercise,
  () => {
    resetDataResult()
  },
)

const resetDataResult = () => {
  dataResult.value = null
  showResult.value = false
}

const handleNextExercise = () => {
  if (showResult.value) {
    const userAnswer = {
      exercise_id: props.exercise._id,
      question: props.exercise.question,
      correct_answer: props.exercise.correct_answer,
      user_answer: dataResult.value?.noi_dung,
      correct: dataResult.value?.noi_dung === props.exercise.correct_answer,
    }
    emit('nextExercise', userAnswer)
    return
  }
  showResult.value = true
}

onMounted(() => {
  // console.log('dataResult.value', dataResult.value)
  // console.log('showResult.value', showResult.value)
  console.log('props.exercise', props.exercise)
})
</script>

<template>
  <!-- Chọn câu trả phù hợp -->
  <div class="left w-[85%]">
    <p class="text-[#001122] text-[3rem] text-type">
      {{ props.exercise?.type?.ten_muc }}
    </p>
    <div class="mt-20">
      <p class="text-center text-[3.6rem] font-bold px-10 text-question">
        {{ props.exercise?.question }}
      </p>
    </div>
    <div class="min-h-[64px]">
      <div v-if="props.exercise?.audio" class="flex justify-center mt-4">
        <button
          class="flex items-center justify-center rounded-2xl w-[48px] h-[48px] bg-[#f6f6f6] hover:scale-110"
          @click="playAudio(props.exercise?.audio)"
        >
          <svg
            width="44"
            height="36"
            viewBox="0 0 44 36"
            xmlns="http://www.w3.org/2000/svg"
            class="w-[32px] h-[32px] text-[#012]"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M23.9344 9.57506C23.6084 9.81708 23.2685 10.0694 23.344 10.7807C23.3768 10.892 23.4125 11.0211 23.4517 11.1624L23.4518 11.1626L23.4518 11.1627L23.4518 11.1627C23.5539 11.5312 23.6792 11.9836 23.8368 12.425C24.0785 13.1019 24.3612 13.2114 25.0803 12.9822C25.2759 12.9198 25.4667 12.8377 25.6516 12.7484C28.8733 11.1894 32.095 9.63028 35.3139 8.06576L35.5291 7.96117C36.7888 7.34897 38.0487 6.73672 39.2949 6.09861C40.0669 5.70343 40.1229 5.51924 39.8531 4.74557C39.7037 4.31725 39.5438 3.89243 39.3839 3.46764L39.3837 3.46722L39.3051 3.25833C39.2194 3.02997 39.1348 2.80114 39.0502 2.5723L39.0502 2.57214C38.8246 1.96186 38.5991 1.35153 38.3514 0.749968C37.997 -0.110613 37.6569 -0.196306 36.8492 0.318092C36.7612 0.374177 36.6774 0.436778 36.5936 0.499392L36.5936 0.499446L36.5935 0.499496L36.5935 0.499514C36.5456 0.53525 36.4978 0.570989 36.4492 0.605522C35.5315 1.25823 34.6135 1.91057 33.6955 2.56292C31.5356 4.09776 29.3758 5.63261 27.2193 7.17214C26.1176 7.95861 25.0291 8.76312 23.9421 9.56934L23.9344 9.57506ZM19.27 32.826L19.27 32.8259L19.27 32.8259C19.2579 32.7436 19.2456 32.6599 19.2347 32.5741C19.2947 32.0118 19.2064 31.4565 19.1175 30.8979L19.1175 30.8978C19.0631 30.5562 19.0086 30.2134 18.9876 29.867C18.8849 28.1689 18.7504 26.4726 18.6056 24.7775C18.5326 23.9236 18.4501 23.0705 18.3677 22.2174L18.3677 22.2173L18.3677 22.2173C18.2662 21.168 18.1648 20.1188 18.081 19.0681C17.9374 17.2677 17.8052 15.4665 17.6731 13.6653L17.673 13.6646C17.5773 12.3607 17.4816 11.0567 17.3816 9.75306C17.3532 9.38173 17.3059 9.00041 17.1899 8.65016C16.9093 7.80406 16.2393 7.60342 15.575 8.19036C14.8543 8.82707 14.1604 9.4954 13.4668 10.1635L13.4667 10.1635L13.4662 10.164C13.3286 10.2965 13.1911 10.4289 13.0534 10.5611C12.0285 11.5446 11.0067 12.5312 9.98478 13.5179L9.98461 13.518C9.43441 14.0492 8.88421 14.5805 8.33355 15.1112L8.32955 15.1151C8.12252 15.3148 7.91613 15.5139 7.60043 15.5225C6.94816 15.5401 6.29591 15.56 5.64364 15.58L5.64346 15.58L5.64328 15.58C4.25065 15.6226 2.85799 15.6652 1.4651 15.6848C0.22781 15.7023 -0.0936113 15.9728 0.0219034 17.2343C0.0647786 17.7028 0.0830841 18.1708 0.101383 18.6386C0.112255 18.9166 0.123124 19.1945 0.139142 19.4724L0.15879 19.8125L0.158791 19.8125C0.336651 22.8915 0.51453 25.9709 0.742701 29.0465C0.847871 30.4637 1.30205 30.7817 2.68305 30.5234C4.18841 30.242 5.68733 29.9244 7.18591 29.6069L7.18593 29.6069L7.18619 29.6068L7.50191 29.5399C8.29106 29.3729 8.99831 29.421 9.73351 29.8694C11.3624 30.8629 13.0135 31.819 14.6646 32.7751L14.6653 32.7755C15.2906 33.1377 15.916 33.4998 16.5401 33.8639C16.6422 33.9235 16.7433 33.985 16.8445 34.0464L16.8446 34.0465L16.8446 34.0465C17.0956 34.1991 17.3468 34.3517 17.6112 34.4747C18.7341 34.9974 19.3935 34.5549 19.329 33.3354C19.3201 33.1671 19.2955 32.9997 19.27 32.826ZM41.7786 35.2977C41.7675 35.2945 41.7542 35.2908 41.7391 35.2865C41.6255 35.2546 41.4066 35.1931 41.1953 35.1133C36.5332 33.3522 31.8727 31.5878 27.2121 29.8234C27.058 29.765 26.9041 29.7048 26.7548 29.6361C25.9634 29.2726 25.8653 29.0986 26.1359 28.3448C26.3247 27.8185 26.5475 27.3003 26.7988 26.7988C27.1146 26.1691 27.3564 26.0712 28.0997 26.2827C29.3305 26.6327 30.5556 27.0016 31.7762 27.3833C34.2881 28.1689 36.7983 28.9595 39.3085 29.7501C40.4179 30.0995 41.5273 30.4489 42.6368 30.7979C42.7032 30.8188 42.7704 30.8374 42.8376 30.8559C42.9297 30.8813 43.0217 30.9067 43.1115 30.9381C44.0495 31.2676 44.1422 31.4332 43.8588 32.3417C43.609 33.1423 43.3526 33.9414 43.0796 34.735C42.9153 35.213 42.5663 35.4442 41.8059 35.3057C41.7993 35.3036 41.7901 35.301 41.7786 35.2977ZM26.3694 17.7811C25.4527 17.9852 25.2947 18.2319 25.3404 19.5328C25.3503 19.6089 25.3604 19.6999 25.3717 19.8013C25.4017 20.0693 25.4398 20.4108 25.5031 20.7469C25.6444 21.4949 25.7846 21.6266 26.4801 21.596C27.0096 21.5727 27.539 21.4947 28.0641 21.4105C31.6554 20.8341 35.2461 20.2529 38.8358 19.6657C39.9252 19.4876 41.0138 19.3021 42.0978 19.0909C43.4221 18.8329 43.4853 18.7118 43.1863 17.2683C43.1378 17.0346 43.084 16.802 43.0302 16.5695C42.9969 16.4256 42.9636 16.2817 42.9316 16.1375L42.931 16.1351C42.5063 14.2225 42.5022 14.204 40.6349 14.6143C36.6891 15.4814 32.7456 16.3603 28.802 17.2391C27.9912 17.4198 27.1803 17.6005 26.3694 17.7811Z"
            ></path>
          </svg>
        </button>
      </div>
      <div v-if="showResult" class="text-[20px] mt-8 leading-10">
        <p>
          <span class="font-semibold">Giải thích</span>:
          {{ props.exercise?.explain_answer }}
        </p>
        <p class="mt-4">
          <span class="font-semibold">Tiếng Việt</span>:
          {{ props.exercise?.explain_answer_vn }}
        </p>
      </div>
    </div>
    <span class="block w-full h-[0.2rem] bg-[#d9dee8] mt-[1.6rem]"></span>
    <!-- options 01 -->
    <!-- <div class="btn-options flex flex-wrap gap-6 mt-[3rem] px-[1.6rem]">
      <button
        v-for="option in props.exercise?.options"
        :key="option"
        class="btn btn-default-custom min-h-[5rem] text-[2.4rem]"
        style="padding: 0 32px"
        @click="dataResult = option"
      >
        {{ option?.noi_dung }}
      </button>
    </div> -->
    <!-- options -->
    <div class="btn-options grid grid-cols-2 gap-6 mt-[4rem] px-[1.6rem]">
      <template v-if="!showResult">
        <button
          v-for="option in props.exercise?.options"
          :key="option"
          class="btn btn-default-custom min-h-[6rem] text-[2.4rem]"
          :class="{ active: dataResult?.ma_dap_an === option.ma_dap_an }"
          @click="dataResult = option"
        >
          <span>{{ option?.ma_dap_an }}</span>
          <p class="text">{{ option?.noi_dung }}</p>
        </button>
      </template>
      <template v-else>
        <button
          v-for="option in props.exercise?.options"
          :key="option"
          class="btn btn-default-custom min-h-[6rem] text-[2.4rem]"
          :style="{
            backgroundColor:
              option?.noi_dung === props.exercise?.correct_answer
                ? '#84e41a'
                : dataResult?.ma_dap_an === option.ma_dap_an
                  ? '#b13039'
                  : '',
          }"
        >
          <span>{{ option?.ma_dap_an }}</span>
          <p class="text">{{ option?.noi_dung }}</p>
        </button>
      </template>
    </div>
  </div>
  <div class="right w-[15%]">
    <div class="flex flex-col gap-8 h-full items-center justify-center sm:justify-start">
      <button
        class="btn btn-primary-custom w-full min-h-[4.4rem] text-[1.6rem]"
        style="color: #012"
        :class="{ 'btn-disabled': !dataResult }"
        :disabled="!dataResult"
        @click="handleNextExercise"
      >
        <span v-if="showResult" class="flex items-center">
          <span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 30 45"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M.962 6.643c1.415-1.23 2.79-2.533 4.18-3.796.61-.555 1.342-1.485 2.097-1.824.927-.416 1.473.71 1.964 1.317 1.186 1.466 2.525 2.783 3.876 4.094.711.691 1.442 1.36 2.152 2.053.683.666 1.479 1.2 2.127 1.904.637.692 1.068 1.494 1.791 2.118.928.802 1.84 1.6 2.733 2.443.942.89 1.823 1.844 2.755 2.745.94.909 1.711 1.87 2.56 2.855.53.614 1.426 1.239 1.769 1.988.079.173.116.457.175.652.062.204.128.38.12.598-.022.597-.479 1.063-.798 1.531-.504.74-.926 1.523-1.56 2.164-.87.881-1.838 1.687-2.733 2.547-1.78 1.71-3.385 3.646-5.415 5.078-1.02.721-1.867 1.505-2.726 2.414-.66.698-1.403 1.256-2.118 1.889-.68.6-1.132 1.367-1.787 1.987-.669.633-1.314 1.311-2.025 1.899-.288.238-.601.435-.9.658-.346.259-.694.77-1.14.785-.486.015-.86-.574-1.194-.865-.286-.25-.598-.468-.88-.723-1.343-1.209-2.627-2.682-3.727-4.112a16.625 16.625 0 0 0-.76-.928c-.455-.511-.495-.647-.05-1.172.761-.9 1.67-1.715 2.489-2.576.808-.85 1.685-1.634 2.556-2.419.874-.787 1.617-1.694 2.555-2.411a81.014 81.014 0 0 0 2.647-2.12c.902-.752 1.474-1.768 2.344-2.543.508-.453 1.698-1.11 1.304-1.885-.181-.355-.509-.607-.807-.854-.446-.37-.832-.794-1.265-1.175-.666-.588-1.37-1.063-1.993-1.71-.59-.614-1.199-1.211-1.776-1.838-.674-.733-1.403-1.444-2.013-2.232-.762-.983-1.415-1.888-2.35-2.723-1.469-1.311-2.722-2.804-4.054-4.243-.131-.142-.345-.255-.448-.418C.385 7.4.575 6.892.962 6.643Z"
                fill="currentColor"
              ></path>
            </svg>
          </span>
          Tiếp tục</span
        >
        <span v-else>Kiểm tra</span>
      </button>
    </div>
  </div>
</template>
