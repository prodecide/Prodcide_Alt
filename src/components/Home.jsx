import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

export default function Home() {
  const frameworkRef = useRef(null);
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Smoothly calculate rotation angles (max 15 degrees)
    const rX = -(mouseY / height) * 15;
    const rY = (mouseX / width) * 15;
    setTilt({ x: rX, y: rY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased">
      <Navbar />
      <div className="hero-animated-bg relative">


        {/* Merged Top Section: Hero */}
        <section className="relative pt-24 pb-32 px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Next-Gen Decision Intelligence
              </div>
              <h1 className="font-headline text-5xl lg:text-7xl font-extrabold tracking-tight text-on-surface mb-8 leading-[1.05]">
                The Architecture <br />of <span className="text-primary">Definitive</span> Choice.
              </h1>
              <p className="text-lg md:text-xl text-on-surface-variant mb-12 max-w-xl leading-relaxed">
                We help students and professionals make high-stakes career decisions. Fusing predictive career mapping with real-world mentorship from industry executives.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link className="premium-gradient text-white font-bold py-4 px-10 rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-center inline-block" to="/discovery">Start Your Discovery</Link>
                <button 
                  onClick={() => frameworkRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white/80 backdrop-blur-sm text-on-surface border border-slate-200 font-bold py-4 px-10 rounded-lg hover:bg-white transition-all"
                >
                  The Methodology
                </button>
              </div>
            </div>
            <div className="flex-1 relative w-full flex justify-center">
              {/* Interactive 3D Perspective Video Showcase */}
              <div 
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`,
                  transition: 'transform 0.1s ease-out',
                  transformStyle: 'preserve-3d'
                }}
                className="relative group w-full max-w-lg bg-white/20 backdrop-blur-xl border border-white/40 p-3 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 to-transparent blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                
                {/* 3D Glassmorphic Frame containing the Video */}
                <div style={{ transform: 'translateZ(20px)' }} className="relative rounded-xl overflow-hidden aspect-[4/3] bg-black/90">
                  <video 
                    className="w-full h-full object-cover"
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                  >
                    <source src="/Video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none"></div>
                </div>

                {/* Floating 3D Insight Card */}
                <div 
                  style={{ transform: 'translateZ(40px)' }} 
                  className="absolute bottom-8 left-8 right-8 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md p-5 rounded-xl shadow-xl border border-white/50 animate-float"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-1.5 bg-primary rounded-md flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-sm">play_circle</span>
                    </div>
                    <span className="font-headline font-bold text-xs tracking-tight text-slate-800 dark:text-white">Product Overview</span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">Hover over the frame to explore the platform in 3D perspective.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <main>
        {/* Refined Framework Section */}
        <section ref={frameworkRef} className="bg-slate-50/50 py-32 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-center md:text-left">
              <h2 className="font-headline text-4xl font-bold tracking-tight mb-4 text-slate-900">A Framework for Clarity</h2>
              <p className="text-on-surface-variant max-w-2xl">Precision-engineered phases to transform complex variables into decisive action.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Stage 1 */}
              <div className="group bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">explore</span>
                </div>
                <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase block mb-3">Stage 01</span>
                <h3 className="font-headline text-xl font-bold mb-3 text-slate-900">Understand Your Situation</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">We capture your goals, constraints, and what’s actually at stake.</p>
              </div>
              {/* Stage 2 */}
              <div className="group bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">query_stats</span>
                </div>
                <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase block mb-3">Stage 02</span>
                <h3 className="font-headline text-xl font-bold mb-3 text-slate-900">Bring Clarity to the Problem</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">Our AI structures your inputs and highlights what truly matters.</p>
              </div>
              {/* Stage 3 */}
              <div className="group bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-xl group-hover:-translate-y-0.5 transition-transform">person_search</span>
                </div>
                <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase block mb-3">Stage 03</span>
                <h3 className="font-headline text-xl font-bold mb-3 text-slate-900">Match You with the Right Expert</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">Get connected to a consultant who fits your specific decision context.</p>
              </div>
              {/* Stage 4 */}
              <div className="group bg-slate-900 p-8 rounded-xl text-white shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">verified_user</span>
                </div>
                <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase block mb-3">Stage 04</span>
                <h3 className="font-headline text-xl font-bold mb-3 text-white">Make the Decision with Confidence</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Work through your options in guided sessions and move forward with clarity.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Expert Section - Premium Directory */}
        <section className="py-32 px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
              <div className="max-w-xl">
                <h2 className="font-headline text-4xl font-bold tracking-tight mb-4 text-slate-900">Human Intelligence, Augmented.</h2>
                <p className="text-on-surface-variant leading-relaxed">Work directly with the top 1% of industry strategists, hand-matched to your specific challenge by our AI engine.</p>
              </div>
              <Link className="text-primary font-bold inline-flex items-center gap-2 group" to="/experts">
                <span className="border-b-2 border-primary/20 group-hover:border-primary transition-all">View Full Directory</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Consultant 1 */}
              <div className="consultant-card group cursor-pointer bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative overflow-hidden rounded-xl mb-6 aspect-[4/5] bg-slate-100">
                  <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" alt="Professional female executive Sarah Chen" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKmkV3e9nKo1J_wj7ErY6Jo6PA56ImpTbrbrf2JYmVGx5aBDub1zWrwrFnA5uF233QPgq6gde2uCEcMIQZ9qCI1iglD-skyrmtrLJKersPCe1Rvg8FNt_I1fpLuwsjQYgiu78gm-f7n_kPd-ghenwl5I_6wu21JAv54emIIUm2Q3Xhlsz6Pp9Pexoj5l_nceGikMwWkdDliA8XZlFE6xp5Tnxxwywkz1oD_R7uKfinJU1t1MFuopE34HN1MxJzjZljD1I13-6uyhk" />
                  <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <Link className="w-full py-3 bg-white/90 backdrop-blur text-slate-900 font-bold text-xs uppercase tracking-widest rounded-lg text-center block" to="/experts">Consult With Sarah</Link>
                  </div>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-headline text-xl font-bold text-slate-900">Sarah Chen</h4>
                  <div className="expertise-tag px-2 py-0.5 border border-slate-200 rounded text-[10px] font-bold text-slate-500 uppercase tracking-tighter transition-colors">Logistics</div>
                </div>
                <p className="text-xs text-slate-400 font-semibold mb-4 uppercase tracking-wider">Former COO at GlobalLogix</p>
                <p className="text-sm text-on-surface-variant leading-relaxed">Specializes in multi-modal infrastructure optimization and supply chain resilience.</p>
              </div>
              {/* Consultant 2 */}
              <div className="consultant-card group cursor-pointer bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative overflow-hidden rounded-xl mb-6 aspect-[4/5] bg-slate-100">
                  <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" alt="Senior male consultant Marcus Thorne" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXjKQlFsexu8ZM3ElWg6wQMIVQV-Qe30MQDGhEcj6zoD8IJPVJ3HC9paxqHLneNw_yE8mxaQay6PAsWJ1xtRKYLBiBYc33Zbn8b-3rxQDp0Z4RMstc5B0jnpPYr8WW0bmLTowuj7C31WHCHJ5EIshKQDQxgUjpt-ZR5kjMbsSOKTZpbn78XKBjOKP0lEt9qYIpHw7TPvoA6FaHM38_UG69PNRs_YWCKxq6TX_tybB2TfPgls6GEUJ_DuCO17OFEQcoitR68UR9w_s" />
                  <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <Link className="w-full py-3 bg-white/90 backdrop-blur text-slate-900 font-bold text-xs uppercase tracking-widest rounded-lg text-center block" to="/experts">Consult With Marcus</Link>
                  </div>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-headline text-xl font-bold text-slate-900">Marcus Thorne</h4>
                  <div className="expertise-tag px-2 py-0.5 border border-slate-200 rounded text-[10px] font-bold text-slate-500 uppercase tracking-tighter transition-colors">FinTech</div>
                </div>
                <p className="text-xs text-slate-400 font-semibold mb-4 uppercase tracking-wider">Venture Capital Partner</p>
                <p className="text-sm text-on-surface-variant leading-relaxed">Expertise in emerging market regulatory frameworks and digital asset integration.</p>
              </div>
              {/* Consultant 3 */}
              <div className="consultant-card group cursor-pointer bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative overflow-hidden rounded-xl mb-6 aspect-[4/5] bg-slate-100">
                  <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" alt="Female tech professional Dr. Elena Rodriguez" src="/elena_portrait.png" />
                  <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <Link className="w-full py-3 bg-white/90 backdrop-blur text-slate-900 font-bold text-xs uppercase tracking-widest rounded-lg text-center block" to="/experts">Consult With Elena</Link>
                  </div>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-headline text-xl font-bold text-slate-900">Dr. Elena Rodriguez</h4>
                  <div className="expertise-tag px-2 py-0.5 border border-slate-200 rounded text-[10px] font-bold text-slate-500 uppercase tracking-tighter transition-colors">ESG Systems</div>
                </div>
                <p className="text-xs text-slate-400 font-semibold mb-4 uppercase tracking-wider">G7 Climate Task Force Advisor</p>
                <p className="text-sm text-on-surface-variant leading-relaxed">Lead researcher on circular economies and large-scale sustainability modeling.</p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Insight Pulse */}
        <section className="py-24 px-8 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl p-12 relative overflow-hidden shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div className="bg-primary p-5 rounded-2xl text-white shadow-xl shadow-primary/20">
                  <span className="material-symbols-outlined text-4xl">lightbulb</span>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="font-headline text-2xl font-bold mb-4 text-slate-900">Why ProDecide AI?</h3>
                  <p className="text-lg text-on-surface-variant leading-relaxed italic mb-6">"ProDecide empowers professionals and individuals alike to navigate complex career paths and personal milestones. We don't just provide data; we provide the narrative architecture that makes the right choice obvious."</p>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-primary">Live Strategy Optimization</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#f2f4f6] dark:bg-slate-950 border-t border-slate-200/50">
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
