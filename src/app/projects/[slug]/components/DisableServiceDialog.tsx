'use client'

import { useState } from 'react'
import { useThemeContext } from '@/components/ThemeProvider'
import { Modal, ModalActions, ModalCancelButton, ModalSubmitButton } from '@/components/ui/modal'
import { AlertTriangleIcon } from '@/components/icons'

interface DisableServiceDialogProps {
  serviceName: string
  onCancel: () => void
  onConfirm: () => Promise<void>
}

export function DisableServiceDialog({ serviceName, onCancel, onConfirm }: DisableServiceDialogProps) {
  const { dict } = useThemeContext()
  const [disabling, setDisabling] = useState(false)

  async function handleConfirm() {
    setDisabling(true)
    await onConfirm()
  }

  return (
    <Modal urgent className="p-[26px]">
      <div className="flex items-start gap-[14px]">
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-danger-bg text-danger">
          <AlertTriangleIcon size={18} />
        </span>
        <div className="flex-1 pt-[2px]">
          <h2 className="mb-2 text-[16px] font-semibold text-ink">
            {dict.confirmDisablePrefix} &ldquo;{serviceName}&rdquo;?
          </h2>
          <p className="text-body-sm leading-[1.55] text-ink-secondary">
            {dict.confirmDisableWarning}
          </p>
        </div>
      </div>
      <ModalActions className="mt-[22px]">
        <ModalCancelButton onClick={onCancel} disabled={disabling}>{dict.keepRunning}</ModalCancelButton>
        <ModalSubmitButton type="button" onClick={handleConfirm} disabled={disabling} danger>
          {dict.disableService}
        </ModalSubmitButton>
      </ModalActions>
    </Modal>
  )
}
