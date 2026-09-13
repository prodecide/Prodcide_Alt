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
    <div ref={containerRef} className="bg-[#03091e] font-body text-white antialiased relative">
      
      {/* Scroll Progress Line directly below top fixed navbar */}
      <motion.div 
        className="fixed top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-[#0052FF] to-indigo-500 z-50 origin-left shadow-[0_0_10px_#00f0ff]"
        style={{ scaleX: smoothProgress }}
      />

      <Navbar />
      
      <div className="relative overflow-hidden bg-[#03091e]">

        {/* Ambient Radial Blur Lighting Orbs (Matching Demo Image) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[600px] bg-gradient-to-tr from-[#0052FF]/35 via-cyan-400/25 to-emerald-400/30 rounded-full blur-[150px] pointer-events-none z-0"></div>
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[130px] pointer-events-none z-0"></div>
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[130px] pointer-events-none z-0"></div>

        {/* Merged Top Section: Hero */}
        <section 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative pt-36 pb-32 px-6 md:px-12 overflow-hidden min-h-[92vh] flex items-center justify-center z-10"
        >
          {/* Full-bleed 3D Background Video & Ambient Glow */}
          <div 
            style={{
              transform: `perspective(1200px) rotateX(${tilt.x * 0.2}deg) rotateY(${tilt.y * 0.2}deg) translate3d(${tilt.y * 1.2}px, ${-tilt.x * 1.2}px, -20px) scale(1.05)`,
              transition: 'transform 0.15s ease-out',
              transformStyle: 'preserve-3d'
            }}
            className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40"
          >
            <video 
              className="w-full h-full object-cover opacity-25"
              autoPlay 
              loop 
              muted 
              playsInline
            >
              <source src="/Video.mp4" type="video/mp4" />
            </video>
            {/* Premium glass mask */}
            <div className="absolute inset-0 bg-[#03091e]/80 backdrop-blur-[2px]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#03091e]/50 to-[#03091e]"></div>
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
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 shadow-lg mb-8 text-xs font-semibold text-cyan-300 backdrop-blur-xl animate-fade-in"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              ✦ Next-Gen Predictive Career Intelligence
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-headline text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-8 leading-[1.1] max-w-4xl"
            >
              The Architecture of <br />
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Definitive Choice.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base md:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed"
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
              <Link className="bg-gradient-to-r from-[#0052FF] to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-4 px-9 rounded-full shadow-[0_0_30px_rgba(0,82,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all text-center inline-flex items-center gap-2" to="/discovery">
                <span>Start Your Discovery</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
              <button 
                onClick={() => frameworkRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold py-4 px-9 rounded-full shadow-lg transition-all backdrop-blur-xl"
              >
                The Methodology
              </button>
            </motion.div>

            {/* Interactive Visual Card: Revamped Front-Facing Holographic Neural Scanner */}
            <motion.div 
              ref={cardRef}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{
                transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: 'transform 0.2s cubic-bezier(0.03, 0.98, 0.52, 0.99)'
              }}
              className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,82,255,0.25)] border border-cyan-500/30 relative aspect-[16/10] bg-[#040c1e]/85 backdrop-blur-2xl flex items-center justify-center group select-none"
            >
              {/* Radial Cyan-Blue Glow backdrop inside card */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/15 via-blue-600/10 to-transparent pointer-events-none"></div>

              {/* Full-Screen Spreading Neural Constellation Network Mesh SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1000 625" fill="none">
                <defs>
                  <linearGradient id="laserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#0052FF" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0.8" />
                  </linearGradient>
                  <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Spreading Background Neural Network Lines across entire container */}
                <g opacity="0.4" stroke="url(#laserGrad)" strokeWidth="1">
                  {/* Outer Spreading Nodes and Line Network */}
                  <line x1="500" y1="280" x2="200" y2="100" strokeDasharray="4 2" />
                  <line x1="500" y1="280" x2="800" y2="100" strokeDasharray="4 2" />
                  <line x1="500" y1="360" x2="180" y2="480" strokeDasharray="4 2" />
                  <line x1="500" y1="360" x2="820" y2="480" strokeDasharray="4 2" />
                  
                  <line x1="200" y1="100" x2="80" y2="220" />
                  <line x1="200" y1="100" x2="350" y2="60" />
                  <line x1="800" y1="100" x2="920" y2="220" />
                  <line x1="800" y1="100" x2="650" y2="60" />

                  <line x1="180" y1="480" x2="60" y2="380" />
                  <line x1="180" y1="480" x2="360" y2="560" />
                  <line x1="820" y1="480" x2="940" y2="380" />
                  <line x1="820" y1="480" x2="640" y2="560" />

                  <line x1="80" y1="220" x2="60" y2="380" />
                  <line x1="920" y1="220" x2="940" y2="380" />
                  <line x1="350" y1="60" x2="650" y2="60" />
                  <line x1="360" y1="560" x2="640" y2="560" />

                  {/* Interconnected Web Mesh */}
                  <line x1="350" y1="60" x2="420" y2="200" />
                  <line x1="650" y1="60" x2="580" y2="200" />
                  <line x1="180" y1="220" x2="400" y2="240" />
                  <line x1="820" y1="220" x2="600" y2="240" />
                </g>

                {/* Spreading Node Particles */}
                <g filter="url(#cyanGlow)">
                  <circle cx="200" cy="100" r="4" fill="#00f0ff" className="animate-ping" />
                  <circle cx="800" cy="100" r="4" fill="#00f0ff" className="animate-ping" />
                  <circle cx="180" cy="480" r="4" fill="#34d399" />
                  <circle cx="820" cy="480" r="4" fill="#34d399" />
                  <circle cx="80" cy="220" r="3" fill="#0052FF" />
                  <circle cx="920" cy="220" r="3" fill="#0052FF" />
                  <circle cx="350" cy="60" r="3" fill="#00f0ff" />
                  <circle cx="650" cy="60" r="3" fill="#00f0ff" />
                  <circle cx="60" cy="380" r="3" fill="#00f0ff" />
                  <circle cx="940" cy="380" r="3" fill="#00f0ff" />
                  <circle cx="360" cy="560" r="3.5" fill="#34d399" />
                  <circle cx="640" cy="560" r="3.5" fill="#34d399" />
                </g>

                {/* Laser Connector Target Lines directly linking Badge Positions to Head Nodes */}
                <g stroke="#00f0ff" strokeWidth="1.5" filter="url(#cyanGlow)" opacity="0.8">
                  {/* Top Left Badge Connector */}
                  <polyline points="210,110 320,150 420,210" strokeDasharray="3 2" />
                  <circle cx="420" cy="210" r="4" fill="#00f0ff" />
                  <circle cx="210" cy="110" r="3" fill="#00f0ff" />

                  {/* Bottom Left Badge Connector */}
                  <polyline points="200,430 330,420 430,360" strokeDasharray="3 2" />
                  <circle cx="430" cy="360" r="4" fill="#34d399" />
                  <circle cx="200" cy="430" r="3" fill="#34d399" />

                  {/* Top Right Badge Connector */}
                  <polyline points="790,110 680,150 580,210" strokeDasharray="3 2" />
                  <circle cx="580" cy="210" r="4" fill="#00f0ff" />
                  <circle cx="790" cy="110" r="3" fill="#00f0ff" />

                  {/* Bottom Right Badge Connector */}
                  <polyline points="800,430 670,420 570,360" strokeDasharray="3 2" />
                  <circle cx="570" cy="360" r="4" fill="#34d399" />
                  <circle cx="800" cy="430" r="3" fill="#34d399" />
                </g>
              </svg>

              {/* Central Front-Facing Holographic Neural Head & Laser Beam Scanner */}
              <div className="relative w-80 h-96 flex items-center justify-center z-10">
                
                {/* Front-Facing Holographic Head Silhouette SVG */}
                <svg className="w-full h-full text-cyan-400 opacity-90 drop-shadow-[0_0_25px_rgba(0,240,255,0.4)]" viewBox="0 0 200 240" fill="none">
                  {/* Front-Facing Head Outline Contour */}
                  <path 
                    d="M100 20 C60 20 42 45 42 90 C42 130 52 165 72 190 L80 200 C90 208 95 212 100 212 C105 212 110 208 120 200 L128 190 C148 165 158 130 158 90 C158 45 140 20 100 20 Z" 
                    stroke="url(#laserGrad)" 
                    strokeWidth="2" 
                    fill="url(#headFillGrad)" 
                    opacity="0.85" 
                  />

                  {/* Facial Features & Cranium Neural Grid Lines */}
                  <g stroke="#00f0ff" strokeWidth="0.8" opacity="0.6">
                    {/* Eyebrow & Orbit Lines */}
                    <path d="M60 92 C72 86 84 88 92 94" />
                    <path d="M140 92 C128 86 116 88 108 94" />
                    {/* Nose Bridge & Tip */}
                    <path d="M100 90 L100 135 L93 142 L107 142" />
                    {/* Lips Line */}
                    <path d="M82 165 Q100 172 118 165" />
                    {/* Jaw & Chin Contours */}
                    <path d="M62 145 Q100 195 138 145" />

                    {/* Dotted Neural Brain Grid */}
                    {Array.from({ length: 48 }).map((_, i) => {
                      const cx = 60 + (i % 7) * 13;
                      const cy = 40 + Math.floor(i / 7) * 14;
                      return <circle key={i} cx={cx} cy={cy} r="1.2" fill="#00f0ff" opacity={i % 3 === 0 ? "0.9" : "0.4"} />;
                    })}
                  </g>

                  <defs>
                    <linearGradient id="headFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.15" />
                      <stop offset="60%" stopColor="#0052FF" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#03091e" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Vertical Electric Laser Beam Scanner Line */}
                <motion.div 
                  className="absolute left-0 right-0 h-1 bg-cyan-300 shadow-[0_0_20px_#00f0ff,0_0_35px_#00f0ff] z-20 pointer-events-none"
                  animate={{
                    top: ['12%', '84%', '12%']
                  }}
                  transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {/* Laser Beam Pulse Orbs on Edges */}
                  <div className="absolute -left-1 -top-1 w-3 h-3 rounded-full bg-cyan-200 shadow-[0_0_12px_#00f0ff]"></div>
                  <div className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-cyan-200 shadow-[0_0_12px_#00f0ff]"></div>
                </motion.div>

              </div>

              {/* Floating Glassmorphic Badges connected via Laser lines */}
              
              {/* Badge 1: Top Left - Delight */}
              <div className="absolute top-8 left-6 md:left-12 bg-[#03091e]/90 text-white backdrop-blur-xl border border-cyan-400/40 shadow-[0_0_20px_rgba(0,240,255,0.2)] rounded-full px-4 py-2.5 flex items-center gap-2.5 hover:scale-105 transition-all duration-300 cursor-pointer animate-float z-20">
                <div className="w-6 h-6 rounded-full bg-[#0052FF] text-white flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_#0052FF]">
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                </div>
                <span className="text-xs font-extrabold text-white tracking-tight">Delight</span>
              </div>

              {/* Badge 2: Bottom Left - Deep Focus */}
              <div className="absolute bottom-20 left-6 md:left-10 bg-[#03091e]/90 text-white backdrop-blur-xl border border-cyan-400/40 shadow-[0_0_20px_rgba(0,240,255,0.2)] rounded-full px-4 py-2.5 flex items-center gap-2.5 hover:scale-105 transition-all duration-300 cursor-pointer animate-float delay-100 z-20">
                <div className="w-6 h-6 rounded-full bg-[#0052FF] text-white flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_#0052FF]">
                  <span className="material-symbols-outlined text-xs">psychology</span>
                </div>
                <span className="text-xs font-extrabold text-white tracking-tight">Deep Focus</span>
              </div>

              {/* Badge 3: Top Right - Data-Driven Insight */}
              <div className="absolute top-8 right-6 md:right-12 bg-[#03091e]/90 text-white backdrop-blur-xl border border-cyan-400/40 shadow-[0_0_20px_rgba(0,240,255,0.2)] rounded-full px-4 py-2.5 flex items-center gap-2.5 hover:scale-105 transition-all duration-300 cursor-pointer animate-float delay-200 z-20">
                <div className="w-6 h-6 rounded-full bg-[#0052FF] text-white flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_#0052FF]">
                  <span className="material-symbols-outlined text-xs">analytics</span>
                </div>
                <span className="text-xs font-extrabold text-white tracking-tight">Data-Driven Insight</span>
              </div>

              {/* Badge 4: Bottom Right - Strategic Clarity */}
              <div className="absolute bottom-20 right-6 md:right-10 bg-[#03091e]/90 text-white backdrop-blur-xl border border-cyan-400/40 shadow-[0_0_20px_rgba(0,240,255,0.2)] rounded-full px-4 py-2.5 flex items-center gap-2.5 hover:scale-105 transition-all duration-300 cursor-pointer animate-float delay-300 z-20">
                <div className="w-6 h-6 rounded-full bg-[#0052FF] text-white flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_#0052FF]">
                  <span className="material-symbols-outlined text-xs">track_changes</span>
                </div>
                <span className="text-xs font-extrabold text-white tracking-tight">Strategic Clarity</span>
              </div>

              {/* Bottom Interactive Status Bar */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#03091e]/95 text-white backdrop-blur-xl px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 shadow-lg border border-cyan-500/30 z-20">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                ProDecide Neural Cognitive Parser Active
              </div>
            </motion.div>

            {/* Quick Stats Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-3 gap-6 md:gap-16 mt-16 pt-8 border-t border-slate-800/80 max-w-2xl w-full text-center"
            >
              <div>
                <div className="text-2xl md:text-3xl font-black text-white font-headline">500+</div>
                <div className="text-xs text-slate-400 font-medium">Verified Executives</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black text-white font-headline">98%</div>
                <div className="text-xs text-slate-400 font-medium">Decision Satisfaction</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black text-white font-headline">20k+</div>
                <div className="text-xs text-slate-400 font-medium">Paths Mapped</div>
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
