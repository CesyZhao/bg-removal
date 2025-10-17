import type { Directive, DirectiveBinding } from 'vue'

interface ClickOutsideHTMLElement extends HTMLElement {
  __clickOutsideHandler__?: (e: Event) => void
}

const clickoutside: Directive<ClickOutsideHTMLElement, (e: Event) => void> = {
  beforeMount(el: ClickOutsideHTMLElement, binding: DirectiveBinding<(e: Event) => void>) {
    const handler = (e: Event): void => {
      const target = e.target as Node | null
      if (!target) return
      if (el.contains(target)) return
      if (typeof binding.value === 'function') {
        binding.value(e)
      }
    }
    el.__clickOutsideHandler__ = handler
    document.addEventListener('mousedown', handler, true)
    document.addEventListener('touchstart', handler, true)
  },
  unmounted(el: ClickOutsideHTMLElement) {
    const handler = el.__clickOutsideHandler__
    if (handler) {
      document.removeEventListener('mousedown', handler, true)
      document.removeEventListener('touchstart', handler, true)
      delete el.__clickOutsideHandler__
    }
  }
}

export default clickoutside
