import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';

// Generate 45-min slot labels from a slot value like "09:00"
function slotLabel(value) {
  const [hStr, mStr] = value.split(':');
  let h = parseInt(hStr), m = parseInt(mStr);
  const startH = h % 12 === 0 ? 12 : h % 12;
  const startAmPm = h < 12 ? 'AM' : 'PM';
  const startLabel = `${startH}:${mStr} ${startAmPm}`;
  return startLabel;
}

function formatDateKey(isoDate) {
  // "2026-06-25" → keep as is for key comparison
  return isoDate;
}

export default function Form() {
  const location = useLocation();
  const passedConsultant = location.state?.consultant || null;

  const [consultants, setConsultants] = useState([]);
  const [selectedConsultant, setSelectedConsultant] = useState(passedConsultant);
  const [loading, setLoading] = useState(!passedConsultant);

  // Availability from DB
  const [availSchedule, setAvailSchedule] = useState({}); // { "2026-06-25": ["09:00","09:45"] }
  const [bookedSlots, setBookedSlots]       = useState({}); // already booked
  const [availLoading, setAvailLoading]     = useState(false);

  // Booking state
  const [selectedDate, setSelectedDate]   = useState('');   // "2026-06-25"
  const [selectedSlot, setSelectedSlot]   = useState('');   // "09:00"
  const [viewMonth, setViewMonth]         = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });
  const [clientName, setClientName]       = useState('');
  const [clientEmail, setClientEmail]     = useState('');
  const [clientContext, setClientContext] = useState('');
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingDetails, setBookingDetails]     = useState(null);

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  // Fetch consultants if none passed
  useEffect(() => {
    if (!passedConsultant) {
      const fetchConsultants = async () => {
        try {
          const res = await fetch('/api/consultants');
          if (res.ok) {
            const data = await res.json();
            setConsultants(data);
            if (data.length > 0) setSelectedConsultant(data[0]);
          }
        } catch (err) {
          console.error('Failed to load consultants:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchConsultants();
    }
  }, [passedConsultant]);

  // Fetch availability whenever consultant changes
  useEffect(() => {
    if (!selectedConsultant?._id) return;
    const fetchAvail = async () => {
      setAvailLoading(true);
      setSelectedDate('');
      setSelectedSlot('');
      try {
        const res = await fetch(`/api/availability?consultantId=${selectedConsultant._id}`);
        if (res.ok) {
          const data = await res.json();
          setAvailSchedule(data.schedule || {});
          setBookedSlots(data.bookedSlots || {});
        } else {
          setAvailSchedule({});
          setBookedSlots({});
        }
      } catch (e) {
        setAvailSchedule({});
        setBookedSlots({});
      } finally {
        setAvailLoading(false);
      }
    };
    fetchAvail();
  }, [selectedConsultant?._id]);

  // Build calendar days for current view month
  const buildCalendarDays = () => {
    const { year, month } = viewMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date(); today.setHours(0,0,0,0);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const hasSlots = availSchedule[dateStr] && availSchedule[dateStr].length > 0;
      const alreadyBooked = bookedSlots[dateStr] || [];
      const openSlots = hasSlots ? availSchedule[dateStr].filter(s => !alreadyBooked.includes(s)) : [];
      days.push({
        d, dateStr,
        isPast: date < today,
        hasAvailability: hasSlots && openSlots.length > 0,
        isFullyBooked: hasSlots && openSlots.length === 0
      });
    }
    return days;
  };

  // Slots for selected date — filter out already booked
  const openSlotsForDay = selectedDate
    ? (availSchedule[selectedDate] || []).filter(s => !(bookedSlots[selectedDate] || []).includes(s))
    : [];

  const hasAnyAvailability = Object.values(availSchedule).some(slots => slots && slots.length > 0);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedConsultant) return alert('Please select a consultant.');
    if (!selectedDate) return alert('Please select a booking date.');
    if (!selectedSlot) return alert('Please select a time slot.');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultantId: selectedConsultant._id,
          consultantEmail: selectedConsultant.email,
          consultantName: selectedConsultant.fullName || selectedConsultant.name,
          date: selectedDate,
          slot: selectedSlot,
          clientName,
          clientEmail,
          context: clientContext,
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to book session');
      }
      setBookingDetails({
        id: data.bookingId,
        consultant: selectedConsultant,
        date: new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: slotLabel(selectedSlot) + ' (45 min)',
        clientName,
        clientEmail,
        meetLink: data.meetLink
      });
      setBookingConfirmed(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedFee = selectedConsultant ? parseInt((selectedConsultant.price || '2500').toString().replace(/[^0-9]/g, '')) : 2500;
  const platformFee = 250;
  const totalAmount = calculatedFee + platformFee;

  // ─── Booking Confirmed Screen ─────────────────────────────────────────────
  if (bookingConfirmed && bookingDetails) {
    return (
      <div className="bg-surface font-body text-on-surface min-h-screen">
        <Navbar />
        <main className="max-w-3xl mx-auto px-6 py-16 flex flex-col items-center">
          <div className="bg-white rounded-3xl p-10 border border-outline-variant/10 shadow-2xl w-full text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-blue-400"></div>
            
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>

            <h2 className="text-3xl font-headline font-extrabold text-on-surface mb-2">Consultation Scheduled!</h2>
            <p className="text-sm text-secondary mb-8">We've sent a calendar invite and payment invoice to <span className="font-semibold text-primary">{bookingDetails.clientEmail}</span>.</p>

            <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-4 mb-8">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Booking ID</span>
                <span className="text-sm font-mono font-bold text-slate-700">{bookingDetails.id}</span>
              </div>
              <div className="flex items-center gap-4 py-1">
                <img 
                  src={bookingDetails.consultant.profileImage || bookingDetails.consultant.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'} 
                  alt={bookingDetails.consultant.fullName || bookingDetails.consultant.name} 
                  className="w-12 h-12 rounded-xl object-cover" 
                />
                <div>
                  <h4 className="font-bold text-on-surface text-sm">{bookingDetails.consultant.fullName || bookingDetails.consultant.name}</h4>
                  <p className="text-xs text-primary font-bold uppercase tracking-widest">{bookingDetails.consultant.role || bookingDetails.consultant.profession}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200/50">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Date</span>
                  <p className="text-sm font-semibold mt-0.5">{bookingDetails.date}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Time Slot</span>
                  <p className="text-sm font-semibold mt-0.5">{bookingDetails.time}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200/50">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Google Meet Link</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-slate-400 text-sm">videocam</span>
                  <a href={bookingDetails.meetLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary font-semibold hover:underline truncate">{bookingDetails.meetLink}</a>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/experts" className="flex-1 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg text-center">Back to Directory</Link>
              <Link to="/" className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-center">Go to Homepage</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── Main Booking Form ────────────────────────────────────────────────────
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pb-12">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-3">Schedule Your Consultation</h1>
          <p className="text-secondary text-sm">Review your matching expert, pick an open date slot, and share your context parameters to book a session.</p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-secondary font-medium">Loading session scheduler...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Expert Details & Invoice */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Consultant Card */}
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
                  
                  {/* Select other consultant if dynamic */}
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

                  <div className="pt-4 space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overview</h4>
                    <p className="text-xs text-secondary leading-relaxed italic">"{selectedConsultant.bio}"</p>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 text-rose-600 p-6 rounded-3xl border border-rose-100 text-center">
                  <span className="material-symbols-outlined text-3xl mb-2">person_off</span>
                  <p className="font-bold">No consultant selected</p>
                  <Link to="/experts" className="text-sm text-primary font-semibold hover:underline mt-2 inline-block">Return to experts directory</Link>
                </div>
              )}

              {/* Invoice Summary */}
              {selectedConsultant && (
                <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <h4 className="font-headline font-bold text-sm mb-4 uppercase tracking-wider text-slate-400">Fee Architecture</h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Consultation Session (45 min)</span>
                      <span className="font-semibold">₹{calculatedFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Strategic Alignment Fee</span>
                      <span className="font-semibold">₹{platformFee.toLocaleString()}</span>
                    </div>
                    <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-bold">
                      <span className="text-slate-200">Total Charged Amount</span>
                      <span className="text-blue-400">₹{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
                </div>
              )}
            </div>

            {/* Right Column: Scheduling */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-8 border border-outline-variant/10 shadow-md">
              <form onSubmit={handleBookingSubmit} className="space-y-8">
                
                {/* 1. Calendar Date Picker */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">1. Select Consultation Date</label>

                  {availLoading ? (
                    <div className="flex items-center gap-3 py-6 text-primary">
                      <div className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                      <span className="text-sm font-semibold">Loading availability...</span>
                    </div>
                  ) : !hasAnyAvailability ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
                      <span className="material-symbols-outlined text-amber-500 text-3xl mb-2">event_busy</span>
                      <p className="text-sm font-semibold text-amber-800">No availability set yet</p>
                      <p className="text-xs text-amber-700 mt-1">This consultant hasn't published their availability. Please check back soon.</p>
                    </div>
                  ) : (
                    <>
                      {/* Month navigator */}
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setViewMonth(prev => {
                            let m = prev.month - 1, y = prev.year;
                            if (m < 0) { m = 11; y--; }
                            return { year: y, month: m };
                          })}
                          className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-500"
                        ><span className="material-symbols-outlined">chevron_left</span></button>
                        <span className="font-headline font-extrabold text-base">
                          {MONTH_NAMES[viewMonth.month]} {viewMonth.year}
                        </span>
                        <button
                          type="button"
                          onClick={() => setViewMonth(prev => {
                            let m = prev.month + 1, y = prev.year;
                            if (m > 11) { m = 0; y++; }
                            return { year: y, month: m };
                          })}
                          className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-500"
                        ><span className="material-symbols-outlined">chevron_right</span></button>
                      </div>

                      {/* Day-of-week headers */}
                      <div className="grid grid-cols-7 text-center">
                        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                          <div key={d} className="text-[10px] font-black text-slate-400 uppercase py-1">{d}</div>
                        ))}
                      </div>

                      {/* Calendar grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {buildCalendarDays().map((day, i) => {
                          if (!day) return <div key={`blank-${i}`} />;
                          const isSelected = selectedDate === day.dateStr;
                          return (
                            <button
                              key={day.dateStr}
                              type="button"
                              disabled={day.isPast || !day.hasAvailability}
                              onClick={() => { setSelectedDate(day.dateStr); setSelectedSlot(''); }}
                              title={
                                day.isPast ? 'Past date' :
                                day.isFullyBooked ? 'Fully booked' :
                                !day.hasAvailability ? 'Not available' :
                                'Click to select'
                              }
                              className={`aspect-square rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5
                                ${day.isPast
                                  ? 'text-slate-200 cursor-not-allowed'
                                  : day.isFullyBooked
                                  ? 'text-slate-300 line-through cursor-not-allowed'
                                  : !day.hasAvailability
                                  ? 'text-slate-200 cursor-not-allowed'
                                  : isSelected
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

                      {/* Legend */}
                      <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary/15"/><span className="text-slate-500">Available</span></div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200"/><span className="text-slate-400">Unavailable</span></div>
                      </div>
                    </>
                  )}
                </div>

                {/* 2. Time Slot Picker */}
                {selectedDate && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">2. Select Open Time Slot</label>
                      <span className="text-[10px] text-slate-400">
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </span>
                    </div>

                    {openSlotsForDay.length === 0 ? (
                      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center text-sm text-rose-600 font-semibold">
                        All slots on this day are fully booked. Please select another date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {openSlotsForDay.map((slot) => (
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

                {/* 3. Client Information */}
                <div className="pt-6 border-t border-slate-100 space-y-6">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">3. Contact & Challenge Details</label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Your Full Name</label>
                      <input 
                        value={clientName} 
                        onChange={(e) => setClientName(e.target.value)} 
                        required 
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" 
                        placeholder="John Doe" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Your Business Email</label>
                      <input 
                        value={clientEmail} 
                        onChange={(e) => setClientEmail(e.target.value)} 
                        required 
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" 
                        placeholder="j.doe@enterprise.com" 
                        type="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">Challenge or Consultation Focus</label>
                    <textarea 
                      value={clientContext} 
                      onChange={(e) => setClientContext(e.target.value)} 
                      required 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" 
                      placeholder="Briefly state the primary decision, bottleneck, or scaling challenge you want advice on..." 
                      rows="4"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-6">
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !selectedDate || !selectedSlot}
                    className="w-full py-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <><span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> Confirming...</>
                    ) : (
                      <>Confirm & Schedule Session <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span></>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-tighter">
                    By booking, you agree to ProDecide's <span className="text-primary font-bold cursor-pointer">Terms of Service</span> and professional guarantee.
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
