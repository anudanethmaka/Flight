export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60';
  const variants = {
    primary:
      'bg-primary text-white hover:bg-primary-light shadow-lg shadow-primary/25 hover:shadow-primary/40',
    secondary:
      'bg-surface-3/70 text-foreground border border-white/10 hover:bg-surface-3 hover:border-white/20',
    danger: 'bg-danger text-white hover:brightness-110 shadow-lg shadow-danger/25',
    accent:
      'bg-accent text-surface hover:bg-accent-dark shadow-lg shadow-accent/30 hover:shadow-accent/50',
    ghost: 'bg-transparent text-foreground hover:bg-white/5 border border-white/10',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
