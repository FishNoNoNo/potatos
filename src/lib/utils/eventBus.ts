// 定义类型别名，提高代码可读性
type EventCallback = (...args: any[]) => void

class EventEmitter {
  // 使用 Record 类型定义 events，键为字符串，值为回调函数数组
  private events: Record<string, EventCallback[]>

  constructor() {
    this.events = {}
  }

  /**
   * 监听事件
   * @param event - 事件名称
   * @param fn - 回调函数
   * @returns this (支持链式调用)
   */
  on(event: string, fn: EventCallback): this {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(fn)
    console.log('handler count:', event, this.events[event].length)
    return this
  }

  /**
   * 触发事件
   * @param event - 事件名称
   * @param args - 传递给回调的参数
   */
  emit(event: string, ...args: any[]): this {
    const handlers = this.events[event]
    if (handlers) {
      // 🚀 优化点 1: 使用 slice() 或 [...handlers] 拷贝数组
      // 防止在回调执行过程中 removeEventListener 导致数组索引错乱
      handlers.slice().forEach((fn) => {
        try {
          fn.apply(this, args)
        } catch (error) {
          console.error(`EventEmitter error on event "${event}":`, error)
        }
      })
    }
    return this
  }

  /**
   * 移除事件监听
   * @param event - 事件名称
   * @param fn - 指定要移除的回调，不传则移除所有
   */
  off(event: string, fn?: EventCallback): this {
    const handlers = this.events[event]
    if (!handlers) return this

    if (!fn) {
      // 🧹 优化点 2: 直接删除属性，释放内存
      delete this.events[event]
    } else {
      const index = handlers.indexOf(fn)
      if (index > -1) {
        handlers.splice(index, 1)
        // 🧹 优化点 3: 如果该事件没有监听器了，删除该键，防止内存泄漏
        if (handlers.length === 0) {
          delete this.events[event]
        }
      }
    }
    return this
  }

  /**
   * 监听一次性事件
   */
  once(event: string, fn: EventCallback): this {
    const wrapper = (...args: any[]) => {
      fn.apply(this, args)
      this.off(event, wrapper)
    }
    // 可以在 wrapper 上标记原始函数，方便调试或特殊移除（可选）
    // (wrapper as any)._original = fn;
    this.on(event, wrapper)
    return this
  }
}
const bus = new EventEmitter()

export default bus
