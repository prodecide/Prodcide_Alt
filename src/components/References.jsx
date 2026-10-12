import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { publishedReels } from '../content/reels';

export default function References() {
  const reels = publishedReels;

  useEffect(() => {
    document.title = 'Reel references | Prodecide';
    return () => { document.title = 'Prodecide - Expert Strategic Consulting'; };
  }, []);

  return (
    <div className="min-h-screen bg-[#03091e] text-white font-body antialiased">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Reel references</h1>
        <p className="text-lg text-slate-300 leading-relaxed mb-10">
          The articles, tools and guides behind each reel. Comment on a reel and we'll send you its page, or find it here.
        </p>

        {reels.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
            <p className="text-slate-300">No references are published yet. Check back soon.</p>
          </div>
        )}

        {reels.length > 0 && (
          <ul className="space-y-4">
            {reels.map((r) => (
              <li key={r.slug}>
                <Link
                  to={`/r/${r.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/50 p-5 transition-colors hover:border-cyan-400/40"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-headline font-bold text-lg group-hover:text-cyan-200 transition-colors">{r.title}</span>
                    {r.summary && <span className="block text-slate-300 mt-1 line-clamp-2">{r.summary}</span>}
                    <span className="block text-sm text-slate-400 mt-2">{r.resources.length} {r.resources.length === 1 ? 'reference' : 'references'}</span>
                  </span>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-cyan-300 transition-colors" aria-hidden="true">arrow_forward</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
