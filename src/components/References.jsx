import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { publishedReels } from '../content/reels';

// One tile per reel; each tile opens that reel's own page (/r/<slug>)
export default function References() {
  useEffect(() => {
    document.title = 'References | Prodecide';
    return () => { document.title = 'Prodecide - Expert Strategic Consulting'; };
  }, []);

  return (
    <div className="min-h-screen bg-[#03091e] text-white font-body antialiased">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24">
        <header className="mb-12 max-w-2xl">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4">References</h1>
          <p className="text-lg text-slate-300 leading-relaxed">The tools and guides we share in our reels, with a short note on how to use each one. Pick a reel to see the steps.</p>
        </header>

        {publishedReels.length === 0 ? (
          <p className="text-slate-300">Nothing here yet. Check back soon.</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {publishedReels.map((reel) => (
              <li key={reel.slug}>
                <Link
                  to={`/r/${reel.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-white/10 bg-slate-900/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-slate-900/80"
                >
                  <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0052FF]/20 text-cyan-300">
                    <span className="material-symbols-outlined text-2xl" aria-hidden="true">{reel.icon || 'play_circle'}</span>
                  </span>
                  {reel.heading && <span className="mb-2 text-sm font-semibold text-cyan-300">{reel.heading}</span>}
                  <span className="font-headline text-xl font-bold leading-snug text-white transition-colors group-hover:text-cyan-100">{reel.title}</span>
                  {reel.description && <span className="mt-3 line-clamp-3 text-slate-300 leading-relaxed">{reel.description}</span>}
                  <span className="mt-6 inline-flex items-center gap-2 pt-1 font-semibold text-cyan-300 group-hover:text-cyan-200">
                    {reel.howToUse?.length ? `See the ${reel.howToUse.length} steps` : 'Open'}
                    <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1" aria-hidden="true">arrow_forward</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
