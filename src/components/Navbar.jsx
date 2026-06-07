import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const pathname = location.pathname;

  const getLinkClass = (path) => {
    const isActive = pathname === path;
    if (isActive) {
      return "text-[#0052FF] border-b-2 border-[#0052FF] pb-1 font-manrope tracking-tight font-bold text-lg";
    }
    return "text-slate-500 dark:text-slate-400 hover:text-[#0052FF] font-manrope tracking-tight font-bold text-lg transition-all duration-200 ease-in-out";
  };

  return (
    <header className="sticky top-0 w-full z-50 bg-[#f7f9fb]/90 dark:bg-[#191c1e]/90 backdrop-blur-md border-b border-slate-200/40 shadow-sm">
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link className="text-xl font-black text-[#0052FF] tracking-tighter font-headline" to="/">ProDecide</Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link className={getLinkClass('/discovery')} to="/discovery">Discover</Link>
            <Link className={getLinkClass('/about')} to="/about">About Us</Link>
            <Link className={getLinkClass('/experts')} to="/experts">Consultants</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/registration" className="px-5 py-2 rounded-full border border-[#0052FF] text-[#0052FF] font-bold hover:bg-[#0052FF]/5 transition-all text-sm hidden sm:inline-block">
            Join as Expert
          </Link>
          <button className="p-2 rounded-md hover:bg-slate-200/50 transition-all text-slate-600">
            <span className="material-symbols-outlined text-xl">search</span>
          </button>
          <button className="p-2 rounded-md hover:bg-slate-200/50 transition-all text-slate-600">
            <span className="material-symbols-outlined text-xl">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shadow-inner">
            <img alt="Professional portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSCXL-0gLE1O170SZDAK5qcjkjlHzgDWgCAed04sK9q5lTVyLBY5AWHjBCkQG09u1tnbtWlcRM0g6JSdaKJxbGO_Ig7DNFIgrr3wnP8o3iBTqM-FH8pMQ2W2phyiWzQ4LEi8Qq9bSx4ea516zTUD77k5J4B10TBSWdD-v6XS6LE3L1Ewmt4tMDoP-O6Q_vtIO4y5jG3wGk6o5W_AUTZY-IW8fyX7HzV12RBpB1k27CjcNZsnWZ7rlXHolceeZK8drvj47Vj_efGnA" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
}
