import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, MotionConfig, useScroll, useTransform } from 'framer-motion';
import Navbar from './Navbar';
import HumanHologram from './HumanHologram';

const STEPS = [
  { n: '01', icon: 'psychology', title: 'Deep Analysis', body: 'Tell our AI about your skills, goals and background.' },
  { n: '02', icon: 'trending_up', title: 'Skill Optimization', body: 'Get a personalised plan of skills and courses to build.' },
  { n: '03', icon: 'track_changes', title: 'Market Intelligence', body: 'See which roles are in demand and where you fit.' },
  { n: '04', icon: 'person', title: 'Exec Coaching', body: 'Book a 1:1 session with a vetted consultant.' },
];

const TRUST = [
  { icon: 'verified', text: 'Every consultant is reviewed by our team' },
  { icon: 'tune', text: 'Matched to your profile, not a generic list' },
  { icon: 'event_available', text: 'Book 1:1 sessions online' },
];

const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

function ExpertsPreview() {
  const [experts, setExperts] = useState(null); // null = loading

  useEffect(() => {
    let cancelled = false;
    fetch('/api/consultants')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { if (!cancelled) setExperts(Array.isArray(data) ? data.slice(0, 3) : []); })
      .catch(() => { if (!cancelled) setExperts([]); });
    return () => { cancelled = true; };
  }, []);

  if (experts === null) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 animate-pulse">
            <div className="aspect-[4/5] rounded-xl bg-white/5 mb-6" />
            <div className="h-5 w-2/3 rounded bg-white/10 mb-3" />
            <div className="h-3 w-1/2 rounded bg-white/5" />
          </div>
        ))}
      </div>
    );
  }

  if (experts.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 bg-slate-900/40 px-8 py-16 text-center">
        <span className="material-symbols-outlined text-4xl text-cyan-300 mb-4 block" aria-hidden="true">group_add</span>
        <h3 className="font-headline text-2xl font-bold text-white mb-2">Our first consultants are joining</h3>
        <p className="text-slate-300 max-w-md mx-auto mb-8">Start Discovery now and we'll match you as soon as profiles go live. Experienced professional? Apply to be one.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/discovery" className="bg-gradient-to-r from-[#0052FF] to-blue-600 text-white font-semibold py-3 px-7 rounded-full">Start your discovery</Link>
          <Link to="/registration" className="border border-white/20 text-white font-semibold py-3 px-7 rounded-full hover:bg-white/10 transition-colors">Apply as a consultant</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {experts.map((c) => {
        const name = c.fullName || c.name || 'Consultant';
        const tag = Array.isArray(c.expertise) ? c.expertise[0] : null;
        const subtitle = [c.role, c.organization].filter(Boolean).join(' at ');
        return (
          <Link
            key={c._id}
            to={`/profile/${c._id}`}
            className="group block rounded-2xl border border-white/10 bg-slate-900/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40"
          >
            <div className="relative overflow-hidden rounded-xl mb-6 aspect-[4/5] bg-slate-800">
              {c.profileImage ? (
                <img src={c.profileImage} alt={name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-[#0b1226] text-5xl font-headline font-bold text-cyan-200/70">{initials(name)}</div>
              )}
            </div>
            <div className="flex justify-between items-start gap-3 mb-2">
              <h3 className="font-headline text-xl font-bold text-white">{name}</h3>
              {tag && <span className="shrink-0 px-2 py-0.5 border border-cyan-400/30 rounded text-[11px] font-semibold text-cyan-200">{tag}</span>}
            </div>
            {subtitle && <p className="text-sm text-slate-300 mb-3">{subtitle}</p>}
            {c.bio && <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{c.bio}</p>}
          </Link>
        );
      })}
    </div>
  );
}

export default function Home() {
  const frameworkRef = useRef(null);
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.04]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.92]);

  // Methodology line fills as the section scrolls through the viewport
  const { scrollYProgress: stepsProgress } = useScroll({ target: frameworkRef, offset: ['start 70%', 'end 60%'] });
  const lineScale = useTransform(stepsProgress, [0, 1], [0, 1]);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;
    setTilt({ x: -(mouseY / rect.height) * 15, y: (mouseX / rect.width) * 15 });
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-[#03091e] font-body text-white antialiased relative">
        <Navbar />

        {/* Hero */}
        <div className="relative overflow-hidden bg-[#03091e]">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[600px] bg-gradient-to-tr from-[#0052FF]/35 via-cyan-400/25 to-emerald-400/30 rounded-full blur-[150px] pointer-events-none z-0"></div>
          <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[130px] pointer-events-none z-0"></div>
          <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[130px] pointer-events-none z-0"></div>

          <section
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            className="relative pt-36 pb-24 px-6 md:px-12 min-h-[100vh] flex items-center z-10"
          >
            <motion.div
              style={{ scale: heroScale, opacity: heroOpacity }}
              className="max-w-7xl mx-auto w-full grid lg:grid-cols-[1.05fr_1fr] gap-14 lg:gap-8 items-center"
            >
              {/* Copy: renders immediately, no fade-in from an empty page */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-7 leading-[1.05]">
                  Choose your next career move with an expert, not a guess.
                </h1>

                <p className="text-base md:text-lg text-slate-300 mb-10 max-w-xl leading-relaxed">
                  Answer a few questions, get a match from our AI, then book a session with a vetted consultant.
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4 mb-14">
                  <Link
                    className="bg-gradient-to-r from-[#0052FF] to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-4 px-9 rounded-full shadow-[0_0_30px_rgba(0,82,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center gap-2"
                    to="/discovery"
                  >
                    Start your discovery
                    <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
                  </Link>
                  <button
                    onClick={() => frameworkRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-slate-200 hover:text-white font-semibold underline underline-offset-8 decoration-white/30 hover:decoration-cyan-300 transition-colors"
                  >
                    How it works
                  </button>
                </div>

                <ul className="grid sm:grid-cols-3 gap-6 pt-8 border-t border-white/10 w-full max-w-2xl">
                  {TRUST.map((t) => (
                    <li key={t.text} className="flex lg:flex-col items-center lg:items-start gap-3 text-left">
                      <span className="material-symbols-outlined text-cyan-300 text-xl" aria-hidden="true">{t.icon}</span>
                      <span className="text-sm text-slate-300 leading-snug">{t.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Holographic human */}
              <div ref={cardRef} className="w-full px-2 sm:px-8 lg:px-0">
                <HumanHologram tilt={tilt} />
              </div>
            </motion.div>
          </section>
        </div>

        <main>
          {/* How it works: a real sequence, so the numbering stays */}
          <section ref={frameworkRef} className="bg-[#080d1a] py-24 px-6 md:px-12 relative overflow-hidden scroll-mt-16">
            <div className="max-w-7xl mx-auto">
              <div className="mb-16 max-w-2xl">
                <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">How it works</h2>
                <p className="text-slate-300 text-base md:text-lg">Four steps from a question to a decision you can act on.</p>
              </div>

              <ol className="relative grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                {/* Connecting line fills on scroll (desktop) */}
                <div className="hidden lg:block absolute left-0 right-0 top-6 h-px bg-white/10" aria-hidden="true">
                  <motion.div className="h-full origin-left bg-gradient-to-r from-cyan-400 to-[#0052FF] shadow-[0_0_12px_#00f0ff]" style={{ scaleX: lineScale }} />
                </div>

                {STEPS.map((s, i) => (
                  <motion.li
                    key={s.n}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="relative"
                  >
                    <div className="relative z-10 w-12 h-12 rounded-full bg-[#080d1a] border border-cyan-400/40 text-cyan-300 flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-2xl" aria-hidden="true">{s.icon}</span>
                    </div>
                    <p className="text-sm font-semibold text-cyan-300 mb-2">Step {s.n}</p>
                    <h3 className="font-headline text-xl font-bold text-white mb-2">{s.title}</h3>
                    <p className="text-slate-300 leading-relaxed">{s.body}</p>
                  </motion.li>
                ))}
              </ol>
            </div>
          </section>

          {/* Experts */}
          <section className="py-24 px-6 md:px-12 bg-[#050a18]">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-14">
                <div className="max-w-xl">
                  <h2 className="font-headline text-4xl font-bold tracking-tight mb-4 text-white">Talk to someone who has done it.</h2>
                  <p className="text-slate-300 leading-relaxed">Consultants are reviewed by our team and matched to your profile after Discovery.</p>
                </div>
                <Link className="text-cyan-300 hover:text-cyan-200 font-semibold inline-flex items-center gap-2 group" to="/experts">
                  <span>See all consultants</span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" aria-hidden="true">arrow_forward</span>
                </Link>
              </div>
              <ExpertsPreview />
            </div>
          </section>

          {/* Why */}
          <section className="py-24 px-6 md:px-12 bg-[#080d1a]">
            <div className="max-w-4xl mx-auto bg-slate-900/60 border border-cyan-400/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
              <div className="bg-[#0052FF] p-5 rounded-2xl text-white shadow-xl shadow-[#0052FF]/20">
                <span className="material-symbols-outlined text-4xl" aria-hidden="true">lightbulb</span>
              </div>
              <div className="text-center md:text-left">
                <h3 className="font-headline text-2xl font-bold mb-4 text-white">Why Prodecide?</h3>
                <p className="text-lg text-slate-300 leading-relaxed">
                  Career decisions are personal and hard to undo. We combine AI that maps your options with real people who have made similar moves, so the right choice becomes clearer.
                </p>
              </div>
            </div>
          </section>

          {/* Closing call to action */}
          <section className="py-24 px-6 md:px-12 bg-[#03091e] relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" aria-hidden="true"></div>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">Ready to decide?</h2>
              <p className="text-slate-300 text-lg mb-8">It takes a few minutes to tell us where you are and where you want to go.</p>
              <Link
                className="bg-gradient-to-r from-[#0052FF] to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-4 px-10 rounded-full shadow-[0_0_30px_rgba(0,82,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center gap-2"
                to="/discovery"
              >
                Start your discovery
                <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>
          </section>
        </main>

        <footer className="bg-[#03091e] border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <span className="text-lg font-bold text-white font-headline">prodecide<span className="text-cyan-400">.ai</span></span>
              <p className="text-xs text-slate-400 mt-2">© 2026 Prodecide. All rights reserved.</p>
            </div>
            <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
              <Link className="text-slate-300 hover:text-white transition-colors" to="/discovery">Discovery</Link>
              <Link className="text-slate-300 hover:text-white transition-colors" to="/experts">Consultants</Link>
              <Link className="text-slate-300 hover:text-white transition-colors" to="/about">About us</Link>
              <Link className="text-slate-300 hover:text-white transition-colors" to="/registration">Apply as a consultant</Link>
            </nav>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
