import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { apiFetch } from '../utils/api.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function slotLabel(value) {
  if (!value) return '';
  const [hStr, mStr] = value.split(':');
  const h = parseInt(hStr);
  const startH = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${startH}:${mStr} ${ampm}`;
}

function formatCardNumber(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim();
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ─── Demo Payment Modal ───────────────────────────────────────────────────────
function PaymentModal({ consultant, date, slot, clientName, clientEmail, onPay, onBack, paying }) {
  const fee = parseInt((consultant?.price || '2500').toString().replace(/[^0-9]/g, ''));
  const platformFee = 250;
  const total = fee + platformFee;

  const [cardNum, setCardNum]   = useState('4111 1111 1111 1111');
  const [expiry, setExpiry]     = useState('12/28');
  const [cvv, setCvv]           = useState('123');
  const [cardName, setCardName] = useState(clientName || '');
  const [step, setStep]         = useState('review'); // 'review' | 'card' | 'processing'

  const displayDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const handleCardPay = (e) => {
    e.preventDefault();
    setStep('processing');
    setTimeout(() => onPay(total), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Gradient header */}
        <div className="bg-gradient-to-br from-[#0052FF] to-blue-700 px-8 pt-7 pb-5 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">lock</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Secure Checkout · Demo Mode</p>
              <h2 className="font-headline font-extrabold text-lg">Complete Payment</h2>
            </div>
          </div>
          {/* Summary row */}
          <div className="flex items-center justify-between bg-white/10 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-3">
              <img
                src={consultant?.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/30" alt=""
              />
              <div>
                <p className="font-bold text-sm leading-tight">{consultant?.fullName || consultant?.name}</p>
                <p className="text-white/60 text-xs">{slotLabel(slot)} · 45 min · {displayDate.split(',')[0]}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/60 font-semibold">Total</p>
              <p className="font-extrabold text-lg">₹{total.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Demo badge */}
        <div className="mx-8 mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <span className="material-symbols-outlined text-amber-500 text-sm">info</span>
          <p className="text-[11px] font-semibold text-amber-700">Demo mode — no real payment will be charged</p>
        </div>

        {step === 'processing' ? (
          /* Processing animation */
          <div className="px-8 py-12 flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-primary text-2xl">payments</span>
            </div>
            <p className="font-extrabold text-slate-800 text-base">Processing Payment…</p>
            <p className="text-xs text-slate-400">Verifying transaction with bank</p>
            <div className="flex gap-1 mt-2">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        ) : step === 'review' ? (
          /* Fee review step */
          <>
            <div className="px-8 py-5 space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Fee Breakdown</p>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Consultation Session (45 min)</span>
                <span className="font-semibold">₹{fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Platform Fee</span>
                <span className="font-semibold">₹{platformFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-extrabold text-base pt-3 border-t border-slate-100 mt-1">
                <span>Total</span>
                <span className="text-primary">₹{total.toLocaleString()}</span>
              </div>
            </div>
            <div className="px-8 pb-7 space-y-3">
              <button
                onClick={() => setStep('card')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0052FF] to-blue-600 text-white font-extrabold text-base shadow-lg shadow-primary/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">credit_card</span>
                Pay ₹{total.toLocaleString()} via Card / UPI
              </button>
              <button onClick={onBack} className="w-full py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors">
                ← Edit Details
              </button>
              <div className="flex items-center justify-center gap-3 pt-1">
                {['shield','verified','account_balance'].map((icon, i) => (
                  <div key={i} className="flex items-center gap-1 text-slate-400">
                    <span className="material-symbols-outlined text-sm">{icon}</span>
                    <span className="text-[10px] font-semibold">{['256-bit SSL','Verified','PCI DSS'][i]}</span>
                    {i < 2 && <div className="w-px h-3 bg-slate-200 ml-2" />}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Card entry form */
          <form onSubmit={handleCardPay} className="px-8 py-6 space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card Details</p>

            {/* Card number with visual card chip */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Card Number</label>
              <div className="relative">
                <input
                  value={cardNum}
                  onChange={e => setCardNum(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 pl-12 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-mono tracking-widest outline-none"
                  maxLength={19}
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">credit_card</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Expiry Date</label>
                <input
                  value={expiry}
                  onChange={e => {
                    let v = e.target.value.replace(/\D/g,'').slice(0,4);
                    if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2);
                    setExpiry(v);
                  }}
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-mono outline-none"
                  maxLength={5}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">CVV</label>
                <input
                  value={cvv}
                  onChange={e => setCvv(e.target.value.replace(/\D/g,'').slice(0,3))}
                  placeholder="123"
                  type="password"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-mono outline-none"
                  maxLength={3}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Name on Card</label>
              <input
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0052FF] to-blue-600 text-white font-extrabold text-base shadow-lg shadow-primary/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span className="material-symbols-outlined">lock</span>
              Pay ₹{total.toLocaleString()} Securely
            </button>

            <button type="button" onClick={() => setStep('review')} className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
              ← Back to Review
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Form() {
  const location = useLocation();
  const passedConsultant = location.state?.consultant || null;

  const [consultants, setConsultants]         = useState([]);
  const [selectedConsultant, setSelectedConsultant] = useState(passedConsultant);
  const [loading, setLoading]                 = useState(!passedConsultant);

  // Availability
  const [availSchedule, setAvailSchedule]     = useState({});
  const [bookedSlots, setBookedSlots]         = useState({});
  const [availLoading, setAvailLoading]       = useState(false);

  // Booking selection

  const [selectedDate, setSelectedDate]       = useState('');
  const [selectedSlot, setSelectedSlot]       = useState('');
  const [viewMonth, setViewMonth]             = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Client info
  const [clientName, setClientName]           = useState('');
  const [clientEmail, setClientEmail]         = useState('');
  const [clientContext, setClientContext]     = useState('');

  // UI state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paying, setPaying]                   = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingDetails, setBookingDetails]   = useState(null);

  // Fetch consultants if none passed
  useEffect(() => {
    if (!passedConsultant) {
      (async () => {
        try {
          const res = await apiFetch('/api/consultants');
          if (res.ok) {
            const data = await res.json();
            setConsultants(data);
            if (data.length > 0) setSelectedConsultant(data[0]);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [passedConsultant]);

  // Fetch availability when consultant changes
  useEffect(() => {
    if (!selectedConsultant?._id) return;
    (async () => {
      setAvailLoading(true);
      setSelectedDate('');
      setSelectedSlot('');
      try {
        const res = await apiFetch(`/api/availability?consultantId=${selectedConsultant._id}`);
        if (res.ok) {
          const data = await res.json();
          setAvailSchedule(data.schedule || {});
          setBookedSlots(data.bookedSlots || {});
        } else {
          setAvailSchedule({});
          setBookedSlots({});
        }
      } catch {
        setAvailSchedule({});
        setBookedSlots({});
      } finally {
        setAvailLoading(false);
      }
    })();
  }, [selectedConsultant?._id]);

  const hasAnyAvailability = Object.values(availSchedule).some(s => s && s.length > 0);

  // Calendar builder — uses real schedule or demo fallback
  const buildCalendarDays = useCallback(() => {
    const { year, month } = viewMonth;
    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const usingDemo = !hasAnyAvailability;
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date    = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = date.getDay();
      const slots   = availSchedule[dateStr] || [];
      const booked  = bookedSlots[dateStr]   || [];
      const open    = slots.filter(s => !booked.includes(s));

      // Demo fallback: weekdays from today onwards have open slots
      const isDemoAvailable = usingDemo && !([0, 6].includes(dayOfWeek)) && date >= today;

      days.push({
        d, dateStr,
        isPast:          date < today,
        hasAvailability: usingDemo ? isDemoAvailable : (slots.length > 0 && open.length > 0),
        isFullyBooked:   !usingDemo && slots.length > 0 && open.length === 0
      });
    }
    return days;
  }, [viewMonth, availSchedule, bookedSlots, hasAnyAvailability]);

  // Demo slots shown when consultant has no availability set
  const DEMO_SLOTS = ['09:00','09:45','10:30','11:15','14:00','14:45','15:30','16:15'];

  const openSlotsForDay = selectedDate
    ? hasAnyAvailability
      ? (availSchedule[selectedDate] || []).filter(s => !(bookedSlots[selectedDate] || []).includes(s))
      : DEMO_SLOTS  // fallback for demo
    : [];

  const fee = selectedConsultant
    ? parseInt((selectedConsultant.price || '2500').toString().replace(/[^0-9]/g, ''))
    : 2500;
  const platformFee = 250;
  const totalAmount = fee + platformFee;

  // ── Handle "Proceed to Payment" button ───────────────────────────────────
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!selectedConsultant) return alert('Please select a consultant.');
    if (!selectedDate)       return alert('Please select a date.');
    if (!selectedSlot)       return alert('Please select a time slot.');
    setShowPaymentModal(true);
  };

  // ── Demo payment: save booking directly to DB (no real payment) ──────────
  const handlePay = async (total) => {
    setPaying(true);
    try {
      const res = await apiFetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultantId:    selectedConsultant._id,
          consultantEmail: selectedConsultant.email,
          consultantName:  selectedConsultant.fullName || selectedConsultant.name,
          date:            selectedDate,
          slot:            selectedSlot,
          clientName,
          clientEmail,
          context:         clientContext,
        })
      });
      const booking = await res.json();
      if (!res.ok) throw new Error(booking.error || 'Booking failed');

      setBookingDetails({
        id:        booking.bookingId,
        consultant: selectedConsultant,
        date:      new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time:      `${slotLabel(selectedSlot)} (45 min)`,
        clientName,
        clientEmail,
        meetLink:  booking.meetLink,
        paymentId: `DEMO-${Date.now()}`
      });
      setShowPaymentModal(false);
      setBookingConfirmed(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setPaying(false);
    }
  };

  // ─── Booking Confirmed Screen ────────────────────────────────────────────
  if (bookingConfirmed && bookingDetails) {
    return (
      <div className="bg-surface font-body text-on-surface min-h-screen">
        <Navbar />
        <main className="max-w-2xl mx-auto px-6 py-16">
          <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-2xl overflow-hidden">
            {/* Top gradient bar */}
            <div className="h-2 bg-gradient-to-r from-primary to-blue-500" />

            <div className="p-10 text-center">
              {/* Success icon */}
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <span className="material-symbols-outlined text-green-500 text-4xl">check_circle</span>
              </div>

              <h2 className="font-headline font-extrabold text-3xl text-on-surface mb-2">You're Booked!</h2>
              <p className="text-secondary text-sm mb-8">
                Payment confirmed. A calendar invite has been sent to{' '}
                <span className="font-semibold text-primary">{bookingDetails.clientEmail}</span>.
              </p>

              {/* Booking card */}
              <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-4 mb-8">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Booking ID</span>
                  <span className="font-mono font-bold text-slate-700 text-sm">{bookingDetails.id}</span>
                </div>

                <div className="flex items-center gap-4">
                  <img
                    src={bookingDetails.consultant.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                    className="w-14 h-14 rounded-xl object-cover"
                    alt={bookingDetails.consultant.fullName}
                  />
                  <div>
                    <p className="font-extrabold text-on-surface">{bookingDetails.consultant.fullName || bookingDetails.consultant.name}</p>
                    <p className="text-primary font-bold text-xs uppercase tracking-widest">{bookingDetails.consultant.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200/50">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Date</span>
                    <p className="text-sm font-semibold mt-0.5">{bookingDetails.date}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Time</span>
                    <p className="text-sm font-semibold mt-0.5">{bookingDetails.time}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/50">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Google Meet</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-slate-400 text-sm">videocam</span>
                    <a href={bookingDetails.meetLink} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-primary font-semibold hover:underline truncate"
                    >{bookingDetails.meetLink}</a>
                  </div>
                </div>

                {bookingDetails.paymentId && (
                  <div className="pt-3 border-t border-slate-200/50">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Payment ID</span>
                    <p className="font-mono text-xs text-slate-500 mt-0.5">{bookingDetails.paymentId}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/experts"
                  className="flex-1 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-center"
                >Back to Directory</Link>
                <Link to="/"
                  className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-center"
                >Go to Homepage</Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── Main Booking Form ───────────────────────────────────────────────────
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pb-12">
      <Navbar />

      {/* Payment Modal Overlay */}
      {showPaymentModal && (
        <PaymentModal
          consultant={selectedConsultant}
          date={selectedDate}
          slot={selectedSlot}
          clientName={clientName}
          clientEmail={clientEmail}
          context={clientContext}
          onPay={handlePay}
          onBack={() => setShowPaymentModal(false)}
          paying={paying}
        />
      )}

      <main className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-3">
            Schedule Your Consultation
          </h1>
          <p className="text-secondary text-sm">
            Review your matching expert, pick an open date slot, and share your context to book a session.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-secondary font-medium">Loading session scheduler...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ─── Left: Expert + Invoice ─────────────────────────────── */}
            <div className="lg:col-span-4 space-y-6">

              {selectedConsultant ? (
                <div className="bg-white rounded-3xl p-6 border border-outline-variant/10 shadow-md">
                  <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 mb-4 shadow-md">
                      <img
                        src={selectedConsultant.profileImage || selectedConsultant.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'}
                        alt={selectedConsultant.fullName || selectedConsultant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-extrabold text-xl text-on-surface">{selectedConsultant.fullName || selectedConsultant.name}</h3>
                    <p className="text-primary font-bold text-xs uppercase tracking-widest mt-1">{selectedConsultant.role || selectedConsultant.profession}</p>
                    <p className="text-secondary text-xs mt-1">{selectedConsultant.organization}</p>
                  </div>

                  {!passedConsultant && consultants.length > 1 && (
                    <div className="py-4 border-b border-slate-100">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Change Specialist</label>
                      <select
                        value={selectedConsultant._id}
                        onChange={(e) => setSelectedConsultant(consultants.find(c => c._id === e.target.value))}
                        className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm text-slate-700 outline-none"
                      >
                        {consultants.map(c => (
                          <option key={c._id} value={c._id}>{c.fullName || c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="pt-4 space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overview</h4>
                    <p className="text-xs text-secondary leading-relaxed italic">"{selectedConsultant.bio}"</p>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 text-rose-600 p-6 rounded-3xl border border-rose-100 text-center">
                  <span className="material-symbols-outlined text-3xl mb-2">person_off</span>
                  <p className="font-bold">No consultant selected</p>
                  <Link to="/experts" className="text-sm text-primary font-semibold hover:underline mt-2 inline-block">
                    Return to experts directory
                  </Link>
                </div>
              )}

              {/* Invoice preview */}
              {selectedConsultant && (
                <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <h4 className="font-headline font-bold text-sm mb-4 uppercase tracking-wider text-slate-400">Fee Architecture</h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Consultation Session (45 min)</span>
                      <span className="font-semibold">₹{fee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Strategic Alignment Fee</span>
                      <span className="font-semibold">₹{platformFee.toLocaleString()}</span>
                    </div>
                    <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-bold">
                      <span className="text-slate-200">Total</span>
                      <span className="text-blue-400">₹{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                </div>
              )}
            </div>

            {/* ─── Right: Form ──────────────────────────────────────────── */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-8 border border-outline-variant/10 shadow-md">
              <form onSubmit={handleFormSubmit} className="space-y-8">

                {/* 1. Date picker */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    1. Select Consultation Date
                  </label>

                  {availLoading ? (
                    <div className="flex items-center gap-3 py-6 text-primary">
                      <div className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                      <span className="text-sm font-semibold">Loading availability...</span>
                    </div>
                  ) : (
                    <>
                      {/* Month nav */}
                      <div className="flex items-center justify-between">
                        <button type="button"
                          onClick={() => setViewMonth(p => {
                            let m = p.month - 1, y = p.year;
                            if (m < 0) { m = 11; y--; }
                            return { year: y, month: m };
                          })}
                          className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-500"
                        ><span className="material-symbols-outlined">chevron_left</span></button>
                        <span className="font-headline font-extrabold text-base">
                          {MONTH_NAMES[viewMonth.month]} {viewMonth.year}
                        </span>
                        <button type="button"
                          onClick={() => setViewMonth(p => {
                            let m = p.month + 1, y = p.year;
                            if (m > 11) { m = 0; y++; }
                            return { year: y, month: m };
                          })}
                          className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-500"
                        ><span className="material-symbols-outlined">chevron_right</span></button>
                      </div>

                      {/* Weekday headers */}
                      <div className="grid grid-cols-7 text-center">
                        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                          <div key={d} className="text-[10px] font-black text-slate-400 uppercase py-1">{d}</div>
                        ))}
                      </div>

                      {/* Calendar grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {buildCalendarDays().map((day, i) => {
                          if (!day) return <div key={`b-${i}`} />;
                          const isSel = selectedDate === day.dateStr;
                          return (
                            <button
                              key={day.dateStr}
                              type="button"
                              disabled={day.isPast || !day.hasAvailability}
                              onClick={() => { setSelectedDate(day.dateStr); setSelectedSlot(''); }}
                              className={`aspect-square rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 p-1 sm:p-2
                                ${day.isPast
                                  ? 'text-slate-200 cursor-not-allowed'
                                  : day.isFullyBooked
                                  ? 'text-slate-300 line-through cursor-not-allowed'
                                  : !day.hasAvailability
                                  ? 'text-slate-200 cursor-not-allowed'
                                  : isSel
                                  ? 'bg-primary text-white shadow-lg shadow-primary/20 ring-2 ring-primary ring-offset-1'
                                  : 'bg-primary/10 text-primary font-extrabold hover:bg-primary/20 cursor-pointer'
                                }`}
                            >
                              {day.d}
                              {day.hasAvailability && !day.isPast && (
                                <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary/15" /><span className="text-slate-500">Available</span></div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200" /><span className="text-slate-400">Unavailable</span></div>
                      </div>
                    </>
                  )}
                </div>

                {/* 2. Slot picker */}
                {selectedDate && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">2. Select Time Slot</label>
                      <span className="text-[10px] text-slate-400">
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    {openSlotsForDay.length === 0 ? (
                      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center text-sm text-rose-600 font-semibold">
                        All slots on this day are booked. Please pick another date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {openSlotsForDay.map(slot => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-3.5 px-4 rounded-xl border font-bold text-sm text-center transition-all flex flex-col items-center gap-0.5 ${
                              selectedSlot === slot
                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                : 'border-slate-200 text-slate-600 hover:border-primary/50 hover:text-primary'
                            }`}
                          >
                            <span>{slotLabel(slot)}</span>
                            <span className={`text-[10px] font-normal ${selectedSlot === slot ? 'text-white/70' : 'text-slate-400'}`}>45 min</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Client info */}
                <div className="pt-6 border-t border-slate-100 space-y-6">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                    3. Contact & Challenge Details
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Your Full Name</label>
                      <input value={clientName} onChange={e => setClientName(e.target.value)} required
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm"
                        placeholder="John Doe" type="text" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Your Business Email</label>
                      <input value={clientEmail} onChange={e => setClientEmail(e.target.value)} required
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm"
                        placeholder="j.doe@enterprise.com" type="email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">Challenge or Consultation Focus</label>
                    <textarea value={clientContext} onChange={e => setClientContext(e.target.value)} required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm"
                      placeholder="Briefly state the primary decision, bottleneck, or scaling challenge you want advice on..."
                      rows="4" />
                  </div>
                </div>

                {/* Submit → opens payment modal */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={!selectedDate || !selectedSlot || !clientName || !clientEmail}
                    className="w-full py-4 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-lg shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">payments</span>
                    Proceed to Payment  ₹{totalAmount.toLocaleString()}
                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </button>
                  <p className="text-center text-[10px] text-slate-400 mt-3 flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-xs">lock</span>
                    Secured by Razorpay · 256-bit SSL encryption
                  </p>
                </div>

              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
