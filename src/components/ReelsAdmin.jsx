import React, { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../utils/api.js';

const TYPES = [
  ['article', 'Article'], ['video', 'Video'], ['pdf', 'PDF'], ['tool', 'Tool'],
  ['course', 'Course'], ['book', 'Book'], ['other', 'Other'],
];

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const blankReel = () => ({ title: '', slug: '', keyword: '', reelUrl: '', summary: '', published: false, resources: [{ title: '', url: '', description: '', type: 'article' }] });

const input = 'w-full rounded-xl border border-outline/20 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40';
const label = 'block text-sm font-semibold mb-1.5';

export default function ReelsAdmin() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/reels?all=true');
      if (res.status === 401) throw new Error('Your admin session expired. Log out and log in again.');
      if (!res.ok) throw new Error('Could not load reel references.');
      setReels(await res.json());
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pageUrl = (slug) => `${window.location.origin}/r/${slug}`;
  const copy = async (slug) => {
    try { await navigator.clipboard.writeText(pageUrl(slug)); setMessage({ type: 'ok', text: 'Link copied. Paste it in your DM message.' }); }
    catch { setMessage({ type: 'error', text: pageUrl(slug) }); }
  };

  const startNew = () => { setEditing(blankReel()); setSlugTouched(false); setMessage(null); };
  const startEdit = (r) => { setEditing({ ...r, resources: r.resources?.length ? r.resources : blankReel().resources }); setSlugTouched(true); setMessage(null); };

  const setField = (k, v) => setEditing((e) => {
    const next = { ...e, [k]: v };
    if (k === 'title' && !slugTouched) next.slug = slugify(v);
    return next;
  });
  const setRes = (i, k, v) => setEditing((e) => ({ ...e, resources: e.resources.map((r, j) => (j === i ? { ...r, [k]: v } : r)) }));
  const addRes = () => setEditing((e) => ({ ...e, resources: [...e.resources, { title: '', url: '', description: '', type: 'article' }] }));
  const delRes = (i) => setEditing((e) => ({ ...e, resources: e.resources.filter((_, j) => j !== i) }));
  const moveRes = (i, d) => setEditing((e) => {
    const arr = [...e.resources]; const j = i + d;
    if (j < 0 || j >= arr.length) return e;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return { ...e, resources: arr };
  });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setMessage(null);
    try {
      const isNew = !editing._id;
      const body = { ...editing, id: editing._id, resources: editing.resources.filter((r) => r.title || r.url) };
      const res = await apiFetch('/api/reels', { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save.');
      setEditing(null);
      setMessage({ type: 'ok', text: isNew ? 'Reel page created.' : 'Changes saved.' });
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete "${r.title}"? Anyone with its link will see "page not found".`)) return;
    const res = await apiFetch(`/api/reels?id=${encodeURIComponent(r._id)}`, { method: 'DELETE' });
    setMessage(res.ok ? { type: 'ok', text: 'Deleted.' } : { type: 'error', text: 'Could not delete.' });
    load();
  };

  const banner = message && (
    <div role="status" className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${message.type === 'ok' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
      {message.text}
    </div>
  );

  if (editing) {
    return (
      <form onSubmit={save} className="max-w-3xl">
        {banner}
        <h2 className="text-2xl font-bold mb-6">{editing._id ? 'Edit reel page' : 'New reel page'}</h2>

        <div className="space-y-5 mb-10">
          <div>
            <label className={label} htmlFor="r-title">Page title</label>
            <input id="r-title" required className={input} value={editing.title} onChange={(e) => setField('title', e.target.value)} placeholder="Resources from my reel on switching careers" />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className={label} htmlFor="r-slug">Link name</label>
              <input id="r-slug" required className={input} value={editing.slug} onChange={(e) => { setSlugTouched(true); setField('slug', slugify(e.target.value)); }} placeholder="career-switch" />
              <p className="text-xs text-outline mt-1.5 break-all">Page address: {window.location.origin}/r/{editing.slug || '…'}</p>
            </div>
            <div>
              <label className={label} htmlFor="r-kw">Comment keyword (optional)</label>
              <input id="r-kw" className={input} value={editing.keyword} onChange={(e) => setField('keyword', e.target.value)} placeholder="CAREER" />
              <p className="text-xs text-outline mt-1.5">A note for you: the word people comment on the reel.</p>
            </div>
          </div>
          <div>
            <label className={label} htmlFor="r-url">Instagram reel link (optional)</label>
            <input id="r-url" type="url" className={input} value={editing.reelUrl} onChange={(e) => setField('reelUrl', e.target.value)} placeholder="https://www.instagram.com/reel/…" />
          </div>
          <div>
            <label className={label} htmlFor="r-sum">Short intro (optional)</label>
            <textarea id="r-sum" rows={2} maxLength={400} className={input} value={editing.summary} onChange={(e) => setField('summary', e.target.value)} placeholder="Thanks for commenting. Here are the links I mentioned." />
          </div>
        </div>

        <h3 className="text-lg font-bold mb-4">References</h3>
        <div className="space-y-4 mb-4">
          {editing.resources.map((r, i) => (
            <fieldset key={i} className="rounded-2xl border border-outline/15 bg-white p-4 space-y-3">
              <legend className="sr-only">Reference {i + 1}</legend>
              <div className="grid sm:grid-cols-[1fr_9rem] gap-3">
                <input aria-label="Reference title" className={input} value={r.title} onChange={(e) => setRes(i, 'title', e.target.value)} placeholder="Title" />
                <select aria-label="Reference type" className={input} value={r.type} onChange={(e) => setRes(i, 'type', e.target.value)}>
                  {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <input aria-label="Reference link" type="url" className={input} value={r.url} onChange={(e) => setRes(i, 'url', e.target.value)} placeholder="https://…" />
              <input aria-label="Why it's useful" className={input} value={r.description} onChange={(e) => setRes(i, 'description', e.target.value)} placeholder="Why it's useful (one line)" />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => moveRes(i, -1)} disabled={i === 0} className="px-3 py-1.5 text-sm rounded-lg border border-outline/20 disabled:opacity-40">Move up</button>
                <button type="button" onClick={() => moveRes(i, 1)} disabled={i === editing.resources.length - 1} className="px-3 py-1.5 text-sm rounded-lg border border-outline/20 disabled:opacity-40">Move down</button>
                <button type="button" onClick={() => delRes(i)} className="px-3 py-1.5 text-sm rounded-lg text-rose-600 border border-rose-200">Remove</button>
              </div>
            </fieldset>
          ))}
        </div>
        <button type="button" onClick={addRes} className="mb-10 px-4 py-2 text-sm font-semibold rounded-xl border border-outline/20 hover:bg-surface-variant">Add reference</button>

        <label className="flex items-center gap-3 mb-8 font-medium">
          <input type="checkbox" className="h-5 w-5" checked={editing.published} onChange={(e) => setField('published', e.target.checked)} />
          Published (visible to anyone with the link, and listed on the References page)
        </label>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="px-6 py-3 rounded-xl bg-primary text-white font-bold disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
          <button type="button" onClick={() => { setEditing(null); setMessage(null); }} className="px-6 py-3 rounded-xl border border-outline/20 font-semibold">Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="max-w-3xl">
      {banner}
      <div className="flex items-center justify-between gap-4 mb-6">
        <p className="text-outline">One page per reel. Send its link to people who comment.</p>
        <button onClick={startNew} className="shrink-0 px-5 py-2.5 rounded-xl bg-primary text-white font-bold">New reel page</button>
      </div>

      {loading ? (
        <p className="text-outline py-10 text-center">Loading…</p>
      ) : reels.length === 0 ? (
        <div className="rounded-3xl border border-outline/10 bg-surface-container/50 p-12 text-center">
          <h3 className="text-xl font-bold mb-1">No reel pages yet</h3>
          <p className="text-outline text-sm">Create one for your next reel, then send its link in your reply.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {reels.map((r) => (
            <li key={r._id} className="rounded-2xl border border-outline/15 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-lg">{r.title}</h3>
                  <p className="text-sm text-outline mt-1 break-all">/r/{r.slug}{r.keyword ? ` · comment "${r.keyword}"` : ''} · {r.resources?.length || 0} references</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${r.published ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-variant text-outline'}`}>{r.published ? 'Published' : 'Draft'}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={() => copy(r.slug)} className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-outline/20 hover:bg-surface-variant">Copy link</button>
                <a href={`/r/${r.slug}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-outline/20 hover:bg-surface-variant">Open page</a>
                <button onClick={() => startEdit(r)} className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-outline/20 hover:bg-surface-variant">Edit</button>
                <button onClick={() => remove(r)} className="px-3 py-1.5 text-sm font-semibold rounded-lg text-rose-600 border border-rose-200 hover:bg-rose-50">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
