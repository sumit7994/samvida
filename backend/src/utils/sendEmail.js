const nodemailer = require('nodemailer')

function hasEmailConfig() {
  return Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS)
}

function createTransporter() {
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
    console.log(`[email] skipped: ${subject}`)
    return { skipped: true }
  }

  const transporter = createTransporter()
  const fromName = process.env.EMAIL_FROM_NAME || process.env.BUSINESS_NAME || 'Samvida'

  const info = await transporter.sendMail({
    from: `"${fromName}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  })

  console.log(`[email] sent: ${subject} -> ${to}`)
  return info
}

module.exports = sendEmail
