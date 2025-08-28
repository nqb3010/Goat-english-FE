<script setup>
import { inject, onMounted, ref } from "vue";
import { toast } from "vue3-toastify";
import api from "@/utils";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
} from "chart.js";
import { Pie, Bar } from "vue-chartjs";

// Đăng ký ChartJS modules
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement
);

const URL_API = inject("URL_API");
const handleErrorAPI = inject("handleErrorAPI");

const report = ref(null);
const loading = ref(true);

// Đặt giá trị mặc định để tránh lỗi undefined
const chartData = ref({ labels: [], datasets: [{ data: [] }] });
const barChartData = ref({ labels: [], datasets: [{ data: [] }] });
const fullLessonNames = ref([]);

const fetchStats = async () => {
  try {
    const response = await api.get(`${URL_API}/api/admin/report`);
    if (!response.data || !response.data.data) {
      throw new Error("Dữ liệu API không hợp lệ");
    }
    report.value = response.data.data;
    console.log("report", report.value);
    // Cập nhật chartData nếu có dữ liệu hợp lệ
    if (report.value.completionRate) {
      chartData.value = {
        labels: ["Hoàn thành", "Đang học"],
        datasets: [
          {
            data: [
              report.value.completionRate.completed || 0,
              report.value.completionRate.inProgress || 0,
            ],
            backgroundColor: ["#4CAF50", "#FF9800"],
          },
        ],
      };
    }
    // Cập nhật barChartData nếu có dữ liệu hợp lệ
    if (report.value.topLessons?.length) {
      // Lưu tên đầy đủ
      fullLessonNames.value = report.value.topLessons.map((lesson) => lesson.title);
      barChartData.value = {
        labels: report.value.topLessons.map(
          (lesson) => lesson.title.slice(0, 20) + "..." || "N/A"
        ),
        datasets: [
          {
            label: "Lượt học",
            data: report.value.topLessons.map((lesson) => lesson.count || 0),
            backgroundColor: "#2196F3",
          },
        ],
      };
    }
  } catch (error) {
    handleErrorAPI(error);
    toast.error("Không thể tải dữ liệu!");
  } finally {
    loading.value = false;
  }
};

const barChartOptions = {
  responsive: true,
  plugins: {
    tooltip: {
      callbacks: {
        label: (tooltipItem) => {
          const index = tooltipItem.dataIndex;
          return ` ${fullLessonNames.value[index]}: ${tooltipItem.raw} lượt học`;
        },
      },
    },
  },
};

onMounted(fetchStats);
</script>

<template>
  <div class="dashboard p-2">
    <template v-if="loading">
      <p class="text-center text-lg font-semibold">Đang tải dữ liệu...</p>
    </template>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <!-- Tổng số học viên -->
        <div class="card">
          <h3 class="text-lg font-semibold">Tổng số học viên</h3>
          <p class="text-3xl font-bold">{{ report?.totalUsers || 0 }}</p>
        </div>

        <!-- Tổng số bài học -->
        <div class="card">
          <h3 class="text-lg font-semibold">Tổng số bài học</h3>
          <p class="text-3xl font-bold">{{ report?.totalLessons || 0 }}</p>
        </div>
      </div>

      <div class="grid grid-cols-4 md:grid-cols-6 gap-4">
        <!-- Tỷ lệ hoàn thành bài học -->
        <div class="card col-span-4 md:col-span-2">
          <h3 class="text-lg font-semibold">Tỷ lệ hoàn thành bài học</h3>
          <Pie v-if="chartData?.labels?.length" :data="chartData" />
        </div>

        <!-- Điểm trung bình -->
        <!-- <div class="card">
        <h3 class="text-lg font-semibold">Điểm trung bình</h3>
        <p class="text-3xl font-bold">{{ report?.avgScore?.toFixed(2) || "0.00" }}</p>
      </div> -->

        <!-- Bài học phổ biến nhất -->
        <div class="card col-span-4">
          <h3 class="text-lg font-semibold">Bài học phổ biến</h3>
          <Bar
            v-if="barChartData?.labels?.length"
            :data="barChartData"
            :options="barChartOptions"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style>
.dashboard {
  display: grid;
  gap: 20px;
}
.card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
