<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { TodoDraft, TodoItem } from "../service/models";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "../utils/datetime";
import CustomSelect from "./CustomSelect.vue";

const props = defineProps<{
  editingTodo: TodoItem | null;
  defaultNotifyBeforeMinutes: number;
  submitting: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: TodoDraft, todoId?: string];
  cancel: [];
}>();

const form = reactive({
  title: "",
  description: "",
  startTime: "",
  notifyBeforeMinutes: 0,
});

const titleText = computed(() => (props.editingTodo ? "编辑 Todo" : "创建 Todo"));
const actionText = computed(() => (props.editingTodo ? "保存修改" : "加入清单"));

const reminderOptions = [
  { value: 0, label: "准点提醒" },
  { value: 5, label: "提前 5 分钟" },
  { value: 10, label: "提前 10 分钟" },
  { value: 15, label: "提前 15 分钟" },
  { value: 30, label: "提前 30 分钟" },
  { value: 60, label: "提前 1 小时" },
];

watch(
  () => props.editingTodo,
  (todo) => {
    form.title = todo?.title ?? "";
    form.description = todo?.description ?? "";
    form.startTime = todo ? toDatetimeLocalValue(todo.start_time) : "";
    form.notifyBeforeMinutes = todo?.notify_before_minutes ?? props.defaultNotifyBeforeMinutes;
  },
  { immediate: true },
);

watch(
  () => props.defaultNotifyBeforeMinutes,
  (value) => {
    if (!props.editingTodo) {
      form.notifyBeforeMinutes = value;
    }
  },
);

function onSubmit() {
  if (!form.title.trim() || !form.startTime) {
    return;
  }

  emit(
    "submit",
    {
      title: form.title.trim(),
      description: form.description.trim(),
      start_time: fromDatetimeLocalValue(form.startTime),
      notify_before_minutes: Number(form.notifyBeforeMinutes) || 0,
    },
    props.editingTodo?.id,
  );

  if (!props.editingTodo) {
    form.title = "";
    form.description = "";
    form.startTime = "";
  }
}
</script>

<template>
  <section class="composer">
    <div class="composer__header">
      <div>
        <p class="eyebrow">Quick Studio</p>
        <h2>{{ titleText }}</h2>
      </div>
      <button v-if="editingTodo" class="ghost-button" type="button" @click="emit('cancel')">取消编辑</button>
    </div>

    <label class="field">
      <span>标题</span>
      <input v-model="form.title" maxlength="80" placeholder="例如：整理本周产品文档" type="text" />
    </label>

    <label class="field">
      <span>描述</span>
      <textarea v-model="form.description" maxlength="240" placeholder="给未来的自己留一点上下文" rows="3" />
    </label>

    <div class="field-grid">
      <label class="field">
        <span>开始时间</span>
        <input v-model="form.startTime" type="datetime-local" />
      </label>
      <label class="field">
        <span>提前提醒</span>
        <!-- <select v-model="form.notifyBeforeMinutes">
          <option :value="0">准点提醒</option>
          <option :value="5">提前 5 分钟</option>
          <option :value="10">提前 10 分钟</option>
          <option :value="15">提前 15 分钟</option>
          <option :value="30">提前 30 分钟</option>
          <option :value="60">提前 1 小时</option>
        </select> -->
        <CustomSelect v-model="form.notifyBeforeMinutes" :options="reminderOptions" />
      </label>
    </div>

    <button class="primary-button" :disabled="submitting" type="button" @click="onSubmit">
      {{ actionText }}
    </button>
  </section>
</template>

<style scoped lang="scss">
input,
textarea,
select {
  box-sizing: border-box;

  transition:
    border-color 300ms ease,
    box-shadow 300ms ease;

  &:focus {
    border-color: var(--potatos-accent);
    box-shadow: 0 0 0 2px var(--potatos-glow);
  }
}
.composer {
  padding: 18px;
  border: 1px solid var(--potatos-line);
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  backdrop-filter: blur(12px);
}

.composer__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.eyebrow {
  margin: 0 0 4px;
  color: var(--potatos-text-soft);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 0.72rem;
}

h2 {
  margin: 0;
  font-size: 1.2rem;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.field span {
  font-size: 0.82rem;
  color: var(--potatos-text-soft);
}

.field input,
.field textarea,
.field select {
  width: 100%;
  border: 1px solid var(--potatos-line);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--potatos-text);
  padding: 12px 14px;
  font: inherit;
  outline: none;
}

input[type="datetime-local"] {
  // 使用主题变量
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--potatos-line);
  border-radius: 16px;
  color: var(--potatos-text);
  padding: 12px 14px;
  font: inherit;
  outline: none;
  transition: all 300ms ease;

  // 强制使用深色模式样式（适配你的深色主题）
  color-scheme: dark;

  // WebKit 浏览器（Chrome, Edge, Safari）
  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
    padding: 4px;
    border-radius: 8px;
    transition: all 300ms ease;
    // 使用 filter 让图标适配主题色
    filter: brightness(0) invert(1);
    opacity: 0.6;

    &:hover {
      opacity: 1;
      background-color: var(--potatos-accent-soft);
    }
  }

  // 聚焦状态
  &:focus {
    border-color: var(--potatos-accent);
    box-shadow: 0 0 0 2px var(--potatos-glow);

    &::-webkit-calendar-picker-indicator {
      opacity: 1;
      filter: brightness(0) invert(1);
    }
  }

  // 悬停状态
  &:hover {
    border-color: var(--potatos-accent-soft);

    &::-webkit-calendar-picker-indicator {
      opacity: 0.8;
    }
  }

  // 禁用状态
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &::-webkit-calendar-picker-indicator {
      cursor: not-allowed;
      opacity: 0.3;
    }
  }
}

// Firefox 浏览器适配
@-moz-document url-prefix() {
  input[type="datetime-local"] {
    &::-moz-datetime-edit-fields-wrapper {
      color: var(--potatos-text);
      padding: 0;
    }

    &::-moz-datetime-edit-text {
      color: var(--potatos-text-soft);
      padding: 0 2px;
    }

    &::-moz-datetime-edit-month-field,
    &::-moz-datetime-edit-day-field,
    &::-moz-datetime-edit-year-field,
    &::-moz-datetime-edit-hour-field,
    &::-moz-datetime-edit-minute-field {
      color: var(--potatos-text);
      padding: 0 2px;

      &:focus {
        background-color: var(--potatos-accent);
        color: #0a0c0f;
        border-radius: 4px;
      }
    }
  }
}

// 下拉框样式
select {
  cursor: pointer;
  appearance: none;
}

select option {
  background: var(--potatos-panel);
  color: var(--potatos-text);
  padding: 10px;

  &:hover {
    background: var(--potatos-accent-soft);
  }

  &:checked {
    background: linear-gradient(135deg, var(--potatos-accent), var(--potatos-accent-strong));
    color: #0a0c0f;
  }
}

// 针对不同的主题模式优化日期选择器图标颜色
@media (prefers-color-scheme: dark) {
  input[type="datetime-local"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
    opacity: 0.6;
  }
}

// 或者根据实际主题亮度动态调整
// 如果主题是深色背景，使用亮色图标
input[type="datetime-local"] {
  &::-webkit-calendar-picker-indicator {
    filter: brightness(0) invert(1);
  }
}

.field textarea {
  resize: vertical;
  min-height: 88px;
}

.primary-button,
.ghost-button {
  border-radius: 16px;
  font: inherit;
  cursor: pointer;
  transition:
    transform 300ms ease,
    border-color 300ms ease;
}

.primary-button {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: linear-gradient(135deg, var(--potatos-accent), var(--potatos-accent-strong));
  color: #0a0c0f;
  font-weight: 700;
}

.ghost-button {
  padding: 10px 14px;
  border: 1px solid var(--potatos-line);
  background: transparent;
  color: var(--potatos-text-soft);
}

@media (max-width: 640px) {
  .field-grid {
    grid-template-columns: 1fr;
  }
}
</style>
