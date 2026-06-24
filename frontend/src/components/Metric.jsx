function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <span className="block text-sm font-extrabold text-slate-500">{label}</span>
      <strong className="mt-1 block text-3xl text-slate-950">{value}</strong>
    </div>
  )
}

export default Metric
