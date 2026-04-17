<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";

interface Option {
  value: number;
  label: string;
}

const props = defineProps<{
  modelValue: number;
  options: Option[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const selectedLabel = computed(() => {
  const selected = props.options.find((opt) => opt.value === props.modelValue);
  return selected?.label || props.options[0]?.label;
});

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

function selectOption(option: Option) {
  emit("update:modelValue", option.value);
  isOpen.value = false;
}

// 点击外部关闭
function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="custom-select" ref="dropdownRef">
    <div class="select-trigger" @click="toggleDropdown">
      <span>{{ selectedLabel }}</span>
    </div>

    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu">
        <div
          v-for="option in options"
          :key="option.value"
          class="dropdown-item"
          :class="{ selected: modelValue === option.value }"
          @click="selectOption(option)"
        >
          {{ option.label }}
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.custom-select {
  position: relative;
  width: 100%;
}

.select-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid var(--potatos-line);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--potatos-text);
  cursor: pointer;
  transition: all 300ms ease;

  &:hover {
    border-color: var(--potatos-accent);
  }

  .arrow {
    font-size: 12px;
    transition: transform 300ms ease;
    color: var(--potatos-text-soft);

    &.open {
      transform: rotate(180deg);
    }
  }
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  overflow-y: auto;
  background: var(--potatos-panel);
  border: 1px solid var(--potatos-line);
  border-radius: 12px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--potatos-line);
    border-radius: 3px;
  }
}

.dropdown-item {
  padding: 10px 14px;
  cursor: pointer;
  transition: all 300ms ease;
  color: var(--potatos-text);

  &:hover {
    background: var(--potatos-nav-hover-bg);
  }

  &.selected {
    background: linear-gradient(135deg, var(--potatos-accent), var(--potatos-accent-strong));
    color: #0a0c0f;
    font-weight: 500;
  }
}

// 动画
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 300ms ease,
    transform 300ms ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
