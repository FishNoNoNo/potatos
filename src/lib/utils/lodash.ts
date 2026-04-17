// utils/throttle.ts

/**
 * 防抖函数 (Debounce)
 * 延迟执行，如果在等待期间再次触发，重新计时
 *
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 * @param options 配置选项
 * @returns 防抖后的函数（含 cancel 方法）
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
  options: {
    leading?: boolean; // 首次是否立即执行
    trailing?: boolean; // 停止触发后是否执行最后一次（默认 true）
  } = {},
) {
  const { leading = false, trailing = true } = options;

  let timer: number | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime: number | null = null;

  const invoke = (context: any, args: Parameters<T>) => {
    lastCallTime = Date.now();
    fn.apply(context, args);
  };

  const debounced = function (this: any, ...args: Parameters<T>) {
    const now = Date.now();

    // 清除之前的定时器
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    // leading 模式：如果之前没调用过，立即执行
    if (leading) {
      const isFirstCall = lastCallTime === null;
      const shouldCall = isFirstCall || now - lastCallTime! >= delay;

      if (shouldCall) {
        invoke(this, args);
        lastCallTime = now;
        return;
      }
    }

    // 保存参数用于 trailing 执行
    lastArgs = args;

    // 设置新的定时器
    if (trailing) {
      timer = window.setTimeout(() => {
        // leading 模式下，如果已经执行过，这里不再执行
        if (!leading || lastArgs !== null) {
          invoke(this, lastArgs!);
        }
        lastArgs = null;
        timer = null;
      }, delay);
    }
  };

  // 取消方法
  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    lastArgs = null;
    lastCallTime = null;
  };

  // 立即执行方法（如果有待执行的）
  debounced.flush = () => {
    if (timer && lastArgs) {
      invoke(debounced, lastArgs);
      debounced.cancel();
    }
  };

  return debounced;
}

/**
 * 节流函数 (Throttle)
 * 固定时间间隔内只执行一次
 *
 * @param fn 要执行的函数
 * @param limit 时间限制（毫秒）
 * @param options 配置选项
 * @returns 节流后的函数（含 cancel 方法）
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 300,
  options: {
    leading?: boolean; // 首次是否执行（默认 true）
    trailing?: boolean; // 结束后是否执行最后一次（默认 true）
  } = {},
) {
  const { leading = true, trailing = true } = options;

  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const invoke = (context: any, args: Parameters<T>) => {
    fn.apply(context, args);
  };

  const throttled = function (this: any, ...args: Parameters<T>) {
    // 如果在节流期间，记录最后一次参数
    if (inThrottle) {
      lastArgs = args;
      return;
    }

    // leading 执行
    if (leading) {
      invoke(this, args);
    } else {
      lastArgs = args;
    }

    inThrottle = true;

    timer = setTimeout(() => {
      // trailing 执行
      if (trailing && lastArgs && !leading) {
        invoke(this, lastArgs);
      }

      inThrottle = false;
      lastArgs = null;
      timer = null;
    }, limit);
  };

  // 取消方法
  throttled.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    inThrottle = false;
    lastArgs = null;
  };

  return throttled;
}
