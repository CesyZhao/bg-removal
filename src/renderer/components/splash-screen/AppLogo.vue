<template>
  <div
    class="app-logo flex items-center gap-2 transition-all duration-200 ease-in-out"
    :class="logoClass"
  >
    <!-- 应用图标 -->
    <div
      class="bg-gradient-to-br from-primary to-primary-focus rounded-md flex items-center justify-center shadow-lg transition-all duration-500"
      :class="iconSizeClass"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="text-primary-content drop-shadow-sm transition-all duration-200"
        :class="iconSvgClass"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
    <!-- 应用标题 -->
    <h1 class="font-bold tracking-tight transition-all duration-200" :class="titleClass">
      {{ $t('splash.appName') }}
    </h1>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'normal' | 'small' | 'mini'
  showTitle?: boolean
  position?: 'center' | 'top-left'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'normal',
  showTitle: true,
  position: 'center'
})

const logoClass = computed(() => {
  const classes: string[] = []

  if (props.position === 'top-left') {
    classes.push('absolute', 'top-6', 'left-6', 'z-20')
  } else if (props.position === 'center') {
    // 居中定位需要父容器支持，这里添加相对定位以便在需要时可以定位
    classes.push(
      'absolute',
      'top-1/5',
      'left-1/2',
      'transform',
      '-translate-x-1/2',
      '-translate-y-1/2',
      'z-20'
    )
  }

  return classes.join(' ')
})

const iconSizeClass = computed(() => {
  switch (props.size) {
    case 'small':
      return 'w-8 h-8'
    case 'mini':
      return 'w-6 h-6'
    default:
      return 'w-12 h-12'
  }
})

const iconSvgClass = computed(() => {
  switch (props.size) {
    case 'small':
      return 'w-5 h-5'
    case 'mini':
      return 'w-4 h-4'
    default:
      return 'w-7 h-7'
  }
})

const titleClass = computed(() => {
  switch (props.size) {
    case 'small':
      return 'text-lg'
    case 'mini':
      return 'text-base'
    default:
      return 'text-2xl'
  }
})
</script>

<style scoped>
.app-logo {
  transform-origin: center;
}
</style>
