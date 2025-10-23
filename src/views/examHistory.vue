<template>
  <div id="exam-history" class="flex">
    <Sidebar />
    <div class="exam-history-main w-full flex-1">
      <Header />
      <div class="exam-history-content">
        <!-- Header -->
        <div class="exam-row">
          <div class="flex justify-between items-center">
            <p class="title">Lịch Sử Làm Đề Thi</p>
            <button @click="goBack" class="btn-back">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Quay lại
            </button>
          </div>
        </div>

    <!-- Loading State -->
    <div v-if="loading" class="exam-row">
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Đang tải lịch sử...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!historyList || historyList.length === 0" class="exam-row">
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <h3 class="empty-title">Chưa có lịch sử làm bài thi</h3>
        <p class="empty-description">Bạn chưa hoàn thành bài thi nào. Hãy bắt đầu làm bài thi đầu tiên của bạn!</p>
        <button @click="goToExams" class="btn-primary">Danh sách đề thi</button>
      </div>
    </div>

    <!-- History List -->
    <div v-else class="exam-row">
      <div class="history-list">
      <div 
        v-for="(history, index) in historyList" 
        :key="history._id"
        class="history-card"
      >
        <!-- Card Header -->
        <div class="card-header">
          <div class="exam-info">
            <img 
              :src="history.exam_id?.image || '/default-exam.png'" 
              :alt="history.exam_id?.name"
              class="exam-image"
              @error="handleImageError"
            />
            <div class="exam-details">
              <h3 class="exam-name">{{ history.exam_id?.name }}</h3>
              <p class="exam-description">{{ history.exam_id?.description }}</p>
              <div class="topic-badge">
                <span class="badge">{{ history.topic_id?.name }}</span>
              </div>
            </div>
          </div>
          <div class="score-container">
            <div 
              class="score-circle"
              :class="getScoreClass(history.score)"
            >
              <span class="score-number">{{ history.score }}</span>
              <span class="score-label">điểm</span>
            </div>
          </div>
        </div>

        <!-- Card Body -->
        <div class="card-body">
          <div class="stats-grid">
            <div class="stat-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Thời gian: {{ history.exam_id?.duration }} phút</span>
            </div>
            <div class="stat-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span>Tổng số câu: {{ history.exam_id?.total_questions }}</span>
            </div>
            <div class="stat-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Đúng: {{ getCorrectCount(history.detail) }}/{{ history.detail?.length }}</span>
            </div>
            <div class="stat-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Ngày làm: {{ formatDate(history.createdAt) }}</span>
            </div>
          </div>

          <!-- Status Badge -->
          <div class="status-container">
            <span 
              class="status-badge"
              :class="history.status"
            >
              {{ getStatusLabel(history.status) }}
            </span>
          </div>
        </div>

        <!-- Card Footer - Detail Answers -->
        <div class="card-footer">
          <button 
            @click="toggleDetail(history._id)"
            class="btn-toggle-detail"
          >
            <span>{{ expandedId === history._id ? 'Ẩn' : 'Xem' }} chi tiết đáp án</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2"
              :class="{ 'rotate-180': expandedId === history._id }"
              class="transition-transform"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <!-- Expanded Detail -->
          <transition name="slide-down">
            <div v-if="expandedId === history._id" class="detail-container">
              <div 
                v-for="(answer, idx) in history.detail" 
                :key="answer._id"
                class="answer-item"
                :class="{ 'correct': answer.correct, 'incorrect': !answer.correct }"
              >
                <div class="answer-header">
                  <span class="question-number">Câu {{ idx + 1 }}</span>
                  <span class="answer-status">
                    <svg v-if="answer.correct" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    {{ answer.correct ? 'Đúng' : 'Sai' }}
                  </span>
                </div>
                <div class="answer-content">
                  <p class="question-text">{{ answer.question }}</p>
                  <div class="answer-comparison">
                    <div class="answer-row">
                      <span class="label">Đáp án của bạn:</span>
                      <span class="user-answer" :class="{ 'wrong': !answer.correct }">
                        {{ answer.user_answer || 'Chưa trả lời' }}
                      </span>
                    </div>
                    <div v-if="!answer.correct" class="answer-row">
                      <span class="label">Đáp án đúng:</span>
                      <span class="correct-answer">{{ answer.correct_answer }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
      </div>
    </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils'
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'

const router = useRouter()
const URL_API = inject('URL_API')
const loading = ref(true)
const historyList = ref([])
const expandedId = ref(null)

// Fetch exam history
const fetchExamHistory = async () => {
  try {
    loading.value = true
    
    // Lấy user_id từ localStorage
    const userDataString = localStorage.getItem('user')
    if (!userDataString) {
      console.error('User not found in localStorage')
      loading.value = false
      return
    }
    
    const userData = JSON.parse(userDataString)
    const userId = userData?._id || userData?.id
    
    if (!userId) {
      console.error('User ID not found')
      loading.value = false
      return
    }
    
    // Gọi API với user_id
    const res = await api.get(`${URL_API}/api/exam/history/user/${userId}`)
    
    if (res?.data?.data) {
      historyList.value = res.data.data
    }
  } catch (error) {
    console.error('Fetch exam history error:', error)
  } finally {
    loading.value = false
  }
}

// Toggle detail view
const toggleDetail = (id) => {
  expandedId.value = expandedId.value === id ? null : id
}

// Get correct count
const getCorrectCount = (details) => {
  if (!details) return 0
  return details.filter(item => item.correct).length
}

// Get score class for styling
const getScoreClass = (score) => {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'average'
  return 'poor'
}

// Get status label
const getStatusLabel = (status) => {
  const labels = {
    'completed': 'Hoàn thành',
    'in_progress': 'Đang làm',
    'pending': 'Chờ xử lý'
  }
  return labels[status] || status
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Handle image error
const handleImageError = (e) => {
  e.target.src = '/favicon.ico'
}

// Navigation
const goBack = () => {
  router.back()
}

const goToExams = () => {
  router.push('/exam')
}

// Lifecycle
onMounted(() => {
  fetchExamHistory()
})
</script>

<style scoped>
#exam-history {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.exam-history-main {
  overflow-y: auto;
  height: 100vh;
}

.exam-history-content {
  padding: 40px 80px;
  padding-top: 100px; /* Space for fixed header */
  max-width: 1200px;
  margin: 0 auto;
}

.exam-row {
  margin-bottom: 30px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.4);
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  text-align: center;
}

.empty-state svg {
  color: #d1d5db;
  margin-bottom: 20px;
}

.empty-title {
  color: #374151;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-description {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 30px;
}

.btn-primary {
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* History List */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* History Card */
.history-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.history-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.exam-info {
  display: flex;
  gap: 16px;
  flex: 1;
}

.exam-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  background: #f0f0f0;
}

.exam-details {
  flex: 1;
}

.exam-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.exam-description {
  color: #666;
  font-size: 14px;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.topic-badge .badge {
  display: inline-block;
  padding: 4px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.score-container {
  margin-left: 20px;
}

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: 4px solid;
}

.score-circle.excellent {
  background: #e8f5e9;
  border-color: #4caf50;
  color: #2e7d32;
}

.score-circle.good {
  background: #fff3e0;
  border-color: #ff9800;
  color: #e65100;
}

.score-circle.average {
  background: #fff9c4;
  border-color: #fbc02d;
  color: #f57f17;
}

.score-circle.poor {
  background: #ffebee;
  border-color: #f44336;
  color: #c62828;
}

.score-number {
  font-size: 24px;
}

.score-label {
  font-size: 12px;
  font-weight: normal;
}

/* Card Body */
.card-body {
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.stat-item svg {
  color: #999;
}

.status-container {
  margin-top: 12px;
}

.status-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-badge.completed {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.in_progress {
  background: #fff3e0;
  color: #e65100;
}

.status-badge.pending {
  background: #e3f2fd;
  color: #1565c0;
}

/* Card Footer */
.card-footer {
  border-top: 1px solid #f0f0f0;
}

.btn-toggle-detail {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #3498db;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-toggle-detail:hover {
  background: #f8f9fa;
}

.btn-toggle-detail svg {
  transition: transform 0.3s;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Detail Container */
.detail-container {
  padding: 20px;
  background: #f8f9fa;
}

.answer-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid;
}

.answer-item.correct {
  border-left-color: #4caf50;
}

.answer-item.incorrect {
  border-left-color: #f44336;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.question-number {
  font-weight: 600;
  color: #333;
}

.answer-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
}

.answer-item.correct .answer-status {
  color: #4caf50;
}

.answer-item.incorrect .answer-status {
  color: #f44336;
}

.answer-content {
  padding-left: 8px;
}

.question-text {
  color: #333;
  font-size: 15px;
  margin-bottom: 12px;
  line-height: 1.5;
}

.answer-comparison {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.answer-row {
  display: flex;
  gap: 12px;
  font-size: 14px;
}

.answer-row .label {
  color: #666;
  min-width: 140px;
}

.user-answer {
  color: #4caf50;
  font-weight: 500;
}

.user-answer.wrong {
  color: #f44336;
  text-decoration: line-through;
}

.correct-answer {
  color: #4caf50;
  font-weight: 500;
}

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 2000px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .exam-history-content {
    padding: 20px;
    padding-top: 80px;
  }

  .exam-row .flex {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start !important;
  }

  .card-header {
    flex-direction: column;
    gap: 16px;
  }

  .exam-info {
    width: 100%;
  }

  .score-container {
    margin-left: 0;
    align-self: flex-end;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .answer-row {
    flex-direction: column;
    gap: 4px;
  }

  .answer-row .label {
    min-width: auto;
  }

  .title {
    font-size: 20px;
  }
}

/* Medium screens - Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .exam-history-content {
    padding: 40px 40px;
    padding-top: 100px;
  }
}
</style>
