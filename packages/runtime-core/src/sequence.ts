export function getSequence(arr) {
  const len = arr.length
  const result = [0]
  const p = new Array(len).fill(0)
  let start, end, middle, resultLastIndex

  for (let i = 0; i < len; i++) {
    let arrI = arr[i];
    if(arrI !== 0) {
      resultLastIndex = result[result.length - 1]
      if(arr[resultLastIndex] < arrI) {
        result.push(i)
        p[i] = resultLastIndex
        continue
      }
      // 这里通过二分查找，在结果集中找到比当前值大的， 用当前的索引值将其替换掉
      // 递增序列 采用二分查找 是最快的
      start = 0
      end = result.length - 1
      while(start < end) {
        middle = ((start + end) / 2) | 0;
        if (arr[result[middle]] < arrI) {
          start = middle + 1
        } else {
          end = middle
        }
      }
      // 找到中间值后，我们需要做替换操作
      if(arr[result[end]] > arrI) {
        result[end] = i
        p[i] = result[end - 1]
      }
    }
    
  }

  // 1. 默认追加
  // 1. 替换
  // 1. 记录每个的前驱节点
  // 通过最后一项进行回溯
  let i = result.length
  let last = result[i - 1]

  while(i-- > 0) {
    result[i] = last
    last = p[last]
  }

  return result
}