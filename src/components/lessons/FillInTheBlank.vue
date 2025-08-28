<script setup>
import { onMounted, ref, watch } from "vue";

const props = defineProps({
  exercise: { type: Object, required: true },
});

const dataResult = ref({
  ma_dap_an: null,
  noi_dung: "",
});
const showResult = ref(false);

const emit = defineEmits(["nextExercise"]);

watch(
  () => props.exercise,
  () => {
    resetDataResult();
  }
);

const resetDataResult = () => {
  dataResult.value = {
    ma_dap_an: null,
    noi_dung: "",
  };
  showResult.value = false;
};

const handleNextExercise = () => {
  if (showResult.value) {
    const userAnswer = {
      exercise_id: props.exercise._id,
      question: props.exercise.question,
      correct_answer: props.exercise.correct_answer,
      user_answer: dataResult.value?.noi_dung,
      correct:
        dataResult.value?.noi_dung?.toLowerCase() ===
        props.exercise.correct_answer?.toLowerCase(),
    };
    emit("nextExercise", userAnswer);
    return;
  }
  showResult.value = true;
};

onMounted(() => {
  // console.log('dataResult.value', dataResult.value)
  // console.log('showResult.value', showResult.value)
  console.log("props.exercise", props.exercise);
});
</script>

<template>
  <!-- Chọn câu trả phù hợp -->
  <div class="left w-[85%]">
    <p class="text-[#001122] text-[3rem] text-type">
      {{ props.exercise?.type?.ten_muc }}
    </p>
    <div class="mt-20">
      <p class="text-question text-center text-[3.6rem] font-bold px-10">
        {{ props.exercise?.question }}
      </p>
    </div>
    <div class="min-h-[64px]">
      <div v-if="showResult" class="text-[1.6rem] sm:text-[2rem] mt-8 leading-10">
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
    <!-- options -->
    <div
      v-if="props.exercise?.options && props.exercise?.options.length > 0"
      class="btn-options grid grid-cols-2 gap-6 mt-[4rem] px-[1.6rem]"
    >
      <template v-if="!showResult">
        <button
          v-for="option in props.exercise?.options"
          :key="option"
          class="btn btn-default-custom min-h-[6rem] text-[2.4rem]"
          :class="{ active: dataResult?.ma_dap_an === option.ma_dap_an }"
          @click="dataResult = option"
        >
          <p class="text" style="margin-left: 0">{{ option?.noi_dung }}</p>
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
          <p class="text" style="margin-left: 0">{{ option?.noi_dung }}</p>
        </button>
      </template>
    </div>
    <!-- enter answer -->
    <div v-else class="btn-options flex flex-wrap gap-6 mt-[3rem]">
      <input
        v-if="showResult"
        type="text"
        v-model.trim="dataResult.noi_dung"
        class="w-full h-[6rem] p-[1.6rem] border border-[#d9dee8] rounded-[4px] text-[2.4rem] input-answer"
        placeholder="Nhập câu trả lời"
        :style="{
          backgroundColor:
            dataResult?.noi_dung?.toLowerCase() ===
            props.exercise?.correct_answer?.toLowerCase()
              ? '#84e41a'
              : '#b13039',
        }"
        disabled
      />
      <input
        v-else
        type="text"
        v-model.trim="dataResult.noi_dung"
        class="w-full h-[6rem] p-[1.6rem] border border-[#d9dee8] rounded-[4px] text-[2.4rem] input-answer"
        placeholder="Nhập câu trả lời"
      />
    </div>
  </div>
  <div class="right w-[15%]">
    <div class="flex flex-col gap-8 h-full items-center justify-center sm:justify-start">
      <button
        class="btn btn-primary-custom w-full min-h-[4.4rem] text-[1.6rem]"
        style="color: #012"
        :class="{ 'btn-disabled': !dataResult.noi_dung }"
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
