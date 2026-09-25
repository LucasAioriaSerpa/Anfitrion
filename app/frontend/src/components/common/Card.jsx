/**
 * Componente Card Reutilizável com padrão de Composição
 */
export default function Card({
  children,
  variant = 'default', // 'default' | 'bordered' | 'flat'
  className = '',
  onClick,
  ...props
}) {
  const variantStyles = {
    default: 'bg-white rounded-xl shadow-xs border border-stone-200/80',
    bordered: 'bg-white rounded-xl border border-stone-300',
    flat: 'bg-stone-50 rounded-xl border border-stone-200/60'
  };

  const interactiveStyles = onClick ? 'cursor-pointer hover:border-[#663f46]/40 transition-colors' : '';

  return (
    <div
      onClick={onClick}
      className={`${variantStyles[variant] || variantStyles.default} ${interactiveStyles} overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = '', action = null }) {
  return (
    <div className={`p-5 pb-3 flex items-start justify-between gap-4 border-b border-stone-100 ${className}`}>
      <div className="space-y-1">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

Card.Title = function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-base font-semibold text-stone-900 tracking-tight ${className}`}>
      {children}
    </h3>
  );
};

Card.Description = function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-xs text-stone-500 leading-relaxed ${className}`}>
      {children}
    </p>
  );
};

Card.Body = function CardBody({ children, className = '' }) {
  return (
    <div className={`p-5 ${className}`}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-5 py-3.5 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-3 ${className}`}>
      {children}
    </div>
  );
};
