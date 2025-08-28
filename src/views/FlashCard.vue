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
const studiedCards = ref(new Set())

// Pagination và filter
const page = ref(1)
const limit = ref(50)
const search = ref('')
const sort = ref('created_at:asc')
const totalCards = ref(0)
const loading = ref(false)

// Study mode
const studyMode = ref('all') // 'all', 'unstudied', 'studied'
const showMeaning = ref(false)
const autoPlay = ref(false)

const init = async () => {
  user.value = await getInfoUser()
  await getVocabularies()
}

const getVocabularies = async () => {
  if (!user.value?.topic_id) return
  
  loading.value = true
  try {
    const res = await api.get(
      `${URL_API}/api/vocabulary/topic/${user.value.topic_id}?page=${page.value}&limit=${limit.value}&search=${search.value}&sort=${sort.value}`
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

const filteredCards = computed(() => {
  if (studyMode.value === 'all') return vocabularies.value
  if (studyMode.value === 'unstudied') {
    return vocabularies.value.filter((_, index) => !studiedCards.value.has(index))
  }
  if (studyMode.value === 'studied') {
    return vocabularies.value.filter((_, index) => studiedCards.value.has(index))
  }
  return vocabularies.value
})

const progress = computed(() => {
  if (vocabularies.value.length === 0) return 0
  return Math.round((studiedCards.value.size / vocabularies.value.length) * 100)
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
    if (autoPlay.value) {
      playAudio()
    }
  }
}

const previousCard = () => {
  if (canGoPrevious.value) {
    currentCardIndex.value--
    isFlipped.value = false
    if (autoPlay.value) {
      playAudio()
    }
  }
}

const markAsStudied = () => {
  studiedCards.value.add(currentCardIndex.value)
  nextCard()
}

const markAsUnstudied = () => {
  studiedCards.value.delete(currentCardIndex.value)
}

const shuffleCards = () => {
  vocabularies.value = vocabularies.value.sort(() => Math.random() - 0.5)
  currentCardIndex.value = 0
  isFlipped.value = false
}

const resetProgress = () => {
  studiedCards.value.clear()
  currentCardIndex.value = 0
  isFlipped.value = false
}

// Audio functions
const playAudio = () => {
  if (currentCard.value?.audio?.us || currentCard.value?.audio?.uk) {
    // Ưu tiên âm Mỹ, nếu không có thì dùng âm Anh
    const audioUrl = currentCard.value.audio.us || currentCard.value.audio.uk
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play().catch(err => {
        console.error('Error playing audio:', err)
      })
    }
  }
}

// Search and filter
const handleSearch = async () => {
  page.value = 1
  currentCardIndex.value = 0
  await getVocabularies()
}

const handleSortChange = async () => {
  page.value = 1
  currentCardIndex.value = 0
  await getVocabularies()
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
  } else if (event.code === 'Enter') {
    event.preventDefault()
    markAsStudied()
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
  <div id="flashcard" class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <div class="flashcard-header pt-6 px-6 flex justify-between items-center">
      <button @click="closeFlashcard" class="p-2 hover:bg-white/20 rounded-lg transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      
      <!-- Progress -->
      <div class="flex-1 mx-8">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">
            {{ currentCardIndex + 1 }} / {{ vocabularies.length }}
          </span>
          <span class="text-sm font-medium text-indigo-600">
            Đã học: {{ progress }}%
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div 
            class="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-300"
            :style="{ width: `${(currentCardIndex + 1) / vocabularies.length * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-3">
        <button 
          @click="playAudio" 
          v-if="currentCard?.audio?.us || currentCard?.audio?.uk"
          class="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          title="Phát âm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        </button>
        
        <div class="flex items-center gap-1 bg-white/80 rounded-lg p-1">
          <button 
            @click="autoPlay = !autoPlay"
            :class="autoPlay ? 'bg-indigo-500 text-white' : 'text-gray-600'"
            class="p-1 rounded text-xs font-medium transition-colors"
          >
            Auto
          </button>
        </div>
      </div>
    </div>

    <!-- Filter Controls -->
    <div class="px-6 pb-4 flex items-center gap-4 flex-wrap">
      <!-- Search -->
      <div class="flex-1 min-w-[200px]">
        <input 
          v-model="search"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="Tìm kiếm từ vựng..."
          class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
      </div>

      <!-- Sort -->
      <select 
        v-model="sort" 
        @change="handleSortChange"
        class="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
      >
        <option value="created_at">Mới nhất</option>
        <option value="word">Theo từ A-Z</option>
        <option value="difficulty">Độ khó</option>
      </select>

      <!-- Study Mode -->
      <select 
        v-model="studyMode"
        class="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
      >
        <option value="all">Tất cả</option>
        <option value="unstudied">Chưa học</option>
        <option value="studied">Đã học</option>
      </select>

      <!-- Action buttons -->
      <button 
        @click="shuffleCards"
        class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        Trộn bài
      </button>
      
      <button 
        @click="resetProgress"
        class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
      >
        Reset
      </button>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex items-center justify-center px-6 pb-6">
      <div v-if="loading" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p class="text-gray-600">Đang tải từ vựng...</p>
      </div>

      <div v-else-if="!currentCard" class="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4 text-gray-400">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
        <p class="text-gray-600">Không có từ vựng nào</p>
      </div>

      <!-- Flashcard -->
      <div v-else class="flashcard-container">
        <div 
          class="flashcard"
          :class="{ flipped: isFlipped }"
          @click="flipCard"
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
              <div class="flex items-center justify-center gap-4 mb-6">
                <button 
                  v-if="currentCard.audio?.us || currentCard.audio?.uk"
                  @click.stop="playAudio"
                  class="p-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                </button>
              </div>
              <p class="text-gray-500">Click để xem nghĩa</p>
            </div>
          </div>

          <!-- Back side -->
          <div class="flashcard-side flashcard-back">
            <div class="h-full flex flex-col">
              <!-- Meaning -->
              <div class="text-center mb-6">
                <h2 class="text-4xl font-bold text-indigo-600 mb-4">
                  {{ currentCard.meaning }}
                </h2>
                <div v-if="currentCard.type && currentCard.type.length" class="flex flex-wrap justify-center gap-2 mb-4">
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
              <div v-if="currentCard.examples && currentCard.examples.length" class="flex-1">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">Ví dụ:</h3>
                <div 
                  v-for="(example, index) in currentCard.examples" 
                  :key="index"
                  class="bg-gray-50 rounded-lg p-4 mb-3 last:mb-0"
                >
                  <p class="text-gray-700 italic mb-2">{{ example.sentence }}</p>
                  <p v-if="example.translation" class="text-gray-600 text-sm">
                    {{ example.translation }}
                  </p>
                </div>
              </div>

              <!-- Additional info -->
              <div class="mt-4">
                <div v-if="currentCard.topic_id" class="flex items-center gap-2 mb-2">
                  <span class="text-sm text-gray-600">Chủ đề:</span>
                  <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                    {{ currentCard.topic_id.name }}
                  </span>
                </div>
                
                <div v-if="currentCard.vietnamese && currentCard.vietnamese !== currentCard.meaning" class="flex items-center gap-2 mb-2">
                  <span class="text-sm text-gray-600">Nghĩa khác:</span>
                  <span class="text-sm text-gray-700">{{ currentCard.vietnamese }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <!-- Previous -->
        <button 
          @click="previousCard"
          :disabled="!canGoPrevious"
          class="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Trước
        </button>

        <!-- Center actions -->
        <div class="flex items-center gap-3">
          <button 
            v-if="studiedCards.has(currentCardIndex)"
            @click="markAsUnstudied"
            class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
          >
            Học lại
          </button>
          <button 
            v-else
            @click="markAsStudied"
            class="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            ✓ Đã nhớ
          </button>
          
          <button 
            @click="flipCard"
            class="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm"
          >
            Lật bài
          </button>
        </div>

        <!-- Next -->
        <button 
          @click="nextCard"
          :disabled="!canGoNext"
          class="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Tiếp
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Keyboard shortcuts hint -->
    <div class="fixed top-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg backdrop-blur-sm">
      <p><kbd class="bg-white/20 px-1 rounded">Space</kbd> Lật bài</p>
      <p><kbd class="bg-white/20 px-1 rounded">←→</kbd> Điều hướng</p>
      <p><kbd class="bg-white/20 px-1 rounded">Enter</kbd> Đã nhớ</p>
    </div>
  </div>
</template>

<style scoped>
.flashcard-container {
  perspective: 1000px;
  width: 100%;
  max-width: 600px;
  height: 400px;
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

kbd {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 11px;
}

/* Responsive */
@media (max-width: 768px) {
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
}

/* Animation */
.flashcard:hover {
  transform: translateY(-5px) rotateY(var(--rotation, 0deg));
}

.flashcard.flipped:hover {
  --rotation: 180deg;
}
</style>