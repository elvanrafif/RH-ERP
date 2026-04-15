import { useState } from 'react'

export function useTableState<T>() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [viewing, setViewing] = useState<T | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleCreate = () => {
    setEditing(null)
    setOpen(true)
  }

  const handleEdit = (item: T) => {
    setEditing(item)
    setOpen(true)
  }

  const handleView = (item: T) => {
    setViewing(item)
  }

  const handleCloseDetail = () => {
    setViewing(null)
  }

  const handleCloseForm = () => {
    setOpen(false)
  }

  return {
    open,
    setOpen,
    editing,
    viewing,
    searchTerm,
    setSearchTerm,
    handleCreate,
    handleEdit,
    handleView,
    handleCloseDetail,
    handleCloseForm,
  }
}
