import { useEffect, useState } from 'react'
import ButtonLoader from './ButtonLoader'

const emptyService = {
  name: '',
  category: '',
  duration: 30,
  price: 0,
}

function ManageServicesPanel({ services, addService, updateService, toggleService, busyAction }) {
  const [draft, setDraft] = useState(emptyService)
  const [edits, setEdits] = useState({})

  useEffect(() => {
    setEdits(
      services.reduce((nextEdits, service) => {
        nextEdits[service.id] = {
          name: service.name,
          category: service.category,
          duration: service.duration,
          price: service.price,
        }
        return nextEdits
      }, {}),
    )
  }, [services])

  async function handleSubmit(event) {
    event.preventDefault()
    await addService(draft)
    setDraft(emptyService)
  }

  function updateEdit(id, patch) {
    setEdits((current) => ({
      ...current,
      [id]: {
        ...current[id],
        ...patch,
      },
    }))
  }

  function resetEdit(service) {
    setEdits((current) => ({
      ...current,
      [service.id]: {
        name: service.name,
        category: service.category,
        duration: service.duration,
        price: service.price,
      },
    }))
  }

  function hasChanges(service) {
    const edit = edits[service.id]
    if (!edit) return false
    return (
      edit.name !== service.name ||
      edit.category !== service.category ||
      Number(edit.duration) !== Number(service.duration) ||
      Number(edit.price) !== Number(service.price)
    )
  }

  async function saveService(service) {
    const edit = edits[service.id]
    if (!edit) return

    await updateService(service.id, {
      name: edit.name.trim(),
      category: edit.category.trim() || 'General',
      duration: Number(edit.duration),
      price: Number(edit.price),
    })
  }

  return (
    <div className="panel">
      <div className="section-heading">
        <span className="eyebrow">Service catalogue</span>
        <h2>Manage services</h2>
      </div>

      <form className="panel-soft grid gap-3" onSubmit={handleSubmit}>
        <div className="grid gap-3 lg:grid-cols-4">
          <label className="form-label">
            Name
            <input
              className="form-field"
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              placeholder="Service name"
            />
          </label>
          <label className="form-label">
            Category
            <input
              className="form-field"
              value={draft.category}
              onChange={(event) => setDraft({ ...draft, category: event.target.value })}
              placeholder="Hair, Skin..."
            />
          </label>
          <label className="form-label">
            Duration
            <input
              className="form-field"
              type="number"
              min="5"
              step="5"
              value={draft.duration}
              onChange={(event) => setDraft({ ...draft, duration: event.target.value })}
            />
          </label>
          <label className="form-label">
            Price
            <input
              className="form-field"
              type="number"
              min="0"
              value={draft.price}
              onChange={(event) => setDraft({ ...draft, price: event.target.value })}
            />
          </label>
        </div>
        <button className="btn-primary justify-self-start" type="submit" disabled={busyAction === 'add-service'}>
          {busyAction === 'add-service' && <ButtonLoader />}
          {busyAction === 'add-service' ? 'Adding' : 'Add service'}
        </button>
      </form>

      <div className="mt-4 grid gap-3">
        {services.map((service) => (
          <article
            className="grid gap-3 rounded-lg border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur xl:grid-cols-[minmax(0,1fr)_auto]"
            key={service.id}
          >
            <div className="grid gap-3 md:grid-cols-4">
              <input
                className="form-field"
                value={edits[service.id]?.name || ''}
                onChange={(event) => updateEdit(service.id, { name: event.target.value })}
              />
              <input
                className="form-field"
                value={edits[service.id]?.category || ''}
                onChange={(event) => updateEdit(service.id, { category: event.target.value })}
              />
              <input
                className="form-field"
                type="number"
                min="5"
                step="5"
                value={edits[service.id]?.duration || ''}
                onChange={(event) => updateEdit(service.id, { duration: event.target.value })}
              />
              <input
                className="form-field"
                type="number"
                min="0"
                value={edits[service.id]?.price || ''}
                onChange={(event) => updateEdit(service.id, { price: event.target.value })}
              />
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              <button
                className="btn-primary"
                disabled={!hasChanges(service) || busyAction === `service:${service.id}`}
                onClick={() => saveService(service)}
              >
                {busyAction === `service:${service.id}` && <ButtonLoader />}
                {busyAction === `service:${service.id}` ? 'Saving' : 'Save'}
              </button>
              <button className="btn-ghost" disabled={!hasChanges(service)} onClick={() => resetEdit(service)}>
                Reset
              </button>
              <button
                className={`btn-ghost ${service.isActive ? '' : 'border-rose-200 bg-rose-50 text-rose-900'}`}
                disabled={busyAction === `toggle-service:${service.id}`}
                onClick={() => toggleService(service.id)}
              >
                {busyAction === `toggle-service:${service.id}` && <ButtonLoader />}
                {busyAction === `toggle-service:${service.id}`
                  ? 'Saving'
                  : service.isActive
                    ? 'Deactivate'
                    : 'Activate'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default ManageServicesPanel
