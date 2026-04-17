import { throttle } from './lodash'

interface ListData {
  page: number
  pagesize: number
  total: number
  loading?: boolean // 添加加载状态
}

/**
 * 滚动加载节流函数
 * @param target 滚动容器
 * @param listData 列表数据状态
 * @param callback 加载回调函数
 * @param threshold 触发阈值，默认100px
 */
export const onScroll = throttle(
  (
    target: HTMLElement | null,
    listData: ListData,
    callback: () => void,
    threshold: number = 100,
  ) => {
    let loaded = false
    const executeLoad = (isStopCheck: boolean = false) => {
      // 1. 基础校验
      if (!target || listData.loading) return

      // 2. 判断是否已经加载完所有数据
      const loadedCount = listData.page * listData.pagesize
      if (listData.total > 0 && loadedCount >= listData.total) {
        return
      }

      // 3. 获取滚动信息
      const { scrollTop, scrollHeight, clientHeight } = target
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold
      if (isStopCheck && !loaded) {
        if (isNearBottom) {
          console.log('触底了 - 停止检查')
          listData.page++
          callback()
          return
        }
      }
      // 4. 判断是否触底
      if (isNearBottom) {
        loaded = true
        console.log('触底了')
        listData.page++
        callback()
        return
      }
    }

    executeLoad()
    setTimeout(() => {
      executeLoad(true)
    }, 400)
  },
  300,
)
