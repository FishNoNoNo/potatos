<template>
  <button
    class="floating-ball"
    :class="{ shadow: shadow, reminding: reminding }"
    type="button"
    @click="emit('click')"
    @contextmenu.prevent="emit('open')"
    data-tauri-drag-region="true"
  >
    <span class="floating-ball__shine" data-tauri-drag-region="true" />
    <span class="floating-ball__badge" data-tauri-drag-region="true">
      {{ count }}
    </span>
  </button>
</template>

<script setup lang="ts">
export interface Props {
  count: number;
  shadow?: boolean;
  reminding?: boolean;
}

withDefaults(defineProps<Props>(), {
  count: 0,
  shadow: false,
  reminding: false,
});

const emit = defineEmits<{
  click: [];
  open: [];
}>();
</script>

<style scoped lang="scss">
.floating-ball {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  border: 1px solid var(--potatos-line, rgba(255, 255, 255, 0.2));
  background:
    radial-gradient(circle at 35% 30%, var(--potatos-accent-soft, #ffb347), transparent 70%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.02)), var(--potatos-panel, #2c2c2e);
  color: var(--potatos-text, #ffffff);
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }

  &.shadow {
    box-shadow:
      0 8px 20px rgba(0, 0, 0, 0.35),
      0 0 0 2px rgba(255, 255, 255, 0.05) inset,
      0 0 12px var(--potatos-glow, rgba(255, 180, 70, 0.6));
  }

  &.reminding {
    animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    animation-iteration-count: infinite;
  }
}

.floating-ball__shine {
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  pointer-events: none;
  background: radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.25), transparent 70%);
  opacity: 0.7;
}

.floating-ball__brand {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2.4rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  background: linear-gradient(135deg, #fff, rgba(255, 255, 255, 0.8));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;

  @supports not (background-clip: text) {
    color: white;
  }
}

.floating-ball__badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2.4rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  background: linear-gradient(135deg, #fff, rgba(255, 255, 255, 0.8));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-3px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(3px, 0, 0);
  }
}
</style>
