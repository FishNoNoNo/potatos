export async function writeClipboard(text: string): Promise<boolean> {
  // 1. 优先尝试使用现代异步 API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.warn('现代 Clipboard API 失败，尝试降级方案...', err)
    }
  }

  // 2. 降级方案：使用 document.execCommand (兼容旧版移动端)
  return fallbackCopyTextToClipboard(text)
}

// 降级方案的具体实现
function fallbackCopyTextToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // 创建一个隐藏的 textarea 元素
    const textArea = document.createElement('textarea')
    textArea.value = text

    // 确保元素不可见但可以被选中
    textArea.style.position = 'fixed'
    textArea.style.top = '0'
    textArea.style.left = '0'
    textArea.style.width = '2em'
    textArea.style.height = '2em'
    textArea.style.padding = '0'
    textArea.style.border = 'none'
    textArea.style.outline = 'none'
    textArea.style.boxShadow = 'none'
    textArea.style.background = 'transparent'
    textArea.style.opacity = '0' // 使用 opacity 而不是 display:none，因为 display:none 无法聚焦

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      // 执行复制命令
      const successful = document.execCommand('copy')
      if (successful) {
        resolve(true)
      } else {
        reject(new Error('execCommand 执行失败'))
      }
    } catch (err) {
      console.error('降级方案也失败了', err)
      reject(err)
    } finally {
      // 清理 DOM
      document.body.removeChild(textArea)
    }
  })
}
