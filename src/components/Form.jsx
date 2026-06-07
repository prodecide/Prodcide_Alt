import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';

export default function Form() {
  const location = useLocation();
  const passedConsultant = location.state?.consultant || null;

  const [consultants, setConsultants] = useState([]);
  const [selectedConsultant, setSelectedConsultant] = useState(passedConsultant);
  const [loading, setLoading] = useState(!passedConsultant);
  
  // Form details
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientContext, setClientContext] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  // Fetch all consultants if none was passed to allow manual selection
  useEffect(() => {
    if (!passedConsultant) {
      const fetchConsultants = async () => {
        try {
          const res = await fetch('/api/consultants');
          if (res.ok) {
            const data = await res.json();
            setConsultants(data);
            if (data.length > 0) {
              setSelectedConsultant(data[0]);
            }
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

  // Generate next 7 days for booking
  const getNext7Days = () => {
    const days = [];
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        formatted: date.toLocaleDateString('en-US', options),
        value: date.toISOString().split('T')[0]
      });
    }
    return days;
  };

  const timeSlots = [
    '09:30 AM - 10:30 AM',
    '11:00 AM - 12:00 PM',
    '02:00 PM - 03:00 PM',
    '04:30 PM - 05:30 PM'
  ];

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!selectedConsultant) return alert('Please select a consultant.');
    if (!selectedDate) return alert('Please select a booking date.');
    if (!selectedTime) return alert('Please select a booking time slot.');

    const uniqueId = 'PD-' + Math.floor(100000 + Math.random() * 900000);
    setBookingDetails({
      id: uniqueId,
      consultant: selectedConsultant,
      date: selectedDate,
      time: selectedTime,
      clientName,
      clientEmail,
      context: clientContext,
      meetLink: 'https://meet.google.com/pd-' + Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 5)
    });
    setBookingConfirmed(true);
  };

  const calculatedFee = selectedConsultant ? parseInt((selectedConsultant.price || '2500').toString().replace(/[^0-9]/g, '')) : 2500;
  const platformFee = 250;
  const totalAmount = calculatedFee + platformFee;

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
              <Link to="/experts" className="flex-1 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg">
                Back to Directory
              </Link>
              <Link to="/" className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">
                Go to Homepage
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
                      <span className="text-slate-400">Consultation Session</span>
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

            {/* Right Column: Scheduling inputs */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-8 border border-outline-variant/10 shadow-md">
              <form onSubmit={handleBookingSubmit} className="space-y-8">
                
                {/* 1. Date Picker slots */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">1. Select Consultation Date</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {getNext7Days().map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => setSelectedDate(day.formatted)}
                        className={`py-3 px-4 rounded-xl border font-bold text-sm text-center transition-all ${
                          selectedDate === day.formatted
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                            : 'border-slate-200 text-slate-600 hover:border-primary/50'
                        }`}
                      >
                        {day.formatted}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Time Slot slots */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">2. Select Open Time Slot</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`py-3.5 px-6 rounded-xl border font-bold text-sm text-left flex justify-between items-center transition-all ${
                          selectedTime === slot
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                            : 'border-slate-200 text-slate-600 hover:border-primary/50'
                        }`}
                      >
                        <span>{slot}</span>
                        <span className={`material-symbols-outlined text-lg ${selectedTime === slot ? 'text-white' : 'text-slate-300'}`}>
                          {selectedTime === slot ? 'check_circle' : 'schedule'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

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

                {/* Submit button */}
                <div className="pt-6">
                  <button 
                    type="submit" 
                    className="w-full py-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    Confirm & Schedule Session
                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
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
