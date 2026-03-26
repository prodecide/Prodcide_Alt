import React from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      
{/* TopNavBar */}
<nav className="bg-[#f7f9fb] dark:bg-slate-900 sticky top-0 z-50">
<div className="flex justify-between items-center px-8 py-4 w-full max-w-7xl mx-auto">
<div className="flex items-center gap-12">
<Link className="text-xl font-bold text-slate-900 dark:text-white tracking-tighter font-headline" to="/">ProDecide</Link>
<div className="hidden md:flex gap-8 items-center">
<Link className="font-manrope text-sm font-medium tracking-tight text-[#0052FF] dark:text-blue-400 border-b-2 border-[#0052FF] pb-1" to="/dashboard">My Projects</Link>
<Link className="font-manrope text-sm font-medium tracking-tight text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200" to="/experts">Consultants</Link>
<a className="font-manrope text-sm font-medium tracking-tight text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200" href="#">Settings</a>
</div>
</div>
<div className="flex items-center gap-6">
<div className="relative hidden sm:block">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm">search</span>
<input className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-fixed transition-all w-64" placeholder="Search strategy..." type="text"/>
</div>
<div className="flex items-center gap-4">
<button className="material-symbols-outlined text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors duration-200">notifications</button>
<button className="material-symbols-outlined text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors duration-200">account_circle</button>
</div>
</div>
</div>
</nav>
<main className="max-w-7xl mx-auto px-8 py-12">
{/* Header Section */}
<header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
<div className="max-w-2xl">
<nav className="flex items-center gap-2 text-on-surface-variant text-xs font-medium mb-4 uppercase tracking-widest">
<span>Analysis</span>
<span className="material-symbols-outlined text-[10px]">arrow_forward_ios</span>
<span className="text-primary">Project Alpha-9</span>
</nav>
<h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tighter leading-none mb-4">Strategic Landscape Analysis</h1>
<p className="text-on-surface-variant text-lg leading-relaxed max-w-xl">AI-driven breakdown of market entry risks and capital allocation opportunities for Q3 expansion.</p>
</div>
<button className="primary-gradient text-on-primary px-8 py-4 rounded-xl font-headline font-bold text-sm tracking-tight shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                View Expert Consultant Matches
            </button>
</header>
{/* Bento Grid Layout */}
<div className="asymmetric-grid">
{/* Main Analysis Column */}
<div className="space-y-8">
{/* Strategic Paths Flowchart */}
<section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/15">
<h3 className="font-headline text-xl font-bold mb-8 flex items-center gap-2">
<span className="material-symbols-outlined text-primary">account_tree</span>
                        Recommended Strategic Paths
                    </h3>
<div className="relative py-4">
<div className="flex flex-col gap-12">
{/* Node 1 */}
<div className="flex items-center gap-6">
<div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-on-primary-fixed shrink-0">01</div>
<div className="flex-1 bg-surface-container-low p-5 rounded-xl border-l-4 border-primary">
<h4 className="font-bold text-sm mb-1">Market Penetration Phase</h4>
<p className="text-xs text-on-surface-variant">Focus on core competencies in existing European clusters.</p>
</div>
</div>
{/* Connector */}
<div className="absolute left-6 top-12 bottom-12 w-0.5 bg-surface-container-highest -z-10"></div>
{/* Node 2 */}
<div className="flex items-center gap-6">
<div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-on-secondary-fixed shrink-0">02</div>
<div className="flex-1 bg-surface-container-low p-5 rounded-xl">
<h4 className="font-bold text-sm mb-1">Operational Scalability</h4>
<p className="text-xs text-on-surface-variant">Automating back-office logistics via ProDecide API integrations.</p>
</div>
</div>
{/* Node 3 */}
<div className="flex items-center gap-6">
<div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center font-bold text-on-tertiary-fixed shrink-0">03</div>
<div className="flex-1 bg-surface-container-low p-5 rounded-xl">
<h4 className="font-bold text-sm mb-1">Global Exit Strategy</h4>
<p className="text-xs text-on-surface-variant">Acquisition readiness for potential Tier-1 buyout by FY26.</p>
</div>
</div>
</div>
</div>
</section>
{/* AI Insight Pulse */}
<section className="bg-tertiary-container/10 p-8 rounded-xl border border-primary/20 backdrop-blur-md">
<div className="flex items-start gap-4">
<div className="bg-primary-container p-3 rounded-lg">
<span className="material-symbols-outlined text-on-primary-container" data-weight="fill">lightbulb</span>
</div>
<div>
<h3 className="font-headline text-lg font-bold text-on-surface mb-2">Insight Pulse: AI Recommendation</h3>
<p className="text-on-surface-variant leading-relaxed mb-6">Based on current volatility indexes, we suggest delaying the APAC launch by 4 weeks to capitalize on projected currency stabilization. This could increase initial ROI by <span className="text-primary font-bold">12.4%</span>.</p>
<div className="flex gap-4">
<button className="bg-surface-container-lowest px-4 py-2 rounded-lg text-xs font-bold border border-outline-variant/20 hover:bg-surface-container-low transition-colors">Apply Strategy</button>
<button className="text-primary px-4 py-2 rounded-lg text-xs font-bold hover:underline">Discuss with AI</button>
</div>
</div>
</div>
</section>
</div>
{/* Side Visualization Column */}
<div className="space-y-8">
{/* Radar Chart / Risk Profile */}
<section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/15">
<h3 className="font-headline text-xl font-bold mb-6">Risk vs. Opportunity</h3>
<div className="aspect-square relative flex items-center justify-center mb-6">
{/* Abstract Radar Visualization */}
<div className="absolute inset-0 border border-outline-variant/10 rounded-full"></div>
<div className="absolute inset-8 border border-outline-variant/10 rounded-full"></div>
<div className="absolute inset-16 border border-outline-variant/10 rounded-full"></div>
<div className="absolute w-full h-[1px] bg-outline-variant/10"></div>
<div className="absolute w-[1px] h-full bg-outline-variant/10"></div>
{/* Polygon Overlay */}
<svg className="w-full h-full p-4 drop-shadow-lg" viewbox="0 0 100 100">
<polygon fill="rgba(0, 62, 199, 0.15)" points="50,10 85,35 75,80 25,80 15,35" stroke="#003ec7" stroke-width="1"></polygon>
<circle cx="50" cy="10" fill="#003ec7" r="1.5"></circle>
<circle cx="85" cy="35" fill="#003ec7" r="1.5"></circle>
<circle cx="75" cy="80" fill="#003ec7" r="1.5"></circle>
<circle cx="25" cy="80" fill="#003ec7" r="1.5"></circle>
<circle cx="15" cy="35" fill="#003ec7" r="1.5"></circle>
</svg>
{/* Labels */}
<span className="absolute top-0 text-[10px] font-bold text-outline uppercase tracking-tighter">Profit</span>
<span className="absolute bottom-0 text-[10px] font-bold text-outline uppercase tracking-tighter">Stability</span>
<span className="absolute right-0 text-[10px] font-bold text-outline uppercase tracking-tighter">Speed</span>
<span className="absolute left-0 text-[10px] font-bold text-outline uppercase tracking-tighter">Safety</span>
</div>
<div className="space-y-4">
<div className="flex justify-between items-center text-sm">
<span className="text-on-surface-variant">Market Volatility</span>
<span className="font-bold text-error">High</span>
</div>
<div className="flex justify-between items-center text-sm">
<span className="text-on-surface-variant">Capital Efficiency</span>
<span className="font-bold text-primary">8.8/10</span>
</div>
</div>
</section>
{/* Key Takeaways */}
<section className="bg-surface-container p-8 rounded-xl">
<h3 className="font-headline text-lg font-bold mb-6">Key Takeaways</h3>
<ul className="space-y-6">
<li className="flex gap-4">
<span className="material-symbols-outlined text-primary text-xl">check_circle</span>
<div>
<p className="text-sm font-bold text-on-surface mb-1">Regulatory Clearance</p>
<p className="text-xs text-on-surface-variant">All GDPR and localized compliance checks passed for the Nordic region.</p>
</div>
</li>
<li className="flex gap-4">
<span className="material-symbols-outlined text-primary text-xl">check_circle</span>
<div>
<p className="text-sm font-bold text-on-surface mb-1">Talent Density</p>
<p className="text-xs text-on-surface-variant">Consultant matches show high availability for FinTech specialists in Stockholm.</p>
</div>
</li>
<li className="flex gap-4">
<span className="material-symbols-outlined text-on-error text-xl">warning</span>
<div>
<p className="text-sm font-bold text-on-surface mb-1">Competitor Response</p>
<p className="text-xs text-on-surface-variant">Main rival detected aggressive pricing adjustments in secondary markets.</p>
</div>
</li>
</ul>
</section>
</div>
</div>
{/* Next Steps Horizontal Section */}
<section className="mt-12 bg-surface-container-low p-8 rounded-2xl">
<h3 className="font-headline text-2xl font-extrabold mb-8 tracking-tight">Recommended Next Steps</h3>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 group cursor-pointer hover:shadow-md transition-all">
<span className="material-symbols-outlined text-primary mb-4 block">fact_check</span>
<h4 className="font-bold text-base mb-2">Review Technical Debt</h4>
<p className="text-xs text-on-surface-variant leading-relaxed">AI audit suggests prioritizing cloud infrastructure optimization.</p>
</div>
<div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 group cursor-pointer hover:shadow-md transition-all">
<span className="material-symbols-outlined text-primary mb-4 block">group_add</span>
<h4 className="font-bold text-base mb-2">Assemble Focus Team</h4>
<p className="text-xs text-on-surface-variant leading-relaxed">Interview top 3 matched consultants for the transition phase.</p>
</div>
<div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 group cursor-pointer hover:shadow-md transition-all">
<span className="material-symbols-outlined text-primary mb-4 block">monitoring</span>
<h4 className="font-bold text-base mb-2">Simulate Exit Scenario</h4>
<p className="text-xs text-on-surface-variant leading-relaxed">Run the AI model again with 15% lower valuation projections.</p>
</div>
</div>
</section>
</main>
{/* Footer */}
<footer className="bg-[#f2f4f6] dark:bg-slate-950 w-full py-12 px-8 mt-24">
<div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
<div className="flex flex-col items-center md:items-start gap-4">
<Link className="text-lg font-bold text-slate-700 dark:text-slate-300 font-headline" to="/">ProDecide</Link>
<p className="font-inter text-xs leading-relaxed text-slate-500">© 2024 ProDecide AI. All rights reserved.</p>
</div>
<div className="flex flex-wrap justify-center gap-8">
<a className="font-inter text-xs text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400 transition-all" href="#">Privacy Policy</a>
<a className="font-inter text-xs text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400 transition-all" href="#">Terms of Service</a>
<a className="font-inter text-xs text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400 transition-all" href="#">Contact Support</a>
<a className="font-inter text-xs text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400 transition-all" href="#">About Us</a>
</div>
</div>
</footer>

    </div>
  );
}
