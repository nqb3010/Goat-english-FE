<script setup>
import { inject, onMounted, ref, reactive, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils'
import { toast } from 'vue3-toastify'
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'

const URL_API = inject('URL_API')
const handleErrorAPI = inject('handleErrorAPI')
const getInfoUser = inject('getInfoUser')
const router = useRouter()

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
  router.push('/dashboard')
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
  <div id="flashcard" class="flex">
    <Sidebar />
    <div class="flashcard-main w-full flex-1">
      <Header />
      <div class="flashcard-content">
        <!-- Progress bar ở trên cùng -->
        <div class="flashcard-row">
          <div class="w-full max-w-full">
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div
                class="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full h-3 transition-all duration-300"
                :style="{ width: ((currentCardIndex + 1) / vocabularies.length) * 100 + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Header Section -->
        <div class="flashcard-row">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-4">
              <div>
                <p class="title">Flashcard</p>
                <p v-if="currentCard" class="subtitle">
                  {{ currentCard?.topic_id?.name || user?.topic_id?.name || 'Từ vựng' }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <span class="text-lg font-medium text-gray-800"
                >{{ currentCardIndex + 1 }}/{{ vocabularies.length }}</span
              >
              
              <!-- Keyboard shortcuts hint inline -->
              <div class="keyboard-hints-inline">
                <div class="hint-item">
                  <kbd>Space</kbd>
                  <span>Lật bài</span>
                </div>
                <div class="hint-item">
                  <kbd>←→</kbd>
                  <span>Điều hướng</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="flashcard-row">
          <div class="flashcard-body-container">
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
                    <h1 class="font-bold mb-4" style="color: white;">
                      {{ currentCard.word }}
                    </h1>
                    <div v-if="currentCard.phonetic" class="text-xl mb-6" style="color: rgba(255,255,255,0.9);">
                      /{{ currentCard.phonetic }}/
                    </div>
                    <p style="color: rgba(255,255,255,0.8);">Click để xem nghĩa</p>
                  </div>
                </div>

                <!-- Back side -->
                <div class="flashcard-side flashcard-back">
                  <div class="h-full flex flex-col justify-center items-center text-center px-8 overflow-y-auto">
                    <!-- Meaning -->
                    <div class="mb-4">
                      <h2 class="font-bold mb-4" style="color: white;">
                        {{ currentCard.meaning }}
                      </h2>
                      <div
                        v-if="currentCard.type && currentCard.type.length"
                        class="flex flex-wrap justify-center gap-2 mb-4"
                      >
                        <span
                          v-for="t in currentCard.type"
                          :key="t"
                          class="inline-block px-3 py-1 rounded-full text-sm font-medium"
                          style="background-color: rgba(255,255,255,0.25); color: white;"
                        >
                          {{ t }}
                        </span>
                      </div>
                    </div>

                    <!-- Examples -->
                    <div
                      v-if="currentCard.examples && currentCard.examples.length"
                      class="max-w-lg mb-3"
                    >
                      <h3 class="text-lg font-semibold mb-3" style="color: white;">Ví dụ:</h3>
                      <div
                        v-for="(example, index) in currentCard.examples.slice(0, 2)"
                        :key="index"
                        class="rounded-lg p-3 mb-2 last:mb-0"
                        style="background-color: rgba(255,255,255,0.15);"
                      >
                        <p class="italic mb-1 text-sm" style="color: white;">{{ example.sentence }}</p>
                        <p v-if="example.translation" class="text-xs" style="color: rgba(255,255,255,0.85);">
                          {{ example.translation }}
                        </p>
                      </div>
                    </div>

                    <!-- Additional info -->
                    <div class="mt-2">
                      <div
                        v-if="
                          currentCard.vietnamese && currentCard.vietnamese !== currentCard.meaning
                        "
                        class="flex items-center justify-center gap-2 mb-2"
                      >
                        <span class="text-sm" style="color: rgba(255,255,255,0.9);">Nghĩa khác:</span>
                        <span class="text-sm" style="color: white;">{{ currentCard.vietnamese }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <div class="flashcard-navigation mt-8 flex items-center justify-between">
            <!-- Previous -->
            <button
              @click="previousCard"
              :disabled="!canGoPrevious"
              class="btn-flashcard btn-flashcard-prev"
              :class="{ 'btn-flashcard-disabled': !canGoPrevious }"
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
                class="btn-flashcard btn-flashcard-flip"
              >
                Lật bài
              </button>
            </div>

            <!-- Next -->
            <button
              @click="nextCard"
              :disabled="!canGoNext"
              class="btn-flashcard btn-flashcard-next"
              :class="{ 'btn-flashcard-disabled': !canGoNext }"
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
    </div>
  </div>
</template>

<style scoped>
#flashcard {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.flashcard-main {
  overflow-y: auto;
  height: 100vh;
}

.flashcard-content {
  padding: 40px 80px;
  padding-top: 80px;
  max-width: 1200px;
  margin: 0 auto;
}

.flashcard-row {
  margin-bottom: 30px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.subtitle {
  font-size: 16px;
  color: #666;
}

.flashcard-body-container {
  background: white;
  border-radius: 16px;
  padding: 2rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.flashcard-container {
  perspective: 1000px;
  width: 100%;
  max-width: 500px;
  height: 350px;
  margin: 0 auto 1.5rem;
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

.flashcard-front h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.flashcard-back {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  transform: rotateY(180deg);
  overflow-y: auto;
}

.flashcard-back h2 {
  font-size: 2rem;
  color: white;
}

.flashcard-back .bg-indigo-100 {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.flashcard-back .bg-purple-100 {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.flashcard-back .text-gray-800,
.flashcard-back .text-gray-700,
.flashcard-back .text-gray-600 {
  color: rgba(255, 255, 255, 0.95) !important;
}

.flashcard-back .bg-gray-50 {
  background-color: rgba(255, 255, 255, 0.15);
}

.flashcard-navigation {
  margin-top: 0;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.flashcard-navigation button {
  font-weight: 600;
  min-width: 120px;
}

.flashcard-navigation button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.flashcard-navigation button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
}

.btn-flashcard {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  font-weight: 600;
  min-width: 120px;
  justify-content: center;
}

.btn-flashcard:hover:not(.btn-flashcard-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-flashcard-flip {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  min-width: 100px;
  padding: 12px 20px;
  font-size: 14px;
}

.btn-flashcard-flip:hover {
  box-shadow: 0 8px 20px rgba(240, 147, 251, 0.4);
}

.btn-flashcard-disabled {
  background: #d1d5db;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-flashcard-disabled:hover {
  transform: none;
  box-shadow: none;
}

.keyboard-hints-inline {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.85);
  padding: 10px 16px;
  border-radius: 8px;
  color: white;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  white-space: nowrap;
}

.hint-item kbd {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  font-weight: 600;
  min-width: 32px;
  text-align: center;
}

.hint-item span {
  color: rgba(255, 255, 255, 0.95);
  font-size: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .flashcard-content {
    padding: 20px;
    padding-top: 80px;
  }

  .flashcard-body-container {
    padding: 1.5rem 1rem;
  }

  .title {
    font-size: 20px;
  }

  .flashcard-container {
    height: 320px;
    max-width: 100%;
  }

  .flashcard-side {
    padding: 1.5rem;
  }

  .flashcard-front h1 {
    font-size: 2rem !important;
  }

  .flashcard-back h2 {
    font-size: 1.5rem !important;
  }

  .flashcard-navigation {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .flashcard-navigation button,
  .btn-flashcard {
    flex: 1;
    min-width: 100px;
    justify-content: center;
  }

  .flashcard-navigation > div {
    width: 100%;
    order: 3;
    margin-top: 0.5rem;
  }

  .keyboard-hints-inline {
    display: none;
  }
}
</style>
