// src/composables/useTheme.ts
import { ref, onMounted } from "vue";

const THEME_KEY = "theme";

type Theme = "dark" | "light";

export function useTheme() {
  const currentTheme = ref<Theme>("dark");

  const setTheme = (theme: Theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  };

  const toggleDarkMode = () => {
    const newTheme = currentTheme.value === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  onMounted(() => {
    // 从 localStorage 恢复主题
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    if (saved && ["light", "dark", "red"].includes(saved)) {
      setTheme(saved);
    } else {
      // 或根据系统偏好
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark");
      }
    }
  });

  return {
    currentTheme,
    setTheme,
    toggleDarkMode,
  };
}
