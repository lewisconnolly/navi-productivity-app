import { useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const ROUTES = ['/', '/lists', '/notes']
const MIN_SWIPE_PX = 80
const MIN_HORIZONTAL_RATIO = 1.5 // horizontal movement must exceed vertical by this factor

export function useSwipeNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return
    const t = e.changedTouches[0]
    const deltaX = t.clientX - touchStart.current.x
    const deltaY = t.clientY - touchStart.current.y
    touchStart.current = null

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    // Ignore if not long enough or more vertical than horizontal
    if (absX < MIN_SWIPE_PX || absX < absY * MIN_HORIZONTAL_RATIO) return

    const currentIndex = ROUTES.indexOf(location.pathname)
    if (currentIndex === -1) return

    if (deltaX < 0 && currentIndex < ROUTES.length - 1) {
      navigate(ROUTES[currentIndex + 1])
    } else if (deltaX > 0 && currentIndex > 0) {
      navigate(ROUTES[currentIndex - 1])
    }
  }, [navigate, location.pathname])

  return { handleTouchStart, handleTouchEnd }
}
