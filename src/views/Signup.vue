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
  <div class="signup-body page-container">
    <div class="main-signup">
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
        <div class="list-card">
          <!-- loading -->
          <div v-if="loadingUI" class="flex justify-center">
            <span
              class="loading loading-dots loading-sm"
              style="animation: none; width: 80px"
            ></span>
          </div>
          <template v-else>
            <div
              class="card-item"
              v-for="topic in topics"
              :key="topic._id"
              :class="{ active: topic._id === dataStep.topic }"
              @click="handleSelectAction(topic._id, 'topic')"
            >
              <div class="flex justify-center w-[150px] h-[150px]">
                <img class="w-full h-full rounded-xl object-cover" :src="topic.image" />
              </div>
              <h2 class="title-lv2">{{ topic.name }}</h2>
              <p class="mt-4 font-bold text-[#777] line-clamp-3">
                {{ topic.description }}
              </p>
            </div>
          </template>
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
    <div v-if="stepCurr !== 3" class="footer-signup">
      <div class="footer-block page-container flex items-center justify-end">
        <Button
          :item="{ text: 'Tiếp tục' }"
          :loading="loading"
          class="btn-next btn-primary-custom text-white rounded-lg font-bold sm:btn-sm md:btn-md lg:btn-lg"
          :disabled="isNext === false"
          @click="handleNext()"
        />
      </div>
    </div>
  </div>
</template>
