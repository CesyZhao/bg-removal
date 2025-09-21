import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    css: {
      postcss: {
        plugins: []
      }
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer'),
        '@common': resolve('src/common'),
        '@main': resolve('src/main')
      }
    },
    plugins: [vue(), tailwindcss()]
  }
})
