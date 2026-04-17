import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { confirm } from "@tauri-apps/plugin-dialog";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";
import {
  disable as disableAutostart,
  enable as enableAutostart,
  isEnabled as isAutostartEnabled,
} from "@tauri-apps/plugin-autostart";
import { LogicalSize, PhysicalPosition } from "@tauri-apps/api/dpi";
import { getCurrentWindow, currentMonitor, type Monitor } from "@tauri-apps/api/window";
import * as settingsService from "../service/settings.service";
import * as todoService from "../service/todo.service";
import {
  DEFAULT_SETTINGS,
  EMPTY_TODO_DRAFT,
  type PotatosSettings,
  type ThemePreset,
  type TodoDraft,
  type TodoItem,
} from "../service/models";
import { isTodoDue, isUpcomingToday } from "../utils/datetime";
import { playReminderSound } from "../utils/sound";
import { applyTheme, getThemePreset } from "../utils/theme";
import { startCheckActive } from "@/service/active.service";
import { TauriEvent } from "@tauri-apps/api/event";
import { isFirst, setFirst } from "@/service/tauri.service";

const EXPANDED_SIZE = { width: 530, height: 760 };
const COMPACT_SIZE = { width: 118, height: 118 };

export const useAppStore = defineStore("potatos-app", () => {
  const todos = ref<TodoItem[]>([]);
  const settings = ref<PotatosSettings>({ ...DEFAULT_SETTINGS });
  const hydrated = ref(false);
  const shellExpanded = ref(false);
  const editingTodoId = ref<string | null>(null);
  const reminderIds = ref<string[]>([]);
  const reminding = ref(false);
  let reminderTimer: number | null = null;

  const currentTheme = computed<ThemePreset>(() => getThemePreset(settings.value.theme_key));
  const todayTodos = computed(() =>
    [...todos.value]
      .filter((item) => isUpcomingToday(item.start_time))
      .sort((left, right) => left.start_time.localeCompare(right.start_time)),
  );
  const pendingTodos = computed(() =>
    [...todos.value]
      .filter((item) => !item.completed)
      .sort((left, right) => left.start_time.localeCompare(right.start_time)),
  );
  const completedTodos = computed(() =>
    [...todos.value]
      .filter((item) => item.completed)
      .sort((left, right) => right.updated_at.localeCompare(left.updated_at)),
  );
  const editingTodo = computed(() => todos.value.find((item) => item.id === editingTodoId.value) ?? null);

  let syncTimer: number | null = null;

  async function syncData() {
    const payload = await settingsService.getBootstrapData();
    todos.value = payload.todos;
    settings.value = payload.settings;
    tempWindowPosition = { x: settings.value.window_x, y: settings.value.window_y };
  }

  function startSyncLoop() {
    if (syncTimer) {
      clearInterval(syncTimer);
      syncTimer = null;
    }
    syncTimer = window.setInterval(async () => {
      await syncData();
    }, 3000);
  }

  const unlisteners: (() => void)[] = [];

  async function hydrate() {
    if (hydrated.value) {
      return;
    }

    await syncData();
    applyTheme(settings.value.theme_key);
    hydrated.value = true;
    startReminderLoop();
    startSyncLoop();
    startCheckActive();
    await setWindowCompactMode(true);

    const unlisten = await getCurrentWindow().listen(TauriEvent.WINDOW_BLUR, async () => {
      console.log("拖拽结束（窗口失去焦点）");
      if (shellExpanded.value) {
        console.log("拖拽结束，不保存位置");
        return;
      }
      const position = await getCurrentWindow().outerPosition();
      const { x, y } = position;
      console.log("拖拽结束，保存位置", x, y);
      tempWindowPosition = { x, y };

      patchSettings({
        window_x: x,
        window_y: y,
      });
    });
    unlisteners.push(unlisten);

    await getCurrentWindow().listen("tauri://close-requested", () => {
      unlisteners.forEach((unlisten) => unlisten());
    });

    const isFirstRun = await isFirst();
    console.log(isFirstRun);
    if (isFirstRun) {
      console.log(settings.value.autostart_enabled);
      patchSettings({
        autostart_enabled: true,
      });
      settings.value.autostart_enabled = true;
      await syncAutostartState(settings.value.autostart_enabled);
      console.log(settings.value.autostart_enabled);

      await setFirst();
    }
  }

  async function createTodo(payload: TodoDraft) {
    const todo = await todoService.createTodo(payload);
    todos.value = [todo, ...todos.value];
  }

  async function updateTodo(id: string, payload: TodoDraft) {
    const updated = await todoService.updateTodo(id, payload);
    todos.value = todos.value.map((item) => (item.id === id ? updated : item));
    editingTodoId.value = null;
  }

  async function removeTodo(id: string) {
    await todoService.deleteTodo(id);
    todos.value = todos.value.filter((item) => item.id !== id);
  }

  async function toggleTodoCompleted(todo: TodoItem) {
    const updated = await todoService.setTodoCompleted(todo.id, !todo.completed);
    todos.value = todos.value.map((item) => (item.id === todo.id ? updated : item));
  }

  async function saveSettings(nextSettings: PotatosSettings) {
    settings.value = await settingsService.saveSettings(nextSettings);
    applyTheme(settings.value.theme_key);
    await syncAutostartState(settings.value.autostart_enabled);
  }

  async function patchSettings(patch: Partial<PotatosSettings>) {
    await saveSettings({
      ...settings.value,
      ...patch,
    });
  }

  function startEditing(todoId: string) {
    editingTodoId.value = todoId;
  }

  function cancelEditing() {
    editingTodoId.value = null;
  }

  let tempWindowPosition = { x: 0, y: 0 };

  async function expandShell() {
    shellExpanded.value = true;
    await setWindowExpandedMode();
  }

  async function collapseShell() {
    shellExpanded.value = false;
    editingTodoId.value = null;
    await setWindowCompactMode();
  }

  async function setWindowExpandedMode() {
    const currentWindow = getCurrentWindow();
    await currentWindow.setResizable(false);
    await currentWindow.setAlwaysOnTop(true);
    const position = await currentWindow.outerPosition();
    const { x, y } = position;
    tempWindowPosition = { x, y };
    const monitor = await currentMonitor();
    if (!monitor) {
      console.error("monitor is null");
      return;
    }
    const scaleFactor = monitor.scaleFactor;

    // 将逻辑尺寸转换为物理尺寸
    const physicalWidth = Math.round(EXPANDED_SIZE.width * scaleFactor);
    const physicalHeight = Math.round(EXPANDED_SIZE.height * scaleFactor);
    const { x: softX, y: softY } = softWindowPosition(x, y, physicalWidth, physicalHeight, monitor);
    await currentWindow.setPosition(new PhysicalPosition({ x: softX, y: softY }));
    await currentWindow.setSize(new LogicalSize(EXPANDED_SIZE.width, EXPANDED_SIZE.height));

    // await currentWindow.center();
  }

  function softWindowPosition(x: number, y: number, w: number, h: number, monitor: Monitor) {
    if (x + w > monitor.position.x + monitor.size.width) {
      // 右边超出
      x = monitor.position.x + monitor.size.width - w;
    }
    if (y + h > monitor.position.y + monitor.size.height) {
      // 下边超出
      y = monitor.position.y + monitor.size.height - h;
    }

    return { x, y };
  }

  function softWinfowPositionCompact(x: number, y: number, monitor: Monitor) {
    let { x: newX, y: newY } = tempWindowPosition;
    const scaleFactor = monitor.scaleFactor;
    const physicalCompactWidth = Math.round(COMPACT_SIZE.width * scaleFactor);
    const physicalCompactHeight = Math.round(COMPACT_SIZE.height * scaleFactor);
    const physicalExpandedWidth = Math.round(EXPANDED_SIZE.width * scaleFactor);
    const physicalExpandedHeight = Math.round(EXPANDED_SIZE.height * scaleFactor);
    if (newX + physicalCompactWidth > x + physicalExpandedWidth || newX < x) {
      newX = x;
    }
    if (newY + physicalCompactHeight > y + physicalExpandedHeight || newY < y) {
      newY = y;
    }
    if (newX < 0) {
      newX = 0;
    } else if (newX + physicalCompactWidth > monitor.size.width + monitor.position.x) {
      newX = monitor.size.width + monitor.position.x - physicalCompactWidth;
    }
    if (newY < 0) {
      newY = 0;
    } else if (newY + physicalCompactHeight > monitor.size.height + monitor.position.y) {
      newY = monitor.size.height + monitor.position.y - physicalCompactHeight;
    }
    return { x: newX, y: newY };
  }

  async function setWindowCompactMode(first?: boolean) {
    const currentWindow = getCurrentWindow();
    await currentWindow.setResizable(false);
    await currentWindow.setAlwaysOnTop(true);
    if (!first) {
      const position = await currentWindow.outerPosition();
      const { x, y } = position;
      const monitor = await currentMonitor();
      if (!monitor) {
        console.error("monitor is null");
        return;
      }
      const { x: softX, y: softY } = softWinfowPositionCompact(x, y, monitor);
      await currentWindow.setPosition(new PhysicalPosition({ x: softX, y: softY }));
    } else {
      await currentWindow.setPosition(new PhysicalPosition(tempWindowPosition));
    }
    await currentWindow.setSize(new LogicalSize(COMPACT_SIZE.width, COMPACT_SIZE.height));
  }

  async function moveWindowToSide() {
    const currentWindow = getCurrentWindow();
    const position = await currentWindow.outerPosition();
    const { x, y } = position;
    const monitor = await currentMonitor();
    if (!monitor) {
      console.error("monitor is null");
      return;
    }
    let newX = x;
    if (monitor.position.x > 0) {
      const scaleFactor = monitor.scaleFactor;
      const physicalCompactWidth = Math.round(COMPACT_SIZE.width * scaleFactor);
      newX = monitor.position.x + monitor.size.width - physicalCompactWidth;
    } else {
      newX = 0;
    }
    await currentWindow.setPosition(new PhysicalPosition({ x: newX, y: y }));
  }

  async function syncAutostartState(enabled: boolean) {
    try {
      const current = await isAutostartEnabled();
      if (enabled && !current) {
        await enableAutostart();
      }
      if (!enabled && current) {
        await disableAutostart();
      }
    } catch (error) {
      console.warn("autostart sync failed", error);
    }
  }

  function startReminderLoop() {
    if (reminderTimer) {
      window.clearInterval(reminderTimer);
    }

    reminderTimer = window.setInterval(() => {
      void checkReminders();
    }, 20_000);

    void checkReminders();
  }

  async function checkReminders() {
    const dueTodos = pendingTodos.value.filter(
      (item) =>
        !item.reminded_at &&
        !reminderIds.value.includes(item.id) &&
        isTodoDue(item.start_time, item.notify_before_minutes),
    );

    for (const todo of dueTodos) {
      reminderIds.value = [...reminderIds.value, todo.id];
      await triggerReminder(todo);
      reminderIds.value = reminderIds.value.filter((item) => item !== todo.id);
    }
  }

  async function triggerReminder(todo: TodoItem) {
    await requestNotificationPermission();
    const stop = await playReminderSound(settings.value.sound_key);
    let hasCompleted = false;
    try {
      try {
        await sendNotification({
          title: `Potatos 提醒: ${todo.title}`,
          body: todo.description || "该任务到提醒时间了。",
        });
      } catch (error) {
        console.warn("notification failed", error);
      }

      hasCompleted = await confirm(`${todo.title}\n\n提醒时间已到\n\n${todo.description}\n\n是否完成?`, {
        title: "Potatos 提醒",
        okLabel: "完成",
        cancelLabel: "未完成",
      });
    } finally {
      stop && stop();
    }

    if (hasCompleted) {
      await toggleTodoCompleted(todo);
      return;
    }

    const updated = await todoService.markTodoReminded(todo.id);
    todos.value = todos.value.map((item) => (item.id === todo.id ? updated : item));
  }

  async function requestNotificationPermission() {
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === "granted";
    }
    return permissionGranted;
  }

  return {
    reminding,
    completedTodos,
    currentTheme,
    editingTodo,
    editingTodoId,
    hydrated,
    pendingTodos,
    settings,
    shellExpanded,
    todayTodos,
    todos,
    cancelEditing,
    collapseShell,
    createTodo,
    expandShell,
    hydrate,
    patchSettings,
    removeTodo,
    saveSettings,
    setTodoCompleted: toggleTodoCompleted,
    startEditing,
    updateTodo,
    moveWindowToSide,
  };
});

export function createDraftFromTodo(todo: TodoItem | null, defaultNotifyBeforeMinutes: number): TodoDraft {
  if (!todo) {
    return {
      ...EMPTY_TODO_DRAFT,
      notify_before_minutes: defaultNotifyBeforeMinutes,
    };
  }

  return {
    title: todo.title,
    description: todo.description,
    start_time: todo.start_time,
    notify_before_minutes: todo.notify_before_minutes,
  };
}
