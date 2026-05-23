interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  accent?: boolean
  dataCid?: string
}

export default function StatsCard({ title, value, subtitle, accent, dataCid }: StatsCardProps) {
  return (
    <div
      data-cid={dataCid}
      data-v2-card=""
      className="flex flex-col gap-3 rounded-3xl bg-white p-3"
      style={{
        boxShadow:
          'rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px',
      }}
    >
      <p
        data-v2-muted=""
        className="font-semibold tracking-widest text-[#6B5549] uppercase"
        style={{ fontSize: 'var(--text-label, 11px)' }}
      >
        {title}
      </p>
      <span
        data-v2-stat-value={accent ? 'accent' : 'default'}
        className={`leading-none font-bold tracking-tight ${accent ? 'text-[#FF5533]' : 'text-[#1b1b1b]'}`}
        style={{ fontSize: 'var(--text-display, 36px)', fontWeight: 'var(--weight-bold, 700)' }}
      >
        {value}
      </span>
      {subtitle && (
        <p data-v2-muted="" className="text-[#6B5549]" style={{ fontSize: 'var(--text-small, 12px)' }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
