import { services, slotTimes } from '../data/mockData'

function BookingPage({ draft, setDraft, submitBooking, unavailableSlots }) {
  const selectedService = services.find((service) => service.id === draft.serviceId)

  return (
    <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <form className="panel grid gap-4" onSubmit={submitBooking}>
        <div className="section-heading">
          <span className="eyebrow">Customer flow</span>
          <h2>New appointment request</h2>
        </div>

        <label className="form-label">
          Service
          <select
            className="form-field"
            value={draft.serviceId}
            onChange={(event) => setDraft({ ...draft, serviceId: event.target.value })}
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - Rs.{service.price}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="form-label">
            Date
            <input
              className="form-field"
              type="date"
              value={draft.date}
              onChange={(event) => setDraft({ ...draft, date: event.target.value })}
            />
          </label>
          <label className="form-label">
            Time
            <select
              className="form-field"
              value={draft.time}
              onChange={(event) => setDraft({ ...draft, time: event.target.value })}
            >
              {slotTimes.map((time) => (
                <option key={time} value={time} disabled={unavailableSlots.includes(time)}>
                  {time}
                  {unavailableSlots.includes(time) ? ' - booked' : ''}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="form-label">
            Name
            <input
              className="form-field"
              value={draft.customerName}
              onChange={(event) => setDraft({ ...draft, customerName: event.target.value })}
              placeholder="Customer name"
            />
          </label>
          <label className="form-label">
            Phone
            <input
              className="form-field"
              value={draft.phone}
              onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
              placeholder="10 digit mobile"
            />
          </label>
        </div>

        <label className="form-label">
          Email
          <input
            className="form-field"
            type="email"
            value={draft.email}
            onChange={(event) => setDraft({ ...draft, email: event.target.value })}
            placeholder="Optional"
          />
        </label>

        <label className="form-label">
          Notes
          <textarea
            className="form-field min-h-24"
            value={draft.notes}
            onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
            placeholder="Optional request"
          />
        </label>

        <button className="btn-primary" type="submit">
          Request booking
        </button>
      </form>

      <div className="panel">
        <div className="section-heading">
          <span className="eyebrow">Selected service</span>
          <h2>{selectedService.name}</h2>
        </div>

        <dl className="grid gap-3">
          <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
            <dt className="text-sm text-slate-500">Duration</dt>
            <dd className="m-0 text-right font-extrabold text-slate-950">
              {selectedService.duration} minutes
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
            <dt className="text-sm text-slate-500">Price</dt>
            <dd className="m-0 text-right font-extrabold text-slate-950">Rs.{selectedService.price}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
            <dt className="text-sm text-slate-500">Token</dt>
            <dd className="m-0 text-right font-extrabold text-slate-950">Set by admin after review</dd>
          </div>
        </dl>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {slotTimes.map((time) => (
            <button
              key={time}
              className={`min-h-11 rounded-lg border font-semibold ${
                draft.time === time
                  ? 'border-teal-900 bg-teal-50 text-teal-900'
                  : 'border-slate-200 bg-white text-slate-600'
              } disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
              disabled={unavailableSlots.includes(time)}
              onClick={() => setDraft({ ...draft, time })}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BookingPage
