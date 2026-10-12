import React from 'react';

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

const embedUrl = (url) => {
  const m = /instagram\.com\/(?:[\w.]+\/)?(?:reel|p)\/([A-Za-z0-9_-]+)/.exec(url || '');
  return m ? `https://www.instagram.com/reel/${m[1]}/embed/` : null;
};

export default function ReelSection({ reel, as: Heading = 'h2' }) {
  const embed = embedUrl(reel.instagramUrl);

  return (
    <section className="grid lg:grid-cols-[minmax(0,24rem)_1fr] gap-10 lg:gap-14 items-start" aria-labelledby={`reel-${reel.slug}`}>
      {embed && (
        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-white shadow-[0_20px_60px_rgba(0,82,255,0.15)]">
            <iframe
              src={embed}
              title={`Instagram reel: ${reel.title}`}
              className="w-full block border-0"
              style={{ height: 640 }}
              loading="lazy"
              allow="encrypted-media; fullscreen"
              allowFullScreen
            />
          </div>
          <a href={reel.instagramUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
            <span className="material-symbols-outlined text-base" aria-hidden="true">open_in_new</span>
            Watch on Instagram
          </a>
        </div>
      )}

      <div>
        {reel.heading && <p className="text-sm font-semibold text-cyan-300 mb-3">{reel.heading}</p>}
        <Heading id={`reel-${reel.slug}`} className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight mb-5">{reel.title}</Heading>
        {reel.description && <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-prose">{reel.description}</p>}

        {reel.link && (
          <a
            href={reel.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0052FF] to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3.5 px-8 rounded-full shadow-[0_0_30px_rgba(0,82,255,0.35)] transition-all"
          >
            {reel.link.label}
            <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_outward</span>
          </a>
        )}

        {reel.howToUse?.length > 0 && (
          <div className="mt-10">
            <h3 className="font-headline text-xl font-bold mb-4">How to use it</h3>
            <ol className="space-y-4">
              {reel.howToUse.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-full border border-cyan-400/40 text-cyan-300 text-sm font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="text-slate-200 leading-relaxed pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {reel.resources?.length > 0 && (
          <div className="mt-10">
            <h3 className="font-headline text-xl font-bold mb-4">More links</h3>
            <ul className="space-y-3">
              {reel.resources.map((r, i) => (
                <li key={`${r.url}-${i}`}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-900/50 p-4 transition-colors hover:border-cyan-400/40">
                    <span className="shrink-0 w-10 h-10 rounded-xl bg-[#0052FF]/20 text-cyan-300 flex items-center justify-center">
                      <span className="material-symbols-outlined" aria-hidden="true">{TYPE_ICON[r.type] || 'link'}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-white group-hover:text-cyan-200 transition-colors">{r.title}</span>
                      {r.description && <span className="block text-slate-300 mt-0.5">{r.description}</span>}
                      <span className="block text-sm text-slate-400 mt-1">{host(r.url)}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
