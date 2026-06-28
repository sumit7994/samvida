import { NavLink } from 'react-router-dom'

const adminLinks = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/services', label: 'Services' },
  { to: '/admin/slots', label: 'Slots' },
  { to: '/admin/settings', label: 'Settings' },
]

function AdminNav({ logoutAdmin }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/80 bg-white/70 p-2 shadow-sm backdrop-blur">
      <nav className="flex flex-wrap gap-2" aria-label="Admin navigation">
        {adminLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `rounded-lg border px-3.5 py-2.5 text-sm font-black transition ${
                isActive
                  ? 'border-zinc-950 bg-zinc-950 text-white shadow-[0_10px_22px_rgba(24,24,27,0.22)]'
                  : 'border-transparent bg-transparent text-zinc-600 hover:bg-white hover:text-zinc-950'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      {logoutAdmin && (
        <button className="btn-ghost" onClick={logoutAdmin}>
          Logout
        </button>
      )}
    </div>
  )
}

export default AdminNav
