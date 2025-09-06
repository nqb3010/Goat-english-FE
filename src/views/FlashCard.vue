<script setup>
import { inject, onMounted, ref, reactive, computed, onUnmounted } from 'vue'
import api from '@/utils'
import { toast } from 'vue3-toastify'

const URL_API = inject('URL_API')
const handleErrorAPI = inject('handleErrorAPI')
const getInfoUser = inject('getInfoUser')

const user = ref()
const vocabularies = ref([])
const currentCardIndex = ref(0)
const isFlipped = ref(false)

// Pagination và filter
const page = ref(1)
const limit = ref(50)
const totalCards = ref(0)
const loading = ref(false)

const init = async () => {
  user.value = await getInfoUser()
  await getVocabularies()
}

const getVocabularies = async () => {
  if (!user.value?.topic_id) return

  loading.value = true
  try {
    const res = await api.get(
      `${URL_API}/api/vocabulary/topic/${user.value.topic_id}?page=${page.value}&limit=${limit.value}`,
    )

    if (res?.status !== 200) {
      toast.error(res?.data?.message)
      return
    }

    vocabularies.value = res?.data?.data?.vocabularies || []
    totalCards.value = res?.data?.data?.pagination?.totalRecords || 0

    // Reset current card nếu cần
    if (currentCardIndex.value >= vocabularies.value.length) {
      currentCardIndex.value = 0
    }
  } catch (error) {
    handleErrorAPI(error)
  } finally {
    loading.value = false
  }
}

// Computed properties
const currentCard = computed(() => {
  return vocabularies.value[currentCardIndex.value] || null
})

const canGoPrevious = computed(() => currentCardIndex.value > 0)
const canGoNext = computed(() => currentCardIndex.value < vocabularies.value.length - 1)

// Card navigation
const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

const nextCard = () => {
  if (canGoNext.value) {
    currentCardIndex.value++
    isFlipped.value = false
  }
}

const previousCard = () => {
  if (canGoPrevious.value) {
    currentCardIndex.value--
    isFlipped.value = false
  }
}

const shuffleCards = () => {
  vocabularies.value = vocabularies.value.sort(() => Math.random() - 0.5)
  currentCardIndex.value = 0
  isFlipped.value = false
}

// Keyboard shortcuts
const handleKeydown = (event) => {
  if (event.code === 'Space') {
    event.preventDefault()
    flipCard()
  } else if (event.code === 'ArrowRight') {
    event.preventDefault()
    nextCard()
  } else if (event.code === 'ArrowLeft') {
    event.preventDefault()
    previousCard()
  }
}

const closeFlashcard = () => {
  const result = confirm('Xác nhận thoát flashcard?')
  if (result) {
    location.href = '/dashboard'
  }
}

onMounted(() => {
  init()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div id="flashcard">
    <!-- Animated Background giống Home.vue -->
    <div class="animated-bg">
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
      <div class="bg-circle circle-3"></div>
    </div>

    <!-- Header giống Lesson với màu đúng -->
    <div class="lesson-header py-8 px-16" style="background: oklch(76% 0.177 163.223)">
      <div class="flex justify-between items-center gap-12">
        <span @click="closeFlashcard" class="cursor-pointer hover:scale-110 transition-transform">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </span>

        <div class="flex-1 flex flex-col items-center gap-4">
          <!-- Thông tin chủ đề trong header -->
          <div v-if="user?.topic_id" class="flex items-center gap-3">
            <svg height="24" width="24" style="color: white; overflow: visible" viewBox="0 0 33 32">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M16.5 28C23.1274 28 28.5 22.6274 28.5 16C28.5 9.37258 23.1274 4 16.5 4C9.87258 4 4.5 9.37258 4.5 16C4.5 22.6274 9.87258 28 16.5 28ZM15.5 8C15.5 7.44772 15.9477 7 16.5 7C17.0523 7 17.5 7.44772 17.5 8V15.5858L21.2929 19.3787C21.6834 19.7692 21.6834 20.4024 21.2929 20.7929C20.9024 21.1834 20.2692 21.1834 19.8787 20.7929L15.7929 16.7071C15.6054 16.5196 15.5 16.2652 15.5 16V8Z"
                fill="white"
              ></path>
            </svg>
            <p class="text-white font-bold text-xl">
              Flashcard - {{ user?.topic_id?.name || 'Từ vựng' }}
            </p>
          </div>

          <!-- Progress bar -->
          <div class="w-full max-w-lg">
            <div class="w-full bg-white/30 rounded-full h-3">
              <div
                class="bg-white rounded-full h-3 transition-all duration-300"
                :style="{ width: ((currentCardIndex + 1) / vocabularies.length) * 100 + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <span class="text-lg font-medium text-white"
            >{{ currentCardIndex + 1 }}/{{ vocabularies.length }}</span
          >
          <span
            ><img
              src="../components/icons/heart_icon.svg"
              class="w-6 h-6 filter brightness-0 invert"
          /></span>
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="lesson-body px-16">
      <div class="content-lesson">
        <div class="lesson-detail">
          <!-- Main Content -->
          <div class="flex-1 flex items-center justify-center mb-8">
            <div v-if="loading" class="text-center">
              <div
                class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"
              ></div>
              <p class="text-gray-600">Đang tải từ vựng...</p>
            </div>

            <div v-else-if="!currentCard" class="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="mx-auto mb-4 text-gray-400"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
              </svg>
              <p class="text-gray-600">Không có từ vựng nào</p>
            </div>

            <!-- Flashcard -->
            <div v-else class="flashcard-container">
              <div
                class="flashcard"
                :class="{ flipped: isFlipped }"
                @click="flipCard"
                style="z-index: 1; position: relative"
              >
                <!-- Front side -->
                <div class="flashcard-side flashcard-front">
                  <div class="text-center">
                    <h1 class="text-6xl font-bold text-gray-800 mb-4">
                      {{ currentCard.word }}
                    </h1>
                    <div v-if="currentCard.phonetic" class="text-xl text-gray-600 mb-6">
                      /{{ currentCard.phonetic }}/
                    </div>
                    <p class="text-gray-500">Click để xem nghĩa</p>
                  </div>
                </div>

                <!-- Back side -->
                <div class="flashcard-side flashcard-back">
                  <div class="h-full flex flex-col justify-center items-center text-center px-8">
                    <!-- Meaning -->
                    <div class="mb-6">
                      <h2 class="text-4xl font-bold text-indigo-600 mb-4">
                        {{ currentCard.meaning }}
                      </h2>
                      <div
                        v-if="currentCard.type && currentCard.type.length"
                        class="flex flex-wrap justify-center gap-2 mb-4"
                      >
                        <span
                          v-for="t in currentCard.type"
                          :key="t"
                          class="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {{ t }}
                        </span>
                      </div>
                    </div>

                    <!-- Examples -->
                    <div
                      v-if="currentCard.examples && currentCard.examples.length"
                      class="max-w-lg"
                    >
                      <h3 class="text-lg font-semibold text-gray-800 mb-3">Ví dụ:</h3>
                      <div
                        v-for="(example, index) in currentCard.examples.slice(0, 2)"
                        :key="index"
                        class="bg-gray-50 rounded-lg p-4 mb-3 last:mb-0"
                      >
                        <p class="text-gray-700 italic mb-2">{{ example.en }}</p>
                        <p v-if="example.vi" class="text-gray-600 text-sm">
                          {{ example.vi }}
                        </p>
                      </div>
                    </div>

                    <!-- Additional info -->
                    <div class="mt-4">
                      <div
                        v-if="currentCard.topic_id"
                        class="flex items-center justify-center gap-2 mb-2"
                      >
                        <span class="text-sm text-gray-600">Chủ đề:</span>
                        <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                          {{ currentCard.topic_id.name }}
                        </span>
                      </div>

                      <div
                        v-if="
                          currentCard.vietnamese && currentCard.vietnamese !== currentCard.meaning
                        "
                        class="flex items-center justify-center gap-2 mb-2"
                      >
                        <span class="text-sm text-gray-600">Nghĩa khác:</span>
                        <span class="text-sm text-gray-700">{{ currentCard.vietnamese }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card info và controls -->
          <div
            class="flex items-center justify-between mb-6 py-4 bg-white/50 rounded-lg backdrop-blur-sm"
          >
            <div class="flex items-center gap-4">
              <span class="text-lg font-bold text-gray-700">
                Thẻ {{ currentCardIndex + 1 }} / {{ vocabularies.length }}
              </span>
            </div>

            <div class="flex items-center gap-3">
              <!-- Shuffle button -->
              <button
                @click="shuffleCards"
                class="px-3 py-2 bg-gradient-to-r from-slate-800 to-slate-600 text-white rounded-lg hover:from-slate-900 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
                title="Trộn bài"
              >
                <svg
                  fill="#000000"
                  version="1.1"
                  id="Capa_1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  width="30"
                  height="16"
                  viewBox="0 0 39.499 39.499"
                  xml:space="preserve"
                >
                  <g>
                    <path
                      d="M38.765,26.274c0.469,0.469,0.732,1.104,0.732,1.77s-0.266,1.299-0.732,1.771l-4.344,4.338
		c-0.488,0.486-1.127,0.729-1.77,0.729c-0.641,0-1.277-0.243-1.769-0.731c-0.977-0.978-0.975-2.562,0.003-3.535l0.086-0.086
		c-1.162,0.131-2.509,0.24-3.81,0.24c-1.576,0-3.07-0.158-4.047-0.629c-2.313-1.109-4.198-3.5-6.021-6.314
		c-1.728,2.701-3.488,5.031-5.604,6.234c-0.998,0.567-2.553,0.76-4.188,0.76c-1.855,0-3.816-0.244-5.191-0.461
		c-1.364-0.217-2.295-1.496-2.08-2.859c0.216-1.362,1.49-2.291,2.859-2.08c2.532,0.4,5.493,0.521,6.215,0.254
		c1.494-0.854,3.354-3.807,5.056-6.601c-1.548-2.506-3.188-4.955-4.595-5.755c-0.698-0.268-3.912-0.141-6.676,0.297
		c-1.361,0.211-2.644-0.716-2.859-2.08c-0.215-1.363,0.716-2.645,2.08-2.859c2.748-0.434,7.695-0.974,9.929,0.297
		c1.895,1.078,3.504,3.068,5.061,5.411c1.656-2.449,3.389-4.49,5.471-5.491c1.812-0.869,5.449-0.694,7.976-0.435
		c-0.614-0.967-0.506-2.263,0.338-3.107c0.976-0.978,2.558-0.978,3.535-0.002l4.347,4.342c0.469,0.469,0.731,1.104,0.731,1.769
		s-0.265,1.3-0.731,1.769l-4.345,4.34c-0.487,0.486-1.127,0.73-1.769,0.73c-0.641,0-1.278-0.244-1.768-0.732
		c-0.977-0.978-0.975-2.561,0.002-3.535l0.443-0.444c-2.822-0.371-5.871-0.452-6.627-0.171c-1.426,0.687-3.098,3.106-4.686,5.661
		c1.746,2.86,3.646,5.784,5.266,6.562c0.619,0.221,3.197,0.153,5.629-0.136l-0.027-0.026c-0.977-0.976-0.979-2.56-0.002-3.533
		c0.975-0.98,2.557-0.979,3.535-0.002L38.765,26.274z"
                    />
                  </g>
                </svg>
              </button>
            </div>
          </div>

          <!-- Navigation trong lesson-detail như lesson -->
          <div class="lesson-navigation mt-8 flex items-center justify-between">
            <!-- Previous -->
            <button
              @click="previousCard"
              :disabled="!canGoPrevious"
              class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-600 text-white rounded-lg hover:from-slate-900 hover:to-slate-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Trước
            </button>

            <!-- Center actions -->
            <div class="flex items-center gap-3">
              <button
                @click="flipCard"
                class="px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-600 text-white rounded-lg hover:from-slate-900 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
              >
                Lật bài
              </button>
            </div>

            <!-- Next -->
            <button
              @click="nextCard"
              :disabled="!canGoNext"
              class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-600 text-white rounded-lg hover:from-slate-900 hover:to-slate-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Tiếp
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Keyboard shortcuts hint -->
    <div class="fixed top-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg backdrop-blur-sm">
      <p><kbd class="bg-white/20 px-1 rounded">Space</kbd> Lật bài</p>
      <p><kbd class="bg-white/20 px-1 rounded">←→</kbd> Điều hướng</p>
    </div>
  </div>
</template>

<style scoped>
#flashcard {
  margin: 0 auto;
  max-width: 1080px;
  padding-bottom: 140px;
  height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
  color: #1f2937; /* Màu chữ tối để thấy trên background sáng */
}

/* Animated Background giống Home.vue */
.animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05));
  animation: float 8s ease-in-out infinite;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: -10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 250px;
  height: 250px;
  top: 60%;
  right: -8%;
  animation-delay: 3s;
}

.circle-3 {
  width: 200px;
  height: 200px;
  bottom: 20%;
  left: 60%;
  animation-delay: 6s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(120deg);
  }
  66% {
    transform: translateY(10px) rotate(240deg);
  }
}

.progress-success {
  border-radius: 12px;
  height: 16px;
}

.lesson-body {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  position: relative;
  z-index: 1;
  color: #1f2937; /* Đảm bảo text có màu tối */
}

.content-lesson {
  margin-top: 15px;
  overflow: visible;
  width: 600px;
  position: relative;
  z-index: 1;
  color: #1f2937; /* Màu text tối */
}

.lesson-detail {
  display: flex;
  flex-direction: column;
  min-height: 450px;
  position: relative;
  z-index: 1;
  color: #1f2937; /* Màu text tối */
}

.flashcard-container {
  perspective: 1000px;
  width: 100%;
  max-width: 600px;
  height: 400px;
  margin: 2rem auto;
}

.flashcard {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
  cursor: pointer;
}

.flashcard.flipped {
  transform: rotateY(180deg);
}

.flashcard-side {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.flashcard-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.flashcard-back {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  transform: rotateY(180deg);
}

.lesson-navigation {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  position: relative;
  z-index: 1;
}

/* Header styling */
.lesson-header {
  position: relative;
  z-index: 2;
  color: #1f2937; /* Màu text tối cho header */
}

.lesson-header span {
  color: #1f2937; /* Đảm bảo icon và text có màu tối */
}

/* Filter controls styling */
.filter-controls {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 2rem;
  border: 1px solid #e5e7eb;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
  color: #1f2937; /* Màu text tối */
}

/* Loading và empty states */
.text-center {
  color: #374151 !important;
}

.text-gray-600 {
  color: #4b5563 !important;
}

.text-gray-400 {
  color: #9ca3af !important;
}

/* Study mode buttons */
.bg-gray-100 {
  background-color: rgba(243, 244, 246, 0.9) !important;
  backdrop-filter: blur(10px);
}

/* Button text colors */
button:not(.bg-gradient-to-r) {
  color: #374151 !important;
}

/* Gradient button styling với !important để override global CSS */
.bg-gradient-to-r.from-slate-800 {
  background: linear-gradient(to right, #1e293b, #475569) !important;
  color: white !important;
}

.bg-gradient-to-r.from-slate-800:hover {
  background: linear-gradient(to right, #0f172a, #334155) !important;
}

.bg-gradient-to-r.from-green-500 {
  background: linear-gradient(to right, #10b981, #059669) !important;
  color: white !important;
}

.bg-gradient-to-r.from-yellow-500 {
  background: linear-gradient(to right, #f59e0b, #ea580c) !important;
  color: white !important;
}

button.bg-gradient-to-r {
  color: white !important;
}

/* Auto button specific styling */
.auto-button-active {
  background: linear-gradient(to right, #1e293b, #475569) !important;
  color: white !important;
}

.auto-button-inactive {
  background: transparent !important;
  color: #374151 !important;
}

/* Override global button styles */
#flashcard button {
  border: none !important;
}

#flashcard .bg-gradient-to-r {
  border: none !important;
}

/* Specific button overrides with high specificity */
#flashcard button[class*='from-slate-'] {
  background: linear-gradient(to right, #1e293b, #475569) !important;
  color: white !important;
}

#flashcard button[class*='from-slate-']:hover {
  background: linear-gradient(to right, #0f172a, #334155) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 25px rgba(30, 41, 59, 0.25) !important;
}

#flashcard button[class*='from-green-'] {
  background: linear-gradient(to right, #10b981, #059669) !important;
  color: white !important;
}

#flashcard button[class*='from-yellow-'] {
  background: linear-gradient(to right, #f59e0b, #ea580c) !important;
  color: white !important;
}

/* Disabled state */
#flashcard button:disabled {
  background: linear-gradient(to right, #d1d5db, #9ca3af) !important;
  color: #6b7280 !important;
  transform: none !important;
  box-shadow: none !important;
  cursor: not-allowed !important;
}

#flashcard button:disabled:hover {
  transform: none !important;
  box-shadow: none !important;
}

/* Override any global button styles */
#flashcard button {
  font-family: inherit !important;
  font-size: inherit !important;
  line-height: inherit !important;
}

/* Force gradient styles */
#flashcard .bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important;
}

/* Input và select text colors */
input,
select {
  color: #374151 !important;
}

input::placeholder {
  color: #9ca3af !important;
}

/* Tất cả text trong lesson-detail */
.lesson-detail * {
  color: inherit;
}

.lesson-detail .text-lg,
.lesson-detail .text-sm,
.lesson-detail span:not(.bg-gradient-to-r *) {
  color: #374151 !important;
}

/* Flashcard với gradient background mới */
.flashcard-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.flashcard-back {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  transform: rotateY(180deg);
}

/* Button hover effects */
button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

button:disabled {
  transform: none !important;
  box-shadow: none !important;
}

/* Keyboard shortcuts hint styling */
.fixed.top-4.right-4 {
  z-index: 10;
  background: rgba(0, 0, 0, 0.8) !important;
  color: white !important;
  backdrop-filter: blur(10px);
}

kbd {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 11px;
}

/* Responsive */
@media (max-width: 768px) {
  #flashcard {
    max-width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .content-lesson {
    width: 100%;
    max-width: 400px;
  }

  .flashcard-container {
    height: 350px;
    max-width: 350px;
  }

  .flashcard-side {
    padding: 1.5rem;
  }

  .flashcard-front h1 {
    font-size: 2.5rem;
  }

  .flashcard-back h2 {
    font-size: 2rem;
  }

  .lesson-navigation {
    flex-direction: column;
    gap: 1rem;
  }

  .lesson-navigation > div {
    width: 100%;
    justify-content: center;
  }

  /* Mobile circles */
  .circle-1 {
    width: 200px;
    height: 200px;
  }

  .circle-2 {
    width: 150px;
    height: 150px;
  }

  .circle-3 {
    width: 100px;
    height: 100px;
  }
}

.flashcard-side {
  z-index: 4 !important;
}

/* Animation improvements */
.flashcard:hover {
  transform: translateY(-5px) rotateY(var(--rotation, 0deg));
}

.flashcard.flipped:hover {
  --rotation: 180deg;
}
</style>
