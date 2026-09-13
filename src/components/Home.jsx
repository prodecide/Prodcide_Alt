import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Navbar from './Navbar';

export default function Home() {
  const frameworkRef = useRef(null);
  const cardRef = useRef(null);
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Page Scroll Progress Hooks
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Hero Scroll Transformations
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.06]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.92]);
  const beamScaleX = useTransform(scrollYProgress, [0.18, 0.42], [0, 1]);

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
    <div ref={containerRef} className="bg-surface font-body text-on-surface antialiased relative">
      
      {/* Scroll Progress Line directly below top fixed navbar */}
      <motion.div 
        className="fixed top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0052FF] via-indigo-500 to-purple-600 z-50 origin-left"
        style={{ scaleX: smoothProgress }}
      />

      <Navbar />
      
      <div className="hero-animated-bg relative">

        {/* Merged Top Section: Hero */}
        <section 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative pt-36 pb-32 px-6 md:px-12 overflow-hidden min-h-[92vh] flex items-center justify-center"
        >
          {/* Full-bleed 3D Background Video & Ambient Glow */}
          <div 
            style={{
              transform: `perspective(1200px) rotateX(${tilt.x * 0.2}deg) rotateY(${tilt.y * 0.2}deg) translate3d(${tilt.y * 1.2}px, ${-tilt.x * 1.2}px, -20px) scale(1.05)`,
              transition: 'transform 0.15s ease-out',
              transformStyle: 'preserve-3d'
            }}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
          >
            <video 
              className="w-full h-full object-cover opacity-40 dark:opacity-20"
              autoPlay 
              loop 
              muted 
              playsInline
            >
              <source src="/Video.mp4" type="video/mp4" />
            </video>
            {/* Premium glass mask to ensure crisp text reading */}
            <div className="absolute inset-0 bg-white/75 dark:bg-slate-950/80 backdrop-blur-[4px]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-[#f7f9fb]"></div>
          </div>

          <motion.div 
            style={{ scale: heroScale, opacity: heroOpacity }}
            className="max-w-6xl mx-auto text-center z-10 flex flex-col items-center"
          >
            
            {/* Top Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-8 text-xs font-semibold text-[#0052FF] dark:text-blue-400 backdrop-blur-md animate-fade-in"
            >
              <span className="w-2 h-2 rounded-full bg-[#0052FF] animate-pulse"></span>
              ✦ Next-Gen Predictive Career Intelligence
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-headline text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#03091e] dark:text-white mb-8 leading-[1.1] max-w-4xl"
            >
              The Architecture of <br />
              <span className="bg-gradient-to-r from-[#0052FF] via-indigo-600 to-purple-600 bg-clip-text text-transparent">Definitive Choice.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl leading-relaxed"
            >
              Fusing AI predictive career mapping with real-world executive mentorship to help students & professionals navigate high-stakes career decisions with 100% confidence.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4 mb-16"
            >
              <Link className="bg-[#03091e] hover:bg-[#0a1538] text-white font-bold py-4 px-9 rounded-full shadow-xl shadow-slate-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all text-center inline-flex items-center gap-2" to="/discovery">
                <span>Start Your Discovery</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
              <button 
                onClick={() => frameworkRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white/90 hover:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800 font-semibold py-4 px-9 rounded-full shadow-sm hover:shadow-md transition-all backdrop-blur-md"
              >
                The Methodology
              </button>
            </motion.div>

            {/* Interactive Visual Card: Neural Cognitive Scan Widget (Matching Reference Image) */}
            <motion.div 
              ref={cardRef}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: 'transform 0.2s cubic-bezier(0.03, 0.98, 0.52, 0.99)'
              }}
              className="w-full max-w-3xl rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.12)] border border-white/90 dark:border-slate-800 relative aspect-[16/10] bg-gradient-to-br from-[#4ade80] via-[#52e493] to-[#34d399] flex items-center justify-center group select-none"
            >
              {/* Halftone Dot Grid Pattern Overlay */}
              <div 
                className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#03091e 1.5px, transparent 1.5px)`,
                  backgroundSize: '16px 16px'
                }}
              ></div>

              {/* Central Silhouette & Neural Mesh Overlay */}
              <div className="relative w-72 h-80 flex items-center justify-center">
                {/* Silhouette SVG Avatar / Portrait */}
                <svg className="w-full h-full text-[#03091e] opacity-90 drop-shadow-2xl" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 3.54 1.84 6.65 4.63 8.43.12-.51.37-1.41.76-2.22.46-.96 1.15-1.92 2.1-2.61.92-.67 2.05-1.1 3.51-1.1s2.59.43 3.51 1.1c.95.69 1.64 1.65 2.1 2.61.39.81.64 1.71.76 2.22C20.16 18.65 22 15.54 22 12c0-5.52-4.48-10-10-10zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                </svg>

                {/* Dotted Neural Scanning Overlay Grid over Head */}
                <div className="absolute top-4 w-48 h-56 rounded-full bg-slate-900/30 backdrop-blur-[1px] mix-blend-multiply flex flex-wrap gap-1 p-3 items-center justify-center opacity-80 animate-pulse">
                  {Array.from({ length: 96 }).map((_, i) => (
                    <span 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full transition-opacity duration-500 ${
                        i % 5 === 0 ? 'bg-white opacity-90' : i % 3 === 0 ? 'bg-[#03091e] opacity-70' : 'bg-emerald-950 opacity-40'
                      }`}
                    ></span>
                  ))}
                </div>
              </div>

              {/* Floating Glassmorphic Badges (Matching Screenshot Callouts) */}
              
              {/* Badge 1: Top Right - Delight */}
              <div className="absolute top-8 left-8 md:left-14 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/90 dark:border-slate-700 shadow-xl rounded-full px-4 py-2.5 flex items-center gap-2.5 hover:scale-105 transition-all duration-300 cursor-pointer animate-float">
                <div className="w-6 h-6 rounded-full bg-[#03091e] text-white flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                </div>
                <span className="text-xs font-extrabold text-[#03091e] dark:text-white tracking-tight">Delight</span>
              </div>

              {/* Badge 2: Middle Left - Deep Focus */}
              <div className="absolute bottom-24 left-6 md:left-10 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/90 dark:border-slate-700 shadow-xl rounded-full px-4 py-2.5 flex items-center gap-2.5 hover:scale-105 transition-all duration-300 cursor-pointer animate-float delay-100">
                <div className="w-6 h-6 rounded-full bg-[#03091e] text-white flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-xs">psychology</span>
                </div>
                <span className="text-xs font-extrabold text-[#03091e] dark:text-white tracking-tight">Deep Focus</span>
              </div>

              {/* Badge 3: Top Right - Data-Driven Insight */}
              <div className="absolute top-10 right-6 md:right-10 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/90 dark:border-slate-700 shadow-xl rounded-full px-4 py-2.5 flex items-center gap-2.5 hover:scale-105 transition-all duration-300 cursor-pointer animate-float delay-200">
                <div className="w-6 h-6 rounded-full bg-[#03091e] text-white flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-xs">analytics</span>
                </div>
                <span className="text-xs font-extrabold text-[#03091e] dark:text-white tracking-tight">Data-Driven Insight</span>
              </div>

              {/* Badge 4: Bottom Right - Strategic Clarity */}
              <div className="absolute bottom-24 right-6 md:right-10 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/90 dark:border-slate-700 shadow-xl rounded-full px-4 py-2.5 flex items-center gap-2.5 hover:scale-105 transition-all duration-300 cursor-pointer animate-float delay-300">
                <div className="w-6 h-6 rounded-full bg-[#03091e] text-white flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-xs">track_changes</span>
                </div>
                <span className="text-xs font-extrabold text-[#03091e] dark:text-white tracking-tight">Strategic Clarity</span>
              </div>

              {/* Bottom Interactive Status Bar */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#03091e]/90 text-white backdrop-blur-xl px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                ProDecide Neural Cognitive Parser Active
              </div>
            </motion.div>

            {/* Quick Stats Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-3 gap-6 md:gap-16 mt-16 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 max-w-2xl w-full text-center"
            >
              <div>
                <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-headline">500+</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verified Executives</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-headline">98%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Decision Satisfaction</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-headline">20k+</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Paths Mapped</div>
              </div>
            </motion.div>

          </motion.div>
        </section>
      </div>

      <main>
        {/* Exact Methodology Section Matching Generated Demo Image */}
        <section ref={frameworkRef} className="bg-[#080d1a] py-32 px-6 md:px-12 relative overflow-hidden text-white select-none">
          
          <div className="max-w-7xl mx-auto relative">
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-20 text-center"
            >
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">Methodology</h2>
              <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base font-medium">Advanced AI career navigation for your career path</p>
            </motion.div>

            {/* Glowing Laser Beam Line connecting Stage 01 -> Stage 04 on Scroll */}
            <div className="hidden lg:block absolute top-[58%] left-12 right-12 h-2 bg-slate-800/80 rounded-full pointer-events-none z-0 overflow-visible">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500 rounded-full shadow-[0_0_25px_#00f0ff] origin-left relative"
                style={{ scaleX: beamScaleX }}
              >
                {/* Electric Laser Tip Orb */}
                <div className="w-5 h-5 rounded-full bg-cyan-300 shadow-[0_0_25px_#00f0ff] -right-2.5 -top-1.5 absolute animate-pulse"></div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 relative z-10">
              
              {/* Stage 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="group bg-slate-900/70 backdrop-blur-2xl p-8 rounded-3xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-cyan-400/80 hover:shadow-[0_0_40px_rgba(0,240,255,0.25)] transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Stage</span>
                      <span className="text-3xl font-extrabold text-white">01</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-cyan-400 flex items-center justify-center shadow-inner">
                      <span className="material-symbols-outlined text-lg">psychology</span>
                    </div>
                  </div>

                  <div className="w-20 h-20 rounded-full bg-slate-800/90 border border-cyan-400/30 text-cyan-300 flex items-center justify-center my-6 mx-auto shadow-inner group-hover:scale-110 group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-300">
                    <span className="material-symbols-outlined text-3xl">psychology</span>
                  </div>

                  <h3 className="font-headline text-xl font-extrabold text-white text-center mb-2">Deep Analysis</h3>
                  <p className="text-slate-400 text-xs text-center leading-relaxed">Comprehensive Skill & Personality Assessment</p>
                </div>
              </motion.div>

              {/* Stage 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="group bg-slate-900/70 backdrop-blur-2xl p-8 rounded-3xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-cyan-400/80 hover:shadow-[0_0_40px_rgba(0,240,255,0.25)] transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Stage</span>
                      <span className="text-3xl font-extrabold text-white">02</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-cyan-400 flex items-center justify-center shadow-inner">
                      <span className="material-symbols-outlined text-lg">settings</span>
                    </div>
                  </div>

                  <div className="w-20 h-20 rounded-full bg-slate-800/90 border border-cyan-400/30 text-cyan-300 flex items-center justify-center my-6 mx-auto shadow-inner group-hover:scale-110 group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-300">
                    <span className="material-symbols-outlined text-3xl">trending_up</span>
                  </div>

                  <h3 className="font-headline text-xl font-extrabold text-white text-center mb-2">Skill Optimization</h3>
                  <p className="text-slate-400 text-xs text-center leading-relaxed">Curated Training & Development Paths</p>
                </div>
              </motion.div>

              {/* Stage 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="group bg-slate-900/70 backdrop-blur-2xl p-8 rounded-3xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-cyan-400/80 hover:shadow-[0_0_40px_rgba(0,240,255,0.25)] transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Stage</span>
                      <span className="text-3xl font-extrabold text-white">03</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-cyan-400 flex items-center justify-center shadow-inner">
                      <span className="material-symbols-outlined text-lg">language</span>
                    </div>
                  </div>

                  <div className="w-20 h-20 rounded-full bg-slate-800/90 border border-cyan-400/30 text-cyan-300 flex items-center justify-center my-6 mx-auto shadow-inner group-hover:scale-110 group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-300">
                    <span className="material-symbols-outlined text-3xl">track_changes</span>
                  </div>

                  <h3 className="font-headline text-xl font-extrabold text-white text-center mb-2">Market Intelligence</h3>
                  <p className="text-slate-400 text-xs text-center leading-relaxed">Real-time Opportunity Matching & Demand Analysis</p>
                </div>
              </motion.div>

              {/* Stage 4 */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.55 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="group bg-slate-900/70 backdrop-blur-2xl p-8 rounded-3xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-cyan-400/80 hover:shadow-[0_0_40px_rgba(0,240,255,0.25)] transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Stage</span>
                      <span className="text-3xl font-extrabold text-white">04</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-cyan-400 flex items-center justify-center shadow-inner">
                      <span className="material-symbols-outlined text-lg">star</span>
                    </div>
                  </div>

                  <div className="w-20 h-20 rounded-full bg-slate-800/90 border border-cyan-400/30 text-cyan-300 flex items-center justify-center my-6 mx-auto shadow-inner group-hover:scale-110 group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-300">
                    <span className="material-symbols-outlined text-3xl">person</span>
                  </div>

                  <h3 className="font-headline text-xl font-extrabold text-white text-center mb-2">Exec Coaching</h3>
                  <p className="text-slate-400 text-xs text-center leading-relaxed">Personalized Guidance for Strategic Placement</p>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Expert Section - Premium Directory */}
        <section className="py-32 px-8 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20"
            >
              <div className="max-w-xl">
                <h2 className="font-headline text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">Human Intelligence, Augmented.</h2>
                <p className="text-on-surface-variant leading-relaxed">Work directly with the top 1% of industry strategists, hand-matched to your specific challenge by our AI engine.</p>
              </div>
              <Link className="text-[#0052FF] font-bold inline-flex items-center gap-2 group" to="/experts">
                <span className="border-b-2 border-primary/20 group-hover:border-primary transition-all">View Full Directory</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Consultant 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -6 }}
                className="consultant-card group cursor-pointer bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative overflow-hidden rounded-xl mb-6 aspect-[4/5] bg-slate-100">
                  <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" alt="Professional female executive Sarah Chen" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKmkV3e9nKo1J_wj7ErY6Jo6PA56ImpTbrbrf2JYmVGx5aBDub1zWrwrFnA5uF233QPgq6gde2uCEcMIQZ9qCI1iglD-skyrmtrLJKersPCe1Rvg8FNt_I1fpLuwsjQYgiu78gm-f7n_kPd-ghenwl5I_6wu21JAv54emIIUm2Q3Xhlsz6Pp9Pexoj5l_nceGikMwWkdDliA8XZlFE6xp5Tnxxwywkz1oD_R7uKfinJU1t1MFuopE34HN1MxJzjZljD1I13-6uyhk" />
                  <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <Link className="w-full py-3 bg-white/90 backdrop-blur text-slate-900 font-bold text-xs uppercase tracking-widest rounded-lg text-center block" to="/experts">Consult With Sarah</Link>
                  </div>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-headline text-xl font-bold text-slate-900 dark:text-white">Sarah Chen</h4>
                  <div className="expertise-tag px-2 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-500 uppercase tracking-tighter transition-colors">Logistics</div>
                </div>
                <p className="text-xs text-slate-400 font-semibold mb-4 uppercase tracking-wider">Former COO at GlobalLogix</p>
                <p className="text-sm text-on-surface-variant leading-relaxed">Specializes in multi-modal infrastructure optimization and supply chain resilience.</p>
              </motion.div>

              {/* Consultant 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25 }}
                whileHover={{ y: -6 }}
                className="consultant-card group cursor-pointer bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative overflow-hidden rounded-xl mb-6 aspect-[4/5] bg-slate-100">
                  <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" alt="Senior male consultant Marcus Thorne" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXjKQlFsexu8ZM3ElWg6wQMIVQV-Qe30MQDGhEcj6zoD8IJPVJ3HC9paxqHLneNw_yE8mxaQay6PAsWJ1xtRKYLBiBYc33Zbn8b-3rxQDp0Z4RMstc5B0jnpPYr8WW0bmLTowuj7C31WHCHJ5EIshKQDQxgUjpt-ZR5kjMbsSOKTZpbn78XKBjOKP0lEt9qYIpHw7TPvoA6FaHM38_UG69PNRs_YWCKxq6TX_tybB2TfPgls6GEUJ_DuCO17OFEQcoitR68UR9w_s" />
                  <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <Link className="w-full py-3 bg-white/90 backdrop-blur text-slate-900 font-bold text-xs uppercase tracking-widest rounded-lg text-center block" to="/experts">Consult With Marcus</Link>
                  </div>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-headline text-xl font-bold text-slate-900 dark:text-white">Marcus Thorne</h4>
                  <div className="expertise-tag px-2 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-500 uppercase tracking-tighter transition-colors">FinTech</div>
                </div>
                <p className="text-xs text-slate-400 font-semibold mb-4 uppercase tracking-wider">Venture Capital Partner</p>
                <p className="text-sm text-on-surface-variant leading-relaxed">Expertise in emerging market regulatory frameworks and digital asset integration.</p>
              </motion.div>

              {/* Consultant 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ y: -6 }}
                className="consultant-card group cursor-pointer bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative overflow-hidden rounded-xl mb-6 aspect-[4/5] bg-slate-100">
                  <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" alt="Female tech professional Dr. Elena Rodriguez" src="/elena_portrait.png" />
                  <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <Link className="w-full py-3 bg-white/90 backdrop-blur text-slate-900 font-bold text-xs uppercase tracking-widest rounded-lg text-center block" to="/experts">Consult With Elena</Link>
                  </div>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-headline text-xl font-bold text-slate-900 dark:text-white">Dr. Elena Rodriguez</h4>
                  <div className="expertise-tag px-2 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-500 uppercase tracking-tighter transition-colors">ESG Systems</div>
                </div>
                <p className="text-xs text-slate-400 font-semibold mb-4 uppercase tracking-wider">G7 Climate Task Force Advisor</p>
                <p className="text-sm text-on-surface-variant leading-relaxed">Lead researcher on circular economies and large-scale sustainability modeling.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* AI Insight Pulse */}
        <section className="py-24 px-8 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-xl"
            >
              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div className="bg-[#0052FF] p-5 rounded-2xl text-white shadow-xl shadow-[#0052FF]/20">
                  <span className="material-symbols-outlined text-4xl">lightbulb</span>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="font-headline text-2xl font-bold mb-4 text-slate-900 dark:text-white">Why ProDecide AI?</h3>
                  <p className="text-lg text-on-surface-variant leading-relaxed italic mb-6">"ProDecide empowers professionals and individuals alike to navigate complex career paths and personal milestones. We don't just provide data; we provide the narrative architecture that makes the right choice obvious."</p>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <div className="w-2 h-2 bg-[#0052FF] rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[#0052FF]">Live Strategy Optimization</span>
                  </div>
                </div>
              </div>
            </motion.div>
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
