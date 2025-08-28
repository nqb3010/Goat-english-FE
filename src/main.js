import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// css
import 'swiper/css'
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './assets/css/tailwind.css'
import './assets/css/main.css'
import 'bootstrap-icons/font/bootstrap-icons.min.css'
import 'vue3-toastify/dist/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
