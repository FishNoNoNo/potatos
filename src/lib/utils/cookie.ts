export function getCookie(name: string): string | null {
  const nameEQ = encodeURIComponent(name) + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    const cookiePart = ca[i]
    if (typeof cookiePart !== 'string') continue
    const c = cookiePart.trim()
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length))
    }
  }
  return null
}

export function setCookie(
  name: string,
  value: string,
  options: {
    expires?: Date | number
    path?: string
    domain?: string
    secure?: boolean
    unit?: 's' | 'm' | 'h' | 'd' // 限制单位类型，增加代码提示
  } = {},
) {
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

  if (options.expires) {
    // 1. 确定单位，默认为 'd' (天)
    const unit = options.unit || 'd'

    // 2. 定义不同单位对应的毫秒数
    const timeMap = {
      s: 1000, // 秒
      m: 1000 * 60, // 分
      h: 1000 * 60 * 60, // 小时
      d: 864e5, // 天
    }

    let expiresDate: Date

    if (options.expires instanceof Date) {
      // 如果直接传入 Date 对象，直接使用
      expiresDate = options.expires
    } else {
      // 如果是数字，根据单位计算具体的过期时间
      const multiplier = timeMap[unit] || timeMap['d'] // 防止非法单位，回退到天
      const milliseconds = options.expires * multiplier
      expiresDate = new Date(Date.now() + milliseconds)
    }

    cookieString += `; expires=${expiresDate.toUTCString()}`
  }

  if (options.path) cookieString += `; path=${options.path}`
  if (options.domain) cookieString += `; domain=${options.domain}`
  if (options.secure) cookieString += '; secure'

  document.cookie = cookieString
}

export function deleteCookie(name: string, path = '/', domain?: string) {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domain ? `; domain=${domain}` : ''}`
}

export function hasCookie(name: string): boolean {
  const cookie = getCookie(name)
  if (cookie) {
    if (cookie === 'undefined' || cookie === 'null') {
      deleteCookie(name)
      return false
    }
  }
  return !!cookie
}
