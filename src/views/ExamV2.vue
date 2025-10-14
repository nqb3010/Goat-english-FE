<script setup>
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils'
import { toast } from 'vue3-toastify'

const URL_API = inject('URL_API')
const handleErrorAPI = inject('handleErrorAPI')
const getInfoUser = inject('getInfoUser')

const route = useRoute()
const router = useRouter()
const exam_id = route.params.id

const loadingUI = ref(false)
const showResult = ref(false)

const user = ref()
const exam = ref()
const questions = ref([])
const userAnswers = ref({}) // Object: { questionId: selectedAnswerId }
const exercisesLength = ref(0)

const answeredCount = computed(() => {
  return Object.keys(userAnswers.value).length
})

const progressExam = computed(() => {
  return (answeredCount.value / exercisesLength.value) * 100
})

// Timer variables
const timeRemaining = ref(0) // seconds
const timerInterval = ref(null)
const isTimeUp = ref(false)

const formatTime = computed(() => {
  const hours = Math.floor(timeRemaining.value / 3600)
  const minutes = Math.floor((timeRemaining.value % 3600) / 60)
  const seconds = timeRemaining.value % 60
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`
})

const startTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  
  timerInterval.value = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
      
      // Warning khi còn 5 phút
      if (timeRemaining.value === 300) {
        toast.warning('Còn 5 phút nữa là hết giờ làm bài!', { autoClose: 5000 })
      }
      
      // Warning khi còn 1 phút
      if (timeRemaining.value === 60) {
        toast.warning('Còn 1 phút nữa là hết giờ làm bài!', { autoClose: 5000 })
      }
    } else {
      // Hết giờ - tự động nộp bài
      clearInterval(timerInterval.value)
      isTimeUp.value = true
      toast.error('Hết giờ làm bài! Đang tự động nộp bài...', { autoClose: 3000 })
      submitExam()
    }
  }, 1000)
}

const init = async () => {
  try {
    loadingUI.value = true
    user.value = await getInfoUser()
    await getDataExam(exam_id)
  } catch (error) {
    handleErrorAPI(error)
  } finally {
    loadingUI.value = false
  }
}

const getDataExam = async (exam_id) => {
  try {
    const res = await api.get(`${URL_API}/api/exam/${exam_id}`)
    
    if (res?.status !== 200) {
      toast.error(res?.data?.message || 'Không thể tải đề thi')
      router.push('/exam')
      return
    }
    
    exam.value = res?.data?.data
    
    if (exam.value?.status !== 'publish') {
      toast.error('Đề thi này chưa được công bố')
      router.push('/exam')
      return
    }
    
    // Lấy tất cả câu hỏi và format lại
    questions.value = (exam.value?.exercises || []).map((q, index) => ({
      ...q,
      questionNumber: index + 1,
      selectedAnswer: null
    }))
    
    exercisesLength.value = questions.value.length
    
    if (exercisesLength.value === 0) {
      toast.error('Không có câu hỏi nào trong đề thi này')
      router.push('/exam')
      return
    }
    
    // Khởi tạo timer - duration là phút, chuyển sang giây
    timeRemaining.value = exam.value?.duration * 60
    startTimer()
    
    console.log('Exam loaded:', exam.value)
    console.log('Questions:', questions.value)
  } catch (error) {
    handleErrorAPI(error)
    router.push('/exam')
  }
}

// Xử lý chọn đáp án
const selectAnswer = (questionId, answerId) => {
  if (showResult.value) return // Không cho chọn sau khi nộp bài
  userAnswers.value[questionId] = answerId
}

// Kiểm tra câu trả lời đúng
const checkAnswer = (question) => {
  if (!showResult.value) return null
  
  const userAnswerId = userAnswers.value[question._id]
  const correctAnswerId = question.correct_answer // String ID như "0", "1", "2", "3"
  
  if (!userAnswerId) return 'unanswered'
  if (userAnswerId === correctAnswerId) return 'correct'
  return 'incorrect'
}

// Tính điểm
const calculateScore = () => {
  let correctCount = 0
  
  questions.value.forEach(question => {
    const userAnswerId = userAnswers.value[question._id]
    const correctAnswerId = question.correct_answer // String ID
    
    if (userAnswerId === correctAnswerId) {
      correctCount++
    }
  })
  
  return {
    correct: correctCount,
    total: questions.value.length,
    percentage: Math.round((correctCount / questions.value.length) * 100)
  }
}

const doneSubmit = ref(false)

const submitExam = async () => {
  if (doneSubmit.value) return // Tránh submit nhiều lần
  
  // Kiểm tra đã làm hết chưa
  if (answeredCount.value < exercisesLength.value && !isTimeUp.value) {
    const confirm = window.confirm(
      `Bạn mới trả lời ${answeredCount.value}/${exercisesLength.value} câu. Bạn có chắc muốn nộp bài?`
    )
    if (!confirm) return
  }
  
  // Dừng timer
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  
  const toastId = toast.loading('Đang chấm bài...')
  
  try {
    doneSubmit.value = true
    showResult.value = true
    
    const score = calculateScore()
    
    const data = {
      user_id: user.value?._id,
      exam_id: exam.value?._id,
      topic_id: exam.value?.topic,
      score: score.percentage,
      total_questions: score.total,
      correct_answers: score.correct,
      time_spent: (exam.value?.duration * 60) - timeRemaining.value,
      detail: questions.value.map(q => ({
        question_id: q._id,
        user_answer: userAnswers.value[q._id] || null,
        is_correct: checkAnswer(q) === 'correct'
      })),
      completed_at: new Date().toISOString()
    }
    
    const res = await api.post(`${URL_API}/api/exam/submit`, { data })
    
    if (res?.status !== 200) {
      toast.update(toastId, {
        render: res?.data?.message || 'Có lỗi xảy ra khi nộp bài',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
      doneSubmit.value = false
      showResult.value = false
      return
    }
    
    toast.update(toastId, {
      render: `Chấm bài thành công! Điểm: ${score.correct}/${score.total} (${score.percentage}%)`,
      type: 'success',
      isLoading: false,
      autoClose: 5000,
    })
    
    // Scroll to top để xem kết quả
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
  } catch (error) {
    handleErrorAPI(error, toastId)
    doneSubmit.value = false
    showResult.value = false
  }
}

const handleCloseExam = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  router.push('/exam')
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  // Clean up timer khi component bị destroy
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})
</script>

<template>
  <div id="exam-v2">
    <!-- Fixed Header -->
    <header class="exam-header">
      <div class="header-content">
        <div class="exam-info">
          <h1 class="exam-title">{{ exam?.name }}</h1>
          <p class="exam-meta">
            <span>{{ exercisesLength }} câu hỏi</span>
            <span>•</span>
            <span>{{ exam?.duration }} phút</span>
          </p>
        </div>
        
        <div class="header-actions">
          <!-- Timer -->
          <div 
            class="timer-display"
            :class="{
              'timer-warning': timeRemaining <= 300 && timeRemaining > 60,
              'timer-danger': timeRemaining <= 60
            }"
          >
            <svg class="timer-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ formatTime }}
          </div>
          
          <!-- Submit Button -->
          <button 
            v-if="!showResult"
            @click="submitExam"
            class="btn-submit"
            :disabled="answeredCount === 0"
          >
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Nộp bài ({{ answeredCount }}/{{ exercisesLength }})
          </button>
          
          <!-- Back Button (after submit) -->
          <button 
            v-else
            @click="handleCloseExam"
            class="btn-back"
          >
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Về danh sách
          </button>
          
          <!-- Exit Button -->
          <span 
            v-if="!showResult"
            class="cursor-pointer"
            onclick="exam_exit_modal.showModal()"
          >
            <svg 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              class="w-[32px] h-[32px] text-[#00a778]"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </span>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div v-if="!showResult" class="progress-container">
        <div class="progress-info">
          <span>Tiến độ: {{ answeredCount }}/{{ exercisesLength }} câu</span>
          <span>{{ Math.round(progressExam) }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressExam + '%' }"></div>
        </div>
      </div>
      
      <!-- Result Summary -->
      <div v-else class="result-summary">
        <div class="result-card">
          <div class="result-icon">
            <svg v-if="calculateScore().percentage >= 80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <svg v-else-if="calculateScore().percentage >= 50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="result-info">
            <h2 class="result-title">Kết quả bài thi</h2>
            <div class="result-details">
              <div class="result-item">
                <span class="result-label">Điểm:</span>
                <span class="result-value score">{{ calculateScore().correct }}/{{ calculateScore().total }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">Phần trăm:</span>
                <span class="result-value">{{ calculateScore().percentage }}%</span>
              </div>
              <div class="result-item">
                <span class="result-label">Thời gian:</span>
                <span class="result-value">{{ Math.floor(((exam?.duration * 60) - timeRemaining) / 60) }} phút</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Body - A4 Paper Style -->
    <div class="exam-body">
      <!-- Loading -->
      <div v-if="loadingUI" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Đang tải đề thi...</p>
      </div>

      <!-- Exam Paper -->
      <div v-else class="exam-paper">
        <!-- Student Info Section -->
        <div class="student-info">
          <div class="info-row">
            <span class="info-label">Tài khoản:</span>
            <span class="info-value">{{ user?.username || '___________________________' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Đề thi:</span>
            <span class="info-value">{{ exam?.name }}</span>
          </div>
        </div>

        <!-- Questions List -->
        <div class="questions-container">
          <div 
            v-for="(question, index) in questions" 
            :key="question._id"
            class="question-item"
            :class="{ 
              'question-correct': showResult && checkAnswer(question) === 'correct',
              'question-incorrect': showResult && checkAnswer(question) === 'incorrect',
              'question-unanswered': showResult && checkAnswer(question) === 'unanswered'
            }"
          >
            <!-- Question Number and Content -->
            <div class="question-header">
              <span class="question-number">Câu {{ index + 1 }}:</span>
              <div class="question-content">
                {{ question.question || question.title }}
              </div>
            </div>

            <!-- Answers -->
            <div class="answers-list">
              <label 
                v-for="(option, optionIndex) in question.options" 
                :key="option._id"
                class="answer-option"
                :class="{
                  'answer-selected': userAnswers[question._id] === option._id,
                  'answer-correct': showResult && option._id === question.correct_answer,
                  'answer-incorrect': showResult && userAnswers[question._id] === option._id && option._id !== question.correct_answer,
                  'answer-disabled': showResult
                }"
              >
                <input
                  type="radio"
                  :name="`question-${question._id}`"
                  :value="option._id"
                  :checked="userAnswers[question._id] === option._id"
                  :disabled="showResult"
                  @change="selectAnswer(question._id, option._id)"
                  class="answer-radio"
                />
                <span class="answer-letter">{{ option.ma_dap_an }}.</span>
                <span class="answer-text">{{ option.noi_dung }}</span>
                
                <!-- Result Icons -->
                <span v-if="showResult && option._id === question.correct_answer" class="answer-icon answer-icon-correct">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </span>
                <span v-else-if="showResult && userAnswers[question._id] === option._id && option._id !== question.correct_answer" class="answer-icon answer-icon-incorrect">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </span>
              </label>
            </div>

            <!-- Explanation (after submit) -->
            <div v-if="showResult && (question.explain_answer_vn || question.explain_answer)" class="question-explanation">
              <strong>Giải thích:</strong> {{ question.explain_answer_vn || question.explain_answer }}
            </div>
          </div>
        </div>

        <!-- Submit Button at Bottom -->
        <div v-if="!showResult" class="submit-section">
          <button 
            @click="submitExam"
            class="btn-submit-large"
            :disabled="answeredCount === 0"
          >
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Nộp bài ({{ answeredCount }}/{{ exercisesLength }})
          </button>
        </div>
      </div>
    </div>
    
    <!-- Exit Modal -->
    <dialog id="exam_exit_modal" class="modal modal-bottom sm:modal-middle text-[15px]">
      <div class="modal-box">
        <h3 class="font-bold">Xác nhận thoát bài thi!</h3>
        <p class="mt-4 leading-8">
          Nếu bạn thoát, bài thi của bạn sẽ không được lưu lại và bạn sẽ phải làm lại từ đầu.
        </p>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-ghost" style="font-size: 14px">Đóng</button>
            <button
              class="btn btn-soft btn-success ms-5"
              style="font-size: 14px"
              @click="handleCloseExam"
            >
              Đồng ý
            </button>
          </form>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

#exam-v2 {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 40px;
}

/* Fixed Header */
.exam-header {
  position: sticky;
  top: 0;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.exam-info {
  flex: 1;
  min-width: 0;
}

.exam-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.exam-meta {
  font-size: 14px;
  color: #718096;
  display: flex;
  gap: 8px;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Timer */
.timer-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 18px;
  background: #f7fafc;
  color: #2d3748;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.timer-warning {
  background: #fef3c7;
  color: #92400e;
  border-color: #fbbf24;
}

.timer-danger {
  background: #fee2e2;
  color: #991b1b;
  border-color: #ef4444;
  animation: pulse 1s infinite;
}

.timer-icon {
  width: 20px;
  height: 20px;
}

/* Buttons */
.btn-submit,
.btn-back,
.btn-exit {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-submit {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-back {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-exit {
  padding: 10px;
  background: white;
  color: #ef4444;
  border: 2px solid #ef4444;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-exit:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.05);
}

.btn-exit svg {
  width: 24px;
  height: 24px;
}

.btn-icon {
  width: 18px;
  height: 18px;
}

/* Progress Bar */
.progress-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 30px 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #4b5563;
  margin-bottom: 8px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  transition: width 0.3s ease;
}

/* Result Summary */
.result-summary {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 30px 20px;
}

.result-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 24px;
  color: white;
}

.result-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-icon svg {
  width: 36px;
  height: 36px;
}

.result-info {
  flex: 1;
}

.result-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.result-details {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-label {
  font-size: 13px;
  opacity: 0.9;
}

.result-value {
  font-size: 20px;
  font-weight: 700;
}

.result-value.score {
  font-size: 32px;
}

/* Body */
.exam-body {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 30px;
}

/* A4 Paper Style */
.exam-paper {
  background: white;
  padding: 60px 80px;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  min-height: 297mm; /* A4 height */
}

/* Student Info */
.student-info {
  border: 2px solid #1a202c;
  padding: 20px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  gap: 12px;
  font-size: 15px;
}

.info-label {
  font-weight: 700;
  color: #1a202c;
  min-width: 100px;
}

.info-value {
  flex: 1;
  color: #2d3748;
}

/* Questions */
.questions-container {
  margin-top: 40px;
}

.question-item {
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.question-item:last-child {
  border-bottom: none;
}

.question-correct {
  background: #f0fdf4;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #10b981;
}

.question-incorrect {
  background: #fef2f2;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #ef4444;
}

.question-unanswered {
  background: #fefce8;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #eab308;
}

.question-header {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.question-number {
  font-weight: 700;
  color: #1a202c;
  font-size: 16px;
  flex-shrink: 0;
}

.question-content {
  flex: 1;
  font-size: 16px;
  color: #2d3748;
  line-height: 1.6;
}

/* Answers */
.answers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-left: 24px;
}

.answer-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.answer-option:hover:not(.answer-disabled) {
  border-color: #667eea;
  background: #f7fafc;
}

.answer-selected {
  border-color: #667eea;
  background: #eef2ff;
}

.answer-correct {
  border-color: #10b981 !important;
  background: #f0fdf4 !important;
}

.answer-incorrect {
  border-color: #ef4444 !important;
  background: #fef2f2 !important;
}

.answer-disabled {
  cursor: default;
}

.answer-radio {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #667eea;
  flex-shrink: 0;
  margin: 0;
  appearance: auto;
  -webkit-appearance: radio;
  -moz-appearance: radio;
}

.answer-radio:checked {
  accent-color: #667eea;
}

.answer-radio:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.answer-disabled .answer-radio {
  cursor: default;
}

.answer-letter {
  font-weight: 700;
  color: #4b5563;
  min-width: 24px;
}

.answer-text {
  flex: 1;
  font-size: 15px;
  color: #2d3748;
  line-height: 1.5;
}

.answer-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.answer-icon svg {
  width: 100%;
  height: 100%;
}

.answer-icon-correct {
  color: #10b981;
}

.answer-icon-incorrect {
  color: #ef4444;
}

/* Explanation */
.question-explanation {
  margin-top: 16px;
  margin-left: 24px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-left: 3px solid #667eea;
  border-radius: 4px;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
}

/* Submit Section */
.submit-section {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 2px solid #e2e8f0;
  display: flex;
  justify-content: center;
}

.btn-submit-large {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 48px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transition: all 0.3s ease;
}

.btn-submit-large:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-submit-large:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #4b5563;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Print Styles */
@media print {
  #exam-v2 {
    background: white;
  }
  
  .exam-header {
    position: static;
    box-shadow: none;
  }
  
  .header-actions,
  .progress-container,
  .submit-section {
    display: none !important;
  }
  
  .exam-paper {
    box-shadow: none;
    padding: 20mm;
  }
  
  .question-item {
    page-break-inside: avoid;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .exam-paper {
    padding: 30px 20px;
  }
  
  .header-content {
    padding: 15px 20px;
    flex-direction: column;
    align-items: stretch;
  }
  
  .exam-title {
    font-size: 18px;
    white-space: normal;
  }
  
  .header-actions {
    justify-content: space-between;
    flex-wrap: wrap;
  }
  
  .timer-display {
    font-size: 14px;
    padding: 8px 12px;
  }
  
  .btn-submit,
  .btn-back {
    font-size: 12px;
    padding: 8px 12px;
  }
  
  .result-card {
    flex-direction: column;
    text-align: center;
  }
  
  .result-details {
    justify-content: center;
  }
  
  .student-info {
    padding: 15px;
  }
  
  .answers-list {
    margin-left: 0;
  }
  
  .question-explanation {
    margin-left: 0;
  }
}
</style>
