import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { pb } from '@/lib/pocketbase'
import { toast } from 'sonner'
import { SESSION_TIMEOUT_MS, SESSION_LAST_ACTIVITY_KEY } from '@/lib/constant'

const ACTIVITY_EVENTS = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart']
const CHANNEL_NAME = 'rh_session'

type SessionMessage = { type: 'activity' } | { type: 'logout' }

export function useSessionTimeout() {
  const navigate = useNavigate()

  const logout = useCallback((broadcast = true) => {
    if (!pb.authStore.isValid) return
    if (broadcast) {
      const ch = new BroadcastChannel(CHANNEL_NAME)
      ch.postMessage({ type: 'logout' } satisfies SessionMessage)
      ch.close()
    }
    pb.authStore.clear()
    localStorage.removeItem(SESSION_LAST_ACTIVITY_KEY)
    toast.warning('Session expired due to inactivity. Please log in again.')
    navigate('/login')
  }, [navigate])

  useEffect(() => {
    if (!pb.authStore.isValid) return

    // Cek apakah sesi sudah expire saat tab ditutup
    const stored = localStorage.getItem(SESSION_LAST_ACTIVITY_KEY)
    if (stored) {
      const elapsed = Date.now() - parseInt(stored, 10)
      if (elapsed >= SESSION_TIMEOUT_MS) {
        logout()
        return
      }
    }

    const channel = new BroadcastChannel(CHANNEL_NAME)
    let timeoutId: ReturnType<typeof setTimeout>
    let lastWritten = 0
    let lastBroadcast = 0

    // Reset timer lokal tanpa broadcast (dipanggil saat terima pesan dari tab lain)
    const resetLocalTimer = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => logout(), SESSION_TIMEOUT_MS)
    }

    // Reset timer + update localStorage + broadcast ke tab lain
    const resetTimer = () => {
      const now = Date.now()

      if (now - lastWritten > 10_000) {
        localStorage.setItem(SESSION_LAST_ACTIVITY_KEY, String(now))
        lastWritten = now
      }

      if (now - lastBroadcast > 10_000) {
        channel.postMessage({ type: 'activity' } satisfies SessionMessage)
        lastBroadcast = now
      }

      resetLocalTimer()
    }

    // Terima pesan dari tab lain
    channel.onmessage = (e: MessageEvent<SessionMessage>) => {
      if (e.data.type === 'activity') resetLocalTimer()
      if (e.data.type === 'logout') logout(false)
    }

    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, resetTimer))
    resetTimer()

    return () => {
      clearTimeout(timeoutId)
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, resetTimer))
      channel.close()
    }
  }, [logout])
}
