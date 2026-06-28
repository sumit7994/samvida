import ButtonLoader from '../components/ButtonLoader'

function BookingPage({
  draft,
  setDraft,
  submitBooking,
  unavailableSlots,
  services,
  slotTimes,
  business,
  loading,
}) {
  const selectedService = services.find((service) => service.id === draft.serviceId)
  const isFlexibleBooking = business?.bookingMode === 'flexible'

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
            {isFlexibleBooking ? 'Preferred time' : 'Time'}
            {isFlexibleBooking ? (
              <input
                className="form-field"
                type="time"
                value={draft.time}
                onChange={(event) => setDraft({ ...draft, time: event.target.value })}
              />
            ) : (
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
            )}
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
            placeholder="Customer email"
            required
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

        <button className="btn-primary w-full" type="submit" disabled={loading}>
          {loading && <ButtonLoader />}
          {loading ? 'Please wait' : 'Request booking'}
        </button>
      </form>

      <div className="panel overflow-hidden">
        <div className="section-heading">
          <span className="eyebrow">Selected service</span>
          <h2>{selectedService?.name || 'No active service'}</h2>
        </div>

        {selectedService ? (
          <dl className="grid gap-3 rounded-lg border border-zinc-900/10 bg-zinc-950 p-4 text-white shadow-[0_24px_80px_rgba(24,24,27,0.2)]">
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="text-sm text-zinc-300">Duration</dt>
              <dd className="m-0 text-right font-black text-white">
                {selectedService.duration} minutes
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="text-sm text-zinc-300">Price</dt>
              <dd className="m-0 text-right text-3xl font-black text-emerald-200">
                Rs.{selectedService.price}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-sm text-zinc-300">Token</dt>
              <dd className="m-0 text-right font-black text-white">
                Set by admin after review
              </dd>
            </div>
          </dl>
        ) : (
          <p className="empty-state">No service is currently available for booking.</p>
        )}

        {isFlexibleBooking && (
          <p className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-sm font-bold text-emerald-800">
            Flexible mode is enabled. Choose your preferred time; admin can approve it or suggest a better slot.
          </p>
        )}

        {!isFlexibleBooking && <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {slotTimes.map((time) => (
            <button
              key={time}
              type="button"
              className={`min-h-12 rounded-lg border font-black transition ${
                draft.time === time
                  ? 'border-zinc-950 bg-zinc-950 text-white shadow-[0_12px_28px_rgba(24,24,27,0.22)]'
                  : 'border-zinc-200 bg-white/80 text-zinc-600 hover:border-emerald-200 hover:text-zinc-950'
              } disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
              disabled={unavailableSlots.includes(time)}
              onClick={() => setDraft({ ...draft, time })}
            >
              {time}
            </button>
          ))}
        </div>}
      </div>
    </section>
  )
}

export default BookingPage
