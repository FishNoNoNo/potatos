import type { ThemePreset } from "../service/models";

export const THEME_PRESETS: ThemePreset[] = [
  {
    key: "graphite",
    label: "曜石黑",
    accent: "#8db5ff",
    accentSoft: "rgba(141, 181, 255, 0.18)",
    accentStrong: "#d4e4ff",
    panel: "rgba(12, 14, 19, 0.88)",
    panelMuted: "rgba(20, 24, 32, 0.9)",
    line: "rgba(255, 255, 255, 0.12)",
    text: "#f5f7fb",
    textSoft: "rgba(245, 247, 251, 0.72)",
    glow: "rgba(120, 159, 255, 0.42)",
    // 导航栏样式
    navBg: "rgba(8, 10, 14, 0.92)",
    navActiveBg: "rgba(100, 116, 139, 0.85)",
    navActiveText: "#ffffff", // 改为纯白色，更清晰
    navHoverBg: "rgba(100, 116, 139, 0.82)",
    navBorder: "rgba(255, 255, 255, 0.06)",
  },
  {
    key: "aurora",
    label: "极光绿",
    accent: "#73f0c2",
    accentSoft: "rgba(115, 240, 194, 0.18)",
    accentStrong: "#d7fff2",
    panel: "rgba(8, 18, 18, 0.88)",
    panelMuted: "rgba(17, 31, 29, 0.92)",
    line: "rgba(255, 255, 255, 0.1)",
    text: "#f3fffb",
    textSoft: "rgba(243, 255, 251, 0.72)",
    glow: "rgba(68, 226, 176, 0.35)",
    // 导航栏样式
    navBg: "rgba(4, 12, 12, 0.94)",
    navActiveBg: "rgba(115, 240, 194, 0.85)",
    navActiveText: "#ffffff", // 改为纯白色，更清晰
    navHoverBg: "rgba(115, 240, 194, 0.82)",
    navBorder: "rgba(255, 255, 255, 0.06)",
  },
  {
    key: "ember",
    label: "余烬红",
    accent: "#ff8f6b",
    accentSoft: "rgba(255, 143, 107, 0.18)",
    accentStrong: "#ffe0d5",
    panel: "rgba(23, 12, 10, 0.9)",
    panelMuted: "rgba(37, 20, 17, 0.92)",
    line: "rgba(255, 255, 255, 0.12)",
    text: "#fff7f4",
    textSoft: "rgba(255, 247, 244, 0.72)",
    glow: "rgba(255, 122, 82, 0.38)",
    // 导航栏样式
    navBg: "rgba(18, 8, 6, 0.94)",
    navActiveBg: "rgba(255, 143, 107, 0.85)",
    navActiveText: "#ffffff", // 改为纯白色，更清晰
    navHoverBg: "rgba(255, 143, 107, 0.82)",
    navBorder: "rgba(255, 255, 255, 0.06)",
  },
  {
    key: "ocean",
    label: "深海蓝",
    accent: "#5bc9ff",
    accentSoft: "rgba(91, 201, 255, 0.18)",
    accentStrong: "#d6f4ff",
    panel: "rgba(8, 15, 24, 0.9)",
    panelMuted: "rgba(15, 28, 40, 0.94)",
    line: "rgba(255, 255, 255, 0.12)",
    text: "#f4fbff",
    textSoft: "rgba(244, 251, 255, 0.72)",
    glow: "rgba(75, 187, 255, 0.4)",
    // 导航栏样式
    navBg: "rgba(4, 10, 18, 0.94)",
    navActiveBg: "rgba(91, 201, 255, 0.85)",
    navActiveText: "#ffffff", // 改为纯白色，更清晰
    navHoverBg: "rgba(91, 201, 255, 0.82)",
    navBorder: "rgba(255, 255, 255, 0.06)",
  },
];

export function getThemePreset(themeKey: string) {
  return THEME_PRESETS.find((item) => item.key === themeKey) ?? THEME_PRESETS[0];
}

export function applyTheme(themeKey: string) {
  const theme = getThemePreset(themeKey);
  const root = document.documentElement;

  root.style.setProperty("--potatos-accent", theme.accent);
  root.style.setProperty("--potatos-accent-soft", theme.accentSoft);
  root.style.setProperty("--potatos-accent-strong", theme.accentStrong);
  root.style.setProperty("--potatos-panel", theme.panel);
  root.style.setProperty("--potatos-panel-muted", theme.panelMuted);
  root.style.setProperty("--potatos-line", theme.line);
  root.style.setProperty("--potatos-text", theme.text);
  root.style.setProperty("--potatos-text-soft", theme.textSoft);
  root.style.setProperty("--potatos-glow", theme.glow);

  // 新增导航栏变量
  root.style.setProperty("--potatos-nav-bg", theme.navBg);
  root.style.setProperty("--potatos-nav-active-bg", theme.navActiveBg);
  root.style.setProperty("--potatos-nav-active-text", theme.navActiveText);
  root.style.setProperty("--potatos-nav-hover-bg", theme.navHoverBg);
  root.style.setProperty("--potatos-nav-border", theme.navBorder);
}
