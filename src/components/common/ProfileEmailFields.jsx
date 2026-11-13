'use client'

import { Mail } from 'lucide-react'
import { hasVerifiedEmail } from '@/lib/emailVerification'

const inputClass = 'w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:outline-none focus:border-primary-500 dark:border-dark-600 dark:bg-dark-900'

export function ProfileEmailFields({ email, user, verification, setVerification, onEmailChange, sending, onSend }) {
  const needsVerification = email.trim().toLowerCase() !== user.email || !hasVerifiedEmail(user)
  return (
    <div className="space-y-3">
      <label className="block space-y-2">
        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500"><Mail size={12} /> Email</span>
        <input type="email" autoComplete="email" value={email} onChange={e => onEmailChange(e.target.value)}
          className={inputClass} maxLength={254} required />
      </label>
      {needsVerification && (
        <div className="space-y-2">
          <p className="text-xs text-neutral-500">Use your current password and a code sent to this email to verify it.</p>
          <label className="block space-y-1 text-xs">
            <span>Current password</span>
            <input type="password" autoComplete="current-password" value={verification.password}
              onChange={e => setVerification({ ...verification, password: e.target.value })} className={inputClass} />
          </label>
          <button type="button" onClick={onSend} disabled={sending || !verification.password || !email}
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50">
            {sending ? 'Sending…' : verification.sent ? 'Resend code' : 'Send verification code'}
          </button>
          {verification.sent && (
            <label className="block space-y-1 text-xs">
              <span>Verification code</span>
              <input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6}
                value={verification.code} onChange={e => setVerification({ ...verification, code: e.target.value })}
                className={inputClass} required />
            </label>
          )}
        </div>
      )}
    </div>
  )
}
