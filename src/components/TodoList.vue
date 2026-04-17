<script setup lang="ts">
import type { TodoItem } from "../service/models";
import { formatFullTime, formatTodoTime } from "../utils/datetime";

defineProps<{
  pendingTodos: TodoItem[];
  completedTodos: TodoItem[];
}>();

const emit = defineEmits<{
  edit: [todoId: string];
  remove: [todoId: string];
  toggle: [todo: TodoItem];
}>();
</script>

<template>
  <section class="todo-panel">
    <div class="todo-panel__header">
      <div>
        <p class="eyebrow">Timeline</p>
        <h2>待办清单</h2>
      </div>
      <div class="badge">{{ pendingTodos.length }} 项待处理</div>
    </div>

    <div class="todo-stack">
      <article v-for="todo in pendingTodos" :key="todo.id" class="todo-card">
        <div class="todo-card__top">
          <div>
            <p class="todo-card__time">{{ formatTodoTime(todo.start_time) }}</p>
            <h3>{{ todo.title }}</h3>
          </div>
          <button class="icon-button" type="button" @click="emit('toggle', todo)">完成</button>
        </div>
        <p class="todo-card__description">
          {{ todo.description || "没有额外描述，保持简单也很好。" }}
        </p>
        <div class="todo-card__footer">
          <span>提醒：提前 {{ todo.notify_before_minutes }} 分钟</span>
          <span>{{ formatFullTime(todo.start_time) }}</span>
        </div>
        <div class="todo-card__actions">
          <button class="ghost-button" type="button" @click="emit('edit', todo.id)">编辑</button>
          <button class="ghost-button danger" type="button" @click="emit('remove', todo.id)">删除</button>
        </div>
      </article>

      <div v-if="!pendingTodos.length" class="empty-state">
        <strong>今天的舞台是空的</strong>
        <span>创建一条 todo，让悬浮球开始发光。</span>
      </div>
    </div>

    <div v-if="completedTodos.length" class="history">
      <div class="history__header">
        <p class="eyebrow">Archive</p>
        <h3>已完成</h3>
      </div>
      <div class="history__list">
        <button
          v-for="todo in completedTodos"
          :key="todo.id"
          class="history__item"
          type="button"
          @click="emit('toggle', todo)"
        >
          <span>{{ todo.title }}</span>
          <small>{{ formatTodoTime(todo.start_time) }}</small>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.todo-panel {
  padding: 18px;
  border: 1px solid var(--potatos-line);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.03);
}

.todo-panel__header,
.history__header,
.todo-card__top,
.todo-card__footer,
.todo-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.badge {
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--potatos-accent-soft);
  color: var(--potatos-accent-strong);
  font-size: 0.78rem;
}

.todo-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.todo-card {
  border: 1px solid var(--potatos-line);
  border-radius: 24px;
  padding: 16px;
  background:
    radial-gradient(circle at top right, var(--potatos-accent-soft), transparent 36%), var(--potatos-panel-muted);
}

.todo-card__time,
.todo-card__footer span,
.empty-state span,
.history__item small {
  color: var(--potatos-text-soft);
}

.todo-card h3,
.history__header h3 {
  margin: 2px 0 0;
}

.todo-card__description {
  margin: 12px 0 14px;
  line-height: 1.6;
}

.todo-card__actions {
  margin-top: 14px;
}

.icon-button,
.ghost-button,
.history__item {
  border-radius: 14px;
  border: 1px solid var(--potatos-line);
  background: transparent;
  color: var(--potatos-text);
  padding: 10px 14px;
  cursor: pointer;
  font: inherit;
}

.danger {
  color: #ffab99;
}

.empty-state {
  padding: 18px;
  border: 1px dashed var(--potatos-line);
  border-radius: 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history {
  margin-top: 18px;
}

.history__list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history__item {
  width: 100%;
  justify-content: space-between;
  display: flex;
}
</style>
