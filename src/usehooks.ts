/*
这个函数的作用是实现防抖效果（Debounce Effect）。防抖是一种常见的前端优化技术，用于限制某个操作的频率。
通过使用防抖，可以确保在一段时间内只执行最后一次触发的操作，而忽略在此期间的其他触发。
*/
import { useEffect, useState } from 'react'

function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce;

