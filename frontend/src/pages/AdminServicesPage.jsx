import AdminNav from '../components/AdminNav'
import ManageServicesPanel from '../components/ManageServicesPanel'

function AdminServicesPage({
  services,
  addService,
  updateService,
  toggleService,
  logoutAdmin,
  loading,
  busyAction,
}) {
  return (
    <section className="grid gap-5">
      <AdminNav logoutAdmin={logoutAdmin} />
      {loading && <p className="empty-state">Refreshing services...</p>}
      <ManageServicesPanel
        services={services}
        addService={addService}
        updateService={updateService}
        toggleService={toggleService}
        busyAction={busyAction}
      />
    </section>
  )
}

export default AdminServicesPage
