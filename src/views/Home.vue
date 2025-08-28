<script setup>
import { onMounted } from "vue";
import { useLayoutStore } from "@/stores/layout";
import Button from "@/components/Button.vue";
const init = async () => {
  const token = localStorage.getItem("token");
  if (token) {
    location.href = "/dashboard";
  }
};
const layout = useLayoutStore();
onMounted(() => {
  init();
});
</script>
<template>
  <div class="home-body page-container flex items-center">
    <div class="flex items-center justify-between gap-4 flex-col md:flex-row">
      <div class="banner">
        <img class="img" src="../assets/images/19467ffee68fe.png" />
      </div>
      <div class="block-text">
        <h1 class="title">Nâng cao kỹ năng tiếng Anh của bạn với công nghệ tiên tiến!</h1>
        <Button
          :item="{ text: 'Bắt đầu ngay', href: '/signup' }"
          class="btn-primary-custom uppercase"
        />
        <Button
          :item="{ text: 'Tôi đã có tài khoản', href: '/login' }"
          class="btn-default-custom uppercase"
        />
      </div>
    </div>
  </div>
</template>
