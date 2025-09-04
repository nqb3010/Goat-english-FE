<script setup>
import { RouterView, useRoute } from 'vue-router'
import { useLayoutStore } from '@/stores/layout'
import { provide, watch } from 'vue'
import { toast } from 'vue3-toastify'
import api from '@/utils'

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
  <footer id="footer" v-if="layout.showFooter" class="w-full">
    <div class="page-container flex justify-between gap-4 flex-col sm:flex-row">
      <div class="footer-col flex flex-col gap-6">
        <p class="footer-col-item">
          <span
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              class="bi bi-geo-alt-fill"
              viewBox="0 0 16 16"
            >
              <path
                d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"
              /></svg
          ></span>
          <span class="block leading-8">TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP VIỆT-HUNG</span>
        </p>
        <p class="footer-col-item">
          <span
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              class="bi bi-telephone-fill"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"
              /></svg></span
          ><span>0346508570</span>
        </p>
        <p class="footer-col-item">
          <span
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              class="bi bi-envelope-fill"
              viewBox="0 0 16 16"
            >
              <path
                d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"
              /></svg></span
          ><span>nqb3010@gmail.com</span>
        </p>
      </div>
      <div class="footer-col flex flex-col gap-6">
        <!-- <p class="footer-col-item font-bold">Về chúng tôi</p>
        <p class="footer-col-desc">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Expedita illum sed
          ducimus aspernatur, accusantium consequuntur vero facere laudantium veritatis
          ullam!
        </p> -->
        <ul class="flex items-center gap-6">
          <li>
            <a href="https://www.facebook.com/nqb3010/">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                class="bi bi-facebook"
                viewBox="0 0 16 16"
              >
                <path
                  d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"
                /></svg
            ></a>
          </li>
          <li>
            <a href="https://github.com/nqb3010/">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                class="bi bi-github"
                viewBox="0 0 16 16"
              >
                <path
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"
                />
              </svg>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>
