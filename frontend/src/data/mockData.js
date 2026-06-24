export const business = {
  name: 'Samvida Demo Studio',
  category: 'Salon and wellness',
  address: 'Model Town, Jalandhar',
  phone: '+91 98765 43210',
  openTime: '09:00',
  closeTime: '20:00',
  upiId: 'owner@upi',
}

export const services = [
  { id: 'haircut', name: 'Haircut and Styling', category: 'Hair', duration: 45, price: 350 },
  { id: 'facial', name: 'Express Facial', category: 'Skin', duration: 60, price: 900 },
  { id: 'beard', name: 'Beard Grooming', category: 'Hair', duration: 30, price: 220 },
  { id: 'consult', name: 'Consultation', category: 'Wellness', duration: 20, price: 150 },
]

export const slotTimes = ['09:30', '10:15', '11:00', '12:30', '14:00', '15:30', '17:00', '18:30']

export const statusLabels = {
  pending: 'Pending review',
  payment_pending: 'Payment pending',
  upi_claimed: 'UPI claimed',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No-show',
}

export const today = new Date().toISOString().slice(0, 10)

export const initialBookings = [
  {
    id: 'SAM-1024',
    customerName: 'Aman Sharma',
    phone: '9876543210',
    email: 'aman@example.com',
    serviceId: 'haircut',
    date: today,
    time: '11:00',
    status: 'pending',
    token: 0,
    paymentMethod: 'none',
    notes: 'Prefers senior stylist',
  },
  {
    id: 'SAM-1025',
    customerName: 'Neha Verma',
    phone: '9876500000',
    email: 'neha@example.com',
    serviceId: 'facial',
    date: today,
    time: '15:30',
    status: 'upi_claimed',
    token: 250,
    paymentMethod: 'upi',
    notes: '',
  },
]
