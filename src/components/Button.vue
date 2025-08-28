<script setup>
const { item, loading } = defineProps(['item', 'loading'])
</script>

<template>
  <button type="button" class="btn text-[16px]" :class="item.class" :style="item.style">
    <span
      v-if="loading"
      class="loading loading-dots loading-sm"
      style="animation: none; width: 40px"
    ></span>
    <slot name="icon"></slot>
    <template v-if="item.href">
      <span v-if="item.icon" class="btn-with-icon">
        <RouterLink :to="item.href">{{ item.text }}</RouterLink>
        <img :src="item.icon" :alt="item.text" />
      </span>
      <RouterLink v-else :to="item.href">{{ item.text }}</RouterLink>
    </template>
    <template v-else>
      <span v-if="item.icon" class="btn-with-icon">
        <span>{{ item.text }}</span>
        <img :src="item.icon" :alt="item.text" />
      </span>
      <p v-else>
        {{ item.text }}
      </p>
    </template>
  </button>
</template>
