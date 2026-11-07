const isBrowser = typeof window !== 'undefined'

// Client-side encryption with a bundled key is not a security boundary.
// Persist only non-secret UI identity data; the session token is HttpOnly.
export const encryptedStorage = {
  getItem: (name) => {
    if (!isBrowser) return null
    const value = localStorage.getItem(name)
    if (!value) return null
    return value
  },
  setItem: (name, value) => {
    if (!isBrowser) return
    localStorage.setItem(name, typeof value === 'string' ? value : JSON.stringify(value))
  },
  removeItem: (name) => {
    if (isBrowser) localStorage.removeItem(name)
  },
}
