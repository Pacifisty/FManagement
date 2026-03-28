'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  title?: string
  description?: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'destructive' | 'default'
}

export function ConfirmDialog({
  open,
  title = 'Confirmar',
  description = 'Esta ação não pode ser desfeita.',
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'destructive',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={variant} onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function useConfirmDialog() {
  const [open, setOpen] = useState(false)
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null)

  const confirm = (callback: () => void) => {
    setOnConfirmCallback(() => callback)
    setOpen(true)
  }

  const handleConfirm = () => {
    onConfirmCallback?.()
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return { open, confirm, handleConfirm, handleCancel }
}
