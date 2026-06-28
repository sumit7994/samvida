export function normalizeService(service) {
  return {
    id: service._id,
    name: service.name,
    category: service.category || 'General',
    duration: service.duration,
    price: service.price,
    isActive: service.isActive,
  }
}

export function normalizeSlot(slot) {
  return {
    id: slot._id,
    date: slot.date,
    time: slot.startTime,
    endTime: slot.endTime,
    isBooked: slot.isBooked,
    isBlocked: slot.isBlocked,
  }
}

export function normalizeBusiness(data) {
  return {
    name: data.businessName,
    category: data.category,
    address: data.address,
    phone: data.phone,
    ownerEmail: data.ownerEmail,
    ownerPhone: data.ownerPhone,
    openTime: data.openTime,
    closeTime: data.closeTime,
    slotDuration: data.slotDuration,
    autoGenerateSlots: data.autoGenerateSlots ?? true,
    bookingMode: data.bookingMode || 'slot',
    workingDays: data.workingDays || [],
    holidays: data.holidays || [],
    tokenAmount: data.tokenAmount,
    upiId: data.upiId,
    upiName: data.upiName,
  }
}

export function normalizeBooking(booking) {
  return {
    id: booking.bookingCode || booking._id,
    mongoId: booking._id,
    customerName: booking.customer?.name || '',
    phone: booking.customer?.phone || '',
    email: booking.customer?.email || '',
    serviceId: booking.service?.serviceId,
    serviceName: booking.service?.name || 'Service',
    date: booking.slot?.date || '',
    time: booking.slot?.startTime || '',
    status: booking.status,
    token: booking.token?.amount || 0,
    paymentMethod: booking.token?.paymentMethod || 'none',
    timeProposal: booking.timeProposal || null,
    cancellationReason: booking.cancellationReason || '',
    notes: booking.notes || '',
  }
}
