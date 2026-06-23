export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-muted mb-1.5">{label}</label>
      )}
      <input
        className="w-full bg-surface-2/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/30 transition-all disabled:opacity-60"
        {...props}
      />
      {error && <p className="text-danger text-sm mt-1">{error}</p>}
    </div>
  );
}
