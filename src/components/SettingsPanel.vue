<script setup lang="ts">
import type { PotatosSettings } from "../service/models";
import { THEME_PRESETS } from "../utils/theme";

defineProps<{
  settings: PotatosSettings;
}>();

const emit = defineEmits<{
  "update:theme": [value: string];
  "update:autostart": [value: boolean];
  "update:sound": [value: string];
  "update:notify": [value: number];
}>();

const sounds = [
  { key: "pulse", label: "Pulse" },
  { key: "glass", label: "Glass" },
  { key: "bloom", label: "Bloom" },
];
</script>

<template>
  <section class="settings-panel">
    <div class="settings-panel__header">
      <div>
        <p class="eyebrow">Settings</p>
        <h2>偏好设置</h2>
      </div>
      <span class="badge">个性化</span>
    </div>

    <div class="setting-block">
      <span class="setting-block__label">主题色</span>
      <div class="theme-grid">
        <button
          v-for="theme in THEME_PRESETS"
          :key="theme.key"
          :class="['theme-tile', { 'theme-tile--active': settings.theme_key === theme.key }]"
          type="button"
          @click="emit('update:theme', theme.key)"
        >
          <i :style="{ background: theme.accent }" />
          <span>{{ theme.label }}</span>
        </button>
      </div>
    </div>

    <div class="setting-block">
      <div class="switch-row">
        <div>
          <span class="setting-block__label">开机自启</span>
          <p>启动系统后自动进入悬浮球待机状态</p>
        </div>
        <button
          :class="['switch', { 'switch--on': settings.autostart_enabled }]"
          type="button"
          @click="emit('update:autostart', !settings.autostart_enabled)"
        >
          <span />
        </button>
      </div>
    </div>

    <div class="setting-block">
      <span class="setting-block__label">提示音</span>
      <div class="pill-group">
        <button
          v-for="sound in sounds"
          :key="sound.key"
          :class="['pill', { 'pill--active': settings.sound_key === sound.key }]"
          type="button"
          @click="emit('update:sound', sound.key)"
        >
          {{ sound.label }}
        </button>
      </div>
    </div>

    <div class="setting-block">
      <span class="setting-block__label">默认提醒时间</span>
      <div class="pill-group">
        <button
          v-for="value in [0, 5, 10, 15, 30, 60]"
          :key="value"
          :class="['pill', { 'pill--active': settings.default_notify_before_minutes === value }]"
          type="button"
          @click="emit('update:notify', value)"
        >
          {{ value === 0 ? "准点" : `${value} 分钟` }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.settings-panel {
  padding: 18px;
  border: 1px solid var(--potatos-line);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.03);
}

.settings-panel__header,
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.setting-block {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--potatos-line);
}

.setting-block__label {
  display: inline-block;
  margin-bottom: 12px;
  font-weight: 700;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.theme-tile,
.pill {
  border: 1px solid var(--potatos-line);
  border-radius: 18px;
  background: transparent;
  color: var(--potatos-text);
  padding: 12px 14px;
  font: inherit;
  cursor: pointer;
  transition: all 300ms ease;
}

.theme-tile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.theme-tile i {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 999px;
}

.theme-tile--active,
.pill--active {
  border-color: color-mix(in srgb, var(--potatos-accent) 62%, white);
  box-shadow: 0 0 0 1px var(--potatos-accent-soft) inset;
}

.switch-row p {
  margin: 6px 0 0;
  color: var(--potatos-text-soft);
  line-height: 1.5;
}

.switch {
  width: 52px;
  height: 30px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;

  transition: background 300ms ease;
}

.switch span {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  transition: transform 300ms ease;
}

.switch--on {
  background: var(--potatos-accent);
}

.switch--on span {
  transform: translateX(22px);
}

.pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
