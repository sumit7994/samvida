import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Book' },
  { to: '/track', label: 'Track' },
]

function AppLayout({ children, headline, message, business }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="flex flex-col gap-6 border-b border-zinc-800 bg-zinc-950 p-4 text-white shadow-[14px_0_80px_rgba(24,24,27,0.18)] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:p-6">
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/8 p-2 shadow-sm backdrop-blur">
          <img src="/favicon1.png" alt="Samvida" className="h-12 w-12 rounded-lg object-contain" />
          <div>
            <strong className="block text-xl font-black text-white">Samvida</strong>
            <span className="block text-sm font-semibold text-zinc-400">Appointment desk</span>
          </div>
        </div>

        <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1" aria-label="Samvida navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg border px-3.5 py-3 text-center text-sm font-black transition lg:text-left ${
                  isActive
                    ? 'border-emerald-300 bg-emerald-300 text-zinc-950 shadow-[0_12px_28px_rgba(16,185,129,0.22)]'
                    : 'border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto overflow-hidden rounded-lg border border-white/10 bg-white/8 p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-rose-300">
            {business?.category || 'Appointment booking'}
          </span>
          <h2 className="mt-2 text-2xl font-black text-white">{business?.name || 'Samvida'}</h2>
          {business?.address && <p className="mt-3 text-sm font-medium text-zinc-300">{business.address}</p>}
          <p className="mt-2 text-sm font-bold text-emerald-200">
            {business?.openTime || '09:00'} to {business?.closeTime || '20:00'}
          </p>
        </div>
      </aside>

      <section className="min-w-0 p-4 sm:p-6 lg:p-8">
        <header className="mb-6 grid gap-4 sm:flex sm:items-start sm:justify-between">
          <div>
            <span className="eyebrow">Appointment booking</span>
            <h1 className="mt-1 text-4xl font-black text-slate-950 sm:text-5xl">{headline}</h1>
          </div>
          <div className="max-w-xl rounded-lg border border-white/80 bg-white/85 px-4 py-3 text-sm font-bold text-zinc-950 shadow-sm backdrop-blur">
            {message}
          </div>
        </header>
        {children}
      </section>
    </main>
  )
}

export default AppLayout
