'use client'

import { useThemeContext } from './ThemeProvider'
import { SettingsIcon, ArrowRightIcon } from './icons'

interface AddServiceChooserModalProps {
  onCancel: () => void
  onManual: () => void
  onGithub: () => void
}

export function AddServiceChooserModal({ onCancel, onManual, onGithub }: AddServiceChooserModalProps) {
  const { theme, dict } = useThemeContext()

  const optionStyle = { borderColor: theme.line, backgroundColor: theme.raised }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-[4px]"
      style={{ backgroundColor: theme.overlay }}
    >
      <div
        className="w-[400px] rounded-[14px] border p-6"
        style={{ borderColor: theme.border, backgroundColor: theme.surface, boxShadow: `0 24px 64px ${theme.panelShadow}` }}
      >
        <h2 className="mb-5 text-[15px] font-semibold" style={{ color: theme.ink }}>{dict.addServiceChooserTitle}</h2>

        <div className="flex flex-col gap-[10px]">
          <button
            onClick={onManual}
            className="flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors"
            style={optionStyle}
          >
            <span className="flex items-center gap-3">
              <SettingsIcon size={16} style={{ color: theme.sec }} />
              <span>
                <span className="block text-sm font-medium" style={{ color: theme.ink }}>{dict.manualConfig}</span>
                <span className="mt-[2px] block font-mono text-[11px]" style={{ color: theme.faint }}>{dict.manualConfigDesc}</span>
              </span>
            </span>
            <ArrowRightIcon size={13} style={{ color: theme.faint }} />
          </button>

          <button
            onClick={onGithub}
            className="flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors"
            style={optionStyle}
          >
            <span className="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: theme.sec }} aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.95.68 1.92 0 1.39-.01 2.51-.01 2.85 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
              </svg>
              <span>
                <span className="block text-sm font-medium" style={{ color: theme.ink }}>{dict.importFromGithub}</span>
                <span className="mt-[2px] block font-mono text-[11px]" style={{ color: theme.faint }}>{dict.importFromGithubDesc}</span>
              </span>
            </span>
            <ArrowRightIcon size={13} style={{ color: theme.faint }} />
          </button>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onCancel}
            className="rounded-lg px-[14px] py-[9px] text-sm font-medium transition-colors"
            style={{ color: theme.sec }}
          >
            {dict.cancel}
          </button>
        </div>
      </div>
    </div>
  )
}
