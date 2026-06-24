import { NavLink } from 'react-router-dom'
import { business } from '../data/mockData'

const links = [
  { to: '/', label: 'Book' },
  { to: '/payment', label: 'Payment' },
  { to: '/track', label: 'Track' },
  { to: '/admin', label: 'Admin' },
]

function AppLayout({ children, headline, message }) {
  return (
    <main className="grid min-h-screen bg-slate-100 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="flex flex-col gap-6 border-b border-slate-200 bg-slate-50 p-4 lg:min-h-screen lg:border-b-0 lg:border-r lg:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-teal-950 font-extrabold text-white">
            S
          </span>
          <div>
            <strong className="block text-lg text-slate-950">Samvida</strong>
            <span className="block text-sm text-slate-500">Appointment desk</span>
          </div>
        </div>

        <nav className="grid grid-cols-4 gap-2 lg:grid-cols-1" aria-label="Samvida navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-center text-sm font-bold lg:text-left ${
                  isActive ? 'bg-teal-50 text-teal-900' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-lg border border-slate-200 bg-white p-4">
          <span className="eyebrow">{business.category}</span>
          <h2 className="mt-1 text-xl font-extrabold text-slate-950">{business.name}</h2>
          <p className="mt-2 text-sm text-slate-500">{business.address}</p>
          <p className="mt-1 text-sm text-slate-500">
            {business.openTime} to {business.closeTime}
          </p>
        </div>
      </aside>

      <section className="min-w-0 p-4 sm:p-6 lg:p-7">
        <header className="mb-6 grid gap-4 sm:flex sm:items-start sm:justify-between">
          <div>
            <span className="eyebrow">Live project prototype</span>
            <h1 className="mt-1 text-3xl font-extrabold text-slate-950 sm:text-4xl">{headline}</h1>
          </div>
          <div className="max-w-xl rounded-lg border border-teal-100 bg-teal-50 px-3 py-2 text-sm text-teal-950">
            {message}
          </div>
        </header>
        {children}
      </section>
    </main>
  )
}

export default AppLayout
