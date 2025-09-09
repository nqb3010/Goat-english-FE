<script setup>
import { onMounted } from 'vue'
import { useLayoutStore } from '@/stores/layout'
import Button from '@/components/Button.vue'

const init = async () => {
  const token = localStorage.getItem('token')
  if (token) {
    location.href = '/dashboard'
  }
}

const layout = useLayoutStore()

onMounted(() => {
  layout.show()
  init()
})
</script>

<template>
  <div class="home-body flex items-center min-h-screen">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="bg-circle circle-1"></div>
      <div class="b  .main-title {
    font-size: 2.25rem;
  }

  .description {
    font-size: 1.15rem;
  }

  .stats-grid {circle-2"></div>
      <div class="bg-circle circle-3"></div>
    </div>

    <div class="main-container page-container">
      <!-- Left Side - Image -->
      <div class="image-section">
        <div class="image-wrapper">
          <div class="image-frame">
            <img
              class="main-image"
              src="../assets/images/teamwork48568990.webp"
              alt="English Learning"
            />

            <!-- Floating Info Cards -->
            <div class="info-card card-top">
              <div class="card-icon">🏆</div>
              <div class="card-content">
                <div class="card-title">Thành tích cao</div>
                <div class="card-desc">95% học viên đạt mục tiêu</div>
              </div>
            </div>

            <div class="info-card card-bottom">
              <div class="card-icon">⚡</div>
              <div class="card-content">
                <div class="card-title">Học nhanh</div>
                <div class="card-desc">Tiết kiệm 60% thời gian</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Content -->
      <div class="content-section">
        <!-- Header Tag -->
        <div class="header-tag">
          <span class="tag-dot"></span>
          <span class="tag-text">Phương pháp học hiệu quả nhất 2025</span>
        </div>

        <!-- Main Title -->
        <h1 class="main-title">
          <span class="title-line">
            <span class="animated-text">Nâng cao kỹ năng</span>
          </span>
          <span class="title-line highlight-line">
            <span class="animated-text"> <span class="highlight-bg">tiếng Anh</span> của bạn </span>
          </span>
          <span class="title-line">
            <span class="animated-text">với công nghệ tiên tiến!</span>
          </span>
        </h1>

        <!-- Description -->
        <p class="description">
          Khóa học được thiết kế đặc biệt cho người Việt Nam với AI thông minh, lộ trình cá nhân hóa
          và phương pháp học tương tác hiện đại.
        </p>

        <!-- Features List -->
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-check">✓</div>
            <span>Học từ cơ bản đến nâng cao với 5,000+ bài tập</span>
          </div>
          <div class="feature-item">
            <div class="feature-check">✓</div>
            <span>AI phân tích phát âm và sửa lỗi real-time</span>
          </div>
          <div class="feature-item">
            <div class="feature-check">✓</div>
            <span>Chứng chỉ quốc tế được công nhận toàn cầu</span>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-number">25K+</div>
            <div class="stat-label">Học viên</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">4.9⭐</div>
            <div class="stat-label">Đánh giá</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">30 ngày</div>
            <div class="stat-label">Cam kết</div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <Button
            :item="{ text: 'Bắt đầu Ngay !', href: '/signup' }"
            class="btn-primary-custom uppercase"
          />
        </div>
        
        <!-- Login Link -->
        <div class="login-link-wrapper">
          <router-link to="/login" class="login-link">Đã có tài khoản? Đăng nhập</router-link>
        </div>

        <!-- Security Note -->
        <div class="security-note">
          <span class="security-icon">🔐</span>
          <span>Thông tin được bảo mật tuyệt đối • Hủy đăng ký bất cứ lúc nào</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Base Setup */
.home-body {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  padding: 2rem 0; /* Bỏ padding ngang để full width */
  overflow: hidden;
  width: 100vw; /* Full viewport width */
  margin-left: calc(-50vw + 50%); /* Center trong container */
}

/* Animated Background */
.animated-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05));
  animation: float 8s ease-in-out infinite;
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -200px;
  right: -200px;
  animation-delay: 0s;
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -150px;
  left: -150px;
  animation-delay: 3s;
}

.circle-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 6s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-30px) scale(1.1);
  }
}

/* Main Container */
.main-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  align-items: center;
  padding: 0 2rem; /* Thêm padding ngang cho content */
}

/* Left Side - Image */
.image-section {
  position: relative;
}

.image-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
}

.image-frame {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transition: all 0.4s ease;
  background: white;
  padding: 1.5rem;
}

.image-frame:hover {
  transform: translateY(-10px) rotate(2deg);
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.2);
}

.main-image {
  width: 100%;
  height: auto;
  max-width: 450px;
  border-radius: 16px;
  display: block;
}

/* Floating Info Cards */
.info-card {
  position: absolute;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  animation: cardFloat 4s ease-in-out infinite;
  min-width: 200px;
}

.card-top {
  top: -20px;
  right: -30px;
  animation-delay: 0s;
}

.card-bottom {
  bottom: -20px;
  left: -30px;
  animation-delay: 2s;
}

@keyframes cardFloat {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

.card-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.card-title {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
  line-height: 1.2;
}

.card-desc {
  color: #64748b;
  font-size: 0.75rem;
  line-height: 1.3;
}

/* Right Side - Content */
.content-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem 0;
}

.header-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 500;
  width: fit-content;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.tag-dot {
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.main-title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.1;
  color: #0f172a;
  margin: 0;
}

.title-line {
  display: block;
  margin-bottom: 0.5rem;
}

.highlight-line {
  position: relative;
}

.highlight-bg {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  position: relative;
  box-shadow: 0 4px 16px rgba(251, 191, 36, 0.3);
}

.description {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #475569;
  margin: 0;
  max-width: 90%;
}

/* Features List */
.features-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 1rem;
  color: #334155;
}

.feature-check {
  background: #10b981;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin: 1rem 0;
}

.stat-box {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.3s ease;
}

.stat-box:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.9);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Login Link */
.login-link-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}

.login-link {
  color: #475569;
  font-size: 1.2rem;
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-thickness: 1px;
  transition: all 0.3s ease;
}

.login-link:hover {
  color: #1e293b;
  text-decoration-thickness: 2px;
}

.btn-primary-custom {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  border: none;
  padding: 1.25rem 2.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-width: 200px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary-custom:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(30, 41, 59, 0.25);
}

.btn-primary-custom::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-primary-custom:hover::before {
  left: 100%;
}

.btn-default-custom {
  background: transparent;
  color: #475569;
  border: 2px solid #cbd5e1;
  padding: 0.875rem 1.875rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  min-width: 180px;
}

.btn-default-custom:hover {
  border-color: #1e293b;
  color: #1e293b;
  background: rgba(30, 41, 59, 0.05);
  transform: translateY(-2px);
}

/* Security Note */
.security-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
  padding-top: 1rem;
  border-top: 1px solid rgba(203, 213, 225, 0.5);
}

.security-icon {
  font-size: 1rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-container {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }

  .image-section {
    order: 2;
  }

  .content-section {
    order: 1;
    align-items: center;
  }

  .features-list,
  .action-buttons {
    align-items: center;
  }

  .description {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .home-body {
    padding: 1rem 0.5rem;
    height: auto;
  }

  .main-container {
    gap: 2rem;
    padding: 0;
  }

  .main-title {
    font-size: 2.25rem;
  }

  .description {
    font-size: 1.1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .stat-box {
    padding: 0.75rem 0.5rem;
  }

  .stat-number {
    font-size: 1.25rem;
  }

  .info-card {
    display: none;
  }

  .action-buttons {
    justify-content: center;
    width: 100%;
  }

  .btn-primary-custom {
    width: 100%;
    min-width: 160px;
    max-width: 300px;
    padding: 1rem 1.5rem;
    font-size: 1rem;
    height: 50px;
    margin: 0 auto;
  }

  .login-link-wrapper {
    justify-content: center;
    margin-top: 1rem;
  }

  .login-link {
    font-size: 1.05rem;
  }

  .content-section {
    padding: 1rem;
  }

  .image-section {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .home-body {
    padding-top: 7rem; /* Even more space for small mobile headers */
  }

  .main-title {
    font-size: 2.25rem;
  }

  .description {
    font-size: 1.2rem;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .stat-box {
    padding: 0.75rem 0.25rem;
  }

  .stat-number {
    font-size: 1.1rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .feature-item {
    font-size: 1rem;
  }

  .bg-circle {
    display: none;
  }
}

/* Animation for performance */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
.title-line {
  display: block;
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.animated-text {
  display: inline-block;
  opacity: 0;
  transform: translateX(-100px);
  animation: typeInOut 4s ease-in-out infinite;
}

.title-line:nth-child(1) .animated-text {
  animation-delay: 0s;
}

.title-line:nth-child(2) .animated-text {
  animation-delay: 0.3s;
}

.title-line:nth-child(3) .animated-text {
  animation-delay: 0.6s;
}

@keyframes typeInOut {
  0% {
    opacity: 0;
    transform: translateX(-100px);
  }
  15% {
    opacity: 1;
    transform: translateX(0);
  }
  85% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(100px);
  }
}
</style>
