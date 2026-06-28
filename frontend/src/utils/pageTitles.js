const pageTitles = {
  '/': 'Book an appointment',
  '/track': 'Track booking',
  '/admin': 'Admin dashboard',
  '/admin/bookings': 'Manage bookings',
  '/admin/services': 'Manage services',
  '/admin/slots': 'Manage slots',
  '/admin/settings': 'Business settings',
  '/admin/login': 'Admin login',
}

export function getPageTitle(pathname) {
  if (pathname.startsWith('/booking/')) return 'Booking status'
  if (pathname.startsWith('/payment/')) return 'Token payment'
  return pageTitles[pathname] || 'Samvida'
}
