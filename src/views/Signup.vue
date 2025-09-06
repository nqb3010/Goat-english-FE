<script setup>
import Button from '@/components/Button.vue'
import axios from 'axios'
import { onMounted, ref, watch, inject } from 'vue'
import { useLayoutStore } from '@/stores/layout'
import { toast } from 'vue3-toastify'

const layout = useLayoutStore()
const loading = ref(false)

const URL_API = inject('URL_API')
const handleErrorAPI = inject('handleErrorAPI')
const loadingUI = ref(false)

const stepCurr = ref(1)
const stepNumb = 3
const isNext = ref(false)
const dataStep = ref({
  topic: '',
  level: '',
  age: '',
  goal: '',
  knowFrom: '',
  email: '',
  otp_code: '',
  username: '',
  password: '',
  confirm_password: '',
})

const topics = ref([])
const levels = ref([])
const ages = ref([])
const goals = ref([])
const knowFroms = ref([])

watch(stepCurr, async (value) => {
  if (value !== 2) {
    isNext.value = false
  }
})

watch(
  () => dataStep.value.email,
  (value) => {
    if (value !== '') {
      isNext.value = true
    } else {
      isNext.value = false
    }
  },
)

const doGetAxios = async (url) => {
  try {
    const res = await axios.get(url)
    return res.data
  } catch (error) {
    console.error(error)
  }
}

const handleSelectAction = (value, key) => {
  dataStep.value[key] = value
  isNext.value = true
}

const init = async () => {
  const token = localStorage.getItem('token')
  if (token) {
    location.href = '/dashboard'
  }
  loadingUI.value = true
  levels.value = await doGetAxios('../src/data/levels.json')
  ages.value = await doGetAxios('../src/data/ages.json')
  goals.value = await doGetAxios('../src/data/goals.json')
  knowFroms.value = await doGetAxios('../src/data/knowFroms.json')
  await getTopics()
  loadingUI.value = false
}

const handleNext = async () => {
  loading.value = true
  // Gửi OTP email
  if (stepCurr.value === 2) {
    await sendOTP(dataStep.value.email)
  } else {
    stepCurr.value++
  }
  loading.value = false
}

const getTopics = async () => {
  const data = await doGetAxios(`${URL_API}/api/topic`)
  topics.value = data?.data?.topics || []
}

const sendOTP = async (email) => {
  const toastId = toast.loading('Đang xử lý...')
  try {
    const res = await axios.post(`${URL_API}/api/auth/send-otp`, {
      email,
    })
    const data = res.data
    console.log(data)
    // send success
    if (data?.status === 200) {
      stepCurr.value++
      toast.update(toastId, {
        render: data?.message || 'Gửi mã OTP thành công',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      })
    } else {
      toast.update(toastId, {
        render: data?.message || 'Gửi mã OTP thất bại',
        type: 'error',
        isLoading: false,
        autoClose: 2000,
      })
    }
  } catch (error) {
    handleErrorAPI(error, toastId)
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  const toastId = toast.loading('Đang xử lý...')
  try {
    loading.value = true
    // check username chỉ chứa chữ thường
    const username = String(dataStep.value.username || '').trim()
    if (/^[a-z0-9_]+$/.test(username) === false) {
      setTimeout(() => {
        toast.update(toastId, {
          render: 'Tên đăng nhập chỉ chứa chữ thường và số',
          type: 'error',
          isLoading: false,
          autoClose: 2000,
        })
      }, 1000)
      return
    }
    const res = await axios.post(`${URL_API}/api/auth/register`, {
      otp_code: dataStep.value.otp_code.toString(),
      username: dataStep.value.username,
      email: dataStep.value.email,
      password: dataStep.value.password,
      confirm_password: dataStep.value.confirm_password,
      topic: dataStep.value.topic,
    })
    const data = res.data
    console.log(data)
    // send success
    if (data?.status === 201) {
      stepCurr.value++
      toast.update(toastId, {
        render: data?.message || 'Đăng ký thành công',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      })
      // redirect sang trang đăng nhập
      setTimeout(() => {
        location.href = '/login'
      }, 1000)
    } else {
      toast.update(toastId, {
        render: data?.message || 'Đăng ký thất bại',
        type: 'error',
        isLoading: false,
        autoClose: 2000,
      })
    }
  } catch (error) {
    handleErrorAPI(error, toastId)
    // console.error(error);
    // error?.response?.data?.errors?.forEach((error) => {
    //   toast.error(error?.message);
    // });
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  init()
  layout.show()
})
</script>

<template>
  <div class="signup-body">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
      <div class="bg-circle circle-3"></div>
    </div>
    
    <div class="main-signup page-container">
      <ul class="steps-custom mb-10 w-full">
        <li
          v-for="step in stepNumb"
          :key="step"
          class="step"
          :class="{ done: step <= stepCurr }"
        ></li>
      </ul>
      <div v-if="stepCurr === 1" class="step-content">
        <h1 class="title-lv1 text-center font-bold">Chọn chủ đề bạn muốn học...</h1>
        <div class="topics-slider-container">
          <!-- loading -->
          <div v-if="loadingUI" class="flex justify-center">
            <span
              class="loading loading-dots loading-sm"
              style="animation: none; width: 80px"
            ></span>
          </div>
          <template v-else>
            <div class="topics-slider">
              <div
                class="card-item"
                v-for="topic in topics"
                :key="topic._id"
                :class="{ active: topic._id === dataStep.topic }"
                @click="handleSelectAction(topic._id, 'topic')"
              >
                <div class="card-image">
                  <img class="topic-img" :src="topic.image" />
                </div>
                <h2 class="title-lv2">{{ topic.name }}</h2>
                <p class="topic-description">
                  {{ topic.description }}
                </p>
              </div>
            </div>
          </template>
        </div>
        
        <!-- Nút tiếp tục cho step 1 -->
        <div class="continue-button-container">
          <Button
            :item="{ text: 'Tiếp tục' }"
            :loading="loading"
            class="btn-next btn-primary-custom text-white rounded-lg font-bold sm:btn-sm md:btn-md lg:btn-lg"
            :disabled="isNext === false"
            @click="handleNext()"
          />
        </div>
      </div>
      <!-- <div v-else-if="stepCurr === 2" class="step-content">
        <h1 class="title-lv1 text-center font-bold">Welcome to GoatEnglish</h1>
        <div class="mt-12">
          <img src="../assets/images/19467ffee68fe.png" class="img-step-2" />
          <p class="text-center font-semibold mt-8">
            Just a few questions so we can customize your experience. Are you ready?
          </p>
        </div>
      </div>
      <div v-if="stepCurr === 3" class="step-content">
        <h1 class="title-lv1 text-center font-bold">Do you already know any English?</h1>
        <div class="list-actions flex flex-col items-center">
          <template v-for="level in levels" :key="level.id">
            <Button
              :item="{
                text: level.text,
                icon: level.icon,
                class:
                  'bg-white h-[80px] min-w-[300px] px-8 text-[20px] btn-action-signup',
                style: 'border-radius: 6px;',
              }"
              :class="{ active: level.value === dataStep.level }"
              @click="handleSelectAction(level.value, 'level')"
            />
          </template>
        </div>
      </div>
      <div v-if="stepCurr === 4" class="step-content">
        <h1 class="title-lv1 text-center font-bold">How old are you?</h1>
        <div class="list-actions flex flex-col items-center">
          <template v-for="age in ages" :key="age.id">
            <Button
              :item="{
                text: age.text,
                class:
                  'bg-white h-[80px] min-w-[300px] px-8 text-[20px] btn-action-signup',
                style: 'border-radius: 6px;',
              }"
              :class="{ active: age.value === dataStep.age }"
              @click="handleSelectAction(age.value, 'age')"
            />
          </template>
        </div>
      </div>
      <div v-if="stepCurr === 5" class="step-content">
        <h1 class="title-lv1 text-center font-bold">Select a daily goal</h1>
        <div class="list-actions flex flex-col items-center">
          <template v-for="goal in goals" :key="goal.id">
            <Button
              :item="{
                text: goal.text,
                class:
                  'bg-white h-[80px] min-w-[300px] px-8 text-[20px] btn-action-signup',
                style: 'border-radius: 6px;',
              }"
              :class="{ active: goal.value === dataStep.goal }"
              @click="handleSelectAction(goal.value, 'goal')"
            />
          </template>
        </div>
      </div>
      <div v-if="stepCurr === 6" class="step-content">
        <h1 class="title-lv1 text-center font-bold">How did you hear about us?</h1>
        <div
          class="list-actions flex items-center justify-center flex-wrap gap-[20px] w-3/4 mx-auto"
        >
          <template v-for="knowFrom in knowFroms" :key="knowFrom.id">
            <Button
              :item="{
                text: knowFrom.text,
                icon: knowFrom.icon,
                class:
                  'bg-white h-[80px] min-w-[300px] px-8 text-[20px] btn-action-signup',
                style: 'border-radius: 6px;',
              }"
              :class="{ active: knowFrom.value === dataStep.knowFrom }"
              @click="handleSelectAction(knowFrom.value, 'knowFrom')"
            />
          </template>
        </div>
      </div> -->
      <div v-if="stepCurr === 2" class="step-content">
        <h1 class="title-lv1 text-center font-bold mb-10">Nhập email của bạn</h1>
        <div class="signup-input__with-icon">
          <input
            type="email"
            class="signup-input"
            placeholder="Your email"
            v-model.trim="dataStep.email"
          />
          <img
            src="../components/icons/close.svg"
            @click="dataStep.email = ''"
            class="signup-icon signup-icon__email"
          />
        </div>
        
        <!-- Nút tiếp tục cho step 2 -->
        <div class="continue-button-container">
          <Button
            :item="{ text: 'Tiếp tục' }"
            :loading="loading"
            class="btn-next btn-primary-custom text-white rounded-lg font-bold sm:btn-sm md:btn-md lg:btn-lg"
            :disabled="isNext === false"
            @click="handleNext()"
          />
        </div>
      </div>
      <div v-if="stepCurr === 3" class="step-content">
        <h1 class="title-lv1 text-center font-bold mb-10">Đăng ký tài khoản</h1>
        <div class="signup-input__with-icon">
          <input
            type="number"
            class="signup-input"
            style="padding: 14px 20px"
            placeholder="OTP Email"
            v-model.trim="dataStep.otp_code"
          />
          <img
            src="../components/icons/close.svg"
            @click="dataStep.otp_code = ''"
            class="signup-icon signup-icon__email"
          />
        </div>
        <div class="signup-input__with-icon">
          <input
            type="text"
            class="signup-input"
            placeholder="Username"
            v-model.trim="dataStep.username"
          />
          <img
            src="../components/icons/close.svg"
            @click="dataStep.username = ''"
            class="signup-icon signup-icon__email"
          />
        </div>
        <div class="signup-input__with-icon">
          <input
            type="password"
            class="signup-input"
            placeholder="Password"
            v-model.trim="dataStep.password"
          />
          <img
            src="../components/icons/close.svg"
            @click="dataStep.password = ''"
            class="signup-icon signup-icon__email"
          />
        </div>
        <div class="signup-input__with-icon">
          <input
            type="password"
            class="signup-input"
            placeholder="Confirm Password"
            v-model.trim="dataStep.confirm_password"
          />
          <img
            src="../components/icons/close.svg"
            @click="dataStep.confirm_password = ''"
            class="signup-icon signup-icon__email"
          />
        </div>
        <div class="signup-input__with-icon">
          <Button
            :item="{ text: 'Đăng ký', style: 'font-size: 1.8rem' }"
            :loading="loading"
            class="btn-next btn-primary-custom text-white w-full py-8 rounded-lg font-bold sm:btn-sm md:btn-md lg:btn-lg"
            @click="handleRegister"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Signup page background matching Home.vue */
.signup-body {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  width: 100vw; /* Full viewport width */
  margin-left: calc(-50vw + 50%); /* Center trong container */
  padding-top: 85px;
  padding-bottom: 110px;
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
  animation: floatCenter 8s ease-in-out infinite;
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

@keyframes floatCenter {
  0%,
  100% {
    transform: translate(-50%, -50%) translateY(0px) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-30px) scale(1.1);
  }
}

.main-signup {
  position: relative;
  z-index: 1;
  padding: 3rem 2rem 4rem 2rem; /* Thêm padding ngang */
  min-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

/* Topic slider container */
.topics-slider-container {
  width: 100%;
  overflow: hidden;
  padding: 1rem 0;
  display: flex;
  justify-content: center;
}

.topics-slider {
  display: flex;
  gap: 1.5rem;
  padding: 1rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
  justify-content: center;
  align-items: flex-start;
  max-width: 100%;
}

.topics-slider::-webkit-scrollbar {
  height: 6px;
}

.topics-slider::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.topics-slider::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.topics-slider::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.card-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 250px;
  max-width: 250px;
  padding: 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  flex-shrink: 0;
}

.card-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.card-item.active {
  border-color: #1e293b;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(30, 41, 59, 0.15);
}

.card-image {
  width: 120px;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  overflow: hidden;
  background: #f8fafc;
}

.topic-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.card-item .title-lv2 {
  margin-top: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.3;
}

.topic-description {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
  text-align: center;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .topics-slider-container {
    padding: 0.5rem 0;
    margin-top: 0;
  }
  
  .topics-slider {
    gap: 1rem;
    padding: 0.5rem 1rem;
    justify-content: flex-start;
    align-items: flex-start;
    padding-left: 1rem;
  }
  
  .card-item {
    min-width: 200px;
    max-width: 200px;
    padding: 1rem;
  }
  
  .card-image {
    width: 100px;
    height: 100px;
  }
  
  .card-item .title-lv2 {
    font-size: 1.1rem;
    margin-top: 0.75rem;
  }
  
  .topic-description {
    font-size: 0.8rem;
    margin-top: 0.5rem;
  }
}

@media (max-width: 480px) {
  .topics-slider {
    gap: 0.75rem;
    padding: 0.5rem;
    padding-left: calc(50vw - 80px);
  }
  
  .card-item {
    min-width: 160px;
    max-width: 160px;
    padding: 0.75rem;
  }
  
  .card-image {
    width: 80px;
    height: 80px;
  }
  
  .card-item .title-lv2 {
    font-size: 1rem;
    margin-top: 0.5rem;
  }
  
  .topic-description {
    font-size: 0.75rem;
    line-height: 1.4;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
}

/* Desktop centering */
@media (min-width: 769px) {
  .topics-slider {
    justify-content: center;
    flex-wrap: wrap;
    overflow-x: visible;
  }
  
  .topics-slider::-webkit-scrollbar {
    display: none;
  }
}

/* Button styles matching Home.vue */
.btn-primary-custom {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  color: white !important;
  border: none !important;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
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

.btn-action-signup {
  background: white !important;
  color: #1e293b !important;
  border: 2px solid #e2e8f0 !important;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-action-signup:hover {
  border-color: #1e293b !important;
  background: #f8fafc !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(30, 41, 59, 0.15);
}

.btn-action-signup.active {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  color: white !important;
  border-color: #1e293b !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(30, 41, 59, 0.25);
}

/* Continue button container styling */
.continue-button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  padding: 1rem 0;
  width: 100%;
  position: relative;
  z-index: 10;
}

.continue-button-container .btn-next {
  min-width: 150px;
  padding: 0.75rem 2rem;
  position: relative;
  z-index: 11;
}

/* Desktop small / Tablet adjustments */
@media (max-width: 1024px) and (min-width: 769px) {
  .main-signup {
    padding-bottom: 6rem;
  }
  
  .continue-button-container {
    margin-top: 2.5rem;
    padding: 1.5rem 0;
    /* background: rgba(248, 250, 252, 0.95); */
    /* border-radius: 12px; */
    /* box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); */
  }
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .main-signup {
    min-height: 100vh;
    padding: 1rem 0 2rem 0;
    justify-content: flex-start;
  }
  
  .continue-button-container {
    margin-top: 2rem;
    padding: 1rem;
    justify-content: center;
    /* background: rgba(248, 250, 252, 0.98);
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); */
    position: relative;
    z-index: 20;
    margin-left: 1rem;
    margin-right: 1rem;
  }
  
  .step-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 1rem;
  }
  
  .title-lv1 {
    font-size: 1.5rem !important;
    margin-bottom: 1.5rem !important;
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

@media (max-width: 480px) {
  .main-signup {
    padding: 0.5rem 0 2rem 0;
  }
  
  .continue-button-container {
    margin-top: 1.5rem;
    padding: 1.25rem 1rem;
    justify-content: center;
    /* background: rgba(248, 250, 252, 0.98);
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); */
    margin-left: 1rem;
    margin-right: 1rem;
  }
  
  .step-content {
    padding-top: 0.5rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .title-lv1 {
    font-size: 1.25rem !important;
    margin-bottom: 1rem !important;
  }
  
  .topics-slider {
    justify-content: flex-start;
    padding: 0.25rem 0.5rem;
    padding-left: 0.5rem;
  }
  
  .card-item {
    min-width: 180px;
    max-width: 180px;
    padding: 0.75rem;
  }
}
</style>
