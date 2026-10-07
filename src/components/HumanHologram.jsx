import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Left-facing human bust silhouette (forehead, brow, nose, lips, chin, jaw, neck, shoulders)
const BUST =
  'M178 72 L172 108 C170 118 172 124 170 130 C166 138 160 146 156 152 C150 165 142 180 138 190 ' +
  'C138 196 146 198 156 197 C156 205 154 210 152 214 C156 218 158 222 152 226 C156 232 158 238 154 244 ' +
  'C158 252 160 262 158 272 C160 284 172 292 188 292 C205 292 220 296 230 300 L234 342 ' +
  'C234 360 150 372 70 400 L50 480 L390 480 L372 400 C360 375 330 360 312 350 L302 282 ' +
  'C306 266 322 246 328 220 C345 160 335 100 290 62 C260 38 205 45 178 72 Z';

const mulberry32 = (a) => () => {
  a |= 0; a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Brain-region neural cluster (x, y)
const BRAIN = [
  [214, 96], [246, 82], [282, 98], [308, 130], [296, 168], [262, 182],
  [228, 166], [212, 132], [248, 122], [276, 140], [250, 154], [232, 108],
];
const BRAIN_LINKS = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [8, 9], [8, 10],
  [1, 8], [2, 9], [4, 9], [6, 10], [7, 8], [0, 11], [11, 1], [11, 8], [5, 10], [3, 9],
];

export default function HumanHologram({ tilt = { x: 0, y: 0 } }) {
  const reduce = useReducedMotion();
  const { nodes, links } = useMemo(() => {
    const rnd = mulberry32(7);
    const pts = Array.from({ length: 150 }, () => [120 + rnd() * 250, 40 + rnd() * 440]);
    const lk = [];
    pts.forEach((p, i) => {
      let c = 0;
      for (let j = i + 1; j < pts.length && c < 3; j++) {
        const d = Math.hypot(p[0] - pts[j][0], p[1] - pts[j][1]);
        if (d < 42) { lk.push([p, pts[j]]); c++; }
      }
    });
    return { nodes: pts, links: lk };
  }, []);

  const badges = [
    { icon: 'psychology', label: 'Deep Focus', pos: 'top-[40%] -left-2 sm:-left-6', d: '' },
    { icon: 'track_changes', label: 'Strategic Clarity', pos: 'bottom-[22%] right-0 sm:-right-4', d: 'delay-200' },
  ];

  return (
    <div
      className="relative w-full max-w-[540px] aspect-[22/26] mx-auto select-none"
      style={{
        transform: `perspective(1400px) rotateX(${tilt.x * 0.6}deg) rotateY(${tilt.y * 0.6}deg)`,
        transition: 'transform 0.25s cubic-bezier(0.03, 0.98, 0.52, 0.99)',
      }}
    >
      {/* Ambient aura */}
      <div className="absolute inset-[8%] rounded-full bg-gradient-to-tr from-[#0052FF]/30 via-cyan-400/20 to-emerald-400/20 blur-[80px] pointer-events-none" />

      {/* HUD frame */}
      <div className="absolute inset-0 rounded-[2rem] border border-cyan-400/20 bg-[#040c1e]/50 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,82,255,0.25)] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(0,240,255,0.14),transparent_65%)]" />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,240,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.5) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
            maskImage: 'radial-gradient(ellipse at 50% 45%, black 20%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, black 20%, transparent 75%)',
          }}
        />
        {/* Corner brackets */}
        {['top-3 left-3 border-t-2 border-l-2 rounded-tl-xl', 'top-3 right-3 border-t-2 border-r-2 rounded-tr-xl',
          'bottom-3 left-3 border-b-2 border-l-2 rounded-bl-xl', 'bottom-3 right-3 border-b-2 border-r-2 rounded-br-xl'].map((c) => (
          <span key={c} className={`absolute w-6 h-6 border-cyan-300/70 ${c}`} />
        ))}
      </div>

      <svg viewBox="0 0 440 520" className="absolute inset-0 w-full h-full" fill="none" aria-hidden="true">
        <defs>
          <clipPath id="bustClip"><path d={BUST} /></clipPath>
          <linearGradient id="bustStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#67f3ff" />
            <stop offset="55%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="bustFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.2" />
            <stop offset="60%" stopColor="#0052FF" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#03091e" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="scanBand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.45" />
          </linearGradient>
          <filter id="holoGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Silhouette glow + fill */}
        <path d={BUST} fill="url(#bustFill)" />
        <path d={BUST} stroke="#00f0ff" strokeOpacity="0.35" strokeWidth="6" filter="url(#holoGlow)" />

        {/* Volumetric content, clipped to the bust */}
        <g clipPath="url(#bustClip)">
          {/* contour scan lines */}
          {Array.from({ length: 36 }).map((_, i) => (
            <line key={i} x1="40" x2="400" y1={50 + i * 12.5} y2={50 + i * 12.5} stroke="#00f0ff" strokeOpacity="0.08" />
          ))}
          {/* polygon mesh */}
          <g stroke="#38bdf8" strokeOpacity="0.4" strokeWidth="0.7">
            {links.map(([a, b], i) => <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />)}
          </g>
          <g fill="#7dd3fc">
            {nodes.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i % 5 === 0 ? 1.8 : 1} opacity={i % 5 === 0 ? 0.9 : 0.5} />)}
          </g>

          {/* Brain network */}
          <g stroke="#67f3ff" strokeWidth="0.9" strokeOpacity="0.7">
            {BRAIN_LINKS.map(([a, b], i) => (
              <line key={i} x1={BRAIN[a][0]} y1={BRAIN[a][1]} x2={BRAIN[b][0]} y2={BRAIN[b][1]} />
            ))}
          </g>
          {BRAIN.map(([x, y], i) => (
            <motion.circle
              key={i} cx={x} cy={y} r="3.2" fill="#e0fcff" filter="url(#holoGlow)"
              animate={{ opacity: [0.35, 1, 0.35], scale: [0.8, 1.35, 0.8] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
            />
          ))}
          {/* signal travelling from brain to eye */}
          <motion.path
            d="M248 122 C220 130 196 138 178 146"
            stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeDasharray="10 60" filter="url(#holoGlow)"
            animate={reduce ? { strokeDashoffset: 30 } : { strokeDashoffset: [70, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
          />

          {/* Scanning band */}
          <motion.g animate={reduce ? { y: 240 } : { y: [30, 480, 30] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}>
            <rect x="40" y="-70" width="360" height="70" fill="url(#scanBand)" />
            <rect x="40" y="-1.5" width="360" height="3" fill="#a5f3fc" filter="url(#holoGlow)" />
          </motion.g>
        </g>

        {/* Facial details */}
        <g filter="url(#holoGlow)">
          <motion.circle cx="177" cy="146" r="3.4" fill="#e0fcff"
            animate={{ opacity: [1, 1, 0.1, 1, 1] }} transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.46, 0.5, 0.54, 1] }} />
          <path d="M168 134 C174 130 182 130 188 133" stroke="#67f3ff" strokeWidth="1.2" strokeOpacity="0.8" />
          <ellipse cx="288" cy="196" rx="11" ry="20" stroke="#67f3ff" strokeOpacity="0.55" strokeWidth="1.2" />
          <path d="M232 302 L236 344" stroke="#67f3ff" strokeOpacity="0.4" />
        </g>

        {/* Crisp outline */}
        <path d={BUST} stroke="url(#bustStroke)" strokeWidth="1.8" strokeLinejoin="round" />

        {/* Callout leaders */}
        <g stroke="#00f0ff" strokeOpacity="0.5" strokeDasharray="3 3" strokeWidth="1">
          <polyline points="160,214 110,250 52,250" />
          <polyline points="320,300 360,340 400,340" />
        </g>
        <g fill="#00f0ff" filter="url(#holoGlow)">
          <circle cx="160" cy="214" r="3" /><circle cx="320" cy="300" r="3" />
        </g>
      </svg>

      {/* Floating glass badges */}
      {badges.map((b) => (
        <div
          key={b.label}
          className={`absolute ${b.pos} ${b.d} animate-float z-20 bg-[#03091e]/85 backdrop-blur-xl border border-cyan-400/40 shadow-[0_0_24px_rgba(0,240,255,0.18)] rounded-full pl-2 pr-4 py-2 flex items-center gap-2.5 hover:scale-105 hover:border-cyan-300 transition-all duration-300`}
        >
          <span className="w-6 h-6 rounded-full bg-[#0052FF] shadow-[0_0_12px_#0052FF] flex items-center justify-center">
            <span className="material-symbols-outlined text-[13px] text-white">{b.icon}</span>
          </span>
          <span className="text-[11px] font-bold text-white tracking-tight whitespace-nowrap">{b.label}</span>
        </div>
      ))}

      {/* Readout card */}
      <div className="absolute left-[6%] bottom-[5%] z-20 bg-[#03091e]/85 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-xl">
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Sample result</div>
        <div className="flex items-end gap-2 mt-0.5">
          <span className="font-headline text-2xl font-black text-white leading-none">94%</span>
          <span className="text-[10px] font-semibold text-slate-400 pb-0.5">career match</span>
        </div>
        <div className="mt-2 h-1 w-28 rounded-full bg-white/10 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400" initial={{ width: 0 }} animate={{ width: '94%' }} transition={{ duration: 1.6, delay: 0.8 }} />
        </div>
      </div>

    </div>
  );
}
