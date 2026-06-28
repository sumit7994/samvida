import AdminNav from '../components/AdminNav'
import ManageSlotsPanel from '../components/ManageSlotsPanel'

function AdminSlotsPage({
  slotTimes,
  blockedSlots,
  slotDate,
  setSlotDate,
  addSlotTime,
  removeSlotTime,
  toggleBlockedSlot,
  logoutAdmin,
  loading,
  busyAction,
}) {
  return (
    <section className="grid gap-5">
      <AdminNav logoutAdmin={logoutAdmin} />
      {loading && <p className="empty-state">Refreshing slots...</p>}
      <ManageSlotsPanel
        slotTimes={slotTimes}
        blockedSlots={blockedSlots}
        slotDate={slotDate}
        setSlotDate={setSlotDate}
        addSlotTime={addSlotTime}
        removeSlotTime={removeSlotTime}
        toggleBlockedSlot={toggleBlockedSlot}
        busyAction={busyAction}
      />
    </section>
  )
}

export default AdminSlotsPage
