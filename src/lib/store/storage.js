import CryptoJS from 'crypto-js'

const SECRET_KEY = process.env.NEXT_PUBLIC_STORE_SECRET || 'villupuram-hub-secure-key-2026'

const isBrowser = typeof window !== 'undefined'

export const encryptedStorage = {
  getItem: (name) => {
    if (!isBrowser) return null
    const value = localStorage.getItem(name)
    if (!value) return null
    try {
      const bytes = CryptoJS.AES.decrypt(value, SECRET_KEY)
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8)
      if (!decryptedData) return null
      // Return the raw string — createJSONStorage will JSON.parse it.
      return decryptedData
    } catch (error) {
      console.error('Failed to decrypt store data:', error)
      return null
    }
  },
  setItem: (name, value) => {
    if (!isBrowser) return
    try {
      // value is already a JSON string when coming from createJSONStorage
      const encryptedData = CryptoJS.AES.encrypt(
        typeof value === 'string' ? value : JSON.stringify(value),
        SECRET_KEY
      ).toString()
      localStorage.setItem(name, encryptedData)
    } catch (error) {
      console.error('Failed to encrypt store data:', error)
    }
  },
  removeItem: (name) => {
    if (isBrowser) localStorage.removeItem(name)
  },
}
