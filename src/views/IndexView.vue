<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import FloatingBall from "../components/FloatingBall.vue";
import SettingsPanel from "../components/SettingsPanel.vue";
import TodoComposer from "../components/TodoComposer.vue";
import TodoList from "../components/TodoList.vue";
import { Settings, Home, Circle, Plus } from "lucide-vue-next";
import type { TodoDraft } from "../service/models";
import { useAppStore } from "../store/app";
import { active } from "@/service/active.service";

const appStore = useAppStore();
const submitting = ref(false);

const tabs = [
  {
    name: "main",
    label: "主页",
    icon: Home,
  },
  {
    name: "add",
    label: "添加",
    icon: Plus,
  },
  {
    name: "settings",
    label: "设置",
    icon: Settings,
  },
];

const btnGroup = [
  {
    name: "ball",
    label: "收起",
    icon: Circle,
    func: appStore.collapseShell,
  },
];

const headline = computed(() => {
  const total = appStore.pendingTodos.length;
  if (!total) {
    return "今天你土豆了吗？";
  }

  return `还有 ${total} 个土豆在等你下锅。`;
});

async function handleSubmit(payload: TodoDraft, todoId?: string) {
  submitting.value = true;

  try {
    if (todoId) {
      await appStore.updateTodo(todoId, payload);
      return;
    }

    await appStore.createTodo(payload);
  } finally {
    submitting.value = false;
  }
}

const currentView = ref("main");

let dragTimer: number | null = null;
const isDragging = ref(false);
function onGlobalMouseUp() {
  if (isDragging.value) {
    console.log("拖拽结束");
    isDragging.value = false;
    active(); // 你的激活逻辑

    if (dragTimer) {
      clearTimeout(dragTimer);
      dragTimer = null;
    }
  }
}

function addEventListener() {
  window.addEventListener("mouseup", onGlobalMouseUp);
  window.addEventListener("blur", onWindowBlur);
}

function removeEventListener() {
  window.removeEventListener("mouseup", onGlobalMouseUp);
  window.removeEventListener("blur", onWindowBlur);
}

// 监听窗口失去焦点（更可靠的方案）
function onWindowBlur() {
  if (isDragging.value) {
    console.log("拖拽结束（窗口失去焦点）");
    isDragging.value = false;
    active();
  }
}

function onMouseUp() {
  console.log("拖拽结束");
}

onMounted(() => {
  void appStore.hydrate();
  addEventListener();
});

onUnmounted(() => {
  removeEventListener();
});
</script>

<template>
  <main
    class="workspace"
    :class="{ 'workspace--expanded': appStore.shellExpanded }"
    tabindex="0"
    @contextmenu="(e) => e.preventDefault()"
    @mousedown="
      () => {
        isDragging = true;
        console.log('开始拖拽');
      }
    "
    @mouseup="onMouseUp"
    @click="() => active()"
  >
    <div class="workspace__orb">
      <template v-if="appStore.shellExpanded">
        <Transition mode="out-in">
          <div class="delay__display">
            <div class="nav-tabs">
              <button
                v-for="tab in tabs"
                :key="tab.name"
                class="nav-tab"
                :class="{ active: currentView === tab.name }"
                @click="currentView = tab.name"
              >
                <Component :is="tab.icon" />
              </button>
            </div>
            <div class="btn-group">
              <button
                v-for="btn in btnGroup"
                :key="btn.name"
                class="btn"
                :aria-label="btn.label"
                :title="btn.label"
                @click="btn.func"
              >
                <Component :is="btn.icon" />
              </button>
            </div>
          </div>
        </Transition>

        <!-- <button class="minimize-button" type="button" @click="appStore.collapseShell">收起</button> -->
      </template>

      <div class="main">
        <FloatingBall
          v-if="!appStore.shellExpanded"
          class="delay__display"
          :count="appStore.pendingTodos.length"
          :shadow="appStore.pendingTodos.length > 0"
          :reminding="appStore.reminding"
          @open="
            () => {
              currentView = 'main';
              appStore.expandShell();
            }
          "
        />
        <div v-else class="delay__display shell" data-tauri-drag-region="true">
          <header class="shell__hero" style="pointer-events: none">
            <div>
              <p class="eyebrow">Potatos</p>
              <h1 style="font-size: 24px">{{ headline }}</h1>
            </div>
          </header>

          <Transition name="fade" mode="out-in">
            <div v-if="currentView === 'main'" class="main-content main-panel">
              <div class="stats-strip">
                <article>
                  <strong>{{ appStore.pendingTodos.length }}</strong>
                  <span>待处理</span>
                </article>
                <article>
                  <strong>{{ appStore.todayTodos.length }}</strong>
                  <span>今日计划</span>
                </article>
                <article>
                  <strong>{{ appStore.completedTodos.length }}</strong>
                  <span>已完成</span>
                </article>
              </div>
              <TodoList
                :completed-todos="appStore.completedTodos"
                :pending-todos="appStore.pendingTodos"
                @edit="appStore.startEditing"
                @remove="appStore.removeTodo"
                @toggle="appStore.setTodoCompleted"
              />
            </div>
            <div v-else-if="currentView === 'add'" class="main-content add-panel">
              <TodoComposer
                :default-notify-before-minutes="appStore.settings.default_notify_before_minutes"
                :editing-todo="appStore.editingTodo"
                :submitting="submitting"
                @cancel="appStore.cancelEditing"
                @submit="handleSubmit"
              />
            </div>

            <div v-else-if="currentView === 'settings'" class="main-content setting-panel">
              <SettingsPanel
                :settings="appStore.settings"
                @update:autostart="appStore.patchSettings({ autostart_enabled: $event })"
                @update:notify="appStore.patchSettings({ default_notify_before_minutes: $event })"
                @update:sound="appStore.patchSettings({ sound_key: $event })"
                @update:theme="appStore.patchSettings({ theme_key: $event })"
              />
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
.workspace {
  width: 100%;
  height: 100vh;

  box-sizing: border-box;
  overflow: hidden;
  background: transparent;
  &::-webkit-scrollbar {
    display: none;
  }
}

.workspace__orb {
  width: 100%;
  height: 100%;
  padding: 14px;
  background-color: transparent;
  box-sizing: border-box;
  position: relative;
}

.workspace--expanded {
  padding-left: 60px;
  padding-right: 40px;

  .workspace__orb {
    padding: 14px 0;
  }
}

.shell {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 24px;
  border: 1px solid var(--potatos-line);
  border-radius: 12px;
  background:
    radial-gradient(circle at top left, var(--potatos-accent-soft), transparent 30%),
    radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.07), transparent 20%), var(--potatos-panel);
  backdrop-filter: blur(18px);
  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.34),
    0 0 10px var(--potatos-glow);
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  z-index: 10px;

  user-select: none;

  transform: scale(1); /* 明确指定正常状态 */
  opacity: 1;
}

.nav-tabs {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  width: 60px;

  position: fixed;
  top: 80px;
  left: 0px;
  z-index: 9;

  .nav-tab {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 40px;
    height: 40px;
    border-radius: 12px 0 0 12px;
    color: var(--potatos-text-soft);
    background: var(--potatos-nav-bg);
    border-bottom: 1px solid var(--potatos-nav-border);
    transition:
      background 300ms ease,
      color 300ms ease,
      width 300ms ease;

    &:hover {
      background: var(--potatos-nav-hover-bg);
      color: var(--potatos-text);
    }
  }

  .nav-tab.active {
    width: 60px;
    background: var(--potatos-nav-active-bg);
    color: var(--potatos-nav-active-text);
    &:hover {
      background: var(--potatos-nav-hover-bg);
      color: var(--potatos-text);
    }
  }
}

.btn-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  width: 60px;

  position: fixed;
  top: 80px;
  right: 0px;
  z-index: 9;

  .btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 40px;
    height: 40px;
    border-radius: 0 12px 12px 0;
    color: var(--potatos-text-soft);
    background: var(--potatos-nav-bg);
    border-bottom: 1px solid var(--potatos-nav-border);
    transition:
      background 300ms ease,
      color 300ms ease,
      width 300ms ease;
    &:hover {
      background: var(--potatos-nav-hover-bg);
      color: var(--potatos-text);
    }

    &:active {
      background: var(--potatos-nav-active-bg);
      color: var(--potatos-nav-active-text);
    }
  }
}

.shell__hero,
.stats-strip,
.main-content {
  display: grid;
  gap: 16px;
}

.shell__hero {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--potatos-text-soft);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.72rem;
}

h1 {
  margin: 0;
  max-width: 480px;
  font-size: 2rem;
  line-height: 1.12;
}

.shell__copy {
  margin: 14px 0 0;
  max-width: 520px;
  color: var(--potatos-text-soft);
  line-height: 1.7;
}

.minimize-button {
  padding: 10px 14px;
  border: 1px solid var(--potatos-line);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--potatos-text);
  cursor: pointer;

  position: fixed;
  z-index: 10;
  top: 24px;
  right: 24px;
}

.close-button {
  border: 1px solid var(--potatos-line);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--potatos-text);
  padding: 12px 16px;
  cursor: pointer;
}

.stats-strip {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.stats-strip article {
  padding: 16px 18px;
  border-radius: 24px;
  border: 1px solid var(--potatos-line);
  background: rgba(255, 255, 255, 0.04);
}

.stats-strip strong {
  display: block;
  margin-bottom: 6px;
  font-size: 1.6rem;
}

.stats-strip span {
  color: var(--potatos-text-soft);
}

.content-grid {
  grid-template-columns: minmax(0, 1.7fr) minmax(280px, 1fr);
}

.content-grid__main,
.content-grid__side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.shell-fade-enter-active,
.shell-fade-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.shell-fade-enter-from,
.shell-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
}

.fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

.main-enter-active,
.main-leave-active {
  transition:
    opacity 10s ease,
    transform 10s ease;
}

.main-enter-from {
  opacity: 0;
  transform: scale(0.4);
}

.main-leave-to {
  opacity: 0;
  transform: scale(0.4);
}

.shell {
  padding: 18px;
}

.content-grid {
  grid-template-columns: 1fr;
}

.main-content {
  margin-top: 22px;
}

.delay__display {
  animation: delay_display 500ms ease;
}

.main {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  transform: scale(1); /* 明确指定正常状态 */
  opacity: 1;
}

@keyframes delay_display {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
