'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Megaphone, Loader2, Trash2, Plus, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface Notice {
  _id: string;
  title: string;
  message: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminNoticesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', message: '', isActive: true });
  const [submitting, setSubmitting] = useState(false);
  const [acting, setActing] = useState<string | null>(null);

  const fetchNotices = async () => {
    try {
      const res = await fetch('/api/notices');
      const data = await res.json();
      if (Array.isArray(data)) setNotices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if ((session.user as any).role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      fetchNotices();
    }
  }, [status, router, session]);

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotice),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewNotice({ title: '', message: '', isActive: true });
        fetchNotices();
      } else {
        alert('Failed to create notice');
      }
    } catch (e) {
      console.error(e);
      alert('Error creating notice');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleNoticeStatus = async (id: string, currentStatus: boolean) => {
    setActing(id);
    try {
      const res = await fetch(`/api/notices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        fetchNotices();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActing(null);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    setActing(id);
    try {
      const res = await fetch(`/api/notices/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchNotices();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActing(null);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 size={32} className="animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-black mb-2 flex items-center gap-4" style={{ color: 'var(--foreground)' }}>
              <div className="p-3 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)]">
                <Megaphone size={28} />
              </div>
              Platform Notices
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Broadcast important announcements to all students.</p>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-white transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95"
            style={{ background: 'var(--primary)', boxShadow: '0 8px 30px var(--primary-glow)' }}
          >
            <Plus size={20} strokeWidth={3} />
            Post New Notice
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {notices.map((notice, idx) => (
              <motion.div
                key={notice._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative p-6 rounded-3xl border transition-all hover:shadow-xl"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${notice.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {notice.isActive ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {notice.isActive ? 'Visible' : 'Hidden'}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleNoticeStatus(notice._id, notice.isActive)}
                      className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-[var(--primary-light)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-all"
                      title={notice.isActive ? 'Hide' : 'Show'}
                      disabled={!!acting}
                    >
                      {acting === notice._id ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
                    </button>
                    <button
                      onClick={() => handleDeleteNotice(notice._id)}
                      className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-red-500 hover:text-white text-[var(--text-muted)] transition-all"
                      title="Delete"
                      disabled={!!acting}
                    >
                      {acting === notice._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-3 leading-tight" style={{ color: 'var(--foreground)' }}>{notice.title}</h3>
                <p className="text-sm line-clamp-3 mb-6" style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{notice.message}</p>
                
                <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    {new Date(notice.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {notices.length === 0 && (
          <div className="text-center py-20 rounded-3xl border-2 border-dashed" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="w-20 h-20 bg-[var(--primary-light)] text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6">
              <Megaphone size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>No notices yet</h2>
            <p style={{ color: 'var(--text-muted)' }}>Broadcast your first announcement to students today.</p>
          </div>
        )}

        {/* Add Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-xl p-10 rounded-[2.5rem] shadow-2xl border"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}
              >
                <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }}>
                  <X size={24} />
                </button>

                <h2 className="text-3xl font-black mb-8 flex items-center gap-4" style={{ color: 'var(--foreground)' }}>
                  <div className="p-3 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)]">
                    <Plus size={24} />
                  </div>
                  Create Announcement
                </h2>

                <form onSubmit={handleAddNotice} className="space-y-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-3 ml-2" style={{ color: 'var(--text-muted)' }}>Notice Title</label>
                    <input
                      required
                      type="text"
                      className="w-full px-6 py-4 rounded-2xl border focus:ring-4 focus:ring-[var(--primary-light)] outline-none transition-all text-lg font-bold"
                      style={{ background: 'var(--background)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                      placeholder="e.g. New Course Available!"
                      value={newNotice.title}
                      onChange={e => setNewNotice({ ...newNotice, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-3 ml-2" style={{ color: 'var(--text-muted)' }}>Message Content</label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-6 py-4 rounded-2xl border focus:ring-4 focus:ring-[var(--primary-light)] outline-none transition-all resize-none text-[15px]"
                      style={{ background: 'var(--background)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                      placeholder="Write your announcement details here..."
                      value={newNotice.message}
                      onChange={e => setNewNotice({ ...newNotice, message: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-dashed" style={{ borderColor: 'var(--border-subtle)' }}>
                     <input
                      type="checkbox"
                      id="isActive"
                      className="w-5 h-5 accent-[var(--primary)] cursor-pointer"
                      checked={newNotice.isActive}
                      onChange={e => setNewNotice({ ...newNotice, isActive: e.target.checked })}
                    />
                    <label htmlFor="isActive" className="cursor-pointer font-bold text-sm" style={{ color: 'var(--foreground)' }}>Activate immediately upon posting</label>
                  </div>

                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 text-white text-lg"
                      style={{ background: 'var(--primary)', boxShadow: '0 10px 40px var(--primary-glow)' }}
                    >
                      {submitting ? <Loader2 size={24} className="animate-spin" /> : <Megaphone size={24} />}
                      Broadcast to Students
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
