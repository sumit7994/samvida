import { useState } from 'react'

function PasswordField({ value, onChange, placeholder, minLength, required, autoComplete }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        className="form-field pr-12"
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        minLength={minLength}
        required={required}
        autoComplete={autoComplete}
      />
      <button
        className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? (
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6" />
            <path d="M9.9 4.2A9.6 9.6 0 0 1 12 4c5 0 8.3 4 9.5 6a11.8 11.8 0 0 1-3 3.7" />
            <path d="M6.2 6.3A12.7 12.7 0 0 0 2.5 10c1.2 2 4.5 6 9.5 6a9.8 9.8 0 0 0 4.1-.9" />
          </svg>
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
            <circle cx="12" cy="12" r="2.5" />
          </svg>
        )}
      </button>
    </div>
  )
}

export default PasswordField
