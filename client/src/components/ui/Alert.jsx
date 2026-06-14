export default function Alert({ children, type = 'info', className = '' }) {
  const types = {
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-green-50 text-success border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-danger border-red-200',
  };
  return (
    <div className={`border rounded-md px-4 py-3 text-sm ${types[type]} ${className}`}>
      {children}
    </div>
  );
}
