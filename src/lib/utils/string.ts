export function strToCamel(str: string) {
  return str.replace(/_([a-z])/g, (g) => (g[1] ? g[1].toUpperCase() : ''))
}

export function toCamel(o: unknown): unknown {
  if (typeof o !== 'object' || o === null) return o

  if (Array.isArray(o)) {
    return o.map((item) => toCamel(item))
  }

  const newObj: Record<string, unknown> = {}
  for (const key in o) {
    if (Object.prototype.hasOwnProperty.call(o, key)) {
      const camelKey = strToCamel(key)
      newObj[camelKey] = toCamel((o as Record<string, unknown>)[key])
    }
  }
  return newObj
}

export function strToSnake(str: string) {
  return str.replace(/([A-Z])/g, (g) => `_${g[0] ? g[0].toLowerCase() : ''}`)
}

export function toSnake(o: unknown): unknown {
  if (typeof o !== 'object' || o === null) return o

  if (Array.isArray(o)) {
    return o.map((item) => toSnake(item))
  }

  const newObj: Record<string, unknown> = {}
  for (const key in o) {
    if (Object.prototype.hasOwnProperty.call(o, key)) {
      const snakeKey = strToSnake(key)
      newObj[snakeKey] = toSnake((o as Record<string, unknown>)[key])
    }
  }
  return newObj
}
