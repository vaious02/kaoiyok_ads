export default function Spinner({ label = 'กำลังโหลด…' }: { label?: string }) {
  return (
    <div className="spinner-wrap" role="status" aria-live="polite">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  )
}
