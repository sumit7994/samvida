function Metric({ label, value }) {
  return (
    <div className="stat-card">
      <span className="block text-sm font-black uppercase text-slate-500">{label}</span>
      <strong className="mt-2 block text-4xl font-black text-slate-950">{value}</strong>
    </div>
  )
}

export default Metric
