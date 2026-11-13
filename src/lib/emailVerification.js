export function hasVerifiedEmail(user) {
  if (!user?.email || user.isVerified !== true) return false
  if (user.verifiedEmail) return user.verifiedEmail === user.email

  // Older OTPs recorded only a timestamp. Require a fresh code if the
  // account was modified afterwards, when its address could have changed.
  const verifiedAt = new Date(user.emailVerifiedAt ?? NaN).getTime()
  const updatedAt = new Date(user.updatedAt ?? NaN).getTime()
  return Number.isFinite(verifiedAt) && (!Number.isFinite(updatedAt) || updatedAt <= verifiedAt)
}
