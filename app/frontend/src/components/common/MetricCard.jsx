/**
 * MetricCard (OO - Card de métrica reutilizável com foco em dados)
 */
export default function MetricCard({
  title,
  value,
  subtitle = null,
  icon: Icon = null,
  trend = null, // { text: '+5% vs ontem', positive: true }
  className = ''
}) {
  return (
    <div className={`p-4 bg-white rounded-xl border border-stone-200/80 shadow-2xs flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between text-stone-500 mb-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-stone-600">
          {title}
        </span>
        {Icon && (
          <span className="text-stone-400 p-1.5 bg-stone-100 rounded-md">
            <Icon className="w-4 h-4" />
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-stone-900 font-serif">
          {value}
        </span>
        {trend && (
          <span className={`text-xs font-medium ${trend.positive ? 'text-emerald-700' : 'text-rose-700'}`}>
            {trend.text}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="mt-2 text-xs text-stone-500">
          {subtitle}
        </div>
      )}
    </div>
  );
}
