export function openRazorpayCheckout({ order, booking, business }) {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error('Razorpay checkout could not be loaded.'))
      return
    }

    const key = import.meta.env.VITE_RAZORPAY_KEY_ID
    if (!key) {
      reject(new Error('Razorpay key is not configured.'))
      return
    }

    let completed = false
    const finish = (callback) => {
      if (completed) return
      completed = true
      callback()
    }

    const checkout = new window.Razorpay({
      key,
      amount: order.amount,
      currency: order.currency,
      name: business?.name || 'Samvida',
      description: `Booking token ${booking.id}`,
      order_id: order.order_id || order.id,
      prefill: {
        name: booking.customerName,
        email: booking.email,
        contact: booking.phone,
      },
      notes: {
        booking_id: booking.id,
      },
      config: {
        display: {
          blocks: {
            upi: {
              name: 'Pay using UPI',
              instruments: [{ method: 'upi' }],
            },
          },
          sequence: ['block.upi'],
          preferences: {
            show_default_blocks: true,
          },
        },
      },
      theme: {
        color: '#134e4a',
      },
      handler: (response) => {
        finish(() => resolve(response))
      },
      modal: {
        ondismiss: () => {
          finish(() => reject(new Error('Payment cancelled.')))
        },
      },
    })

    checkout.on('payment.failed', (response) => {
      finish(() => reject(new Error(response.error?.description || 'Payment failed.')))
    })

    checkout.open()
  })
}
