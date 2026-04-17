export function formatTime(date: Date | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return ''
  if (typeof date === 'string') date = new Date(date)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化时间差
 * @param date 日期对象或日期字符串
 * @param format 超过一周时显示的日期格式，默认为 'YYYY-MM-DD'
 * @returns 例如: "刚刚", "1分钟前", "昨天", "2天前", "1周前", "2023-10-01"
 */
export function formatTimeAgo(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  if (!date) return ''
  if (typeof date === 'string') date = new Date(date)

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  // 如果时间在未来，或者无效，直接返回格式化日期
  if (diffMs < 0) return formatTime(date, format)

  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)

  // 1. 1分钟内
  if (diffSec < 60) {
    return '刚刚'
  }

  // 2. 1小时内 (例如: 5分钟前)
  if (diffMin < 60) {
    return `${diffMin}分钟前`
  }

  // 3. 24小时内 (例如: 2小时前)
  if (diffHour < 24) {
    return `${diffHour}小时前`
  }

  // 4. 昨天
  if (diffDay === 1) {
    return '昨天'
  }

  // 5. 7天内 (例如: 2天前, 6天前)
  if (diffDay < 7) {
    return `${diffDay}天前`
  }

  // 6. 7天到30天内 (例如: 1周前, 2周前)
  // 这里可以根据需求调整，如果超过1周就要显示日期，可以把下面的逻辑删掉，直接 return formatTime(...)
  if (diffWeek < 4) {
    return `${diffWeek}周前`
  }

  // 7. 超过一周 (或者超过一个月)，直接显示具体日期
  return formatTime(date, format)
}
