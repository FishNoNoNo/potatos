export interface TodoItem {
  id: string;
  title: string;
  description: string;
  start_time: string;
  notify_before_minutes: number;
  completed: boolean;
  reminded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TodoDraft {
  title: string;
  description: string;
  start_time: string;
  notify_before_minutes: number;
}

export interface PotatosSettings {
  theme_key: string;
  autostart_enabled: boolean;
  sound_key: string;
  default_notify_before_minutes: number;
  window_x: number;
  window_y: number;
}

export interface BootstrapPayload {
  todos: TodoItem[];
  settings: PotatosSettings;
}

export interface ThemePreset {
  key: string;
  label: string;
  accent: string;
  accentSoft: string;
  accentStrong: string;
  panel: string;
  panelMuted: string;
  line: string;
  text: string;
  textSoft: string;
  glow: string;
  navBg: string;
  navActiveBg: string;
  navActiveText: string;
  navHoverBg: string;
  navBorder: string;
}

export const DEFAULT_SETTINGS: PotatosSettings = {
  theme_key: "graphite",
  autostart_enabled: false,
  sound_key: "pulse",
  default_notify_before_minutes: 0,
  window_x: 0,
  window_y: 0,
};

export const EMPTY_TODO_DRAFT: TodoDraft = {
  title: "",
  description: "",
  start_time: "",
  notify_before_minutes: 0,
};
