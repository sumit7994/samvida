const Business = require('../models/Business.model')
const sendEmail = require('./sendEmail')

function appointmentLine(appointment) {
  return `${appointment.service.name} on ${appointment.slot.date || 'the requested date'} at ${
    appointment.slot.startTime || 'the requested time'
  }`
}

function shell(title, body) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#102522">
      <h2 style="margin:0 0 12px">${title}</h2>
      ${body}
      <p style="margin-top:24px;color:#64748b;font-size:13px">Samvida appointment system</p>
    </div>
  `
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function getBusiness() {
  return Business.findOne()
}

async function notifyOwner({ subject, html, text }) {
  const business = await getBusiness()
  return sendEmail({
    to: business?.ownerEmail,
    subject,
    html,
    text,
  })
}

async function notifyCustomer(appointment, { subject, html, text }) {
  return sendEmail({
    to: appointment.customer.email,
    subject,
    html,
    text,
  })
}

function logSettled(results, label) {
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`[notification] ${label} #${index + 1} failed: ${result.reason.message}`)
    }
  })
}

class NotificationService {
  static async bookingReceived(appointment) {
    const line = appointmentLine(appointment)
    const results = await Promise.allSettled([
      notifyCustomer(appointment, {
        subject: `Booking request received - ${appointment.bookingCode}`,
        html: shell(
          'Booking request received',
          `<p>Hi ${appointment.customer.name}, your request for <strong>${line}</strong> has been received.</p>
           <p>Your booking ID is <strong>${appointment.bookingCode}</strong>. The owner will review it shortly.</p>`,
        ),
        text: `Booking request received for ${line}. Booking ID: ${appointment.bookingCode}`,
      }),
      notifyOwner({
        subject: `New booking request - ${appointment.bookingCode}`,
        html: shell(
          'New booking request',
          `<p><strong>${appointment.customer.name}</strong> requested ${line}.</p>
           <p>Phone: ${appointment.customer.phone}</p>
           <p>Booking ID: <strong>${appointment.bookingCode}</strong></p>`,
        ),
        text: `New booking ${appointment.bookingCode}: ${appointment.customer.name}, ${line}, ${appointment.customer.phone}`,
      }),
    ])
    logSettled(results, `bookingReceived ${appointment.bookingCode}`)
  }

  static async bookingApproved(appointment, paymentLink) {
    const line = appointmentLine(appointment)
    await notifyCustomer(appointment, {
      subject: `Booking approved - ${appointment.bookingCode}`,
      html: shell(
        'Booking approved',
        `<p>Hi ${appointment.customer.name}, your appointment for <strong>${line}</strong> is approved.</p>
         <p>Please pay the token amount <strong>Rs.${appointment.token.amount}</strong> to confirm your slot.</p>
         <p><a href="${paymentLink}">Pay token now</a></p>`,
      ),
      text: `Booking approved for ${line}. Pay Rs.${appointment.token.amount}: ${paymentLink}`,
    })
  }

  static async bookingConfirmed(appointment) {
    const line = appointmentLine(appointment)
    const results = await Promise.allSettled([
      notifyCustomer(appointment, {
        subject: `Booking confirmed - ${appointment.bookingCode}`,
        html: shell(
          'Booking confirmed',
          `<p>Hi ${appointment.customer.name}, your appointment for <strong>${line}</strong> is confirmed.</p>
           <p>Booking ID: <strong>${appointment.bookingCode}</strong></p>`,
        ),
        text: `Booking confirmed for ${line}. Booking ID: ${appointment.bookingCode}`,
      }),
      notifyOwner({
        subject: `Booking confirmed - ${appointment.bookingCode}`,
        html: shell(
          'Booking confirmed',
          `<p>${appointment.customer.name}'s appointment for <strong>${line}</strong> is confirmed.</p>
           <p>Payment method: ${appointment.token.paymentMethod}</p>`,
        ),
        text: `Booking confirmed ${appointment.bookingCode}: ${appointment.customer.name}, ${line}`,
      }),
    ])
    logSettled(results, `bookingConfirmed ${appointment.bookingCode}`)
  }

  static async upiClaimed(appointment) {
    const line = appointmentLine(appointment)
    await notifyOwner({
      subject: `UPI payment claimed - ${appointment.bookingCode}`,
      html: shell(
        'UPI payment claim',
        `<p>${appointment.customer.name} marked UPI payment as done for <strong>${line}</strong>.</p>
         <p>Token amount: <strong>Rs.${appointment.token.amount}</strong></p>
         <p>Please verify and confirm in the admin panel.</p>`,
      ),
      text: `UPI claimed for ${appointment.bookingCode}. Verify payment for ${appointment.customer.name}.`,
    })
  }

  static async bookingCancelled(appointment, reason) {
    const line = appointmentLine(appointment)
    const reasonText = reason?.trim()
    const reasonHtml = reasonText ? escapeHtml(reasonText) : ''
    await notifyCustomer(appointment, {
      subject: `Booking cancelled - ${appointment.bookingCode}`,
      html: shell(
        'Booking cancelled',
        `<p>Hi ${appointment.customer.name}, your booking for <strong>${line}</strong> has been cancelled.</p>
         ${reasonHtml ? `<p>Reason: ${reasonHtml}</p>` : ''}`,
      ),
      text: reasonText
        ? `Booking ${appointment.bookingCode} cancelled. Reason: ${reasonText}`
        : `Booking ${appointment.bookingCode} cancelled.`,
    })
  }

  static async bookingTimeProposed(appointment, note) {
    const line = appointmentLine(appointment)
    const noteText = note?.trim()
    const noteHtml = noteText ? escapeHtml(noteText) : ''
    await notifyCustomer(appointment, {
      subject: `New appointment time suggested - ${appointment.bookingCode}`,
      html: shell(
        'New appointment time suggested',
        `<p>Hi ${appointment.customer.name}, the owner has suggested a new time for your appointment:</p>
         <p><strong>${line}</strong></p>
         ${noteHtml ? `<p>Note: ${noteHtml}</p>` : ''}
         <p>Your booking is still under review. You will receive another message after approval.</p>`,
      ),
      text: noteText
        ? `New appointment time suggested for ${line}. Note: ${noteText}`
        : `New appointment time suggested for ${line}.`,
    })
  }

  static async bookingTimeAccepted(appointment) {
    const line = appointmentLine(appointment)
    await notifyOwner({
      subject: `Suggested time accepted - ${appointment.bookingCode}`,
      html: shell(
        'Suggested time accepted',
        `<p><strong>${appointment.customer.name}</strong> accepted the suggested appointment time.</p>
         <p><strong>${line}</strong></p>
         <p>You can now approve the booking from the admin panel.</p>`,
      ),
      text: `Suggested time accepted for ${appointment.bookingCode}: ${appointment.customer.name}, ${line}`,
    })
  }

  static async bookingDayReminder(appointment) {
    const line = appointmentLine(appointment)
    await notifyCustomer(appointment, {
      subject: `Appointment reminder - ${appointment.bookingCode}`,
      html: shell(
        'Appointment reminder',
        `<p>Hi ${appointment.customer.name}, this is a reminder for your appointment today:</p>
         <p><strong>${line}</strong></p>
         <p>Please arrive a few minutes before your scheduled time.</p>`,
      ),
      text: `Reminder: your appointment is today - ${line}. Please arrive a few minutes early.`,
    })
  }

  static async oneHourReminder(appointment) {
    const line = appointmentLine(appointment)
    await notifyCustomer(appointment, {
      subject: `Appointment starts soon - ${appointment.bookingCode}`,
      html: shell(
        'Appointment starts soon',
        `<p>Hi ${appointment.customer.name}, your appointment starts in about one hour.</p>
         <p><strong>${line}</strong></p>`,
      ),
      text: `Your appointment starts in about one hour: ${line}.`,
    })
  }

  static async bookingCompleted(appointment) {
    const line = appointmentLine(appointment)
    await notifyCustomer(appointment, {
      subject: `Appointment completed - ${appointment.bookingCode}`,
      html: shell(
        'Appointment completed',
        `<p>Hi ${appointment.customer.name}, your appointment for <strong>${line}</strong> has been marked completed.</p>
         <p>Thank you for visiting.</p>`,
      ),
      text: `Appointment completed for ${line}. Thank you for visiting.`,
    })
  }

  static async bookingNoShow(appointment) {
    const line = appointmentLine(appointment)
    await notifyCustomer(appointment, {
      subject: `Appointment marked no-show - ${appointment.bookingCode}`,
      html: shell(
        'Appointment marked no-show',
        `<p>Hi ${appointment.customer.name}, your appointment for <strong>${line}</strong> was marked as missed.</p>`,
      ),
      text: `Appointment marked as missed for ${line}.`,
    })
  }

  static async walkInAdded(appointment) {
    const line = appointmentLine(appointment)
    await notifyCustomer(appointment, {
      subject: `Walk-in appointment added - ${appointment.bookingCode}`,
      html: shell(
        'Walk-in appointment added',
        `<p>Hi ${appointment.customer.name}, your walk-in appointment has been added and confirmed.</p>
         <p><strong>${line}</strong></p>
         <p>Booking ID: <strong>${appointment.bookingCode}</strong></p>`,
      ),
      text: `Walk-in appointment confirmed for ${line}. Booking ID: ${appointment.bookingCode}`,
    })
  }
}

module.exports = NotificationService
