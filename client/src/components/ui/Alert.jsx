export default function Alert({ children, message, type = 'info', className = '' }) {
  const types = {
    info: 'bg-primary/10 text-primary-light border-primary/30',
    success: 'bg-success/10 text-success border-success/30',
    warning: 'bg-warning/10 text-warning border-warning/30',
    error: 'bg-danger/10 text-danger border-danger/30',
  };

  const content = children ?? message;

  return (
    <div role="alert" className={`border rounded-lg px-4 py-3 text-sm backdrop-blur-sm ${types[type]} ${className}`}>
      {content}
    </div>
  );
}
