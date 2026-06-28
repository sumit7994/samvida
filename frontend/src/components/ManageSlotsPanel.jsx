import { useState } from 'react'
import { today } from '../data/constants'
import ButtonLoader from './ButtonLoader'

function ManageSlotsPanel({
  slotTimes,
  blockedSlots,
  slotDate,
  setSlotDate,
  addSlotTime,
  removeSlotTime,
  toggleBlockedSlot,
  busyAction,
}) {
  const [newTime, setNewTime] = useState('19:00')

  function handleAddSlot(event) {
    event.preventDefault()
    addSlotTime(newTime)
  }

  function isBlocked(time) {
    return blockedSlots.some((slot) => slot.date === slotDate && slot.time === time)
  }

  return (
    <div className="panel">
      <div className="section-heading">
        <span className="eyebrow">Availability</span>
        <h2>Manage slots</h2>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
        <label className="form-label">
          Slot date
          <input
            className="form-field"
            min={today}
            type="date"
            value={slotDate}
            onChange={(event) => setSlotDate(event.target.value)}
          />
        </label>

        <form className="grid gap-2 sm:grid-cols-[160px_auto] lg:self-end" onSubmit={handleAddSlot}>
          <input
            className="form-field"
            type="time"
            value={newTime}
            onChange={(event) => setNewTime(event.target.value)}
          />
          <button className="btn-primary" type="submit" disabled={busyAction === 'add-slot'}>
            {busyAction === 'add-slot' && <ButtonLoader />}
            {busyAction === 'add-slot' ? 'Adding' : 'Add time'}
          </button>
        </form>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
        {slotTimes.map((time) => (
          <div className="rounded-lg border border-white/80 bg-white/70 p-2 shadow-sm backdrop-blur" key={time}>
            <button
              className={`min-h-11 w-full rounded-lg border font-black transition ${
                isBlocked(time)
                  ? 'border-rose-200 bg-rose-50 text-rose-800'
                  : 'border-zinc-950 bg-zinc-950 text-white shadow-[0_10px_22px_rgba(24,24,27,0.22)]'
              }`}
              disabled={busyAction === `toggle-slot:${time}`}
              onClick={() => toggleBlockedSlot(slotDate, time)}
            >
              {busyAction === `toggle-slot:${time}` ? <ButtonLoader /> : time}
            </button>
            <button
              className="mt-2 inline-flex min-h-8 w-full items-center justify-center gap-2 rounded-md text-xs font-extrabold text-slate-500 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={busyAction === `remove-slot:${time}`}
              onClick={() => removeSlotTime(time)}
            >
              {busyAction === `remove-slot:${time}` && <ButtonLoader />}
              {busyAction === `remove-slot:${time}` ? 'Removing' : 'Remove'}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-3 text-sm text-slate-500">
        Green slots are bookable for the selected date. Red slots are blocked from public booking.
      </p>
    </div>
  )
}

export default ManageSlotsPanel
