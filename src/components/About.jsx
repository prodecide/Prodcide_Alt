import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

export default function About() {
  return (
    <div className="bg-surface font-body text-on-surface overflow-x-hidden min-h-screen">
      <Navbar />

      {/* SideNavBar Shell */}
      <aside className="h-screen w-72 fixed left-0 top-0 z-40 bg-[#f2f4f6] flex-col gap-2 p-6 font-inter text-sm font-medium hidden lg:flex">
        <div className="mb-10 mt-16 px-4">
          <div className="font-manrope font-extrabold text-[#003ec7] text-2xl tracking-tighter">ProDecide</div>
          <div className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">Informed Architect</div>
        </div>
        <nav className="flex-grow flex flex-col gap-1">
          <Link className="text-[#0052FF] font-bold bg-[#ffffff] rounded-lg shadow-sm py-3 px-4 flex items-center gap-3" to="/about">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>diversity_3</span>Overview
          </Link>
        </nav>
        <div className="mt-auto border-t-0 flex flex-col gap-1">
          <a className="text-slate-600 py-3 px-4 hover:bg-[#e6e8ea] rounded-md transition-colors flex items-center gap-3" href="#">
            <span className="material-symbols-outlined">help</span> Help Center
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-72 pt-28 pb-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">

          {/* Our Team Foundation: Bento Grid */}
          <section className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-black font-headline tracking-tight uppercase">Our Team Foundation</h2>
              <div className="h-[2px] flex-grow bg-surface-container-high"></div>
            </div>
            <div className="grid grid-cols-12 gap-6">
              {/* Vision Card */}
              <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest p-8 rounded-2xl shadow-[0px_10px_30px_rgba(25,28,30,0.04)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-8xl">visibility</span>
                </div>
                <div className="flex flex-col h-full relative z-10">
                  <div className="bg-primary-fixed text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4">Vision</h3>
                  <p className="text-on-surface-variant leading-relaxed text-lg italic font-medium">
                    "A world where every person discovers their true potential without wasted time or effort, leading to fulfilling careers and happier lives."
                  </p>
                </div>
              </div>
              {/* Mission Card */}
              <div className="col-span-12 lg:col-span-8 bg-on-secondary-fixed text-white p-8 rounded-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-8 items-center h-full">
                  <div className="flex-grow">
                    <div className="inline-block bg-primary px-3 py-1 rounded-sm text-[10px] font-bold tracking-widest uppercase mb-4">Core Objective</div>
                    <h3 className="text-2xl font-bold mb-4 font-headline">Mission</h3>
                    <p className="text-secondary-fixed text-xl leading-relaxed font-light">
                      To empower individuals to make confident, data-driven career choices through expert mentorship and precise behavioral insights, eliminating the guesswork from their future
                    </p>
                  </div>
                  <div className="w-full md:w-64 h-48 rounded-xl overflow-hidden shadow-2xl flex-shrink-0">
                    <img alt="Mission intelligence visualization" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIGXkA8Qn2KuHlP7HAj4KEKY_aKIfZsDHC3Mafn0lDbAcM0RjEnpuol75-KzEIGSlLsgArhP_Dmj7bUAuEEhOti6PqYwSbzH_9SZFNHX9NrtjkqIUSkKvXxf7zCX1UBs5TDnD9A_YrspdijDKRDc7Zlep8NdxZf2A-PZDf_cXBvvZMVX7cPcYEHApw1UtF58IpPrBSomcOGQz-bPhUNhjuIef5qYOSyw1UJD0BWAbLgVX0B0WXEqq0g6WrVnOIWK9ttNfEzHIMFF0" />
                  </div>
                </div>
              </div>
              {/* Team Details (Roles) */}
              <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Role 1 */}
                <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full border-2 border-white mb-4 overflow-hidden shadow-sm">
                    <img alt="Lead Architect Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcbJ3OPr7XfYxJSW11cj_YJpoIHq42f8Y1XmcgvNmlZzaSnPRoJIvHEEQUjTlkieavwy5hlEK0Tb1NnngfMye9IrpIVkzBO0FPjy4eaF-icGlYpb_6WXcQirA0KoJ27_FsMV9g7bzVtDKt1VVY_XZDMM9ikyO7t5gt9g7hgh5fHkrZaK7SfDtKlR1hXUyvdf7VYNhW5j0WWjcKBIU86JBiPWnVpsxlTAWU7ufcez7FvkgY2-ZOUAetkppim5rUZEB-7ZCChgtihos" />
                  </div>
                  <h4 className="text-lg font-black font-headline tracking-tight">Lead Architect</h4>
                  <p className="text-xs text-primary font-bold uppercase tracking-widest mb-3">Systemic Strategy</p>
                  <p className="text-sm text-on-surface-variant">Defining the structural frameworks that support complex global decisions.</p>
                </div>
                {/* Role 2 */}
                <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full border-2 border-white mb-4 overflow-hidden shadow-sm">
                    <img alt="Strategy Director Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZw4u5RMPy_6iFAtU6DKH7rgy3HBL-g5UqNoXQPMw9r0uYGfkm-ZcsGWMtspG5jWHu2-C7il_PBG4niayUeI7XA4FeiBrSAGzh8OPhwhBkQ_gxMVdFiV6gN9qOxuGJFW1TTSMgm5TmwW9BjHum5CmW8g1Bxs59fRcH7G6d_dzEhB-50LMpNNJ04fbdsX9Ncl1lJxoHL6NRUi8GkmyytdJHVASml715FrxqmcDhxRwxxfl1BSJHRozZQAXEs0OFUWMp32UcJ5DRg8s" />
                  </div>
                  <h4 className="text-lg font-black font-headline tracking-tight">Strategy Director</h4>
                  <p className="text-xs text-primary font-bold uppercase tracking-widest mb-3">Outcome Engineering</p>
                  <p className="text-sm text-on-surface-variant">Translating architectural vision into actionable, high-impact tactical roadmaps.</p>
                </div>
                {/* Role 3 */}
                <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full border-2 border-white mb-4 overflow-hidden shadow-sm">
                    <img alt="Network Curator Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9rn7HfOgtipzqWtO5B_ttwrDQC2L24dRjlXQ81RTg5Yxa3ZxNAjOlitMh5SE3YLbFIulflhCkSnjWrjZ2uAsCdVbFeDwnR5DilofiaFXkV-Zaezcx56Xd_KGyrDqDym-JUQRQrW0vKemvQMOf2G889wSFAcPJI8KJ5RomDdkQGuCUea1V-iYkaxs9BhID-LlzNzcxYTw9mrUDVcgWLWRdY_N6ljyhz9ttSOIS0MzeYPQ1Rr69P8tYX4jNn8P_jGWUZTdSKNE_ulM" />
                  </div>
                  <h4 className="text-lg font-black font-headline tracking-tight">Network Curator</h4>
                  <p className="text-xs text-primary font-bold uppercase tracking-widest mb-3">Global Intelligence</p>
                  <p className="text-sm text-on-surface-variant">Sourcing and validating the world's top 1% subject matter experts.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
