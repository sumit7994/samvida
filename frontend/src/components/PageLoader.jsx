import ButtonLoader from './ButtonLoader'

function PageLoader({ label = 'Loading' }) {
  return (
    <div className="panel flex min-h-40 items-center justify-center gap-3 text-slate-600">
      <ButtonLoader />
      <span className="font-bold">{label}</span>
    </div>
  )
}

export default PageLoader
