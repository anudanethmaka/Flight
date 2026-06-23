export default function LoadingSpinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };
  return (
    <div className="flex justify-center items-center py-8">
      <div
        className={`${sizes[size]} border-white/10 border-t-accent rounded-full animate-spin`}
      />
    </div>
  );
}
