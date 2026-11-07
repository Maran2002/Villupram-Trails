const BREVO_URL = 'https://api.brevo.com/v3/smtp/email'

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char])
}

export async function sendOtpEmail({ email, code, purpose }) {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL
  const senderName = process.env.BREVO_SENDER_NAME || 'Villupuram Trails'
  if (!apiKey || !senderEmail) throw new Error('Brevo email configuration is incomplete')

  const isReset = purpose === 'password_reset'
  const subject = isReset ? 'Your password reset code' : 'Verify your Villupuram Trails account'
  const action = isReset ? 'reset your password' : 'verify your email address'
  const htmlContent = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#222"><h2>${subject}</h2><p>Use this code to ${action}:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px">${escapeHtml(code)}</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p></div>`

  const response = await fetch(BREVO_URL, {
    method: 'POST',
    headers: { accept: 'application/json', 'api-key': apiKey, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email }], subject, htmlContent,
      textContent: `${subject}\n\nYour code to ${action} is ${code}. It expires in 10 minutes. If you did not request it, ignore this email.`,
    }),
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) {
    // Do not expose Brevo's response, which can contain provider and recipient details.
    throw new Error(`Brevo request failed (${response.status})`)
  }
}
