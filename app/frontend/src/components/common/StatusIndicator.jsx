/**
 * StatusIndicator (OO - Respeita a diretriz Zero-Pill)
 * Exibe o estado operacional do quarto ou reserva com tipografia limpa e marcador sutil.
 */
export default function StatusIndicator({
  status = 'Disponível',
  showDot = true,
  className = ''
}) {
  const normalized = String(status).toLowerCase();

  let dotColor = 'bg-stone-400';
  let textColor = 'text-stone-700';

  if (normalized.includes('disponív') || normalized.includes('disponiv') || normalized.includes('limpo')) {
    dotColor = 'bg-emerald-600';
    textColor = 'text-emerald-900';
  } else if (normalized.includes('ocupad') || normalized.includes('check-in')) {
    dotColor = 'bg-rose-600';
    textColor = 'text-rose-900';
  } else if (normalized.includes('limpeza') || normalized.includes('higieniz') || normalized.includes('sujo')) {
    dotColor = 'bg-amber-500';
    textColor = 'text-amber-900';
  } else if (normalized.includes('manuten') || normalized.includes('interdit')) {
    dotColor = 'bg-purple-600';
    textColor = 'text-purple-900';
  } else if (normalized.includes('cancelad')) {
    dotColor = 'bg-stone-400';
    textColor = 'text-stone-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${textColor} ${className}`}>
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`}
          aria-hidden="true"
        />
      )}
      <span>{status}</span>
    </span>
  );
}
