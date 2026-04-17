import { invoke } from "@tauri-apps/api/core";
import type { BootstrapPayload, PotatosSettings, TodoDraft, TodoItem } from "./models";

export function getBootstrapData() {
  return invoke<BootstrapPayload>("get_bootstrap_data");
}

export function createTodo(payload: TodoDraft) {
  return invoke<TodoItem>("create_todo", { payload });
}

export function updateTodo(id: string, payload: TodoDraft) {
  return invoke<TodoItem>("update_todo", { id, payload });
}

export function deleteTodo(id: string) {
  return invoke<void>("delete_todo", { id });
}

export function setTodoCompleted(id: string, completed: boolean) {
  return invoke<TodoItem>("set_todo_completed", { id, completed });
}

export function markTodoReminded(id: string) {
  return invoke<TodoItem>("mark_todo_reminded", { id });
}

export function saveSettings(payload: PotatosSettings) {
  return invoke<PotatosSettings>("save_settings", { payload });
}

export function isFirst() {
  return invoke<boolean>("is_first");
}

export function setFirst() {
  return invoke<void>("set_first");
}
