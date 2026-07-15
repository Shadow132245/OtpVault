interface InputProps {
  label?: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  error?: string
  autoFocus?: boolean
  disabled?: boolean
  className?: string
  icon?: React.ReactNode
}

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  autoFocus = false,
  disabled = false,
  className = '',
  icon,
}: InputProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          className={`w-full transition-all duration-150
            bg-white dark:bg-surface-800
            border border-surface-200 dark:border-surface-600
            text-surface-900 dark:text-surface-100
            placeholder-surface-400 dark:placeholder-surface-500
            focus:outline-none focus:border-primary-400 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
            disabled:opacity-40 disabled:cursor-not-allowed
            ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20' : ''}
            ${icon ? 'pl-10' : 'px-4'}
            py-2.5 text-sm rounded-xl`}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </span>
      )}
    </div>
  )
}
