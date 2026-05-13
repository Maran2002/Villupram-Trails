import CryptoJS from 'crypto-js'

const SECRET_KEY = process.env.NEXT_PUBLIC_STORE_SECRET || 'villupuram-hub-secure-key-2026'

export const encryptedStorage = {
  getItem: (name) => {
    const value = localStorage.getItem(name)
    if (!value) return null
    try {
      const bytes = CryptoJS.AES.decrypt(value, SECRET_KEY)
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8)
      return JSON.parse(decryptedData)
    } catch (error) {
      console.error('Failed to decrypt store data:', error)
      return null
    }
  },
  setItem: (name, value) => {
    try {
      const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(value), SECRET_KEY).toString()
      localStorage.setItem(name, encryptedData)
    } catch (error) {
      console.error('Failed to encrypt store data:', error)
    }
  },
  removeItem: (name) => localStorage.removeItem(name),
}
