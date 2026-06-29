import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plane,
  Search,
  CalendarDays,
  Ticket,
  BellRing,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Layout from '../components/ui/Layout';
import ChatWidget from '../components/chatbot/ChatWidget';
import AirportInput from '../components/ui/AirportInput';

const features = [
  {
    icon: Ticket,
    title: 'Easy Booking',
    desc: 'Search, compare and reserve your seat in seconds with a streamlined, distraction-free flow.',
  },
  {
    icon: BellRing,
    title: 'Real-time Updates',
    desc: 'Live gate changes, delays and confirmations delivered the moment they happen.',
  },
  {
    icon: Sparkles,
    title: 'AI Travel Assistant',
    desc: 'Ask anything about routes, baggage or bookings and get instant intelligent answers.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (date) params.set('date', date);
    navigate(`/flights?${params.toString()}`);
  };

  const inputClass =
    'w-full bg-surface-2/70 border border-white/10 rounded-lg px-3.5 py-2.5 text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/30 transition-all';

  return (
    <Layout>
      {/* Hero */}
      <section className="relative z-20 rounded-3xl glass-strong glow-border px-6 py-16 md:px-14 md:py-24 mb-16">
        {/* Background container to isolate overflow-hidden for ambient blurs */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          {/* Ambient accents */}
          <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />
          <Plane className="absolute top-10 right-10 w-40 h-40 text-white/[0.04] rotate-45 animate-float" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <motion.span
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-accent mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" /> Next-generation flight booking
          </motion.span>

          <motion.h1
            initial="hidden"
            animate="show"
            custom={1}
            variants={fadeUp}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-balance leading-[1.05]"
          >
            Fly smarter with{' '}
            <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
              SkyLink
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            custom={2}
            variants={fadeUp}
            className="mt-5 text-lg text-muted text-pretty max-w-xl"
          >
            Discover and book flights to hundreds of destinations worldwide, with
            real-time updates and an AI assistant by your side.
          </motion.p>

          {/* Glass search bar */}
          <motion.form
            initial="hidden"
            animate="show"
            custom={3}
            variants={fadeUp}
            onSubmit={handleSearch}
            className="mt-10 glass rounded-2xl border border-accent/20 shadow-glow p-4 md:p-5"
          >
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              <div className="flex-1 min-w-0">
                <AirportInput
                  label="From"
                  value={from}
                  onChange={setFrom}
                  placeholder="Departure airport"
                />
              </div>
              <div className="flex-1 min-w-0">
                <AirportInput
                  label="To"
                  value={to}
                  onChange={setTo}
                  placeholder="Arrival airport"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-muted mb-1.5">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-accent text-surface font-semibold px-6 py-2.5 rounded-lg hover:bg-accent-dark shadow-lg shadow-accent/30 hover:shadow-accent/50 transition-all md:mb-0"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* Features */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
      >
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="glass rounded-2xl p-7 border border-white/10 hover:border-accent/30 hover:shadow-glow transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* CTA banner */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        className="relative overflow-hidden glass-strong rounded-3xl border border-white/10 p-10 md:p-12 mb-8 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
        <div className="relative">
          <h2 className="text-2xl md:text-3xl font-bold text-balance">
            Ready for takeoff?
          </h2>
          <p className="text-muted mt-2 max-w-md text-pretty">
            Create a free account and start booking your next journey in minutes.
          </p>
        </div>
        <button
          onClick={() => navigate('/register')}
          className="relative inline-flex items-center gap-2 bg-accent text-surface font-semibold px-7 py-3 rounded-xl hover:bg-accent-dark shadow-lg shadow-accent/30 transition-all whitespace-nowrap"
        >
          Get started <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>

      <ChatWidget />
    </Layout>
  );
}
