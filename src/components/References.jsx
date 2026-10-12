import React, { useEffect } from 'react';
import Navbar from './Navbar';
import ReelSection from './ReelSection';
import { publishedReels } from '../content/reels';

export default function References() {
  useEffect(() => {
    document.title = 'References | Prodecide';
    return () => { document.title = 'Prodecide - Expert Strategic Consulting'; };
  }, []);

  return (
    <div className="min-h-screen bg-[#03091e] text-white font-body antialiased">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24">
        <header className="mb-14 max-w-2xl">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4">References</h1>
          <p className="text-lg text-slate-300 leading-relaxed">The tools and guides we share in our reels, with a short note on how to use each one.</p>
        </header>

        {publishedReels.length === 0 ? (
          <p className="text-slate-300">Nothing here yet. Check back soon.</p>
        ) : (
          <div className="space-y-24">
            {publishedReels.map((reel, i) => (
              <React.Fragment key={reel.slug}>
                {i > 0 && <hr className="border-white/10" />}
                <ReelSection reel={reel} as={i === 0 ? 'h2' : 'h2'} />
              </React.Fragment>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
