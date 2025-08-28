<script setup>
import api from '@/utils'
import { computed, inject, onMounted, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import ListExample from './ListExample.vue'
import _ from 'lodash'

const router = useRouter()
const route = useRoute()

const URL_API = inject('URL_API')
const handleErrorAPI = inject('handleErrorAPI')

const isCreate = computed(() => (route.query._id != 'null' ? false : true))
const { topics } = defineProps(['topics'])
const types = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'preposition',
  'conjunction',
  'pronoun',
  'determiner',
]

const vocabularyObj = reactive({
  _id: null,
  word: '',
  phonetic: '',
  meaning: '',
  type: [],
  topic_id: '',
  audio: {
    uk: '',
    us: '',
  },
  examples: [],
  vietnamese: '',
})

const title = computed(() => (route.query._id != 'null' ? 'Sửa thông tin từ vựng' : 'Thêm từ vựng'))

watch(
  () => route.params._id,
  async () => {
    await init()
  },
  { deep: true },
)

const getVocabularyById = async (vocabulary_id) => {
  try {
    const res = await api.get(`${URL_API}/api/vocabulary/${vocabulary_id}`)
    if (res?.status !== 200) {
      toast.error(res?.data?.message)
      return null
    }
    const data = res?.data?.data
    vocabularyObj._id = data?._id
    vocabularyObj.word = data?.word
    vocabularyObj.phonetic = data?.phonetic
    vocabularyObj.meaning = data?.meaning
    vocabularyObj.type = data?.type
    vocabularyObj.topic_id = data?.topic_id
    vocabularyObj.audio.uk = data?.audio?.uk
    vocabularyObj.audio.us = data?.audio?.us
    vocabularyObj.examples = data?.examples
    vocabularyObj.vietnamese = data?.vietnamese
    console.log(vocabularyObj)
    return res?.data?.data
  } catch (error) {
    return handleErrorAPI(error)
  }
}

const init = async () => {
  if (!isCreate.value) {
    // get by id
    await getVocabularyById(route.query._id)
  }
}

// Add or update example
const handleAddExample = async (example) => {
  // update
  if (example?._id && example?._id != '') {
    const indexItem = _.findIndex(vocabularyObj.examples, { _id: example?._id })
    if (indexItem == -1) {
      toast.error('Ví dụ không được tìm thấy')
      return
    }
    vocabularyObj.examples[indexItem] = {
      ...example,
    }
  } else {
    vocabularyObj.examples.push({
      ...example,
      _id: vocabularyObj.examples.length.toString(),
    })
  }
}

const handleDeleteExample = async (example_id) => {
  const newExamples = vocabularyObj.examples.filter((item) => item._id !== example_id)
  vocabularyObj.examples = newExamples
}

const handleProcessDb = async () => {
  try {
    vocabularyObj.examples = vocabularyObj.examples.map((item) => {
      return {
        sentence: item.sentence,
        translation: item.translation,
      }
    })
    const res = await api.post(`${URL_API}/api/vocabulary`, {
      ...vocabularyObj,
    })
    if (res?.status !== 200 || (res?.data?.status && res?.data?.status !== 200)) {
      toast.error(res?.data?.message)
      return null
    }
    console.log(res?.data)
    toast.success(res?.data?.message || 'Thành công!')
    setTimeout(() => {
      router.replace(`/admin/vocabulary?_id=${res?.data?.data?._id}`)
    }, 1000)
  } catch (error) {
    return handleErrorAPI(error)
  }
}

onMounted(() => {
  init()
})
</script>

<template>
  <h2 class="lv2">{{ title }}</h2>
  <form method="post" class="form" autocomplete="off">
    <fieldset>
      <div class="grid grid-cols-12 gap-2">
        <div class="col-span-6 form-group mt-4">
          <label class="form-label">Từ vựng</label>
          <input
            v-model="vocabularyObj.word"
            type="text"
            class="form-control"
            required
            placeholder="Từ vựng"
          />
        </div>
        <div class="col-span-6 form-group mt-4">
          <label class="form-label">Phiên âm</label>
          <input
            v-model="vocabularyObj.phonetic"
            type="text"
            class="form-control"
            required
            placeholder="Phiên âm"
          />
        </div>
        <div class="col-span-6 form-group">
          <label class="form-label">Tiếng Việt</label>
          <input
            v-model="vocabularyObj.vietnamese"
            type="text"
            class="form-control"
            required
            placeholder="Nghĩa tiếng Việt"
          />
        </div>
        <div class="col-span-6">
          <label class="form-label">Chủ đề</label>
          <select
            v-model="vocabularyObj.topic_id"
            class="select select-neutral form-control w-full border-[#dee2e6]"
          >
            <option disabled selected value="">Chủ đề</option>
            <option v-for="topic in topics" :key="topic?._id" :value="topic?._id">
              {{ topic.name }}
            </option>
          </select>
        </div>
        <div class="col-span-12 form-group">
          <label class="form-label">Nghĩa của từ</label>
          <textarea
            v-model="vocabularyObj.meaning"
            class="form-control"
            required
            placeholder="Nghĩa của từ"
          />
        </div>
        <div class="col-span-6 flex flex-col row-span-3">
          <label class="form-label">Loại từ</label>
          <select
            v-model="vocabularyObj.type"
            class="select select-neutral form-control w-full flex-1 border-[#dee2e6]"
            multiple
          >
            <option v-for="(type, index) in types" :key="index" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
        <div class="col-span-6 form-group">
          <label class="form-label">Audio UK</label>
          <input
            v-model="vocabularyObj.audio.uk"
            type="text"
            class="form-control"
            required
            placeholder="Audio UK"
          />
        </div>
        <div class="col-span-6 form-group">
          <label class="form-label">Audio US</label>
          <input
            v-model="vocabularyObj.audio.us"
            type="text"
            class="form-control"
            required
            placeholder="Audio US"
          />
        </div>
        <ListExample
          :examples="vocabularyObj.examples"
          @add-example="handleAddExample"
          @deleteExample="handleDeleteExample"
        />
      </div>
      <div class="mt-5">
        <router-link
          to="/admin/vocabulary"
          class="btn btn-outline-primary"
          style="margin-right: 4px"
          >Quay lại</router-link
        >
        <button type="button" @click="handleProcessDb" class="btn btn-success">
          <i class="bi bi-plus-circle"></i>&nbsp; {{ isCreate ? 'Lưu' : 'Cập nhật' }}
        </button>
      </div>
    </fieldset>
  </form>
</template>
