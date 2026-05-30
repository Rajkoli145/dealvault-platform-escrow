import { useState, useEffect } from 'react'

/**
 * Generic hook to track window dimensions.
 * Useful for responsive behaviour inside components.
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return size
}

/**
 * Toggle a boolean state — handy for modals / drawers.
 */
export function useToggle(initial = false): [boolean, () => void] {
  const [value, setValue] = useState(initial)
  const toggle = () => setValue(v => !v)
  return [value, toggle]
}

/**
 * Persist state to localStorage with automatic serialisation.
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setValue = (value: T) => {
    setState(value)
    localStorage.setItem(key, JSON.stringify(value))
  }

  return [state, setValue]
}
