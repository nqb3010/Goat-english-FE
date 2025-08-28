<script setup>
import { ref, reactive, onMounted, inject, watch } from "vue";
import api from "@/utils";
import { toast } from "vue3-toastify";
import _ from "lodash";

const URL_API = inject("URL_API");
const handleErrorAPI = inject("handleErrorAPI");

const { examples } = defineProps(["examples"]);
const emit = defineEmits(["addExample", "deleteExample"]);

const modeEditorOption = ref(0); // 0: view, 1: add or update
const showModelExercise = ref(false);

const exampleObj = reactive({
  _id: "",
  sentence: "",
  translation: "",
});

const handleCloseModeEditor = () => {
  modeEditorOption.value = 0;
};

const handleAddExampleToList = () => {
  emit("addExample", exampleObj);
  showModelExercise.value = false;
};

const handleUpdateExample = (example) => {
  showModelExercise.value = true;
  exampleObj._id = example._id;
  exampleObj.sentence = example.sentence;
  exampleObj.translation = example.translation;
};

const handleDeleteExample = (example_id) => {
  const result = confirm("Xác nhận xóa ví dụ");
  if (result) {
    emit("deleteExample", example_id);
  }
};

const handleClickAddExercise = () => {
  showModelExercise.value = true;
  exampleObj._id = "";
  exampleObj.sentence = "";
  exampleObj.translation = "";
};
</script>

<template>
  <div class="col-span-12 form-group">
    <label class="form-label flex justify-between items-center">
      <span>Danh sách ví dụ</span>
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
            <th>Nội dung ví dụ</th>
            <th>Nội dung dịch ví dụ</th>
            <th class="text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(example, index) in examples" :key="example._id">
            <th class="text-center">{{ index + 1 }}</th>
            <td>{{ example.sentence }}</td>
            <td>{{ example.translation }}</td>
            <td class="flex justify-center">
              <span class="cursor-pointer" @click="handleUpdateExample(example, index)">
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
              <span class="cursor-pointer" @click="handleDeleteExample(example._id)">
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
    <div class="modal-content" style="width: 80%">
      <div class="header">
        <h5 class="modal-title">Thêm ví dụ</h5>
        <div @click.prevent="showModelExercise = false" class="icon-close">
          <i class="bi bi-x"></i>
        </div>
      </div>
      <div class="body mt-2">
        <div class="grid grid-cols-12 gap-y-2 gap-x-3">
          <div class="form-group col-span-12">
            <label class="form-label">Nội dung ví dụ</label>
            <input
              v-model="exampleObj.sentence"
              type="text"
              class="form-control"
              placeholder="Nhập nội dung ví dụ"
            />
          </div>
          <div class="form-group col-span-12">
            <label class="form-label">Nội dung dịch ví dụ</label>
            <input
              v-model="exampleObj.translation"
              type="text"
              class="form-control"
              placeholder="Nhập nội dung dịch ví dụ"
            />
          </div>
        </div>
      </div>
      <div class="bottom">
        <button
          @click.prevent="handleAddExampleToList"
          type="button"
          class="btn btn-outline-primary"
        >
          Lưu ví dụ
        </button>
      </div>
    </div>
  </div>
</template>
