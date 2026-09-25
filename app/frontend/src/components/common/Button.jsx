/**
 * Componente Button Reutilizável (OO - Princípio da Substituição e Variabilidade)
 * Suporta variantes de estilo, tamanhos e estados de carregamento.
 */
export default function Button({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'espresso'
  size = 'md',        // 'sm' | 'md' | 'lg'
  disabled = false,
  loading = false,
  icon: Icon = null,
  fullWidth = false,
  className = '',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded gap-1.5',
    md: 'text-sm px-4 py-2 rounded-md gap-2',
    lg: 'text-base px-5 py-2.5 rounded-lg gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-[#663f46] text-white hover:bg-[#4e2f34] focus-visible:ring-[#663f46] shadow-sm',
    espresso: 'bg-[#3c362a] text-[#e8f7ee] hover:bg-[#2b271e] focus-visible:ring-[#3c362a] shadow-sm',
    secondary: 'bg-[#b8c4bb]/30 text-[#3c362a] hover:bg-[#b8c4bb]/50 focus-visible:ring-[#b8c4bb]',
    outline: 'border border-[#663f46] text-[#663f46] bg-transparent hover:bg-[#663f46]/5 focus-visible:ring-[#663f46]',
    ghost: 'text-[#3c362a] bg-transparent hover:bg-[#b8c4bb]/20 focus-visible:ring-slate-400',
    danger: 'bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-600 shadow-sm'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${widthStyle} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
