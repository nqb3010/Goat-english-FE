<script setup>
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import { ref, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/utils';
import { toast } from 'vue3-toastify';

const router = useRouter();
const URL_API = inject('URL_API');
const handleErrorAPI = inject('handleErrorAPI');
const toggleClamp = inject('toggleClamp');

const user = ref();
const exams = ref([]);
const loadingUI = ref(false);
const topicInfo = ref(null);

const init = async () => {
  try {
    loadingUI.value = true;
    const userLocal = localStorage.getItem('user');
    if (userLocal) {
      user.value = JSON.parse(userLocal);
    }
    
    const topicId = user.value?.topic_id;
    if (topicId) {
      await getExamsByTopic(topicId);
    } else {
      toast.warning('Vui lòng chọn chủ đề học tập trước khi làm bài thi');
    }
  } catch (error) {
    handleErrorAPI(error);
  } finally {
    loadingUI.value = false;
  }
};

// Lấy danh sách đề thi theo topic_id
const getExamsByTopic = async (topicId) => {
  if (!topicId) {
    toast.error('Không tìm thấy chủ đề. Vui lòng chọn chủ đề trước.');
    return;
  }

  try {
    const res = await api.get(`${URL_API}/api/exam/topic/${topicId}`);
    
    if (res?.status !== 200) {
      toast.error(res?.data?.message || 'Không thể tải danh sách đề thi');
      return;
    }
    
    // Data trả về trực tiếp là array trong res.data.data
    exams.value = res?.data?.data || [];
    
    // Lấy thông tin topic từ user
    topicInfo.value = user.value?.topic || null;
    
    console.log('Exams loaded:', exams.value);
  } catch (error) {
    console.error('Error loading exams:', error);
    handleErrorAPI(error);
  }
};

// Xử lý khi click vào đề thi
const handleStartExam = (exam) => {
  if (exam.status === 'draft') {
    toast.warning('Đề thi này chưa được công bố');
    return;
  }
  
  router.push(`/exam/${exam._id}`);
};

// Format thời gian
const formatDuration = (minutes) => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} giờ ${mins} phút` : `${hours} giờ`;
  }
  return `${minutes} phút`;
};

onMounted(() => {
  init();
});
</script>

<template>
  <div id="exam" class="flex">
    <Sidebar />
    <div class="exam-main w-full flex-1">
      <Header :user="user" />
      <div class="exam-content">
        <!-- Loading -->
        <div v-if="loadingUI" class="flex justify-center">
          <span class="loading loading-dots loading-sm" style="animation: none; width: 80px"></span>
        </div>

        <template v-else>
          <!-- Header Section -->
          <div class="exam-row">
            <div class="flex justify-between items-start">
              <div>
                <p class="title">Danh sách đề thi</p>
                <p v-if="topicInfo" class="subtitle">
                  <!-- Chủ đề: <span class="font-semibold">{{ topicInfo.name }}</span> -->
                </p>
              </div>
            </div>
          </div>

          <!-- Actions Section -->
          <div class="exam-row" style="margin-top: -20px; margin-bottom: 20px;">
            <div class="flex justify-end">
              <button 
                @click="router.push('/exam-history')"
                class="btn-history"
              >
                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Lịch sử thi
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="exams.length === 0" class="exam-row">
            <div class="empty-state">
              <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3 class="empty-title">Chưa có đề thi</h3>
              <p class="empty-description">Hiện tại chưa có đề thi nào cho chủ đề này.</p>
            </div>
          </div>

          <!-- Exams List -->
          <div v-else class="exam-row">
            <div class="list-exam">
              <div 
                v-for="exam in exams" 
                :key="exam._id"
                class="exam-item flex"
              >
                <img 
                  v-if="exam.image" 
                  class="exam-item__img object-cover" 
                  :src="exam.image"
                  :alt="exam.name"
                />
                <div v-else class="exam-item__img exam-item__img--placeholder">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>

                <div class="px-5 py-8 flex flex-col flex-1 gap-4">
                  <div class="flex justify-between items-start">
                    <p class="text-[15px] font-bold">{{ exam.name }}</p>
                    <span 
                      class="status-badge"
                      :class="{
                        'status-badge--publish': exam.status === 'publish',
                        'status-badge--draft': exam.status === 'draft'
                      }"
                    >
                      {{ exam.status === 'publish' ? 'Đang mở' : 'Bản nháp' }}
                    </span>
                  </div>

                  <p
                    v-if="exam.description"
                    class="line-clamp-2 leading-8 cursor-pointer text-gray-600"
                    @click="toggleClamp($event, 'line-clamp-2')"
                  >
                    {{ exam.description }}
                  </p>

                  <div class="exam-stats">
                    <div class="stat-item">
                      <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                      <span><strong>{{ exam.total_questions }}</strong> câu hỏi</span>
                    </div>
                    <div class="stat-item">
                      <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span><strong>{{ formatDuration(exam.duration) }}</strong></span>
                    </div>
                  </div>

                  <div class="flex justify-between items-center mt-auto">
                    <button
                      v-if="exam.status === 'publish'"
                      @click="handleStartExam(exam)"
                      class="ms-auto btn-exam font-bold"
                    >
                      Bắt đầu làm bài ›
                    </button>
                    <button
                      v-else
                      class="ms-auto btn-exam btn-exam--disabled font-bold"
                      disabled
                    >
                      Chưa mở
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
#exam {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.exam-main {
  overflow-y: auto;
  height: 100vh;
}

.exam-content {
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
  margin-bottom: 10px;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.list-exam {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.exam-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.exam-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.exam-item__img {
  width: 280px;
  height: 200px;
  object-fit: cover;
  flex-shrink: 0;
}

.exam-item__img--placeholder {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.exam-item__img--placeholder svg {
  width: 80px;
  height: 80px;
  color: rgba(255, 255, 255, 0.5);
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge--publish {
  background-color: #10b981;
  color: white;
}

.status-badge--draft {
  background-color: #6b7280;
  color: white;
}

.exam-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
  font-size: 14px;
}

.stat-icon {
  width: 20px;
  height: 20px;
  color: #3b82f6;
}

.btn-exam {
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.btn-exam:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-exam--disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-exam--disabled:hover {
  transform: none;
  box-shadow: none;
}

.btn-history {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 600;
}

.btn-history:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: #d1d5db;
  margin: 0 auto 20px;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: #6b7280;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Loading animation */
.loading {
  display: inline-block;
}

.loading-dots {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

/* Responsive */
@media (max-width: 768px) {
  .exam-content {
    padding: 20px;
  }

  .exam-item {
    flex-direction: column;
  }

  .exam-item__img {
    width: 100%;
    height: 180px;
  }

  .title {
    font-size: 20px;
  }
}
</style>