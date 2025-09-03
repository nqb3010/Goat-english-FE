<script setup>
import { useRouter } from 'vue-router'
const { item, loading } = defineProps(['item', 'loading'])
const router = useRouter()

function handleClick() {
  if (item.href) {
    router.push(item.href)
  }
}
</script>

<template>
  <button type="button" class="btn text-[16px]" :class="item.class" :style="item.style" @click="handleClick">
    <span
      v-if="loading"
      class="loading loading-dots loading-sm"
      style="animation: none; width: 40px"
    ></span>
    <slot name="icon"></slot>
    <template v-if="item.icon">
      <span class="btn-with-icon">
        <span>{{ item.text }}</span>
        <img :src="item.icon" :alt="item.text" />
      </span>
    </template>
    <template v-else>
      <span>{{ item.text }}</span>
    </template>
  </button>
</template>
