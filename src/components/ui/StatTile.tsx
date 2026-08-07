// Headline number tile for KPI rows. Tones map to the existing semantic
// ramps -- no parallel palette: neutral is the default surface, warn flags
// "look at this", danger means the number itself is a problem, success is
// a healthy confirmation.

type Tone = 'neutral' | 'success' | 'warn' | 'danger'

interface Props {
  label: string
  value: React.ReactNode
  // Secondary line under the value -- "72% · 14 remaining".
  sub?: React.ReactNode
  tone?: Tone
}

export default function StatTile({ label, value, sub, tone = 'neutral' }: Props) {
  return (
    <div className={`stat-tile stat-tile--${tone}`}>
      <div className="stat-tile-label">{label}</div>
      <div className="stat-tile-value">{value}</div>
      {sub && <div className="stat-tile-sub">{sub}</div>}
    </div>
  )
}
