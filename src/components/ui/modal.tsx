'use client'

import type { FormEvent, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  children: ReactNode
  width?: number
  urgent?: boolean
  as?: 'form'
  onSubmit?: (e: FormEvent) => void
  className?: string
}

export function Modal({ children, width = 400, urgent = false, as, onSubmit, className }: ModalProps) {
  const Container = as === 'form' ? 'form' : 'div'

  return (
    <div
      className={cn('fixed inset-0 flex items-center justify-center bg-overlay backdrop-blur-[4px]', urgent ? 'z-50' : 'z-40')}
    >
      <Container
        onSubmit={onSubmit}
        className={cn('rounded-[14px] border border-border bg-surface shadow-modal p-6', className)}
        style={{ width }}
      >
        {children}
      </Container>
    </div>
  )
}

export function ModalActions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mt-2 flex justify-end gap-[10px]', className)}>{children}</div>
}

interface ModalCancelButtonProps {
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}

export function ModalCancelButton({ onClick, disabled, children }: ModalCancelButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg px-[14px] py-[9px] text-sm font-medium text-ink-secondary transition-colors disabled:opacity-50"
    >
      {children}
    </button>
  )
}

interface ModalSubmitButtonProps {
  type?: 'submit' | 'button'
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
  children: ReactNode
}

export function ModalSubmitButton({ type = 'submit', onClick, disabled, danger, children }: ModalSubmitButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-lg px-[18px] py-[9px] text-sm font-semibold transition-colors disabled:opacity-50',
        danger ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground',
      )}
    >
      {children}
    </button>
  )
}
