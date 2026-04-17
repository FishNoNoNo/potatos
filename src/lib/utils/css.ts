export const getCssVar = (name: string) => {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#5470c6' // 提供默认值
}
