import React from 'react';
import { Link } from 'react-router-dom';

export default function Discovery() {
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      
{/* TopNavBar */}
<header className="bg-[#f7f9fb] dark:bg-slate-900 sticky top-0 z-50">
<div className="flex justify-between items-center px-8 py-4 w-full max-w-7xl mx-auto">
<div className="flex items-center gap-8">
<Link className="text-xl font-bold text-slate-900 dark:text-white tracking-tighter" to="/">ProDecide</Link>
<nav className="hidden md:flex gap-6 items-center">
<Link className="font-manrope text-sm font-medium tracking-tight text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200" to="/dashboard">My Projects</Link>
<Link className="font-manrope text-sm font-medium tracking-tight text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200" to="/experts">Consultants</Link>
<a className="font-manrope text-sm font-medium tracking-tight text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200" href="#">Settings</a>
</nav>
</div>
<div className="flex items-center gap-4">
<button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200">
<span className="material-symbols-outlined text-slate-600 dark:text-slate-400">notifications</span>
</button>
<button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200">
<span className="material-symbols-outlined text-slate-600 dark:text-slate-400">account_circle</span>
</button>
</div>
</div>
</header>
<main className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-12 gap-8">
{/* Main Chat Area */}
<section className="col-span-12 lg:col-span-8 flex flex-col gap-12">
{/* AI Avatar & Message */}
<div className="flex flex-col gap-6">
<div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg">
<span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
</div>
<div className="max-w-2xl">
<h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-4">
                        Tell me about the challenge you're facing.
                    </h1>
<p className="text-body-lg text-on-surface-variant leading-relaxed text-lg">
                        What is the core decision you need to make? Be as specific as possible—I'll help you structure the variables and evaluate the outcomes.
                    </p>
</div>
</div>
{/* Input Field Area */}
<div className="relative group">
<div className="bg-surface-container-lowest rounded-xl p-2 shadow-sm border-none ring-1 ring-outline-variant/15 focus-within:ring-2 focus-within:ring-primary-fixed transition-all">
<textarea className="w-full bg-transparent border-none focus:ring-0 text-on-surface p-4 text-lg placeholder:text-outline/50 resize-none font-body" placeholder="e.g., We need to decide whether to pivot our SaaS product to enterprise clients or stay focused on SMBs..." rows="4"></textarea>
<div className="flex justify-between items-center px-4 py-3 bg-surface-container-low rounded-lg">
<div className="flex gap-2">
<button className="p-2 rounded-md hover:bg-surface-container-high text-on-surface-variant transition-colors">
<span className="material-symbols-outlined text-sm">attach_file</span>
</button>
<button className="p-2 rounded-md hover:bg-surface-container-high text-on-surface-variant transition-colors">
<span className="material-symbols-outlined text-sm">mic</span>
</button>
</div>
<button className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-2 rounded-md font-medium flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all">
<span>Analyze Problem</span>
<span className="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</div>
{/* AI Insight Pulse (Specialized AI Component) */}
<div className="mt-8 bg-tertiary-container/10 border border-primary/20 backdrop-blur-md rounded-xl p-6 relative overflow-hidden">
<div className="flex gap-4 items-start relative z-10">
<span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
<div>
<h4 className="font-headline text-sm font-bold text-on-surface mb-1">PROMPT SUGGESTION</h4>
<p className="text-xs text-on-surface-variant leading-relaxed">
                                "Help me decide between Option A and Option B considering our Q4 budget constraints and long-term scalability."
                            </p>
</div>
</div>
{/* Decorative background pulse */}
<div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
</div>
</div>
</section>
{/* Sidebar: Current Context */}
<aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
<div className="bg-surface-container-low rounded-xl p-8 sticky top-28 h-fit">
<h3 className="font-headline text-lg font-extrabold tracking-tight text-on-surface mb-6 flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-xl">account_tree</span>
                    Current Context
                </h3>
<div className="space-y-6">
{/* Context Item 1 */}
<div className="flex flex-col gap-2">
<span className="text-[10px] font-bold text-outline tracking-widest uppercase">DOMAIN</span>
<div className="bg-surface-container-lowest px-4 py-3 rounded-lg flex items-center gap-3">
<span className="material-symbols-outlined text-secondary text-sm">business_center</span>
<span className="text-sm font-medium text-on-surface">Strategic Planning</span>
</div>
</div>
{/* Context Item 2 */}
<div className="flex flex-col gap-2 opacity-50">
<span className="text-[10px] font-bold text-outline tracking-widest uppercase">CONSTRAINTS</span>
<div className="bg-surface-container px-4 py-3 rounded-lg border border-dashed border-outline-variant/30 flex items-center justify-center">
<span className="text-xs italic text-on-surface-variant">Gathering details...</span>
</div>
</div>
{/* Context Item 3 */}
<div className="flex flex-col gap-2 opacity-50">
<span className="text-[10px] font-bold text-outline tracking-widest uppercase">STAKEHOLDERS</span>
<div className="bg-surface-container px-4 py-3 rounded-lg border border-dashed border-outline-variant/30 flex items-center justify-center">
<span className="text-xs italic text-on-surface-variant">Awaiting input...</span>
</div>
</div>
</div>
<div className="mt-12 p-4 bg-surface-container-high rounded-lg">
<div className="flex items-center gap-3 mb-2">
<span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
<span className="text-xs font-bold text-on-surface">AI ANALYSIS ENGINE</span>
</div>
<p className="text-xs text-on-surface-variant leading-relaxed">
                        I am currently mapping your problem space. As you provide details, I will categorize your constraints and objectives here.
                    </p>
</div>
</div>
</aside>
</main>
{/* Footer */}
<footer className="bg-[#f2f4f6] dark:bg-slate-950 mt-auto">
<div className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
<span className="text-lg font-bold text-slate-700 dark:text-slate-300">ProDecide AI</span>
<div className="flex gap-6">
<a className="font-inter text-xs leading-relaxed text-slate-500 dark:text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400 transition-all" href="#">Privacy Policy</a>
<a className="font-inter text-xs leading-relaxed text-slate-500 dark:text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400 transition-all" href="#">Terms of Service</a>
<a className="font-inter text-xs leading-relaxed text-slate-500 dark:text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400 transition-all" href="#">Contact Support</a>
<a className="font-inter text-xs leading-relaxed text-slate-500 dark:text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400 transition-all" href="#">About Us</a>
</div>
<p className="font-inter text-xs leading-relaxed text-slate-500 dark:text-slate-500">© 2024 ProDecide AI. All rights reserved.</p>
</div>
</footer>

    </div>
  );
}
