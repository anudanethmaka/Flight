import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, ArrowRight, Lock, Users, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../services/api';

// ─── Check if Stripe is properly configured (not a placeholder) ────────────────
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const PLACEHOLDER_STRIPE_KEYS = new Set([
  'pk_test_add_your_stripe_publishable_key_here',
  'pk_test_your_stripe_publishable_key_here',
]);
const STRIPE_CONFIGURED =
  /^pk_(test|live)_/.test(STRIPE_KEY) &&
  !PLACEHOLDER_STRIPE_KEYS.has(STRIPE_KEY) &&
  !STRIPE_KEY.includes('your_') &&
  STRIPE_KEY.length > 30;

// ─── Lazy-load Stripe only when configured ────────────────────────────────────
let stripePromise = null;
let StripeElements = null;
let StripePaymentElement = null;
let useStripeHook = null;
let useElementsHook = null;

if (STRIPE_CONFIGURED) {
  import('@stripe/stripe-js').then(({ loadStripe }) => {
    stripePromise = loadStripe(STRIPE_KEY);
  });
}

// ─── Simulated (no-Stripe) checkout form ──────────────────────────────────────
function SimulatedCheckoutForm({ flight, passengers, flightId, totalAmount }) {
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fake card fields for UI only — no real payment processed
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const formatCard = (v) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvv || !cardName) {
      setError('Please fill in all card details.');
      return;
    }
    setPaying(true);
    setError('');
    try {
      // Skip Stripe — create booking directly in the database
      await api.post('/bookings', { flightId, passengers });
      setSuccess(true);
      setTimeout(
        () => navigate('/dashboard', { state: { message: 'Booking confirmed! 🎉' } }),
        2000
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
      setPaying(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-10">
        <CheckCircle2 className="w-14 h-14 text-success mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
        <p className="text-muted text-sm">Redirecting to your dashboard…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handlePay} className="space-y-4">
      {error && <Alert type="error" message={error} className="mb-2" />}

      {/* Card name */}
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Name on Card</label>
        <input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="John Smith"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent transition-colors"
          required
        />
      </div>

      {/* Card number */}
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Card Number</label>
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCard(e.target.value))}
          placeholder="4242 4242 4242 4242"
          maxLength={19}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted outline-none focus:border-accent transition-colors"
          required
        />
      </div>

      {/* Expiry + CVV */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Expiry Date</label>
          <input
            type="text"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            placeholder="MM/YY"
            maxLength={5}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted outline-none focus:border-accent transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">CVV</label>
          <input
            type="password"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="•••"
            maxLength={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted outline-none focus:border-accent transition-colors"
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted pt-1">
        <Lock className="w-3.5 h-3.5 flex-shrink-0" />
        This is a demo environment. No real payment is processed.
      </div>

      <Button type="submit" disabled={paying} className="w-full mt-2">
        {paying ? (
          <span className="flex items-center gap-2 justify-center">
            <span className="w-4 h-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
            Processing…
          </span>
        ) : (
          <span className="flex items-center gap-2 justify-center">
            <CreditCard className="w-4 h-4" />
            Confirm Booking — ${totalAmount}
          </span>
        )}
      </Button>
    </form>
  );
}

// ─── Stripe checkout form (only used when Stripe IS configured) ───────────────
function StripeCheckoutForm({ flight, passengers, flightId, totalAmount, clientSecret }) {
  const navigate = useNavigate();
  const [StripeComp, setStripeComp] = useState(null);

  useEffect(() => {
    // Dynamically import Stripe components only when needed
    Promise.all([
      import('@stripe/stripe-js').then(({ loadStripe }) => loadStripe(STRIPE_KEY)),
      import('@stripe/react-stripe-js'),
    ]).then(([stripe, stripeReact]) => {
      setStripeComp({ stripe, ...stripeReact });
    });
  }, []);

  if (!StripeComp) return <LoadingSpinner />;

  const { Elements, PaymentElement, useStripe, useElements } = StripeComp;

  function InnerForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handlePay = async (e) => {
      e.preventDefault();
      if (!stripe || !elements) return;
      setPaying(true);
      setError('');
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.origin + '/dashboard' },
        redirect: 'if_required',
      });
      if (stripeError) {
        setError(stripeError.message || 'Payment failed.');
        setPaying(false);
        return;
      }
      if (paymentIntent?.status === 'succeeded') {
        try {
          await api.post('/bookings', { flightId, passengers });
          setSuccess(true);
          setTimeout(() => navigate('/dashboard', { state: { message: 'Booking confirmed! 🎉' } }), 2000);
        } catch (err) {
          setError(err.response?.data?.message || 'Payment succeeded but booking failed. Contact support.');
          setPaying(false);
        }
      } else {
        setError('Payment was not completed. Please try again.');
        setPaying(false);
      }
    };

    if (success) {
      return (
        <div className="text-center py-10">
          <CheckCircle2 className="w-14 h-14 text-success mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="text-muted text-sm">Redirecting to your dashboard…</p>
        </div>
      );
    }

    return (
      <form onSubmit={handlePay}>
        {error && <Alert type="error" message={error} className="mb-4" />}
        <div className="mb-4"><PaymentElement /></div>
        <div className="flex items-center gap-2 text-xs text-muted mb-4">
          <Lock className="w-3.5 h-3.5" />
          Secured by Stripe. Card details never stored on our servers.
        </div>
        <Button type="submit" disabled={!stripe || paying} className="w-full">
          {paying ? (
            <span className="flex items-center gap-2 justify-center">
              <span className="w-4 h-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
              Processing…
            </span>
          ) : (
            <span className="flex items-center gap-2 justify-center">
              <CreditCard className="w-4 h-4" /> Pay ${totalAmount}
            </span>
          )}
        </Button>
        <p className="text-center text-xs text-muted mt-3">
          Test card: <span className="font-mono text-accent">4242 4242 4242 4242</span> · any future date · any CVC
        </p>
      </form>
    );
  }

  return (
    <StripeComp.Elements
      stripe={StripeComp.stripe}
      options={{
        clientSecret,
        appearance: {
          theme: 'night',
          variables: { colorPrimary: '#2dd4bf', colorBackground: '#0f1729', colorText: '#e2e8f0', borderRadius: '12px' },
        },
      }}
    >
      <InnerForm />
    </StripeComp.Elements>
  );
}

// ─── PaymentPage wrapper ──────────────────────────────────────────────────────
export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(STRIPE_CONFIGURED); // only show loader if Stripe is configured
  const [error, setError] = useState('');

  // If user navigated here without booking state, send them back
  useEffect(() => {
    if (!state?.flightId) {
      navigate('/flights');
      return;
    }

    // Only try to create a Stripe PaymentIntent if Stripe is properly configured
    if (!STRIPE_CONFIGURED) {
      setLoading(false);
      return;
    }

    api
      .post('/payments/create-intent', {
        flightId: state.flightId,
        passengerCount: state.passengers.length,
      })
      .then(({ data }) => setClientSecret(data.clientSecret))
      .catch(() => setError('Could not initialise payment. Please try again.'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!state?.flightId) return null;

  const { flight, passengers, totalAmount } = state;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold text-foreground mb-6">Complete Payment</h1>

          {/* Order summary */}
          <Card className="mb-6">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Order Summary</h2>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10">
                <Plane className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">{flight.airline} · {flight.flightNumber}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <span>{flight.departureAirport}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span>{flight.arrivalAirport}</span>
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted mb-1">
                <Users className="w-3.5 h-3.5" />
                {passengers.length} Passenger{passengers.length > 1 ? 's' : ''}
              </div>
              {passengers.map((p, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-foreground">{p.passengerName} — Seat {p.seatNumber}</span>
                  <span className="text-muted">${flight.price}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-bold text-foreground">
              <span>Total</span>
              <span className="text-accent text-lg">${totalAmount}</span>
            </div>
          </Card>

          {/* Payment form */}
          <Card>
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Payment Details</h2>

            {loading && <LoadingSpinner />}
            {error && <Alert type="error" message={error} />}

            {/* Stripe not configured — use simulated checkout */}
            {!loading && !STRIPE_CONFIGURED && (
              <SimulatedCheckoutForm
                flight={flight}
                passengers={passengers}
                flightId={state.flightId}
                totalAmount={totalAmount}
              />
            )}

            {/* Stripe configured and clientSecret ready */}
            {!loading && !error && STRIPE_CONFIGURED && clientSecret && (
              <StripeCheckoutForm
                flight={flight}
                passengers={passengers}
                flightId={state.flightId}
                totalAmount={totalAmount}
                clientSecret={clientSecret}
              />
            )}
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
