/**
 * 合并列表
 *
 * @param olds 原始列表
 * @param news 新列表
 * @param key 唯一键
 * @returns 合并后的列表
 */
export function mergeList<T>(olds: any[], news: any[], key: string): T[] {
  if (!olds || !news) return []
  if (news.length === 0) return olds
  if (olds.length === 0) return news
  if (olds[0] instanceof Object && news[0] instanceof Object) {
    const exists = new Set(olds.map((item) => item[key]))
    const uniques = news.filter((item) => !exists.has(item[key]))
    let res: T[] = olds
    if (uniques.length > 0) {
      res = [...res, ...uniques]
    }
    return res
  } else {
    return [...new Set([...olds, ...news])]
  }
}
