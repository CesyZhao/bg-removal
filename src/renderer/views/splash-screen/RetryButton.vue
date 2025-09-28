<template>
  <div class="mt-2 flex items-center justify-center">
    <button
      :disabled="disabled"
      class="btn btn-xs btn-primary btn-ghost"
      :class="{ loading: isLoading }"
      @click="handleClick"
    >
      <span v-if="!isLoading">
        {{ text }}
      </span>
      <span v-else>
        {{ loadingText }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
// 定义 Props
interface Props {
  disabled?: boolean
  isLoading?: boolean
  text: string
  loadingText: string
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  isLoading: false
})

// 定义 Emits
const emit = defineEmits<{
  (e: 'click'): void
}>()

// 处理点击事件
const handleClick = (): void => {
  emit('click')
}
</script>
