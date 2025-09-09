<script setup>
import { RouterView, useRoute } from 'vue-router'
import { useLayoutStore } from '@/stores/layout'
import { provide, watch } from 'vue'
import { toast } from 'vue3-toastify'
import api from '@/utils'

// const URL_API = 'http://localhost:3000'
// const URL_API = 'https://api.shopdemo.live'
const URL_API = 'http://10.3.17.202:3000'

const route = useRoute()
const layout = useLayoutStore()

// watch url change.
watch(
  () => route.fullPath,
  (newPath) => {
    console.log('Đã thay đổi URL:', newPath)
    layout.showSidebar = false
  },
  { immediate: true },
)

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// const handleErrorAPI = (error) => {
//   console.log(error);
//   if (error?.response?.data?.errors) {
//     error.response.data.errors?.forEach((error) => {
//       toast.error(error?.message);
//     });
//   } else {
//     toast.error(error?.response?.data?.message || error?.message);
//   }
//   if (error?.status === 401 || error?.status === 403) {
//     setTimeout(() => {
//       // delete token
//       localStorage.clear();
//       location.href = "/login";
//     }, 2000);
//   }
//   return null;
// };

const handleErrorAPI = (error, toastId) => {
  console.log(error)
  if (error?.response?.data?.errors) {
    error.response.data.errors?.forEach((error) => {
      if (toastId) {
        toast.update(toastId, {
          render: error?.message || 'Có lỗi xảy ra',
          type: 'error',
          isLoading: false,
          autoClose: 2000,
        })
      } else {
        toast.error(error?.message || 'Có lỗi xảy ra')
      }
    })
  } else {
    if (toastId) {
      toast.update(toastId, {
        render: error?.response?.data?.message || error?.message || 'Có lỗi xảy ra',
        type: 'error',
        isLoading: false,
        autoClose: 2000,
      })
    } else {
      toast.error(error?.response?.data?.message || error?.message || 'Có lỗi xảy ra')
    }
  }
  if (error?.status === 401 || error?.status === 403) {
    setTimeout(() => {
      // delete token
      localStorage.clear()
      location.href = '/login'
    }, 2000)
  }
  return null
}

// get infor user
const getInfoUser = async () => {
  try {
    const res = await api.get(`${URL_API}/api/user/get-info`)
    // send success
    if (res?.status !== 200) {
      toast.error(res?.data?.message)
      return
    }
    const user = {
      ...res?.data?.data?.user,
      topic: res?.data?.data?.topic,
      score: res?.data?.data?.score,
    }
    localStorage.setItem('user', JSON.stringify(user))
    // nếu chưa học chủ đề nào
    if (!user?.topic) {
      toast.info('Vui lòng chọn một chủ đề để bắt đầu học')
      setTimeout(() => {
        location.href = '/topic'
      }, 2000)
    }
    return user
  } catch (error) {
    handleErrorAPI(error)
  }
}

const toggleClamp = (event, className) => {
  const el = event.currentTarget
  el.classList.toggle(className)
}

provide('URL_API', URL_API)
provide('handleErrorAPI', handleErrorAPI)
provide('getInfoUser', getInfoUser)
provide('toggleClamp', toggleClamp)
provide('sleep', sleep)
</script>

<template>
  <header id="header" v-if="layout.showHeader">
    <nav class="nav page-container flex items-center justify-between">
      <RouterLink to="/" class="logo flex items-center">
        <!-- <img src="./components/icons/logo.svg" class="img" />
        <span class="text">GoatEnglish</span> -->
        <h2 class="text-logo">ENGLISH</h2>
      </RouterLink>
      <div
        class="language-page flex items-center text-[#afafaf] font-bold w-[40%] justify-end uppercase text-[13px] cursor-pointer leading-8"
      >
        <p class="text me-3">Ngôn ngữ hiển thị: Tiếng Việt</p>
        <span class="icon hidden"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-chevron-down"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
            /></svg
        ></span>
      </div>
    </nav>
  </header>
  <div id="main"><RouterView /></div>
  <footer id="footer" v-if="layout.showFooter" class="modern-footer">
    <div class="footer-waves">
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,120 C300,80 600,80 1200,120 L1200,0 L0,0 Z" fill="rgba(102, 126, 234, 0.1)"></path>
      </svg>
    </div>
    
    <div class="footer-content">
      <div class="page-container">
        <!-- Main Footer Content -->
        <div class="footer-grid">
          <!-- Brand Section -->
          <div class="footer-brand">
            <div class="brand-logo">
              <div class="logo-icon">🐐</div>
              <h2 class="brand-name">Goat English</h2>
            </div>
            <p class="brand-description">
              Nền tảng học tiếng Anh hiện đại, giúp bạn chinh phục ngôn ngữ một cách thông minh và hiệu quả.
            </p>
            <div class="social-section">
              <h4 class="social-title">Kết nối với chúng tôi</h4>
              <div class="social-links">
                <a href="https://www.facebook.com/nqb3010/" class="social-link facebook" target="_blank">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
                  </svg>
                </a>
                <a href="https://github.com/nqb3010/" class="social-link github" target="_blank">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="footer-links">
            <h3 class="footer-section-title">Tính năng</h3>
            <ul class="footer-link-list">
              <li><a href="/lesson" class="footer-link">
                <span class="link-icon">📚</span>
                Bài học tương tác
              </a></li>
              <li><a href="/vocabulary" class="footer-link">
                <span class="link-icon">🎯</span>
                Luyện tập từ vựng
              </a></li>
              <li><a href="/chatbot" class="footer-link">
                <span class="link-icon">🤖</span>
                Chatbot AI
              </a></li>
              <li><a href="/progress" class="footer-link">
                <span class="link-icon">📊</span>
                Theo dõi tiến độ
              </a></li>
              <li><a href="/flashcard" class="footer-link">
                <span class="link-icon">🏆</span>
                Thẻ ghi nhớ
              </a></li>
            </ul>
          </div>

          <!-- Learning Resources -->
          <div class="footer-resources">
            <h3 class="footer-section-title">Chủ đề học tập</h3>
            <ul class="footer-link-list">
              <li><a href="/topic" class="footer-link">
                <span class="link-icon">🌟</span>
                Tất cả chủ đề
              </a></li>
              <li><a href="#" class="footer-link">
                <span class="link-icon">�</span>
                Công nghệ thông tin
              </a></li>
              <li><a href="#" class="footer-link">
                <span class="link-icon">�</span>
                Phát triển Web
              </a></li>
              <li><a href="#" class="footer-link">
                <span class="link-icon">🗄️</span>
                Cơ sở dữ liệu
              </a></li>
              <li><a href="#" class="footer-link">
                <span class="link-icon">�</span>
                Mạng máy tính
              </a></li>
            </ul>
          </div>
          <!-- Contact Info -->
          <div class="footer-contact">
            <h3 class="footer-section-title">Liên hệ</h3>
            <div class="contact-info">
              <div class="contact-item">
                <div class="contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
                  </svg>
                </div>
                <div class="contact-text">
                  <span class="contact-label">Trường</span>
                  <span class="contact-value">Trường ĐH Công nghiệp Việt-Hung</span>
                </div>
              </div>
              
              <div class="contact-item">
                <div class="contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"/>
                  </svg>
                </div>
                <div class="contact-text">
                  <span class="contact-label">Email</span>
                  <span class="contact-value">nqb3010@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer Bottom -->
        <div class="footer-bottom">
          <div class="footer-divider"></div>
          <div class="footer-bottom-content">
            <div class="footer-copyright">
              <p>© 2025 <strong>Goat English</strong>. Phát triển bởi <strong>Nguyễn Quốc Bảo</strong></p>
              <p class="footer-tagline">Học tiếng Anh thông minh, tiến bộ mỗi ngày 🚀</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Prevent horizontal overflow */
* {
  box-sizing: border-box;
}

/* Modern Footer Styles */
.modern-footer {
  position: relative;
  margin-top: 40px;
  background: linear-gradient(135deg, #334155 0%, #475569 30%, #64748b 70%, #94a3b8 100%);
  overflow-x: hidden;
  width: 100%;
}

.footer-waves {
  position: absolute;
  top: -1px;
  left: 0;
  width: 100%;
  height: 40px;
  z-index: 1;
}

.footer-waves svg {
  width: 100%;
  height: 100%;
}

.footer-content {
  position: relative;
  z-index: 2;
  padding: 25px 0 20px;
  color: white;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 25px;
  max-width: 100%;
  overflow-x: hidden;
}

/* Brand Section */
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 0;
  overflow: hidden;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 3px;
}

.logo-icon {
  font-size: 2.2rem;
  background: linear-gradient(45deg, #f1f5f9, #e2e8f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.brand-name {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #ffffff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  max-width: 400px;
}

.social-section {
  margin-top: 10px;
}

.social-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: rgba(255, 255, 255, 0.95);
}

.social-links {
  display: flex;
  gap: 15px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 15px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.social-link.facebook {
  background: rgba(24, 119, 242, 0.2);
  color: #1877f2;
}

.social-link.github {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.social-link:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.social-link.facebook:hover {
  background: rgba(24, 119, 242, 0.3);
  box-shadow: 0 10px 30px rgba(24, 119, 242, 0.4);
}

.social-link.github:hover {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 30px rgba(255, 255, 255, 0.2);
}

/* Quick Links, Learning Resources & Support */
.footer-links,
.footer-resources,
.footer-support {
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 0;
  overflow: hidden;
}

.footer-link-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-start;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.85);
  padding: 8px 12px;
  border-radius: 20px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 0.9rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.footer-link:hover {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  border-color: rgba(226, 232, 240, 0.4);
  box-shadow: 0 4px 12px rgba(226, 232, 240, 0.2);
}

.link-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

/* Contact Section */
.footer-contact {
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 0;
  overflow: hidden;
}

.footer-section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #ffffff;
  position: relative;
}

.footer-section-title::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 35px;
  height: 3px;
  background: linear-gradient(45deg, #f1f5f9, #e2e8f0);
  border-radius: 2px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.contact-item:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(5px);
}

.contact-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #f1f5f9, #e2e8f0);
  border-radius: 10px;
  flex-shrink: 0;
}

.contact-icon svg {
  color: #475569;
  width: 18px;
  height: 18px;
}

.contact-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.contact-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contact-value {
  font-size: 1.05rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.4;
}

/* Footer Bottom */
.footer-bottom {
  margin-top: 18px;
}

.footer-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  margin-bottom: 15px;
}

.footer-copyright {
  text-align: center;
}

.footer-copyright p {
  margin: 8px 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

.footer-copyright strong {
  color: #f1f5f9;
  font-weight: 600;
}

.footer-tagline {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;
  }
}

@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .brand-description {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .footer-content {
    padding: 30px 0 20px;
  }
  
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 25px;
    text-align: center;
  }
  
  .brand-logo {
    justify-content: center;
  }
  
  .brand-description {
    max-width: 100%;
    font-size: 1rem;
    line-height: 1.5;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .contact-info {
    align-items: center;
  }
  
  .contact-item {
    max-width: 350px;
    width: 100%;
    padding: 10px 15px;
  }
  
  .footer-link-list {
    align-items: center;
  }
  
  .footer-link {
    max-width: 280px;
    width: 100%;
    justify-content: center;
    padding: 8px 12px;
    font-size: 0.9rem;
  }
  
  .footer-section-title {
    font-size: 1.1rem;
    margin-bottom: 15px;
    text-align: center;
  }
  
  .footer-section-title::after {
    left: 50%;
    transform: translateX(-50%);
  }
  
  .footer-link-list {
    gap: 8px;
  }
  
  .footer-link {
    padding: 6px 10px;
    font-size: 0.85rem;
    border-radius: 15px;
  }
}

@media (max-width: 480px) {
  .footer-content {
    padding: 25px 0 15px;
  }
  
  .footer-grid {
    gap: 20px;
    padding: 0 10px;
  }
  
  .brand-logo {
    flex-direction: column;
    gap: 8px;
  }
  
  .logo-icon {
    font-size: 1.8rem;
  }
  
  .brand-name {
    font-size: 1.6rem;
    line-height: 1.2;
  }
  
  .brand-description {
    font-size: 1.05rem;
    line-height: 1.5;
    margin: 0 auto;
    max-width: 280px;
  }
  
  .social-link {
    width: 40px;
    height: 40px;
  }
  
  .social-links {
    gap: 10px;
  }
  
  .contact-item {
    padding: 10px;
    max-width: 300px;
  }
  
  .contact-icon {
    width: 32px;
    height: 32px;
  }
  
  .contact-icon svg {
    width: 14px;
    height: 14px;
  }
  
  .contact-text .contact-label {
    font-size: 0.8rem;
  }
  
  .contact-text .contact-value {
    font-size: 0.9rem;
    line-height: 1.3;
  }
  
  .footer-link {
    max-width: 260px;
    padding: 8px 10px;
    font-size: 0.85rem;
  }
  
  .footer-section-title {
    font-size: 1rem;
    margin-bottom: 12px;
    text-align: center;
  }
  
  .footer-section-title::after {
    left: 50%;
    transform: translateX(-50%);
  }
  
  .footer-bottom {
    margin-top: 15px;
  }
  
  .footer-copyright p {
    font-size: 0.85rem;
    line-height: 1.4;
  }
  
  .footer-link-list {
    gap: 6px;
    justify-content: center;
  }
  
  .footer-link {
    padding: 5px 8px;
    font-size: 0.8rem;
    border-radius: 12px;
    gap: 6px;
  }
}

@media (max-width: 320px) {
  .footer-content {
    padding: 20px 0 12px;
  }
  
  .footer-grid {
    gap: 15px;
    padding: 0 5px;
  }
  
  .brand-name {
    font-size: 1.4rem;
  }
  
  .brand-description {
    font-size: 1rem;
    max-width: 250px;
  }
  
  .contact-item {
    max-width: 280px;
    padding: 8px;
  }
  
  .footer-link {
    max-width: 240px;
    padding: 6px 8px;
    font-size: 0.8rem;
  }
  
  .footer-section-title {
    font-size: 0.95rem;
    text-align: center;
  }
  
  .footer-section-title::after {
    left: 50%;
    transform: translateX(-50%);
  }
  
  .social-link {
    width: 36px;
    height: 36px;
  }
  
  .footer-copyright p {
    font-size: 0.8rem;
    padding: 0 10px;
  }
  
  .footer-link-list {
    gap: 5px;
    justify-content: center;
  }
  
  .footer-link {
    padding: 4px 6px;
    font-size: 0.75rem;
    border-radius: 10px;
    gap: 4px;
  }
  
  .link-icon {
    font-size: 0.9rem;
  }
}
</style>
