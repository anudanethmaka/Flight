export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'px-4 py-2 rounded-md font-medium transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-light',
    secondary: 'bg-gray-100 text-primary hover:bg-gray-200',
    danger: 'bg-danger text-white hover:bg-red-700',
    accent: 'bg-accent text-white hover:bg-amber-600',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
