export default function Card({ children, className = '' }) {
  return (
    <div className={`glass rounded-card shadow-lg shadow-black/20 p-4 ${className}`}>
      {children}
    </div>
  );
}
