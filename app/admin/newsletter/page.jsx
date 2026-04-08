'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  FaBell, FaEnvelope, FaUser, FaAt, FaCopy, FaCheck, FaDownload,
  FaPen, FaBullhorn, FaCalendarAlt, FaEye, FaEyeSlash, FaTrash,
  FaCopy as FaClone, FaPlay, FaClock, FaSave, FaTimes, FaPlus,
  FaBold, FaItalic, FaLink, FaList, FaHeading,
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

// ─── helpers ────────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  draft:     { bg: 'bg-gray-700',    text: 'text-gray-300',   label: 'Draft'     },
  scheduled: { bg: 'bg-blue-900/50', text: 'text-blue-300',   label: 'Scheduled' },
  sent:      { bg: 'bg-green-900/50',text: 'text-green-400',  label: 'Sent'      },
};

const SOURCE_STYLES = {
  'user-account': 'bg-green-900/40 text-green-300',
  popup: 'bg-blue-900/40 text-blue-300',
  profile: 'bg-purple-900/40 text-purple-300',
  admin: 'bg-amber-900/40 text-amber-300',
  import: 'bg-zinc-800 text-zinc-300',
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.draft;
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function buildEmailPreview(newsletter) {
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8" /></head><body style="margin:0;padding:0;background:#eee;">
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
      <div style="background-color:#0a0a0a;padding:24px 28px;border-radius:12px 12px 0 0;border-bottom:2px solid #22c55e;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="background:linear-gradient(135deg,#15803d,#22c55e);width:48px;height:48px;border-radius:50%;text-align:center;vertical-align:middle;">
            <span style="color:#fff;font-size:20px;font-weight:900;font-family:Impact,Arial Black,sans-serif;line-height:48px;">5S</span>
          </td>
          <td style="padding-left:14px;vertical-align:middle;">
            <div style="color:#fff;font-size:22px;font-family:Impact,Arial Black,sans-serif;letter-spacing:3px;line-height:1;">5S ARENA</div>
            <div style="color:#22c55e;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin-top:3px;">Milnerton · Cape Town</div>
          </td>
        </tr></table>
      </div>
      <div style="background-color:#f9f9f9;padding:32px 28px;border-radius:0 0 12px 12px;border:1px solid #e5e5e5;border-top:none;">
        <h2 style="color:#111;margin-top:0;font-size:22px;">${newsletter.title || 'Newsletter Title'}</h2>
        <div style="color:#333;line-height:1.7;font-size:15px;">${newsletter.body || '<p>Your newsletter content will appear here.</p>'}</div>
        <div style="margin:28px 0 20px;">
          <a href="#" style="display:inline-block;background:linear-gradient(135deg,#15803d,#22c55e);color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold;letter-spacing:1px;">⚽ Visit 5S Arena</a>
        </div>
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;"/>
        <p style="font-size:12px;color:#aaa;margin:0;">You are receiving this because you subscribed to the 5S Arena newsletter. <a href="#" style="color:#aaa;">Unsubscribe</a></p>
      </div>
    </div></body></html>
  `;
}

// ─── Calendar helpers ────────────────────────────────────────────────────────

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

// ─── Subscribers Tab ─────────────────────────────────────────────────────────

function SubscribersTab({ data, loading }) {
  const [copied, setCopied] = useState(false);

  const copyEmails = () => {
    if (!data?.subscribers) return;
    navigator.clipboard.writeText(data.subscribers.map((s) => s.email).join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadCsv = () => {
    if (!data?.subscribers) return;
    const header = 'Name,Email,Username,Source,Joined';
    const rows = data.subscribers.map(
      (s) => `"${s.name}","${s.email}","${s.username || ''}","${s.source || ''}","${new Date(s.joinedAt).toLocaleDateString('en-ZA')}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-gray-500 text-sm py-8 text-center">Loading subscribers…</div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-900/20 border border-green-800/40 rounded-2xl p-5 text-center">
          <FaBell className="text-green-400 text-3xl mx-auto mb-2" />
          <p className="text-3xl font-black text-white">{data?.count ?? 0}</p>
          <p className="text-xs text-green-600 uppercase tracking-widest mt-1">Total Subscribers</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
          <FaEnvelope className="text-blue-400 text-3xl mx-auto mb-2" />
          <p className="text-3xl font-black text-white">{data?.count ?? 0}</p>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Active List Size</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
          <FaUser className="text-purple-400 text-3xl mx-auto mb-2" />
          <p className="text-3xl font-black text-white">
            {data?.subscribers?.filter((s) => s.username).length ?? 0}
          </p>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">With Username</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={copyEmails} className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:border-gray-600 transition-all">
          {copied ? <FaCheck className="text-green-400" /> : <FaCopy />}
          {copied ? 'Copied!' : 'Copy Emails'}
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={downloadCsv} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)', boxShadow: '0 0 15px rgba(34,197,94,0.3)' }}>
          <FaDownload size={12} /> Export CSV
        </motion.button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-white" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>Subscriber List</h3>
          <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">{data?.count ?? 0} subscribers</span>
        </div>
        {!data?.subscribers?.length ? (
          <div className="text-center py-16">
            <FaBell className="text-gray-700 text-4xl mx-auto mb-4" />
            <p className="text-gray-600">No subscribers yet.</p>
            <p className="text-gray-700 text-xs mt-1">Customers can opt in from their Profile page.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Name</th>
                  <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Email</th>
                  <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Username</th>
                  <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Source</th>
                  <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.subscribers.map((sub, i) => (
                  <tr key={i} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-900/40 border border-green-800/60 flex items-center justify-center text-green-400 text-xs font-black flex-shrink-0">
                          {sub.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-semibold text-white">{sub.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <a href={`mailto:${sub.email}`} className="text-blue-400 hover:text-blue-300 transition-colors font-mono text-xs">{sub.email}</a>
                    </td>
                    <td className="px-5 py-4">
                      {sub.username ? (
                        <span className="text-green-400 font-mono text-xs flex items-center gap-1"><FaAt size={9} />{sub.username}</span>
                      ) : (
                        <span className="text-gray-700 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${SOURCE_STYLES[sub.source] || SOURCE_STYLES.import}`}>
                        {sub.source || 'unknown'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {new Date(sub.joinedAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-center text-gray-700 text-xs">
        Customers can subscribe from the popup or toggle newsletter opt-in from their{' '}
        <a href="/profile" className="text-green-600 hover:text-green-500">Profile page</a>. Unsubscribes are immediate.
      </p>
    </div>
  );
}

// ─── Compose Tab ─────────────────────────────────────────────────────────────

function ComposeTab({ editingId, onSaved }) {
  const canSend = useFeatureAccess('admin.newsletter.send');
  const [form, setForm] = useState({
    title: '',
    subject: '',
    fromName: '5S Arena',
    body: '',
  });
  const [preview, setPreview] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState(null);
  const textareaRef = useRef(null);

  // Load existing newsletter if editing
  useEffect(() => {
    if (!editingId) return;
    fetch(`/api/admin/newsletters/${editingId}`)
      .then((r) => r.json())
      .then(({ newsletter }) => {
        if (!newsletter) return;
        setForm({
          title: newsletter.title || '',
          subject: newsletter.subject || '',
          fromName: newsletter.fromName || '5S Arena',
          body: newsletter.body || '',
        });
        if (newsletter.scheduledAt) setScheduledAt(newsletter.scheduledAt.slice(0, 16));
      });
  }, [editingId]);

  const insertAtCursor = (before, after = '') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = form.body.substring(start, end);
    const newText =
      form.body.substring(0, start) +
      before + selected + after +
      form.body.substring(end);
    setForm((f) => ({ ...f, body: newText }));
    setTimeout(() => {
      ta.focus();
      const newCursor = start + before.length + selected.length + after.length;
      ta.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  const toolbarButtons = [
    { icon: <FaBold />, label: 'Bold', action: () => insertAtCursor('<strong>', '</strong>') },
    { icon: <FaItalic />, label: 'Italic', action: () => insertAtCursor('<em>', '</em>') },
    { icon: <FaHeading />, label: 'H2', action: () => insertAtCursor('<h2>', '</h2>') },
    { icon: <FaLink />, label: 'Link', action: () => insertAtCursor('<a href="https://">', '</a>') },
    { icon: <FaList />, label: 'List', action: () => insertAtCursor('<ul>\n  <li>', '</li>\n</ul>') },
  ];

  const validate = () => {
    if (!form.title.trim()) return 'Title is required.';
    if (!form.subject.trim()) return 'Subject is required.';
    if (!form.body.trim()) return 'Body is required.';
    return null;
  };

  const doSave = async (status, schedAt) => {
    const err = validate();
    if (err) { setMsg({ type: 'error', text: err }); return null; }
    setSaving(true);
    setMsg(null);
    try {
      const payload = { title: form.title, subject: form.subject, fromName: form.fromName, bodyHtml: form.body, status };
      if (schedAt) payload.scheduledAt = schedAt;
      const url = editingId ? `/api/admin/newsletters/${editingId}` : '/api/admin/newsletters';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setMsg({ type: 'success', text: `Newsletter ${status === 'scheduled' ? 'scheduled' : 'saved'} successfully!` });
      if (onSaved) onSaved(data.newsletter);
      return data.newsletter;
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSendNow = async () => {
    const err = validate();
    if (err) { setMsg({ type: 'error', text: err }); return; }
    if (!confirm('Send this newsletter to all subscribers now?')) return;
    setSending(true);
    setMsg(null);
    try {
      // First save/update
      let id = editingId;
      if (!id) {
        const saved = await doSave('draft', null);
        if (!saved) return;
        id = saved._id;
      }
      const res = await fetch(`/api/admin/newsletters/${id}/send`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');
      setMsg({ type: 'success', text: `Sent to ${data.sent} subscriber${data.sent !== 1 ? 's' : ''}!` });
      if (onSaved) onSaved();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Title (internal)</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. June Fixtures & Promotions"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-600 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Subject Line</label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            placeholder="e.g. ⚽ June Offers — Book Your Court Now!"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-600 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">From Name</label>
          <input
            type="text"
            value={form.fromName}
            onChange={(e) => setForm((f) => ({ ...f, fromName: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-600 transition-colors"
          />
        </div>
      </div>

      {/* Body editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Body (HTML)</label>
          <button
            onClick={() => setPreview((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700"
          >
            {preview ? <FaEyeSlash size={11} /> : <FaEye size={11} />}
            {preview ? 'Edit' : 'Preview'}
          </button>
        </div>

        {!preview ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-700 flex-wrap">
              {toolbarButtons.map((btn) => (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  title={btn.label}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors text-xs"
                >
                  {btn.icon}
                </button>
              ))}
              <span className="text-gray-600 text-xs ml-2">Insert HTML tags at cursor</span>
            </div>
            <textarea
              ref={textareaRef}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="<p>Write your newsletter content here. Use the toolbar to insert HTML tags.</p>"
              className="w-full bg-transparent px-4 py-3 text-white text-sm focus:outline-none font-mono"
              rows={14}
            />
          </div>
        ) : (
          <div className="border border-gray-700 rounded-xl overflow-hidden" style={{ height: '480px' }}>
            <iframe
              srcDoc={buildEmailPreview(form)}
              title="Email preview"
              className="w-full h-full"
              style={{ background: '#fff' }}
            />
          </div>
        )}
      </div>

      {/* Messages */}
      {msg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${msg.type === 'error' ? 'bg-red-900/30 border border-red-700 text-red-300' : 'bg-green-900/30 border border-green-700 text-green-300'}`}>
          {msg.text}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => doSave('draft', null)}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:border-gray-600 transition-all disabled:opacity-50"
        >
          <FaSave size={12} /> {saving ? 'Saving…' : 'Save Draft'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setScheduleOpen((v) => !v)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-900/30 border border-blue-700 rounded-xl text-sm font-semibold text-blue-300 hover:text-white transition-all"
        >
          <FaClock size={12} /> Schedule
        </motion.button>

        {canSend && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSendNow}
          disabled={sending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)', boxShadow: '0 0 15px rgba(34,197,94,0.3)' }}
        >
          <FaPlay size={11} /> {sending ? 'Sending…' : 'Send Now'}
        </motion.button>
        )}
      </div>

      {/* Schedule picker */}
      {scheduleOpen && (
        <div className="bg-gray-800 border border-blue-700/50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-blue-300 uppercase tracking-widest">Schedule Send Time</p>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-600 w-full"
          />
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { doSave('scheduled', scheduledAt); setScheduleOpen(false); }}
              disabled={!scheduledAt || saving}
              className="px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
            >
              Confirm Schedule
            </motion.button>
            <button onClick={() => setScheduleOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Campaigns Tab ────────────────────────────────────────────────────────────

function CampaignsTab({ newsletters, loading, onEdit, onRefresh }) {
  const [previewNL, setPreviewNL] = useState(null);

  const openPreview = (nl) => { setPreviewNL(nl); };
  const closePreview = () => { setPreviewNL(null); };

  const handleDelete = async (id) => {
    if (!confirm('Delete this newsletter?')) return;
    await fetch(`/api/admin/newsletters/${id}`, { method: 'DELETE' });
    onRefresh();
  };

  const handleDuplicate = async (nl) => {
    await fetch('/api/admin/newsletters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Copy of ${nl.title}`,
        subject: nl.subject,
        fromName: nl.fromName,
        bodyHtml: nl.body,
        status: 'draft',
      }),
    });
    onRefresh();
  };

  if (loading) return <div className="text-gray-500 text-sm py-8 text-center">Loading campaigns…</div>;

  return (
    <div>
      {/* Preview modal */}
      {previewNL && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <div>
                <p className="text-white font-bold">{previewNL.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">Subject: {previewNL.subject}</p>
              </div>
              <button onClick={closePreview} className="text-gray-500 hover:text-white transition-colors"><FaTimes size={18} /></button>
            </div>
            <div style={{ height: '500px' }}>
              <iframe srcDoc={buildEmailPreview(previewNL)} title="Preview" className="w-full h-full" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-white" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
            All Campaigns
          </h3>
          <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">{newsletters.length} total</span>
        </div>

        {!newsletters.length ? (
          <div className="text-center py-16">
            <FaBullhorn className="text-gray-700 text-4xl mx-auto mb-4" />
            <p className="text-gray-600">No newsletters yet.</p>
            <p className="text-gray-700 text-xs mt-1">Create your first one in the Compose tab.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Title</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Created</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Scheduled</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Recipients</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <motion.tbody
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
                initial="hidden"
                animate="visible"
              >
                {newsletters.map((nl) => (
                  <motion.tr
                    key={nl._id}
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } } }}
                    className="border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{nl.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5 truncate max-w-[200px]">{nl.subject}</p>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={nl.status} /></td>
                    <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(nl.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                      {nl.scheduledAt ? new Date(nl.scheduledAt).toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {nl.status === 'sent' ? nl.recipientCount : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openPreview(nl)} title="Preview" className="p-2 text-gray-500 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-colors">
                          <FaEye size={13} />
                        </button>
                        {nl.status !== 'sent' && (
                          <button onClick={() => onEdit(nl._id)} title="Edit" className="p-2 text-gray-500 hover:text-green-400 hover:bg-gray-800 rounded-lg transition-colors">
                            <FaPen size={12} />
                          </button>
                        )}
                        <button onClick={() => handleDuplicate(nl)} title="Duplicate" className="p-2 text-gray-500 hover:text-yellow-400 hover:bg-gray-800 rounded-lg transition-colors">
                          <FaClone size={12} />
                        </button>
                        <button onClick={() => handleDelete(nl._id)} title="Delete" className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors">
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Calendar Tab ─────────────────────────────────────────────────────────────

function CalendarTab({ newsletters, onCompose }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
    setSelectedDate(null);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // Map newsletters to their scheduled dates
  const scheduledMap = {};
  for (const nl of newsletters) {
    if (nl.scheduledAt) {
      const d = new Date(nl.scheduledAt);
      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
        const key = d.getDate();
        if (!scheduledMap[key]) scheduledMap[key] = [];
        scheduledMap[key].push(nl);
      }
    }
  }

  const selectedKey = selectedDate;
  const selectedNLs = selectedKey ? (scheduledMap[selectedKey] || []) : [];

  const STATUS_DOT = {
    draft:     'bg-gray-500',
    scheduled: 'bg-blue-400',
    sent:      'bg-green-400',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <button onClick={prevMonth} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-lg">‹</button>
          <h3 className="text-white font-black uppercase tracking-widest text-sm" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h3>
          <button onClick={nextMonth} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-lg">›</button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 border-b border-gray-800">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-xs font-bold text-gray-600 uppercase py-2">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {/* Blank leading cells */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`blank-${i}`} className="h-14 border-b border-r border-gray-800/50" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
            const dots = scheduledMap[day] || [];
            const isSelected = selectedDate === day;

            return (
              <div
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : day)}
                className={`h-14 border-b border-r border-gray-800/50 p-1.5 cursor-pointer transition-colors relative
                  ${isSelected ? 'bg-green-900/30 border-green-700' : 'hover:bg-gray-800/40'}
                  ${isToday ? 'ring-1 ring-inset ring-green-600' : ''}`}
              >
                <span className={`text-xs font-bold ${isToday ? 'text-green-400' : 'text-gray-400'}`}>{day}</span>
                {/* Dots */}
                <div className="flex flex-wrap gap-0.5 mt-0.5">
                  {dots.map((nl) => (
                    <div
                      key={nl._id}
                      className={`w-2 h-2 rounded-full ${STATUS_DOT[nl.status] || 'bg-gray-500'}`}
                      title={nl.title}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-5 py-3 border-t border-gray-800">
          <span className="text-xs text-gray-600 uppercase tracking-widest font-bold">Legend:</span>
          {Object.entries(STATUS_DOT).map(([s, cls]) => (
            <span key={s} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className={`w-2 h-2 rounded-full ${cls}`} />{s}
            </span>
          ))}
        </div>
      </div>

      {/* Side panel */}
      <div className="space-y-4">
        {selectedDate ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h4 className="text-white font-bold text-sm mb-4">
              {selectedDate} {MONTH_NAMES[viewMonth]} {viewYear}
            </h4>
            {selectedNLs.length ? (
              <div className="space-y-3">
                {selectedNLs.map((nl) => (
                  <div key={nl._id} className="p-3 bg-gray-800 rounded-xl border border-gray-700">
                    <p className="text-white text-sm font-semibold">{nl.title}</p>
                    <p className="text-gray-500 text-xs mt-1">{nl.subject}</p>
                    <div className="mt-2"><StatusBadge status={nl.status} /></div>
                    {nl.scheduledAt && (
                      <p className="text-gray-600 text-xs mt-1">
                        {new Date(nl.scheduledAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">Nothing scheduled.</p>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onCompose(selectedDate, viewMonth, viewYear)}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)' }}
            >
              <FaPlus size={11} /> Schedule New
            </motion.button>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
            <FaCalendarAlt className="text-gray-700 text-3xl mx-auto mb-3" />
            <p className="text-gray-600 text-sm">Click a date to see scheduled newsletters or create a new one.</p>
          </div>
        )}

        {/* Upcoming list */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>Upcoming</h4>
          {newsletters.filter((nl) => nl.status === 'scheduled' && nl.scheduledAt && new Date(nl.scheduledAt) > new Date()).length === 0 ? (
            <p className="text-gray-700 text-xs">No upcoming scheduled newsletters.</p>
          ) : (
            <div className="space-y-2">
              {newsletters
                .filter((nl) => nl.status === 'scheduled' && nl.scheduledAt && new Date(nl.scheduledAt) > new Date())
                .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
                .slice(0, 5)
                .map((nl) => (
                  <div key={nl._id} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white font-semibold truncate">{nl.title}</p>
                      <p className="text-gray-600">
                        {new Date(nl.scheduledAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'subscribers', label: 'Subscribers', icon: <FaUser size={12} /> },
  { id: 'compose',     label: 'Compose',     icon: <FaPen size={12} /> },
  { id: 'campaigns',   label: 'Campaigns',   icon: <FaBullhorn size={12} /> },
  { id: 'calendar',    label: 'Calendar',    icon: <FaCalendarAlt size={12} /> },
];

export default function NewsletterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('subscribers');
  const [subscriberData, setSubscriberData] = useState(null);
  const [subLoading, setSubLoading] = useState(true);
  const [newsletters, setNewsletters] = useState([]);
  const [nlLoading, setNlLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Auth guard
  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated' && session.user.activeRole !== 'admin') { router.push('/'); return; }
  }, [status, session, router]);

  // Load subscribers
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/newsletter')
      .then((r) => r.json())
      .then((d) => { setSubscriberData(d); setSubLoading(false); });
  }, [status]);

  // Load newsletters
  const fetchNewsletters = useCallback(() => {
    if (status !== 'authenticated') return;
    setNlLoading(true);
    fetch('/api/admin/newsletters')
      .then((r) => r.json())
      .then((d) => { setNewsletters(d.newsletters || []); setNlLoading(false); });
  }, [status]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchNewsletters(); }, [fetchNewsletters]);

  const handleEdit = (id) => {
    setEditingId(id);
    setActiveTab('compose');
  };

  const handleSaved = () => {
    fetchNewsletters();
  };

  const handleComposeFromCalendar = () => {
    setEditingId(null);
    setActiveTab('compose');
    // Could pre-fill scheduled date but keep simple for now
  };

  if (status === 'loading' || (status === 'authenticated' && subLoading && nlLoading)) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-lg">Loading newsletter manager…</div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-950 py-10 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Page header */}
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-white" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
            Newsletter Manager
          </h1>
          <p className="text-gray-500 text-sm mt-1">Compose, schedule, and track your newsletters</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-2xl p-1.5 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); if (tab.id === 'compose') setEditingId(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all
                ${activeTab === tab.id
                  ? 'bg-green-900/30 border border-green-700 text-green-400'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'subscribers' && <SubscribersTab data={subscriberData} loading={subLoading} />}
          {activeTab === 'compose' && (
            <ComposeTab
              editingId={editingId}
              onSaved={handleSaved}
            />
          )}
          {activeTab === 'campaigns' && (
            <CampaignsTab
              newsletters={newsletters}
              loading={nlLoading}
              onEdit={handleEdit}
              onRefresh={fetchNewsletters}
            />
          )}
          {activeTab === 'calendar' && (
            <CalendarTab
              newsletters={newsletters}
              onCompose={handleComposeFromCalendar}
            />
          )}
        </div>

      </div>
    </motion.div>
  );
}
