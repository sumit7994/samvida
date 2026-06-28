function ConfirmModal({ request, onCancel, onConfirm }) {
  if (!request) return null

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="modal-panel max-w-md">
        <div className="section-heading mb-0">
          <span className="eyebrow">Confirm action</span>
          <h2>{request.title}</h2>
        </div>
        {request.body && <p className="text-sm text-slate-600">{request.body}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <button className="btn-secondary" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-primary" type="button" onClick={onConfirm}>
            {request.confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
