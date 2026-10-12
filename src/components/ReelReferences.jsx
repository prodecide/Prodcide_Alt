import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import { findReel } from '../content/reels';

const TYPE_ICON = {
  article: 'article',
  video: 'play_circle',
  pdf: 'picture_as_pdf',
  tool: 'build',
  course: 'school',
  book: 'menu_book',
  other: 'link',
};

const host = (url) => {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
};

export default function ReelReferences() {
  const { slug } = useParams();
  const reel = findReel(slug);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (reel?.title) document.title = `${reel.title} | Prodecide references`;
    return () => { document.title = 'Prodecide - Expert Strategic Consulting'; };
  }, [reel]);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: reel.title, url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch { /* user cancelled */ }
  };

  return (
    <div className="min-h-screen bg-[#03091e] text-white font-body antialiased">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        {!reel && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-cyan-300 mb-4 block" aria-hidden="true">link_off</span>
            <h1 className="font-headline text-3xl font-bold mb-3">
              We couldn't find that page
            </h1>
            <p className="text-slate-300 mb-8">
              The link may be mistyped, or the references are not published yet. Check the message we sent you.
            </p>
            <Link to="/references" className="text-cyan-300 hover:text-cyan-200 font-semibold">See all reel references</Link>
          </div>
        )}

        {reel && (
          <>
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{reel.title}</h1>
            {reel.summary && <p className="text-lg text-slate-300 leading-relaxed mb-6">{reel.summary}</p>}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-10">
              {reel.reelUrl && (
                <a href={reel.reelUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 font-semibold">
                  <span className="material-symbols-outlined text-xl" aria-hidden="true">play_circle</span>
                  Watch the reel
                </a>
              )}
              <button onClick={share} className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-semibold">
                <span className="material-symbols-outlined text-xl" aria-hidden="true">{copied ? 'check' : 'ios_share'}</span>
                {copied ? 'Link copied' : 'Share this page'}
              </button>
            </div>

            {reel.resources?.length ? (
              <ul className="space-y-4">
                {reel.resources.map((r, i) => (
                  <li key={`${r.url}-${i}`}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-900/50 p-5 transition-colors hover:border-cyan-400/40 hover:bg-slate-900/80"
                    >
                      <span className="shrink-0 w-11 h-11 rounded-xl bg-[#0052FF]/20 text-cyan-300 flex items-center justify-center">
                        <span className="material-symbols-outlined" aria-hidden="true">{TYPE_ICON[r.type] || 'link'}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-headline font-bold text-lg text-white group-hover:text-cyan-200 transition-colors">{r.title}</span>
                        {r.description && <span className="block text-slate-300 mt-1 leading-relaxed">{r.description}</span>}
                        <span className="block text-sm text-slate-400 mt-2">{host(r.url)}</span>
                      </span>
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-cyan-300 transition-colors" aria-hidden="true">open_in_new</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-300">References for this reel are coming soon.</p>
            )}

            <div className="mt-16 rounded-2xl border border-cyan-400/20 bg-slate-900/60 p-6 md:p-8">
              <h2 className="font-headline text-xl font-bold mb-2">Want advice for your own situation?</h2>
              <p className="text-slate-300 mb-5">Answer a few questions and we'll match you with a consultant.</p>
              <Link to="/discovery" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0052FF] to-blue-600 text-white font-bold py-3 px-7 rounded-full">
                Start your discovery
                <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
