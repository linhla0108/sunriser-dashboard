interface TopBarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1
          className="text-2xl font-semibold text-[#17191c] tracking-tight"
          style={{ fontFamily: "'Signifier', Georgia, 'Times New Roman', serif" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[#777b86] mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
