<template>
  <div class="flex items-center gap-3 transition-all duration-300">
    <StepIcon :status="iconStatus" />
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between mb-1">
        <h3 class="font-semibold text-base-content text-sm truncate">
          {{ title }}
        </h3>
      </div>
      <p
        class="text-base-content/60 text-xs leading-relaxed mb-2 overflow-hidden text-ellipsis whitespace-nowrap"
      >
        <slot></slot>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import StepIcon from './StepIcon.vue'

// 定义 Props
interface Props {
  title: string
  iconStatus: 'success' | 'error' | 'in-progress' | 'waiting' | 'default'
}

defineProps<Props>()
</script>
