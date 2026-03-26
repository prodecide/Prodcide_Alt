import React from 'react';
import { Link } from 'react-router-dom';

export default function Experts() {
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      
{/* TopNavBar Component */}
<nav className="bg-[#f7f9fb] dark:bg-slate-900 sticky top-0 z-50">
<div className="flex justify-between items-center px-8 py-4 w-full max-w-7xl mx-auto">
<div className="flex items-center gap-12">
<Link className="text-xl font-bold text-slate-900 dark:text-white tracking-tighter font-headline" to="/">ProDecide</Link>
<div className="hidden md:flex gap-8 items-center">
<Link className="font-manrope text-sm font-medium tracking-tight text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 px-3 py-1 rounded-lg" to="/dashboard">My Projects</Link>
<Link className="font-manrope text-sm font-medium tracking-tight text-[#0052FF] dark:text-blue-400 border-b-2 border-[#0052FF] pb-1" to="/experts">Consultants</Link>
<a className="font-manrope text-sm font-medium tracking-tight text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 px-3 py-1 rounded-lg" href="#">Settings</a>
</div>
</div>
<div className="flex items-center gap-4">
<button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="notifications">notifications</span>
</button>
<div className="flex items-center gap-3 pl-4 border-l border-surface-container-high">
<img alt="User profile avatar" className="w-8 h-8 rounded-full border border-outline-variant/20" data-alt="Professional male portrait for user profile avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjt6TvWSGfOYme5BPSr0EunmaK0vTHrdvQc7fXuf8PP48w6fj_3bhEBF0id8tRVPWfES0V6Rh8Wr8CMqrPmjC7fa8A5iiaWoDVTQrlzP0OuJ9v0Zks9ApKHoVuirkoRbbsF_WM-X2XE7AeuPMW14TmRiQR_mpZPtn_apV2rqv8MK_Mr-JyfcbCSGNDf0jTffFryMp4jVksqCbd8AuCglHak3WfyFZ9Rph4WuNDQaybI1nwG4nZNMGIqv19BZ3DhorP7yxW9fYQD9Q"/>
<span className="material-symbols-outlined text-on-surface-variant" data-icon="account_circle">account_circle</span>
</div>
</div>
</div>
</nav>
<main className="max-w-7xl mx-auto px-8 py-12">
{/* Header Section */}
<header className="mb-12">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
<div className="max-w-2xl">
<h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface mb-4">Consultant Matchmaker</h1>
<p className="text-body text-lg text-on-surface-variant leading-relaxed">
                        We've analyzed your project architecture. Here are the experts best equipped to solve your specific scaling and operational bottlenecks.
                    </p>
</div>
<div className="flex gap-3">
<Link to="/registration" className="primary-gradient text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2">
    <span className="material-symbols-outlined">person_add</span>
    Join as Expert
</Link>
<div className="bg-tertiary-container/10 p-4 rounded-xl glass-panel">
<div className="flex items-center gap-2 text-primary">
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
<span className="text-xs font-bold uppercase tracking-wider">AI Insight</span>
</div>
<p className="text-sm font-medium mt-1">Found 12 Perfect Matches</p>
</div>
</div>
</div>
</header>
{/* Filters Section */}
<section className="mb-10 flex flex-wrap items-center gap-4">
<div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-lg border border-outline-variant/15 text-sm font-medium shadow-sm">
<span className="text-on-surface-variant">Expertise:</span>
<select className="border-none bg-transparent p-0 focus:ring-0 text-primary font-bold">
<option>Strategic Operations</option>
<option>Cloud Infrastructure</option>
<option>Financial Modeling</option>
</select>
</div>
<div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-lg border border-outline-variant/15 text-sm font-medium shadow-sm">
<span className="text-on-surface-variant">Availability:</span>
<select className="border-none bg-transparent p-0 focus:ring-0 text-primary font-bold">
<option>Immediate</option>
<option>Within 2 Weeks</option>
<option>Next Month</option>
</select>
</div>
<div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-lg border border-outline-variant/15 text-sm font-medium shadow-sm">
<span className="text-on-surface-variant">Rating:</span>
<select className="border-none bg-transparent p-0 focus:ring-0 text-primary font-bold">
<option>4.5+ Stars</option>
<option>4.0+ Stars</option>
<option>Any Rating</option>
</select>
</div>
<button className="ml-auto flex items-center gap-2 text-primary font-semibold text-sm hover:underline">
<span className="material-symbols-outlined text-sm">filter_list</span>
                Advanced Filters
            </button>
</section>
{/* Consultant Grid */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
{/* Card 1: Featured Match */}
<div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
<div className="absolute top-0 right-0 p-4">
<div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        Top Recommended
                    </div>
</div>
<div className="shrink-0">
<div className="relative">
<img alt="Professional woman portrait" className="w-32 h-32 rounded-xl object-cover" data-alt="Close up professional portrait of woman executive" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcApYB6Zyi852ruT3kZCQIn-NcN_IyhtoFO02AHJ6DF8CcfARYtOf2uHpIyA9Hk7FUFCDRBCuqvIt9aNQV7Ge6J-2aXRfrsQEclITVvVVrfP5exzqWNJwixRwMQ9xyBwsMnJ9zciT3MiMEZzzqts-BBGM8WGuL3Lr2CIaSdqMe9giiHkQddfUQBjWGsPxZ0liCQwBiPjtnxFY_4tcUPjK3XGG72f-jpJ73Ngj1sUKo2seQ-BLQcRhcM_XT2zKlSZPyz-K7n5QNmAk"/>
<div className="absolute -bottom-3 -right-3 bg-primary text-white w-12 h-12 rounded-full flex flex-col items-center justify-center border-4 border-surface-container-lowest">
<span className="text-[10px] font-bold leading-none">MATCH</span>
<span className="text-sm font-extrabold">98%</span>
</div>
</div>
</div>
<div className="flex-1 flex flex-col">
<div className="mb-4">
<h3 className="font-headline text-2xl font-bold text-on-surface">Dr. Sarah Jenkins</h3>
<p className="text-primary font-semibold text-sm mb-2">Strategic Operations Expert</p>
<div className="flex gap-1 text-tertiary">
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="text-xs font-bold ml-1 text-on-surface-variant">4.9 (124 reviews)</span>
</div>
</div>
<div className="flex flex-wrap gap-2 mb-6">
<span className="bg-surface-container px-3 py-1 rounded-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Change Mgmt</span>
<span className="bg-surface-container px-3 py-1 rounded-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Lean Six Sigma</span>
<span className="bg-surface-container px-3 py-1 rounded-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">SaaS Scaling</span>
</div>
<div className="mt-auto">
<Link to="/form" className="primary-gradient text-white px-6 py-3 rounded-lg font-bold text-sm w-full hover:opacity-90 transition-opacity active:scale-[0.98] flex items-center justify-center">
                            Book Initial Consultation
                        </Link>
</div>
</div>
</div>
{/* Card 2 */}
<div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
<div className="shrink-0">
<div className="relative">
<img alt="Professional man portrait" className="w-32 h-32 rounded-xl object-cover" data-alt="Professional male consultant headshot in suit" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWTdjMyd96V06Y6xDzO-xEeryuzOesjwiuujK5SNOOzIiGUZKR0dTAN1lcCBgpMRZSWPEnkOOz3ixjwuakLp2DeE1N_N_yi9p_eiRAorqc38O3rV239nq89Gq8O_ELCcdecF3uda4nGpwGB01yyIMuOuM9XFYK_bcpOzmPCuZQZWBPqkY6Qv33I6M7CnFFTzePxp4aQww7cjaBMlMHsovI1dWJ1mC_9X111ca4adPvfIujHKklsFMfsKaKH2-p78Q_KSM3IQoXVJ0"/>
<div className="absolute -bottom-3 -right-3 bg-secondary text-white w-12 h-12 rounded-full flex flex-col items-center justify-center border-4 border-surface-container-lowest">
<span className="text-[10px] font-bold leading-none">MATCH</span>
<span className="text-sm font-extrabold">92%</span>
</div>
</div>
</div>
<div className="flex-1 flex flex-col">
<div className="mb-4">
<h3 className="font-headline text-2xl font-bold text-on-surface">Marcus Thorne</h3>
<p className="text-primary font-semibold text-sm mb-2">Systems Architect &amp; Advisor</p>
<div className="flex gap-1 text-tertiary">
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-sm">star_half</span>
<span className="text-xs font-bold ml-1 text-on-surface-variant">4.7 (89 reviews)</span>
</div>
</div>
<div className="flex flex-wrap gap-2 mb-6">
<span className="bg-surface-container px-3 py-1 rounded-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Cloud Migration</span>
<span className="bg-surface-container px-3 py-1 rounded-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Agile Dev</span>
<span className="bg-surface-container px-3 py-1 rounded-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Cybersecurity</span>
</div>
<div className="mt-auto">
<Link to="/form" className="primary-gradient text-white px-6 py-3 rounded-lg font-bold text-sm w-full hover:opacity-90 transition-opacity active:scale-[0.98] flex items-center justify-center">
                            Book Initial Consultation
                        </Link>
</div>
</div>
</div>
{/* Card 3 */}
<div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
<div className="shrink-0">
<div className="relative">
<img alt="Professional man portrait" className="w-32 h-32 rounded-xl object-cover" data-alt="Candid professional headshot of male consultant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7axjbSzu71X_XdurpCO4uOqf5zNWN8Vrp3MlS9zGu3X9OGJrpNYoRTVQLgdWzCDSnq-59UoRtk4p2TENBLbQwzxvpo0W3o9mjIBMoq_S0yebDahG4fTHn4u_Li2ms46MYMr_3Mx0QkOlbw3SDbBwCPQSmGWE784hZGwOTC-1ONZN056_45kWDTVkaPabdylFY32qY19bVZb2yGqInBJn2BReB2sw1QzwsK-tImRi30S1vnf2ZtOfA_TWAdLaEcCAsh6lS8mAf1C8"/>
<div className="absolute -bottom-3 -right-3 bg-secondary text-white w-12 h-12 rounded-full flex flex-col items-center justify-center border-4 border-surface-container-lowest">
<span className="text-[10px] font-bold leading-none">MATCH</span>
<span className="text-sm font-extrabold">88%</span>
</div>
</div>
</div>
<div className="flex-1 flex flex-col">
<div className="mb-4">
<h3 className="font-headline text-2xl font-bold text-on-surface">Alex Rivera</h3>
<p className="text-primary font-semibold text-sm mb-2">Finance Transformation Specialist</p>
<div className="flex gap-1 text-tertiary">
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="text-xs font-bold ml-1 text-on-surface-variant">5.0 (52 reviews)</span>
</div>
</div>
<div className="flex flex-wrap gap-2 mb-6">
<span className="bg-surface-container px-3 py-1 rounded-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">M&amp;A Strategy</span>
<span className="bg-surface-container px-3 py-1 rounded-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Forecasting</span>
<span className="bg-surface-container px-3 py-1 rounded-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Equity Ops</span>
</div>
<div className="mt-auto">
<Link to="/form" className="primary-gradient text-white px-6 py-3 rounded-lg font-bold text-sm w-full hover:opacity-90 transition-opacity active:scale-[0.98] flex items-center justify-center">
                            Book Initial Consultation
                        </Link>
</div>
</div>
</div>
{/* Card 4 */}
<div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
<div className="shrink-0">
<div className="relative">
<img alt="Professional woman portrait" className="w-32 h-32 rounded-xl object-cover" data-alt="Professional female executive portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEX2ItuXHY651pdglGtVTlcLBd94Be6Ukc1csezNVnpdCKbYwCBnSKGtT6rLc6teYLS5J7kVyQqBlXossPHY6PVRGQ9ax4ihxQXKg-UXYwgRBbc49tuRO-poLvRWj0_2FihSDE6Ejh91L5EnmxU4U8nPXBkKWXkvASbtiprldhlICQOkSK_Fy_C5N4QhCyDNRkf50fOn5Vz9LIOaR3bWeRBhFigaONPl85rGXZd7PyQWxD62uZz606CQ0mHALRIKDeTUnHVSFvg58"/>
<div className="absolute -bottom-3 -right-3 bg-secondary text-white w-12 h-12 rounded-full flex flex-col items-center justify-center border-4 border-surface-container-lowest">
<span className="text-[10px] font-bold leading-none">MATCH</span>
<span className="text-sm font-extrabold">85%</span>
</div>
</div>
</div>
<div className="flex-1 flex flex-col">
<div className="mb-4">
<h3 className="font-headline text-2xl font-bold text-on-surface">Elena Kostic</h3>
<p className="text-primary font-semibold text-sm mb-2">Growth &amp; Product Strategist</p>
<div className="flex gap-1 text-tertiary">
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-sm">star</span>
<span className="text-xs font-bold ml-1 text-on-surface-variant">4.6 (215 reviews)</span>
</div>
</div>
<div className="flex flex-wrap gap-2 mb-6">
<span className="bg-surface-container px-3 py-1 rounded-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Product Led Growth</span>
<span className="bg-surface-container px-3 py-1 rounded-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Retention</span>
<span className="bg-surface-container px-3 py-1 rounded-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Market Entry</span>
</div>
<div className="mt-auto">
<Link to="/form" className="primary-gradient text-white px-6 py-3 rounded-lg font-bold text-sm w-full hover:opacity-90 transition-opacity active:scale-[0.98] flex items-center justify-center">
                            Book Initial Consultation
                        </Link>
</div>
</div>
</div>
</div>
{/* Asymmetric Insight Block */}
<aside className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
<div className="md:col-span-1">
<h4 className="font-headline text-2xl font-bold leading-tight mb-4">Why these matches?</h4>
<p className="text-sm text-on-surface-variant leading-relaxed">
                    Our AI cross-references your current project "Supply Chain Optimization" with the successful track records of 5,000+ vetted consultants.
                </p>
</div>
<div className="md:col-span-2 flex flex-col gap-4">
<div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-primary">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined">psychology</span>
</div>
<div>
<p className="text-sm font-bold text-on-surface">Skill Density Analysis</p>
<p className="text-xs text-on-surface-variant">Matches emphasize "Lean Operations" based on your project requirements.</p>
</div>
</div>
</div>
<div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-tertiary">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-lg bg-tertiary-container flex items-center justify-center text-white">
<span className="material-symbols-outlined">history</span>
</div>
<div>
<p className="text-sm font-bold text-on-surface">Historical Success Velocity</p>
<p className="text-xs text-on-surface-variant">Dr. Jenkins has reduced overhead by 22% in similar high-growth environments.</p>
</div>
</div>
</div>
</div>
</aside>
</main>
{/* Footer Component */}
<footer className="bg-[#f2f4f6] dark:bg-slate-950 w-full py-12 px-8 mt-20">
<div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
<div className="flex flex-col gap-2">
<Link className="text-lg font-bold text-slate-700 dark:text-slate-300 font-headline" to="/">ProDecide</Link>
<p className="font-inter text-xs leading-relaxed text-slate-500 dark:text-slate-500">© 2024 ProDecide AI. All rights reserved.</p>
</div>
<div className="flex flex-wrap justify-center gap-8">
<a className="font-inter text-xs leading-relaxed text-slate-500 dark:text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400 transition-all" href="#">Privacy Policy</a>
<a className="font-inter text-xs leading-relaxed text-slate-500 dark:text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400 transition-all" href="#">Terms of Service</a>
<a className="font-inter text-xs leading-relaxed text-slate-500 dark:text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400 transition-all" href="#">Contact Support</a>
<a className="font-inter text-xs leading-relaxed text-slate-500 dark:text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400 transition-all" href="#">About Us</a>
</div>
</div>
</footer>

    </div>
  );
}
