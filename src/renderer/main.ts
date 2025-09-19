import App from '@renderer/App.vue'
import '@renderer/styles/main.css'
import '@renderer/assets/icon/iconfont.css'
import i18n from './i18n'

import { createApp } from 'vue'

const app = createApp(App)
app.use(i18n)

app.mount('#app')
