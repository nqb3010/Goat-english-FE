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
  // Sử dụng modal như trong LessonV2.vue
  document.getElementById('my_modal_5').showModal()
}

const handleCloseLesson = () => {
  location.href = '/dashboard'
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
    <!-- Background full width -->
    <div class="flashcard-bg"></div>
    
    <!-- Main content container -->
    <div class="flashcard-container-wrapper">
      <!-- Animated Background giống Home.vue -->
      <div class="animated-bg">
        <div class="bg-circle circle-1"></div>
        <div class="bg-circle circle-2"></div>
        <div class="bg-circle circle-3"></div>
      </div>

      <!-- Header với background full width -->
      <div class="lesson-header-wrapper">
        <div class="lesson-header-bg"></div>
        <div class="lesson-header-content py-8 px-16">
          <div class="flex justify-between items-center gap-12">
            <span @click="closeFlashcard" class="cursor-pointer hover:scale-110 transition-transform">
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m4.231 13.171 4.923 5.143c.317.35.944.382 1.311.077.368-.306.405-.888.064-1.22l-3.557-3.714h12.105c.51 0 .923-.384.923-.857s-.413-.857-.923-.857H6.972l3.557-3.714c.34-.332.294-.913-.073-1.22-.368-.305-.986-.275-1.302.077l-4.923 5.142c-.32.417-.295.79 0 1.143Z"
              fill="currentColor"
            ></path>
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
        </div><!-- End flex justify-between items-center gap-12 -->
        </div><!-- End lesson-header-content -->
      </div><!-- End lesson-header-wrapper -->

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

    <!-- Modal thoát flashcard -->
    <dialog id="my_modal_5" class="modal modal-bottom sm:modal-middle text-[15px]">
      <div class="modal-box">
        <h3 class="font-bold">Xác nhận thoát!</h3>
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
    </div><!-- End flashcard-container-wrapper -->
  </div><!-- End flashcard -->
</template>

<style scoped>
#flashcard {
  width: 100vw;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
}

/* Background full width */
.flashcard-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  z-index: 0;
}

/* Main content container */
.flashcard-container-wrapper {
  position: relative;
  max-width: 1080px;
  margin: 0 auto;
  padding-bottom: 140px;
  min-height: 100vh;
  z-index: 1;
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

/* Header với background full width */
.lesson-header-wrapper {
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  z-index: 2;
}

.lesson-header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: oklch(76% 0.177 163.223);
  z-index: 0;
}

.lesson-header-content {
  position: relative;
  max-width: 1080px;
  margin: 0 auto;
  z-index: 1;
  color: white;
}

.lesson-body {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  position: relative;
  z-index: 1;
  color: #1f2937; /* Đảm bảo text có màu tối */
  padding-top: 20px; /* Tăng padding để tạo khoảng trắng với header */
}

.content-lesson {
  margin-top: 40px;
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
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.flashcard-back {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
  transform: rotateY(180deg);
}

.lesson-navigation {
  margin-top: -1rem;
  padding-top: 2rem;
  /* border-top: 1px solid #e5e7eb; */
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
  .flashcard-container-wrapper {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .content-lesson {
    width: 100%;
    max-width: 400px;
    margin-top: 60px; /* Tăng margin cho mobile */
  }

  .lesson-body {
    padding-top: 30px; /* Tăng padding cho mobile */
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
