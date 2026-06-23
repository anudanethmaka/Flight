export default function Alert({ children, type = 'info', className = '' }) {
  const types = {
    info: 'bg-primary/10 text-primary-light border-primary/30',
    success: 'bg-success/10 text-success border-success/30',
    warning: 'bg-warning/10 text-warning border-warning/30',
    error: 'bg-danger/10 text-danger border-danger/30',
  };
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm backdrop-blur-sm ${types[type]} ${className}`}>
      {children}
    </div>
  );
}
