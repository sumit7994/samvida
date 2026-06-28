import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ConfirmModal from './components/ConfirmModal'
import ProtectedRoute from './components/ProtectedRoute'
import { useSamvidaApp } from './hooks/useSamvidaApp'
import AdminBookingsPage from './pages/AdminBookingsPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminPage from './pages/AdminPage'
import AdminSettingsPage from './pages/AdminSettingsPage'
import AdminServicesPage from './pages/AdminServicesPage'
import AdminSlotsPage from './pages/AdminSlotsPage'
import BookingPage from './pages/BookingPage'
import BusinessLandingPage from './pages/BusinessLandingPage'
import TrackPage from './pages/TrackPage'
import BookingStatusRoute from './routes/BookingStatusRoute'
import PaymentRoute from './routes/PaymentRoute'
import { getPageTitle } from './utils/pageTitles'

function App() {
  const location = useLocation()

  if (location.pathname === '/business' || location.pathname === '/business/') {
    return <BusinessLandingPage />
  }

  return <AppointmentApp location={location} />
}

function AppointmentApp({ location }) {
  const app = useSamvidaApp()

  return (
    <AppLayout headline={getPageTitle(location.pathname)} message={app.message} business={app.business}>
      <Routes>
        <Route
          path="/"
          element={
            <BookingPage
              draft={app.draft}
              setDraft={app.setDraft}
              submitBooking={app.submitBooking}
              unavailableSlots={app.unavailableSlots}
              services={app.activeServices}
              slotTimes={app.slotTimes}
              business={app.business}
              loading={app.loading.services || app.loading.slots || app.loading.bookingSubmit}
            />
          }
        />
        <Route
          path="/booking/:bookingId"
          element={<BookingStatusRoute serviceName={app.serviceName} setMessage={app.setMessage} />}
        />
        <Route
          path="/payment/:bookingId"
          element={
            <PaymentRoute
              tokenAmount={app.tokenAmount}
              serviceName={app.serviceName}
              markPaid={app.markPaid}
              setMessage={app.setMessage}
              busyAction={app.busyAction}
              business={app.business}
            />
          }
        />
        <Route
          path="/track"
          element={
            <TrackPage
              trackPhone={app.trackPhone}
              setTrackPhone={app.setTrackPhone}
              trackCode={app.trackCode}
              setTrackCode={app.setTrackCode}
              trackedBookings={app.trackedBookings}
              serviceName={app.serviceName}
              openBooking={app.openBooking}
              onTrackSearch={app.loadTrackedBookings}
              loading={app.loading.tracking}
            />
          }
        />
        <Route
          path="/admin/login"
          element={<AdminLoginPage setMessage={app.setMessage} onLogin={app.loadAdminBookings} />}
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage
                bookings={app.bookings}
                pendingBookings={app.pendingBookings}
                upiBookings={app.upiBookings}
                confirmedToday={app.confirmedToday}
                tokenAmount={app.tokenAmount}
                setTokenAmount={app.setTokenAmount}
                serviceName={app.serviceName}
                approveBooking={app.approveBooking}
                rejectBooking={app.rejectBooking}
                proposeBookingTime={app.proposeBookingTime}
                cancelBooking={app.cancelBooking}
                markCompleted={app.markCompleted}
                markNoShow={app.markNoShow}
                confirmUpi={app.confirmUpi}
                addWalkIn={app.addWalkIn}
                logoutAdmin={app.logoutAdmin}
                services={app.activeServices}
                slotDate={app.slotDate}
                setSlotDate={app.setSlotDate}
                slotTimes={app.availableSlotTimes}
                loading={app.loading.adminBookings}
                busyAction={app.busyAction}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute>
              <AdminBookingsPage
                bookings={app.bookings}
                services={app.services}
                serviceName={app.serviceName}
                cancelBooking={app.cancelBooking}
                markCompleted={app.markCompleted}
                markNoShow={app.markNoShow}
                logoutAdmin={app.logoutAdmin}
                loading={app.loading.adminBookings}
                busyAction={app.busyAction}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute>
              <AdminServicesPage
                services={app.services}
                addService={app.addService}
                updateService={app.updateService}
                toggleService={app.toggleService}
                logoutAdmin={app.logoutAdmin}
                loading={app.loading.services}
                busyAction={app.busyAction}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/slots"
          element={
            <ProtectedRoute>
              <AdminSlotsPage
                slotTimes={app.adminSlotTimes}
                blockedSlots={app.blockedSlots}
                slotDate={app.slotDate}
                setSlotDate={app.setSlotDate}
                addSlotTime={app.addSlotTime}
                removeSlotTime={app.removeSlotTime}
                toggleBlockedSlot={app.toggleBlockedSlot}
                logoutAdmin={app.logoutAdmin}
                loading={app.loading.slots}
                busyAction={app.busyAction}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <AdminSettingsPage
                business={app.business}
                onBusinessSaved={app.handleBusinessSaved}
                setMessage={app.setMessage}
                logoutAdmin={app.logoutAdmin}
                confirmAction={app.confirmAction}
                busyAction={app.busyAction}
                setBusyAction={app.setBusyAction}
              />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ConfirmModal
        request={app.confirmRequest}
        onCancel={() => app.resolveConfirm(false)}
        onConfirm={() => app.resolveConfirm(true)}
      />
    </AppLayout>
  )
}

export default App
