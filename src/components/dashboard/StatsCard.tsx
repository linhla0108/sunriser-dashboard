interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  accent?: boolean
}

export default function StatsCard({ title, value, subtitle, accent }: StatsCardProps) {
  return (
    <div
      className="bg-white rounded-3xl p-6 flex flex-col gap-3"
      style={{
        boxShadow:
          'rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px',
      }}
    >
      <p className="text-xs font-medium text-[#777b86] uppercase tracking-widest">{title}</p>
      <div className="flex items-end gap-2">
        <span
          className={`text-4xl font-bold tracking-tight ${
            accent ? 'text-[#5d2a1a]' : 'text-[#17191c]'
          }`}
          style={{ fontFamily: "'Signifier', Georgia, serif" }}
        >
          {value}
        </span>
      </div>
      {subtitle && <p className="text-xs text-[#a3a6af]">{subtitle}</p>}
    </div>
  )
}
