import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('layout', () => {
  const showHeader = ref(false);
  const showFooter = ref(false);
  const isCollapsed = ref(false);
  const showSidebar = ref(false);

  const show = () => {
    showHeader.value = true;
    showFooter.value = true;
  }

  return { showHeader, showFooter, show, isCollapsed, showSidebar };
})
