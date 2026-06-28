const nodemailer = require('nodemailer')

function hasOAuthConfig() {
  return Boolean(
    process.env.EMAIL_USER &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN,
  )
}

function hasEmailConfig() {
  return hasOAuthConfig() || Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS)
}

function createTransporter() {
  if (hasOAuthConfig()) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      },
    })
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: Number(process.env.EMAIL_PORT || 587) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

async function sendEmail({ to, subject, html, text }) {
  if (!to || !hasEmailConfig()) {
    console.log(`[email] skipped: ${subject}. Email provider is not configured.`)
    return { skipped: true }
  }

  const transporter = createTransporter()
  const fromName = process.env.EMAIL_FROM_NAME || process.env.BUSINESS_NAME || 'Samvida'
  const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER

  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
    text,
  })

  console.log(`[email] sent: ${subject} -> ${to}`)
  return info
}

module.exports = sendEmail
