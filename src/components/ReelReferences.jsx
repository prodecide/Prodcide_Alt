import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import ReelSection from './ReelSection';
import { findReel } from '../content/reels';

// Shareable page for one reel: prodecide.co.in/r/<slug>
export default function ReelReferences() {
  const { slug } = useParams();
  const reel = findReel(slug);

  useEffect(() => {
    if (reel?.title) document.title = `${reel.title} | Prodecide`;
    return () => { document.title = 'Prodecide - Expert Strategic Consulting'; };
  }, [reel]);

  return (
    <div className="min-h-screen bg-[#03091e] text-white font-body antialiased">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24">
        {reel ? (
          <>
            <Link to="/references" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white">
              <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_back</span>
              All references
            </Link>
            <ReelSection reel={reel} as="h1" />
            <div className="mt-20 max-w-2xl rounded-2xl border border-cyan-400/20 bg-slate-900/60 p-6 md:p-8">
              <h2 className="font-headline text-xl font-bold mb-2">Want advice for your own situation?</h2>
              <p className="text-slate-300 mb-5">Answer a few questions and we'll match you with a consultant.</p>
              <Link to="/discovery" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0052FF] to-blue-600 text-white font-bold py-3 px-7 rounded-full">
                Start your discovery
                <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-20 max-w-xl mx-auto">
            <span className="material-symbols-outlined text-5xl text-cyan-300 mb-4 block" aria-hidden="true">link_off</span>
            <h1 className="font-headline text-3xl font-bold mb-3">We couldn't find that page</h1>
            <p className="text-slate-300 mb-8">The link may be mistyped. Check the message we sent you.</p>
            <Link to="/references" className="text-cyan-300 hover:text-cyan-200 font-semibold">See all references</Link>
          </div>
        )}
      </main>
    </div>
  );
}
