<script setup>
import { inject, onMounted } from "vue";

const setNotLogin = inject("setNotLogin");

onMounted(() => {
  setNotLogin(false);
});
</script>

<template>
  <div class="bg-primary" style="height: 100vh">
    <main class="pb-3 main h-full" style="margin-top: 0">
      <div class="login">
        <h2 class="text-primary">Đăng nhập</h2>
        <form method="post" autocomplete="off">
          <div class="form-group">
            <label for="inputTenDN" class="form-label mt-4">Email</label>
            <input
              type="email"
              class="form-control"
              id="inputTenDN"
              name="email"
              required
              placeholder="Nhập email"
            />
          </div>
          <div class="form-group">
            <label for="inputMK" class="form-label mt-4">Mật khẩu</label>
            <input
              type="password"
              class="form-control"
              id="inputMK"
              name="password"
              required
              placeholder="Nhập mật khẩu"
              autocomplete="off"
            />
          </div>
          <br />
          <div class="text-end">
            <a href="#!" class="d-none">Quên mật khẩu</a>
          </div>
          <div class="text-center">
            <input type="submit" value="Log in" class="btn btn-primary w-100" />
          </div>
        </form>
      </div>
    </main>
  </div>
</template>
