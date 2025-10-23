<script setup>
import Sidebar from "@/components/Sidebar.vue";
import Header from "@/components/Header.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
// import required modules
import { Pagination, Navigation } from "swiper/modules";
import { inject, nextTick, onMounted, ref, watch } from "vue";
import { toast } from "vue3-toastify";
import api from "@/utils";
import LessonOldMistake from "./LessonOldMistake.vue";

const URL_API = inject("URL_API");
const handleErrorAPI = inject("handleErrorAPI");
const getInfoUser = inject("getInfoUser");
const toggleClamp = inject("toggleClamp");
const sleep = inject("sleep");

const modules = ref([Pagination, Navigation]);
const tabSwiper = ref(null);
const tabActive = ref(0);

const user = ref();
const dataProgress = ref();
const dataOldMistake = ref();
const showModalPickOldMistake = ref(false);
const pickSelect = ref([]);
const pickSelectAll = ref(false);
const isShowComponentMistake = ref(false);
const loadingGetOldMistake = ref(true);

const loadingUI = ref(false);

// Popup update info
const showUpdateInfoModal = ref(false);
const updateInfo = ref({
  fullname: '',
  age: ''
});

watch(pickSelectAll, (value) => {
  if (value) {
    pickSelect.value = dataOldMistake.value;
  } else {
    pickSelect.value = [];
  }
});

const onSwiper = (swiperInstance) => {
  tabSwiper.value = swiperInstance;
  // sự kiện pagination
  swiperInstance.on("slideChangeTransitionEnd", () => {
    const newIndex = swiperInstance.realIndex;
    handleTabActive(newIndex);
  });
};

// Xử lý thay đổi tab active
const handleTabActive = async (newIndex) => {
  await nextTick(); // Chờ Vue cập nhật DOM
  tabActive.value = newIndex;
  if (tabSwiper.value) {
    // Kiểm tra nếu slide hiện tại không đúng mới gọi `slideTo()`
    if (tabSwiper.value.realIndex !== newIndex) {
      tabSwiper.value.slideTo(newIndex);
    }
  }
};

// Kiểm tra reset streak
const checkStreak = async () => {
  try {
    const res = await api.post(`${URL_API}/api/user/check-streak`);
    if (res?.status !== 200) {
      toast.error(res?.data?.message);
      return;
    }
    if (res?.data?.status == 200 && res?.data?.reset_streak) {
      toast.info(res?.data?.message);
      // Cập nhật lại thông tin người dùng
      user.value = await getInfoUser();
      return;
    }
  } catch (error) {
    handleErrorAPI(error);
  }
};

const init = async () => {
  loadingUI.value = true;
  try {
    user.value = await getInfoUser();
    
    // Kiểm tra fullName và age trong localStorage
    checkUserInfo();
    
    // Lấy dữ liệu bài học hiện tại
    await getLessonCurrent();
    if (user.value) {
      if (user.value?.streak_start && user.value?.streak > 0) {
        const date = new Date(user.value?.streak_start);
        const currentDate = new Date();
        if (date.getDate() !== currentDate.getDate()) {
          await checkStreak();
        }
      }
    }
  } catch (error) {
    handleErrorAPI(error);
  } finally {
    loadingUI.value = false;
  }
};

const checkUserInfo = () => {
  const userLocal = localStorage.getItem('user');
  if (userLocal) {
    const userData = JSON.parse(userLocal);
    const hasFullname = userData.fullname && String(userData.fullname).trim() !== '';
    const hasAge = userData.age && String(userData.age).trim() !== '';
    
    if (!hasFullname || !hasAge) {
      showUpdateInfoModal.value = true;
      updateInfo.value.fullname = userData.fullname || '';
      updateInfo.value.age = userData.age ? String(userData.age) : '';
    }
  }
};

const handleUpdateInfo = async () => {
  try {
    if (!updateInfo.value.fullname || !updateInfo.value.age) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    loadingUI.value = true;
    
    // Cập nhật thông tin user qua API
    const res = await api.put(`${URL_API}/api/user/update-infor`, {
      user_id: user.value._id,
      fullname: updateInfo.value.fullname,
      age: updateInfo.value.age
    });
    
    if (res?.status === 200) {
      // Cập nhật localStorage
      const userLocal = JSON.parse(localStorage.getItem('user'));
      userLocal.fullname = updateInfo.value.fullname;
      userLocal.age = updateInfo.value.age;
      localStorage.setItem('user', JSON.stringify(userLocal));
      
      // Trigger event để các component khác biết localStorage đã thay đổi
      window.dispatchEvent(new Event('localStorageUpdate'));
      
      // Cập nhật user ref
      user.value = userLocal;
      
      toast.success('Cập nhật thông tin thành công');
      showUpdateInfoModal.value = false;
    } else {
      toast.error(res?.data?.message || 'Cập nhật thất bại');
    }
  } catch (error) {
    handleErrorAPI(error);
  } finally {
    loadingUI.value = false;
  }
};

const getLessonCurrent = async () => {
  try {
    const res = await api.get(
      `${URL_API}/api/user/get-lesson-current/${user.value?.topic_id}`
    );
    // send success
    if (res?.status !== 200) {
      toast.error(res?.data?.message);
      return;
    }
    dataProgress.value = res?.data?.data;
    // console.log(dataProgress.value);
  } catch (error) {
    handleErrorAPI(error);
  }
};

const handleGetOldMistake = async () => {
  showModalPickOldMistake.value = true;
  loadingGetOldMistake.value = true;
  if (dataOldMistake.value?.length > 0) {
    loadingGetOldMistake.value = false;
    return;
  }
  try {
    await sleep(1000);
    const res = await api.get(
      `${URL_API}/api/user/get-old-mistake/${user.value?._id}/${user.value?.topic_id}`
    );
    // send success
    if (res?.status !== 200) {
      toast.error(res?.data?.message);
      return;
    }
    dataOldMistake.value = res?.data?.data;
    console.log(dataOldMistake.value);
  } catch (error) {
    handleErrorAPI(error);
  } finally {
    loadingGetOldMistake.value = false;
  }
};

const handleSelect = (item) => {
  const index = pickSelect.value.findIndex((i) => i?._id === item?._id);
  if (index === -1) {
    pickSelect.value.push(item);
  } else {
    pickSelect.value.splice(index, 1);
  }
};

const isCheck = (item) => {
  return pickSelect.value.findIndex((i) => i?._id === item?._id) !== -1;
};

const handleRenderOldMistake = async () => {
  isShowComponentMistake.value = true;
  showModalPickOldMistake.value = false;
};

const handleSubmitOldMistake = async (data) => {
  showModalPickOldMistake.value = false;
  isShowComponentMistake.value = false;
  dataOldMistake.value = [];
  pickSelect.value = [];
  console.log(data);
};

onMounted(() => {
  init();
});
</script>
<template>
  <!-- Update Info Modal -->
  <div v-if="showUpdateInfoModal" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">Cập nhật thông tin cá nhân</h2>
        <p class="modal-subtitle">Vui lòng hoàn thiện thông tin để tiếp tục</p>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="fullname" class="form-label">Họ và tên *</label>
          <input
            id="fullname"
            v-model="updateInfo.fullname"
            type="text"
            class="form-input"
            placeholder="Nhập họ và tên"
          />
        </div>
        <div class="form-group">
          <label for="age" class="form-label">Tuổi *</label>
          <input
            id="age"
            v-model="updateInfo.age"
            type="text"
            class="form-input"
            placeholder="Nhập tuổi"
          />
        </div>
      </div>
      <div class="modal-footer">
        <button
          @click="handleUpdateInfo"
          class="btn-update"
          :disabled="loadingUI"
        >
          {{ loadingUI ? 'Đang cập nhật...' : 'Cập nhật' }}
        </button>
      </div>
    </div>
  </div>

  <LessonOldMistake
    v-if="isShowComponentMistake"
    :exercises="pickSelect"
    :user="user"
    @close="handleSubmitOldMistake"
  />
  <div v-else id="dashboard" class="flex">
    <Sidebar />
    <div class="dashboard-main w-full flex-1">
      <Header :user="user" />
      <div class="dashboard-content">
        <!-- loading -->
        <div v-if="loadingUI" class="flex justify-center">
          <span
            class="loading loading-dots loading-sm"
            style="animation: none; width: 80px"
          ></span>
        </div>
        <template v-else>
          <!-- header -->
          <div class="header-content cursor-pointer mt-4 mb-10">
            <RouterLink to="/progress">
              <div class="flex items-center gap-3 mb-5">
                <span class="icon">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.516 21a.583.583 0 0 0 .44-.186.583.583 0 0 0 .187-.442v-5.258c.138-.045.419-.127.844-.245.425-.124.984-.186 1.677-.186.857 0 1.645.085 2.364.255.72.163 1.416.356 2.09.579.673.215 1.36.408 2.06.578.7.17 1.455.255 2.266.255.712 0 1.249-.039 1.608-.117.367-.079.72-.193 1.06-.344.307-.143.552-.336.735-.578.19-.242.285-.56.285-.952V5.021a.644.644 0 0 0-.265-.55.999.999 0 0 0-.628-.196c-.229 0-.572.066-1.03.196-.451.131-1.075.197-1.873.197-.811 0-1.57-.082-2.276-.246-.7-.17-1.386-.363-2.06-.578a25.03 25.03 0 0 0-2.09-.589C9.192 3.085 8.404 3 7.548 3c-.707 0-1.24.04-1.6.118-.359.078-.712.193-1.059.343a2.01 2.01 0 0 0-.745.579c-.183.235-.275.55-.275.941v15.391c0 .17.062.317.186.442.131.124.285.186.462.186Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </span>
                <p>{{ dataProgress?.progress_id?.name }}</p>
                <span class="icon">
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="m19.769 12.028-4.923-5.142c-.317-.35-.944-.382-1.311-.077-.368.305-.405.888-.064 1.22l3.557 3.713H4.923c-.51 0-.923.384-.923.858 0 .473.413.857.923.857h12.105l-3.557 3.714c-.34.331-.294.913.073 1.219.368.305.986.275 1.302-.076l4.923-5.143c.32-.416.295-.789 0-1.143Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </span>
              </div>
              <div class="title flex items-center mb-5">
                <p class="title-text">{{ user?.topic?.name }}</p>
                <!-- <span class="title-number"> - Cấp độ {{
                5 * (dataProgress?.progress_order - 1) + dataProgress?.lesson_order
              }}</span> -->
              </div>
              <!-- <div class="progress-level flex items-center gap-5">
              <p>
                Tới cấp độ
                {{
                  5 * (dataProgress?.progress_order - 1) + dataProgress?.lesson_order + 1
                }}
              </p>
              <progress
                class="progress h-4 flex-1"
                :value="(user?.score / dataProgress?.min_score_next) * 100"
                max="100"
              ></progress>
              <p>{{ user?.score }}/{{ dataProgress?.min_score_next }}</p>
            </div> -->
            </RouterLink>
          </div>
          <!-- body -->
          <div class="body-content">
            <div class="title flex items-center justify-between">
              <p>Điểm của tôi</p>
              <span>{{ user?.score }} đ</span>
            </div>
            <div class="list-card flex">
              <!-- item -->
              <div
                class="card-item flex-1 e3fff7"
                :class="{ active: tabActive === 0 }"
                @click="handleTabActive(0)"
              >
                <div class="card-item__title flex justify-between">
                  <div class="flex">
                    <span class="icon text-[#00a778]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        width="20"
                        height="20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="m20.737 7.121.007-.011a1.713 1.713 0 0 0-.261-2.127l-1.397-1.396a2.074 2.074 0 0 0-1.977-.52c-1.466.383-2.911.792-4.356 1.228-2.475.748-4.526 2.63-6.893 3.67-.468.207-.654.409-1.024.719-.438.368-2.114 1.255-1.796 1.95.158.345 1.044.543 1.416.513.615-.05 1.267-.485 1.786-.81.546-.341 1.274-1.022 1.98-.975.02.244-.912.756-1.14.944-.428.35-.833.726-1.2 1.13-.566.622-1.159 1.213-1.704 1.848-.703.819.215.92.956.97.7.046.996-.516 1.488-.872.685-.495 1.29-1.1 1.985-1.604.332-.241.756-.612 1.158-.705-.243.767-.766 1.452-.98 2.259-.12.453-.093.611.227 1.022.634.818 1.398 1.682 2.248 2.282.226.16.725.555 1.042.385.274-.148.334-.862.252-1.126-.17-.546-.73-1.141-1.03-1.643-.262-.439-.383-.612-.152-1.057.208-.4.364-.773.574-1.17.648-1.228 2.595-1.596 3.765-.755.375.27.154.395.041.776-.1.34-.078.687-.109 1.033-.034.388-.09.647-.271.981-.189.35-.455.696-.558 1.081-.164.613.081 1.354.91 1.218 1.141-.188 1.993-1.986 2.398-2.82.134-.275.308-.65.457-.917.564-1.016.7-1.966 1.044-3.049a11.38 11.38 0 0 1 1.114-2.452ZM12.686 18.4c-.163-.69-1.054-.738-1.341-.127-.158.335-.151.77-.192 1.133-.046.403-.09.739.09 1.12a.825.825 0 0 0 1.42.127c.397-.564.18-1.629.023-2.253Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </span>
                    <div class="flex flex-col gap-4 ms-5">
                      <p class="font-bold">Thực hiện bài học</p>
                      <div class="text-[#536175]">
                        <!-- Mô tả -->
                        <span class="me-5 leading-8"
                          >Chủ đề: {{ dataProgress?.lesson_id?.title }}</span
                        >
                        <p
                          class="mt-4 leading-8 line-clamp-3"
                          @click="toggleClamp($event, 'line-clamp-3')"
                        >
                          Mô tả: {{ dataProgress?.lesson_id?.description }}
                        </p>
                      </div>
                      <!-- <p class="text-[#536175]">
                      <span class="me-5">0</span> Các từ đã thành thạo
                    </p>
                    <p class="text-[#536175]">
                      <span class="me-5">0</span> Đã bắt đầu học
                    </p> -->
                    </div>
                  </div>
                  <span class="font-bold text-nowrap">{{ user?.score }} đ</span>
                </div>
              </div>
              <div
                class="card-item flex-1 fff5f5"
                :class="{ active: tabActive === 1 }"
                @click="handleTabActive(1)"
              >
                <div class="card-item__title flex justify-between">
                  <div class="flex">
                    <span class="icon text-[#e46962]">
                      <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="m10.74 14.408 5.85-3.758-5.85-3.758v7.516ZM7.05 18.3c-.36 0-.675-.135-.945-.405a1.295 1.295 0 0 1-.405-.945V4.35c0-.36.135-.675.405-.945.27-.27.585-.405.945-.405h12.6c.36 0 .675.135.945.405.27.27.405.585.405.945v12.6c0 .36-.135.675-.405.945-.27.27-.585.405-.945.405H7.05ZM4.35 21c-.36 0-.675-.135-.945-.405A1.295 1.295 0 0 1 3 19.65V5.7h1.35v13.95H18.3V21H4.35Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </span>
                    <div class="flex flex-col gap-4 ms-5">
                      <p class="font-bold">Ôn tập lỗi sai cũ</p>
                      <!-- <p class="text-[#536175]">
                      <span class="me-5">0</span> Các từ đã thành thạo
                    </p>
                    <p class="text-[#536175]">
                      <span class="me-5">0</span> Đã bắt đầu học
                    </p> -->
                    </div>
                  </div>
                  <!-- <span class="font-bold">0 đ</span> -->
                </div>
              </div>
              <!-- <div
              class="card-item flex-1 e9fbff"
              :class="{ active: tabActive === 2 }"
              @click="handleTabActive(2)"
            >
              <div class="card-item__title flex justify-between">
                <div class="flex">
                  <span class="icon text-[#e46962]">
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="m10.74 14.408 5.85-3.758-5.85-3.758v7.516ZM7.05 18.3c-.36 0-.675-.135-.945-.405a1.295 1.295 0 0 1-.405-.945V4.35c0-.36.135-.675.405-.945.27-.27.585-.405.945-.405h12.6c.36 0 .675.135.945.405.27.27.405.585.405.945v12.6c0 .36-.135.675-.405.945-.27.27-.585.405-.945.405H7.05ZM4.35 21c-.36 0-.675-.135-.945-.405A1.295 1.295 0 0 1 3 19.65V5.7h1.35v13.95H18.3V21H4.35Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </span>
                  <div class="flex flex-col gap-4 ms-5">
                    <p class="font-bold">Học vượt cấp</p>
                    <p class="text-[#536175]">
                      <span class="me-5">0</span> Các từ đã thành thạo
                    </p>
                    <p class="text-[#536175]">
                      <span class="me-5">0</span> Đã bắt đầu học
                    </p>
                  </div>
                </div>
                <span class="font-bold">0 đ</span>
              </div>
            </div> -->
            </div>
          </div>
          <!-- bottom -->
          <div class="bottom-content">
            <div class="content text-white">
              <swiper
                class="mySwiper"
                :slidesPerView="1"
                :spaceBetween="30"
                :loop="true"
                :pagination="{
                  clickable: true,
                }"
                :navigation="true"
                :modules="modules"
                @swiper="onSwiper"
              >
                <swiper-slide class="flex c00a778">
                  <div
                    class="text-box w-full flex flex-col gap-4 sm:flex-row justify-between"
                  >
                    <div class="flex">
                      <span class="icon text-[#00a778] hidden sm:block">
                        <svg
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="m20.737 7.121.007-.011a1.713 1.713 0 0 0-.261-2.127l-1.397-1.396a2.074 2.074 0 0 0-1.977-.52c-1.466.383-2.911.792-4.356 1.228-2.475.748-4.526 2.63-6.893 3.67-.468.207-.654.409-1.024.719-.438.368-2.114 1.255-1.796 1.95.158.345 1.044.543 1.416.513.615-.05 1.267-.485 1.786-.81.546-.341 1.274-1.022 1.98-.975.02.244-.912.756-1.14.944-.428.35-.833.726-1.2 1.13-.566.622-1.159 1.213-1.704 1.848-.703.819.215.92.956.97.7.046.996-.516 1.488-.872.685-.495 1.29-1.1 1.985-1.604.332-.241.756-.612 1.158-.705-.243.767-.766 1.452-.98 2.259-.12.453-.093.611.227 1.022.634.818 1.398 1.682 2.248 2.282.226.16.725.555 1.042.385.274-.148.334-.862.252-1.126-.17-.546-.73-1.141-1.03-1.643-.262-.439-.383-.612-.152-1.057.208-.4.364-.773.574-1.17.648-1.228 2.595-1.596 3.765-.755.375.27.154.395.041.776-.1.34-.078.687-.109 1.033-.034.388-.09.647-.271.981-.189.35-.455.696-.558 1.081-.164.613.081 1.354.91 1.218 1.141-.188 1.993-1.986 2.398-2.82.134-.275.308-.65.457-.917.564-1.016.7-1.966 1.044-3.049a11.38 11.38 0 0 1 1.114-2.452ZM12.686 18.4c-.163-.69-1.054-.738-1.341-.127-.158.335-.151.77-.192 1.133-.046.403-.09.739.09 1.12a.825.825 0 0 0 1.42.127c.397-.564.18-1.629.023-2.253Z"
                            fill="currentColor"
                          ></path>
                        </svg>
                      </span>
                      <div class="ms-0 sm:ms-4">
                        <p class="text-[1.5rem] sm:text-[1.5rem] font-bold">
                          Thực hiện bài học
                        </p>
                        <p class="text-[14px] mt-4 leading-8">
                          <span class="hidden sm:block"
                            >Chủ đề:
                            <span>{{ dataProgress?.lesson_id?.title }}</span></span
                          >
                        </p>
                        <p
                          class="text-[12px] text-[#a8aeba] mt-4 line-clamp-2 leading-8 hidden sm:block"
                          @click="toggleClamp($event, 'line-clamp-2')"
                        >
                          Mô tả: {{ dataProgress?.lesson_id?.description }}
                        </p>
                      </div>
                    </div>
                    <RouterLink
                      :to="`/lesson/${dataProgress?.lesson_id?._id}`"
                      class="btn"
                      >Bắt đầu</RouterLink
                    >
                  </div>
                </swiper-slide>
                <swiper-slide class="flex ce46962">
                  <div
                    class="text-box w-full flex flex-col gap-4 sm:flex-row justify-between"
                  >
                    <div class="flex">
                      <span class="icon text-[#e46962] hidden sm:block">
                        <svg
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="m10.74 14.408 5.85-3.758-5.85-3.758v7.516ZM7.05 18.3c-.36 0-.675-.135-.945-.405a1.295 1.295 0 0 1-.405-.945V4.35c0-.36.135-.675.405-.945.27-.27.585-.405.945-.405h12.6c.36 0 .675.135.945.405.27.27.405.585.405.945v12.6c0 .36-.135.675-.405.945-.27.27-.585.405-.945.405H7.05ZM4.35 21c-.36 0-.675-.135-.945-.405A1.295 1.295 0 0 1 3 19.65V5.7h1.35v13.95H18.3V21H4.35Z"
                            fill="currentColor"
                          ></path>
                        </svg>
                      </span>
                      <div class="ms-0 sm:ms-4">
                        <p class="text-[1.5rem] sm:text-[1.5rem] font-bold">
                          Ôn tập lỗi sai cũ
                        </p>
                        <p class="text-[12px] text-[#a8aeba] mt-4"></p>
                      </div>
                    </div>
                    <button class="btn" @click="handleGetOldMistake">Bắt đầu</button>
                  </div>
                </swiper-slide>
                <!-- <swiper-slide class="flex c009fbb">
                <div class="text-box w-full flex justify-between">
                  <div class="flex">
                    <span class="icon text-[#00a778]">
                      <svg
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="m20.737 7.121.007-.011a1.713 1.713 0 0 0-.261-2.127l-1.397-1.396a2.074 2.074 0 0 0-1.977-.52c-1.466.383-2.911.792-4.356 1.228-2.475.748-4.526 2.63-6.893 3.67-.468.207-.654.409-1.024.719-.438.368-2.114 1.255-1.796 1.95.158.345 1.044.543 1.416.513.615-.05 1.267-.485 1.786-.81.546-.341 1.274-1.022 1.98-.975.02.244-.912.756-1.14.944-.428.35-.833.726-1.2 1.13-.566.622-1.159 1.213-1.704 1.848-.703.819.215.92.956.97.7.046.996-.516 1.488-.872.685-.495 1.29-1.1 1.985-1.604.332-.241.756-.612 1.158-.705-.243.767-.766 1.452-.98 2.259-.12.453-.093.611.227 1.022.634.818 1.398 1.682 2.248 2.282.226.16.725.555 1.042.385.274-.148.334-.862.252-1.126-.17-.546-.73-1.141-1.03-1.643-.262-.439-.383-.612-.152-1.057.208-.4.364-.773.574-1.17.648-1.228 2.595-1.596 3.765-.755.375.27.154.395.041.776-.1.34-.078.687-.109 1.033-.034.388-.09.647-.271.981-.189.35-.455.696-.558 1.081-.164.613.081 1.354.91 1.218 1.141-.188 1.993-1.986 2.398-2.82.134-.275.308-.65.457-.917.564-1.016.7-1.966 1.044-3.049a11.38 11.38 0 0 1 1.114-2.452ZM12.686 18.4c-.163-.69-1.054-.738-1.341-.127-.158.335-.151.77-.192 1.133-.046.403-.09.739.09 1.12a.825.825 0 0 0 1.42.127c.397-.564.18-1.629.023-2.253Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </span>
                    <div class="ms-4">
                      <p class="text-[20px] font-bold">Học từ mới</p>
                      <p class="text-[14px] text-[#a8aeba] mt-4">
                        Tình huống: <span>Chào hỏi</span>
                      </p>
                    </div>
                  </div>
                  <button class="btn">Bắt đầu</button>
                </div>
              </swiper-slide> -->
              </swiper>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
  <div
    v-if="showModalPickOldMistake"
    class="modal-bg modal-old__mistake fixed flex justify-center items-center inset-0 h-[100vh] w-[100vw] z-[9999]"
    style="background: rgba(41, 55, 73, 0.8)"
    @click="showModalPickOldMistake = false"
  >
    <div
      class="modal-container w-[80%] min-h-[200px] py-8 px-10 bg-white rounded-3xl overflow-auto"
      @click.stop=""
    >
      <div class="flex flex-col gap-8">
        <div class="flex items-center justify-center gap-3">
          <span class="icon"
            ><svg
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.516 21a.583.583 0 0 0 .44-.186.583.583 0 0 0 .187-.442v-5.258c.138-.045.419-.127.844-.245.425-.124.984-.186 1.677-.186.857 0 1.645.085 2.364.255.72.163 1.416.356 2.09.579.673.215 1.36.408 2.06.578.7.17 1.455.255 2.266.255.712 0 1.249-.039 1.608-.117.367-.079.72-.193 1.06-.344.307-.143.552-.336.735-.578.19-.242.285-.56.285-.952V5.021a.644.644 0 0 0-.265-.55.999.999 0 0 0-.628-.196c-.229 0-.572.066-1.03.196-.451.131-1.075.197-1.873.197-.811 0-1.57-.082-2.276-.246-.7-.17-1.386-.363-2.06-.578a25.03 25.03 0 0 0-2.09-.589C9.192 3.085 8.404 3 7.548 3c-.707 0-1.24.04-1.6.118-.359.078-.712.193-1.059.343a2.01 2.01 0 0 0-.745.579c-.183.235-.275.55-.275.941v15.391c0 .17.062.317.186.442.131.124.285.186.462.186Z"
                fill="currentColor"
              ></path></svg
          ></span>
          <h2 class="text-[24px] font-bold">Danh sách lỗi sai cũ</h2>
        </div>
        <div class="overflow-x-auto max-h-[400px]">
          <div v-if="loadingGetOldMistake" class="flex justify-center">
            <span
              class="loading loading-dots loading-sm"
              style="animation: none; width: 40px"
            ></span>
          </div>
          <template v-else>
            <table v-if="dataOldMistake?.length > 0" class="table text-[1.6rem]">
              <!-- head -->
              <thead class="text-[1.6rem]">
                <tr>
                  <th>
                    <label>
                      <input
                        type="checkbox"
                        class="checkbox"
                        style="width: 22px; height: 22px"
                        v-model="pickSelectAll"
                      />
                    </label>
                  </th>
                  <th>Câu hỏi</th>
                  <th>Câu trả lời trước</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in dataOldMistake"
                  :key="index"
                  @click="handleSelect(item)"
                >
                  <th>
                    <label>
                      <input
                        type="checkbox"
                        class="checkbox"
                        style="width: 22px; height: 22px"
                        :checked="isCheck(item)"
                      />
                    </label>
                  </th>
                  <td>{{ item?.question }}</td>
                  <td>{{ item?.user_answer }}</td>
                </tr>
              </tbody>
            </table>
            <span
              class="h-[250px] text-[1.8rem] flex items-center justify-center font-semibold"
              v-else
            >
              Hiện tại chưa có lỗi sai nào
            </span>
          </template>
        </div>
        <div class="text-center mt-8">
          <button
            class="btn-action"
            :disabled="pickSelect.length == 0"
            style="min-height: 4rem"
            :style="{ backgroundColor: pickSelect.length == 0 ? '#d3d3d3' : '#ffbb00' }"
            @click="handleRenderOldMistake"
          >
            Ôn tập
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  text-align: center;
  margin-bottom: 24px;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.modal-subtitle {
  font-size: 14px;
  color: #6b7280;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s;
  outline: none;
}

.form-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.modal-footer {
  display: flex;
  justify-content: center;
}

.btn-update {
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 150px;
}

.btn-update:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-update:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
