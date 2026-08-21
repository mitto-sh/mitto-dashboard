interface ToggleSwitchProps {
  checked: boolean
  onChange: () => void
  label: string
  disabled?: boolean
}

export function ToggleSwitch({ checked, onChange, label, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      disabled={disabled}
      className={`box-border inline-flex h-5 w-9 flex-none items-center rounded-full p-[2px] transition-colors disabled:opacity-50 ${checked ? 'bg-primary' : 'bg-border'}`}
    >
      <span
        className="block h-4 w-4 rounded-full bg-white transition-transform"
        style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  )
}
