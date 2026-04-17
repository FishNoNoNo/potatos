import * as tauriService from "./tauri.service";
import type { TodoDraft } from "./models";

export function createTodo(payload: TodoDraft) {
  return tauriService.createTodo(payload);
}

export function updateTodo(id: string, payload: TodoDraft) {
  return tauriService.updateTodo(id, payload);
}

export function deleteTodo(id: string) {
  return tauriService.deleteTodo(id);
}

export function setTodoCompleted(id: string, completed: boolean) {
  return tauriService.setTodoCompleted(id, completed);
}

export function markTodoReminded(id: string) {
  return tauriService.markTodoReminded(id);
}
