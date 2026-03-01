import { useState, useRef, useEffect } from 'react'
import type { RefObject } from 'react'

interface DateRangeFilter {
  filter: string
  setFilter: (val: string) => void
  showCustomModal: boolean
  setShowCustomModal: (val: boolean) => void
  modalRef: RefObject<HTMLDivElement>
  tempStart: string
  setTempStart: (val: string) => void
  tempEnd: string
  setTempEnd: (val: string) => void
  appliedStart: string
  appliedEnd: string
  applyCustomDates: () => void
}

export function useDateRangeFilter(initialFilter = 'this_month'): DateRangeFilter {
  const [filter, setFilterState] = useState(initialFilter)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const [tempStart, setTempStart] = useState('')
  const [tempEnd, setTempEnd] = useState('')
  const [appliedStart, setAppliedStart] = useState('')
  const [appliedEnd, setAppliedEnd] = useState('')

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowCustomModal(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const setFilter = (val: string) => {
    setFilterState(val)
    if (val === 'custom') {
      setShowCustomModal(true)
    } else {
      setShowCustomModal(false)
      setAppliedStart('')
      setAppliedEnd('')
    }
  }

  const applyCustomDates = () => {
    setAppliedStart(tempStart)
    setAppliedEnd(tempEnd)
    setShowCustomModal(false)
  }

  return {
    filter,
    setFilter,
    showCustomModal,
    setShowCustomModal,
    modalRef,
    tempStart,
    setTempStart,
    tempEnd,
    setTempEnd,
    appliedStart,
    appliedEnd,
    applyCustomDates,
  }
}
