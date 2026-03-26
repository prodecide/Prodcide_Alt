import React from 'react';
import { Link } from 'react-router-dom';

export default function Form() {
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      
{/* TopNavBar */}
<nav className="bg-[#f7f9fb] dark:bg-slate-900 sticky top-0 z-50">
<div className="flex justify-between items-center px-8 py-4 w-full max-w-7xl mx-auto">
<div className="flex items-center gap-8">
<Link className="text-xl font-bold text-slate-900 dark:text-white tracking-tighter" to="/">ProDecide</Link>
<div className="hidden md:flex gap-6 items-center">
<Link className="font-manrope text-sm font-medium tracking-tight text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200" to="/dashboard">My Projects</Link>
<Link className="font-manrope text-sm font-medium tracking-tight text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200" to="/experts">Consultants</Link>
<a className="font-manrope text-sm font-medium tracking-tight text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200" href="#">Settings</a>
</div>
</div>
<div className="flex items-center gap-4">
<div className="relative hidden sm:block">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
<input className="bg-surface-container-lowest border-none rounded-md pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-fixed outline-none w-64 ambient-shadow" placeholder="Search..." type="text"/>
</div>
<button className="p-2 text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="p-2 text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
<span className="material-symbols-outlined">account_circle</span>
</button>
</div>
</div>
</nav>
<main>
{/* Hero Section */}
<section className="relative overflow-hidden pt-20 pb-32 px-8">
<div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
<div className="flex-1 text-left">
<h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight text-on-surface mb-8 leading-[1.1]">
                        Master Your Toughest <span className="text-primary">Decisions</span> with AI-Powered Intelligence.
                    </h1>
<p className="text-lg md:text-xl text-on-surface-variant mb-12 max-w-xl leading-relaxed">
                        ProDecide combines advanced cognitive AI with a network of elite human consultants to guide your most critical professional choices.
                    </p>
<div className="flex flex-wrap gap-4">
<button className="primary-gradient text-white font-semibold py-4 px-8 rounded-lg ambient-shadow active:scale-[0.98] transition-all">
                            Start Your Discovery
                        </button>
<button className="bg-surface-container-high text-on-surface font-semibold py-4 px-8 rounded-lg hover:bg-surface-container-highest transition-all">
                            View Methodology
                        </button>
</div>
</div>
<div className="flex-1 relative">
<div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 blur-[120px] rounded-full"></div>
<div className="bg-surface-container-lowest p-6 rounded-xl ambient-shadow relative overflow-hidden">
<img className="rounded-lg w-full h-[400px] object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700" data-alt="Modern collaborative workspace with clean professional aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZdLfr0vK_PXrmB9AE5OHi2BLCmq3_wZ6zHI_BoHPqmJnZ17J_u2hpA7314m2jCDho1pRCr_S-1XFHGZx0SphrxM-MBYcxtFeL1s7FjZehCBjzJWqrIxE0dSJ7nEWKdj2VG64wyMjJQuNoRjdRRQvHCoJ9cEyWWnrmeKOYHdUosn_L1mSySgAIiKckeIA04Fn9zi0HEj0pCvKnchnXOPk_szxQfLu2xEONPf-37P9voCncd11Sg8vBGvEwUQkoMZQQa5cR5okY4R0"/>
<div className="absolute bottom-10 right-10 glass-effect p-6 rounded-xl ambient-shadow max-w-[240px]">
<div className="flex items-center gap-2 mb-2">
<span className="material-symbols-outlined text-primary" data-weight="fill">auto_awesome</span>
<span className="font-headline font-bold text-sm">AI Insight</span>
</div>
<p className="text-xs text-on-surface-variant leading-relaxed">Optimization path detected: 94% confidence in strategic alignment for Q4 expansion.</p>
</div>
</div>
</div>
</div>
</section>
{/* How It Works Section - Asymmetric Bento Grid */}
<section className="bg-surface-container-low py-24 px-8">
<div className="max-w-7xl mx-auto">
<div className="mb-16">
<h2 className="font-headline text-4xl font-bold tracking-tight mb-4">A Framework for Clarity</h2>
<p className="text-on-surface-variant">Three pillars of informed decision architecture.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
{/* Step 1 */}
<div className="md:col-span-8 bg-surface-container-lowest p-10 rounded-xl flex flex-col justify-between group">
<div className="max-w-md">
<span className="inline-block px-3 py-1 rounded-sm bg-primary-fixed text-on-primary-fixed text-[10px] font-bold tracking-widest uppercase mb-6">Phase 01</span>
<h3 className="font-headline text-3xl font-bold mb-4">AI Understands</h3>
<p className="text-on-surface-variant leading-relaxed">Our advanced neural models ingest your complex variables—market data, risk factors, and institutional goals—to build a multi-dimensional map of your decision landscape.</p>
</div>
<div className="mt-12 flex items-center gap-4">
<div className="h-1 w-24 bg-surface-container-high rounded-full overflow-hidden">
<div className="h-full bg-primary w-1/2"></div>
</div>
<span className="text-xs font-medium text-primary">Data Synthesis Active</span>
</div>
</div>
{/* Step 2 */}
<div className="md:col-span-4 bg-tertiary-container text-white p-10 rounded-xl relative overflow-hidden">
<span className="inline-block px-3 py-1 rounded-sm bg-white/20 text-white text-[10px] font-bold tracking-widest uppercase mb-6">Phase 02</span>
<h3 className="font-headline text-3xl font-bold mb-4">AI Analyzes</h3>
<p className="text-white/80 leading-relaxed mb-8">Running thousands of simulations to identify path-dependencies and black swan risks before they occur.</p>
<span className="material-symbols-outlined text-8xl absolute -bottom-4 -right-4 opacity-10">insights</span>
</div>
{/* Step 3 */}
<div className="md:col-span-12 bg-surface-container-lowest p-10 rounded-xl flex flex-col md:flex-row items-center gap-12 border-t-0">
<div className="flex-1">
<span className="inline-block px-3 py-1 rounded-sm bg-primary-fixed text-on-primary-fixed text-[10px] font-bold tracking-widest uppercase mb-6">Phase 03</span>
<h3 className="font-headline text-3xl font-bold mb-4">We Match Experts</h3>
<p className="text-on-surface-variant leading-relaxed text-lg">AI filters the noise, then we hand-pick top-tier industry consultants to validate the machine's findings and provide the human nuance essential for final execution.</p>
</div>
<div className="flex-1 grid grid-cols-2 gap-4">
<div className="p-4 bg-surface rounded-lg">
<span className="material-symbols-outlined text-primary mb-2">person_search</span>
<div className="text-sm font-bold">Domain Validation</div>
</div>
<div className="p-4 bg-surface rounded-lg">
<span className="material-symbols-outlined text-primary mb-2">verified_user</span>
<div className="text-sm font-bold">Ethical Review</div>
</div>
<div className="p-4 bg-surface rounded-lg">
<span className="material-symbols-outlined text-primary mb-2">psychology</span>
<div className="text-sm font-bold">Nuance Context</div>
</div>
<div className="p-4 bg-surface rounded-lg">
<span className="material-symbols-outlined text-primary mb-2">rocket_launch</span>
<div className="text-sm font-bold">Execution Plan</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/* Featured Consultants Section */}
<section className="py-24 px-8 bg-surface">
<div className="max-w-7xl mx-auto">
<div className="flex justify-between items-end mb-16">
<div>
<h2 className="font-headline text-4xl font-bold tracking-tight mb-4">Human Intelligence, Augmented.</h2>
<p className="text-on-surface-variant">Collaborate with the top 1% of industry strategists.</p>
</div>
<button className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all">
                        View Directory <span className="material-symbols-outlined">arrow_forward</span>
</button>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
{/* Consultant 1 */}
<div className="group">
<div className="relative overflow-hidden rounded-xl mb-6">
<img className="w-full h-[400px] object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105" data-alt="Professional female executive in high-end office setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKmkV3e9nKo1J_wj7ErY6Jo6PA56ImpTbrbrf2JYmVGx5aBDub1zWrwrFnA5uF233QPgq6gde2uCEcMIQZ9qCI1iglD-skyrmtrLJKersPCe1Rvg8FNt_I1fpLuwsjQYgiu78gm-f7n_kPd-ghenwl5I_6wu21JAv54emIIUm2Q3Xhlsz6Pp9Pexoj5l_nceGikMwWkdDliA8XZlFE6xp5Tnxxwywkz1oD_R7uKfinJU1t1MFuopE34HN1MxJzjZljD1I13-6uyhk"/>
<div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
</div>
<h4 className="font-headline text-xl font-bold mb-1">Sarah Chen</h4>
<p className="text-sm text-on-surface-variant font-medium mb-3 uppercase tracking-wider">Logistics &amp; Supply Chain</p>
<p className="text-sm text-on-surface-variant leading-relaxed">Former COO at GlobalLogix. Specializes in multi-modal infrastructure optimization.</p>
</div>
{/* Consultant 2 */}
<div className="group">
<div className="relative overflow-hidden rounded-xl mb-6">
<img className="w-full h-[400px] object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105" data-alt="Senior male consultant in a minimalist studio environment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXjKQlFsexu8ZM3ElWg6wQMIVQV-Qe30MQDGhEcj6zoD8IJPVJ3HC9paxqHLneNw_yE8mxaQay6PAsWJ1xtRKYLBiBYc33Zbn8b-3rxQDp0Z4RMstc5B0jnpPYr8WW0bmLTowuj7C31WHCHJ5EIshKQDQxgUjpt-ZR5kjMbsSOKTZpbn78XKBjOKP0lEt9qYIpHw7TPvoA6FaHM38_UG69PNRs_YWCKxq6TX_tybB2TfPgls6GEUJ_DuCO17OFEQcoitR68UR9w_s"/>
<div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
</div>
<h4 className="font-headline text-xl font-bold mb-1">Marcus Thorne</h4>
<p className="text-sm text-on-surface-variant font-medium mb-3 uppercase tracking-wider">FinTech Strategy</p>
<p className="text-sm text-on-surface-variant leading-relaxed">20+ years in venture capital. Expertise in emerging market regulatory frameworks.</p>
</div>
{/* Consultant 3 */}
<div className="group">
<div className="relative overflow-hidden rounded-xl mb-6">
<img className="w-full h-[400px] object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105" data-alt="Modern tech professional with focused expression" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZ3aMjQwalbGojpGOM_DdB8d_djwk7zRuCEDSghyuCODxyYdKjlIwj-MQUT5lzdnlEVGUs2iH01ev4EfH_oAHtjLEzD-FMA1kr6FtU8T_TttS63-HqFKvCX4-EElt8nN8FUaOar-Oakv_oPGycld3k8KqfGrBwwlPGt4sDTQDNVRyHecirsPUYsDcglER67BUm7w-Rdup1eUAIiXBI75_K0FODJy_Q_gU2g60z681RhTSRIFsMYWdJo0cgKa6Pd1RI1mKa2XeDk3A"/>
<div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
</div>
<h4 className="font-headline text-xl font-bold mb-1">Dr. Elena Rodriguez</h4>
<p className="text-sm text-on-surface-variant font-medium mb-3 uppercase tracking-wider">Sustainable Systems</p>
<p className="text-sm text-on-surface-variant leading-relaxed">Lead researcher on circular economies. Advisor to G7 climate task force.</p>
</div>
</div>
</div>
</section>
{/* AI Insight Pulse - Specialized Component */}
<section className="py-24 px-8">
<div className="max-w-4xl mx-auto">
<div className="bg-tertiary-container/10 border border-primary/20 backdrop-blur-md rounded-2xl p-12 relative overflow-hidden">
<div className="flex items-start gap-8 relative z-10">
<div className="bg-primary p-4 rounded-xl text-white">
<span className="material-symbols-outlined text-3xl">lightbulb</span>
</div>
<div>
<h3 className="font-headline text-2xl font-bold mb-4">Why ProDecide AI?</h3>
<p className="text-lg text-on-surface-variant leading-relaxed italic mb-8">
                                "Decision fatigue costs Fortune 500 companies billions annually. We don't just provide data; we provide the narrative architecture that makes the right choice obvious."
                            </p>
<div className="flex items-center gap-2">
<div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
<span className="text-xs font-bold tracking-widest uppercase text-primary">Live Optimization Stream</span>
</div>
</div>
</div>
{/* Decorative background graphic */}
<div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
</div>
</div>
</section>
</main>
{/* Footer */}
<footer className="bg-[#f2f4f6] dark:bg-slate-950">
<div className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
<div>
<span className="text-lg font-bold text-slate-700 dark:text-slate-300">ProDecide AI</span>
<p className="font-inter text-xs leading-relaxed text-slate-500 dark:text-slate-500 mt-2">© 2024 ProDecide AI. All rights reserved.</p>
</div>
<div className="flex flex-wrap justify-center gap-8">
<a className="font-inter text-xs leading-relaxed text-slate-500 dark:text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400 transition-all" href="#">Privacy Policy</a>
<a className="font-inter text-xs leading-relaxed text-slate-500 dark:text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400 transition-all" href="#">Terms of Service</a>
<a className="font-inter text-xs leading-relaxed text-slate-500 dark:text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400 transition-all" href="#">Contact Support</a>
<a className="font-inter text-xs leading-relaxed text-slate-500 dark:text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400 transition-all" href="#">About Us</a>
</div>
<div className="flex gap-4">
<button className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 hover:text-primary transition-colors">
<span className="material-symbols-outlined text-sm">language</span>
</button>
<button className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 hover:text-primary transition-colors">
<span className="material-symbols-outlined text-sm">share</span>
</button>
</div>
</div>
</footer>

    </div>
  );
}
