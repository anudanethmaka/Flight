import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md"
      >
        {/* Animated plane */}
        <motion.div
          animate={{ x: [0, 20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-accent/20">
            <Plane className="w-12 h-12 text-accent" />
          </div>
        </motion.div>

        {/* 404 text */}
        <h1 className="text-8xl font-black text-accent/20 tracking-tight leading-none mb-2">
          404
        </h1>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Page Not Found
        </h2>
        <p className="text-muted text-sm leading-relaxed mb-8">
          Looks like this flight doesn't exist! The page you're looking for may
          have been moved, deleted, or never existed.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-accent text-surface px-6 py-2.5 rounded-lg font-semibold hover:bg-accent-dark transition-colors shadow-lg shadow-accent/20"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-foreground px-6 py-2.5 rounded-lg font-semibold hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
