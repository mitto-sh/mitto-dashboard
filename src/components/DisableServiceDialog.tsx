'use client'

import { useState } from 'react'
import { useThemeContext } from './ThemeProvider'
import { AlertTriangleIcon } from './icons'

interface DisableServiceDialogProps {
  serviceName: string
  onCancel: () => void
  onConfirm: () => Promise<void>
}

export function DisableServiceDialog({ serviceName, onCancel, onConfirm }: DisableServiceDialogProps) {
  const { theme, dict } = useThemeContext()
  const [disabling, setDisabling] = useState(false)

  async function handleConfirm() {
    setDisabling(true)
    await onConfirm()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[4px]"
      style={{ backgroundColor: theme.overlay }}
    >
      <div
        className="w-[400px] rounded-[14px] border p-[26px]"
        style={{ borderColor: theme.border, backgroundColor: theme.surface, boxShadow: `0 24px 64px ${theme.panelShadow}` }}
      >
        <div className="flex items-start gap-[14px]">
          <span
            className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px]"
            style={{ backgroundColor: theme.dangerBg, color: theme.danger }}
          >
            <AlertTriangleIcon size={18} />
          </span>
          <div className="flex-1 pt-[2px]">
            <h2 className="mb-2 text-[16px] font-semibold" style={{ color: theme.ink }}>
              {dict.confirmDisablePrefix} &ldquo;{serviceName}&rdquo;?
            </h2>
            <p className="text-[14px] leading-[1.55]" style={{ color: theme.sec }}>
              {dict.confirmDisableWarning}
            </p>
          </div>
        </div>
        <div className="mt-[22px] flex justify-end gap-[10px]">
          <button
            onClick={onCancel}
            disabled={disabling}
            className="rounded-lg px-4 py-[10px] text-[13.5px] font-medium transition-colors disabled:opacity-50"
            style={{ color: theme.sec }}
          >
            {dict.keepRunning}
          </button>
          <button
            onClick={handleConfirm}
            disabled={disabling}
            className="rounded-lg px-[18px] py-[10px] text-[13.5px] font-semibold transition-colors disabled:opacity-50"
            style={{ backgroundColor: theme.danger, color: theme.accentInk }}
          >
            {dict.disableService}
          </button>
        </div>
      </div>
    </div>
  )
}
