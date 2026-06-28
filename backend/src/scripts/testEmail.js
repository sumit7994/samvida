require('dotenv').config()

const sendEmail = require('../utils/sendEmail')

async function testEmail() {
  const to = process.argv[2] || process.env.EMAIL_USER

  if (!to) {
    throw new Error('Pass a recipient email: npm run test:email -- you@example.com')
  }

  const result = await sendEmail({
    to,
    subject: 'Samvida email test',
    html: '<p>Samvida Nodemailer setup is working.</p>',
    text: 'Samvida Nodemailer setup is working.',
  })

  if (result?.skipped) {
    console.log('Email skipped. Check EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in .env.')
  } else {
    console.log(`Test email sent to ${to}`)
  }
}

testEmail().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
