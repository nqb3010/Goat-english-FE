<script setup>
import { ref, watch } from "vue";
import _ from "lodash";

const props = defineProps({
  exercise: { type: Object, required: true },
});

const options = ref([]);
const userAnswer = ref([]);
const showResult = ref(false);
const result = ref(false);

const emit = defineEmits(["nextExercise"]);

watch(
  () => props.exercise,
  (newValue) => {
    if (newValue) {
      options.value = _.shuffle(newValue.correct_answer.split(" "));
    }
  },
  { immediate: true }
);

const handleNextExercise = () => {
  const userAnswerString = userAnswer.value.map((item) => item.answer).join(" ");
  const correctAnswer = props.exercise?.correct_answer;
  result.value = userAnswerString === correctAnswer;
  if (showResult.value) {
    const userAnswerData = {
      exercise_id: props.exercise._id,
      question: correctAnswer,
      correct_answer: correctAnswer,
      user_answer: userAnswerString,
      correct: result.value,
    };
    emit("nextExercise", userAnswerData);
    resetAnswer();
    return;
  }
  showResult.value = true;
};

const handleInsertAnswer = (answer, index) => {
  const item = userAnswer.value.find((item) => item.index === index);
  if (item) {
    userAnswer.value = userAnswer.value.filter((item) => item.index !== index);
    return;
  }
  userAnswer.value.push({
    answer,
    index,
  });
};

const checkSelected = (option, index) => {
  const item = userAnswer.value.find((item) => item.index === index);
  return item ? true : false;
};

const resetAnswer = () => {
  userAnswer.value = [];
  options.value = [];
  showResult.value = false;
  result.value = false;
};

// onMounted(() => {
//   options.value = _.shuffle(props.exercise?.correct_answer.split(" "));
// });
</script>

<template>
  <!-- Chọn câu trả phù hợp -->
  <div class="left w-[85%]">
    <p class="text-[#001122] text-[3rem] text-type">
      {{ props.exercise?.type?.ten_muc }}
    </p>
    <div class="my-20">
      <p class="text-center text-[3.6rem] font-bold px-10 text-question">
        {{ props.exercise?.question }}
      </p>
    </div>
    <div class="flex-1">
      <div>
        <div class="flex items-center flex-wrap gap-2 sm:gap-4">
          <button
            v-for="(option, index) in userAnswer"
            :key="index"
            class="btn btn-default-custom min-h-[3rem] sm:min-h-[5rem] text-[1.6rem] py-3 sm:text-[2.4rem]"
            @click="handleInsertAnswer(option.answer, option.index)"
          >
            {{ option.answer }}
          </button>
        </div>
        <div v-if="showResult" class="text-[1.6rem] sm:text-[2rem] mt-8 leading-10">
          <p v-if="result" class="font-semibold text-[#6ba72a]">Chính xác</p>
          <p v-else>
            <span class="block font-semibold text-[#b13039] mb-4">Chưa chính xác</span>
            <span class="font-semibold">Đáp án</span>:
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
      <div class="btn-options flex flex-wrap gap-6 mt-[3rem] px-[1.6rem]">
        <button
          v-for="(option, index) in options"
          :key="index"
          class="btn btn-default-custom min-h-[3rem] sm:min-h-[5rem] py-3 text-[2.4rem]"
          :style="{
            backgroundColor: checkSelected(option, index) ? '#bcc2cf' : '#fff',
          }"
          @click="handleInsertAnswer(option, index)"
        >
          {{ option }}
        </button>
      </div>
    </div>
  </div>
  <div class="right w-[15%]">
    <div class="flex flex-col gap-8 h-full items-center justify-center sm:justify-start">
      <button
        class="btn btn-primary-custom w-full min-h-[4.4rem] text-[1.6rem]"
        :disabled="userAnswer.length === 0"
        style="color: #012"
        @click="handleNextExercise"
      >
        <span v-if="!showResult">Kiểm tra</span>
        <span v-else>Tiếp tục</span>
      </button>
      <button
        class="btn btn-default-custom flex-col w-full h-full text-[1.6rem] mt-4 hidden"
        style="padding: 8px; background-color: #d9dee8"
      >
        <span
          ><svg
            width="23"
            height="37"
            viewBox="0 0 23 37"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="w-[32px] h-[32px] block"
          >
            <path
              d="M23 9.899c0 .614-.136 1.228-.238 1.775a7.594 7.594 0 0 1-.508 1.706c-.204.546-.51 1.092-.78 1.604-.306.512-.747.922-1.086 1.4-.34.512-.577 1.092-.916 1.536-.373.478-.848.887-1.221 1.297-.407.512-.814.956-1.12 1.4a3.27 3.27 0 0 0-.475 1.706c0 .102-.135.102-.135.205 0 .819-.51 1.092-1.188 1.092-.78 0-.78.17-1.594.17-.78 0-.78-.102-1.595-.102-.78 0-.78.069-1.594.069-.814 0-.78.034-1.594.034-.747 0-1.425-.547-1.425-1.297 0-.683.102-.683.102-1.366 0-.546.101-1.16.305-1.74.204-.513.679-.922 1.018-1.434.305-.478.576-.99.916-1.468.339-.444.576-1.024.916-1.502.373-.477.78-.887 1.12-1.33.372-.513.644-.99.881-1.469.305-.58.713-1.058.713-1.604 0-.58-.442-1.297-1.086-1.809-.441-.375-1.052-.853-1.934-.853-.61 0-1.085.41-1.594.58-.509.205-1.12.239-1.595.614-.407.342-.848.717-1.255 1.161-.373.376-.746.649-1.255.683-.475.068-.882-.069-1.323-.478-.678-.649-.78-.546-1.492-1.195-.713-.648-.679-.683-1.357-1.331-.306-.41-.882-1.058-.78-1.911C-.103 5.53.338 4.983.95 4.335c.34-.341.746-.717 1.221-1.126.407-.342.712-.854 1.221-1.195.441-.273.984-.478 1.493-.751.475-.239.984-.444 1.56-.649.51-.17 1.086-.239 1.629-.34C8.583.17 9.159.17 9.736.136c.543-.069 1.085-.171 1.662-.171s1.154-.068 1.696 0c.577.068 1.12.273 1.629.41.576.136 1.153.17 1.628.375.543.205 1.086.375 1.56.648.51.274 1.018.58 1.425.922.441.376.645.956 1.018 1.365.373.444.848.785 1.12 1.263.27.512.474 1.058.644 1.57.204.547.373 1.093.475 1.639.305.614.407 1.16.407 1.74ZM6.886 31.539c0-.58.17-1.127.306-1.673a5.64 5.64 0 0 1 .746-1.502c.34-.443.746-.853 1.187-1.194.441-.342.984-.41 1.527-.615.509-.17 1.018-.443 1.594-.443.577 0 1.086.204 1.629.375.542.17.983.478 1.424.785.441.341.95.58 1.29 1.024.339.444.474.99.644 1.536.17.512.204 1.058.204 1.639 0 .58.101 1.126-.102 1.672-.17.546-.543.99-.848 1.434-.34.443-.679.887-1.12 1.194-.44.307-.95.615-1.459.785-.508.171-1.085.376-1.628.376-.576 0-1.12-.205-1.628-.376-.543-.17-1.086-.41-1.527-.716-.44-.342-.678-.888-.983-1.332-.34-.443-.645-.887-.815-1.4-.203-.477-.44-1.023-.44-1.57Z"
              fill="currentColor"
            ></path></svg
        ></span>
        Tôi không biết
      </button>
    </div>
  </div>
</template>
