'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Plus, Trash2, ExternalLink, Loader2, X, Calendar, Globe, Monitor } from 'lucide-react';
import LiveClassesSection from '@/frontend/components/LiveClassesSection';

interface LiveClass {
  _id: string;
  title: string;
  url: string;
  platform: 'zoom' | 'meet' | 'other';
  startTime: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminLiveClassesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [acting, setActing] = useState<string | null>(null);

  const [newClass, setNewClass] = useState({
    title: '',
    url: '',
    platform: 'zoom' as const,
    startTime: '',
    isActive: true
  });

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/live-classes');
      const data = await res.json();
      if (Array.isArray(data)) setClasses(data);
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
      // Allow everyone authenticated
      fetchClasses();
    }
  }, [status, router, session]);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewClass({ title: '', url: '', platform: 'zoom', startTime: '', isActive: true });
        fetchClasses();
      } else {
        alert('Failed to add class link');
      }
    } catch (e) {
      console.error(e);
      alert('Error adding class link');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Remove this live class link?')) return;
    setActing(id);
    try {
      const res = await fetch(`/api/live-classes/${id}`, { method: 'DELETE' });
      if (res.ok) fetchClasses();
    } catch (e) {
      console.error(e);
    } finally {
      setActing(null);
    }
  };

  const role = (session?.user as any)?.role || 'student';
  const isAdminOrTeacher = role === 'admin' || role === 'teacher';

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 size={32} className="animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  // Student view
  if (!isAdminOrTeacher) {
    return (
      <div className="min-h-screen p-6 md:p-8" style={{ background: 'var(--background)' }}>
        <div className="max-w-6xl mx-auto">
          <LiveClassesSection />
        </div>
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
                <Video size={28} />
              </div>
              Live Classes
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Manage Zoom and Google Meet links for students.</p>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-white transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95"
            style={{ background: 'var(--primary)', boxShadow: '0 8px 30px var(--primary-glow)' }}
          >
            <Plus size={20} strokeWidth={3} />
            Add Live Link
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {classes.map((c, idx) => (
              <motion.div
                key={c._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative p-6 rounded-3xl border transition-all hover:shadow-xl"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${c.platform === 'zoom' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                    {c.platform === 'zoom' ? <Globe size={12} /> : <Video size={12} />}
                    {c.platform === 'zoom' ? 'Zoom' : 'Google Meet'}
                  </div>
                  <button
                    onClick={() => handleDeleteClass(c._id)}
                    className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-red-500 hover:text-white text-[var(--text-muted)] transition-all opacity-0 group-hover:opacity-100"
                    disabled={!!acting}
                  >
                    {acting === c._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>

                <h3 className="text-xl font-bold mb-2 leading-tight" style={{ color: 'var(--foreground)' }}>{c.title}</h3>
                
                <div className="space-y-2 mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[var(--primary)]" />
                    <span>{new Date(c.startTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Monitor size={14} className="text-[var(--primary)]" />
                    <span className="truncate">{c.url}</span>
                  </div>
                </div>

                <a 
                  href={c.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                >
                  <ExternalLink size={14} />
                  Test Link
                </a>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {classes.length === 0 && (
          <div className="text-center py-20 rounded-3xl border-2 border-dashed" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="w-20 h-20 bg-[var(--primary-light)] text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6">
              <Video size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>No live classes scheduled</h2>
            <p style={{ color: 'var(--text-muted)' }}>Add your first Zoom or Google Meet link to get started.</p>
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
                  Add Live Link
                </h2>

                <form onSubmit={handleAddClass} className="space-y-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-3 ml-2" style={{ color: 'var(--text-muted)' }}>Class Title</label>
                    <input
                      required
                      type="text"
                      className="w-full px-6 py-4 rounded-2xl border focus:ring-4 focus:ring-[var(--primary-light)] outline-none transition-all text-lg font-bold"
                      style={{ background: 'var(--background)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                      placeholder="e.g. Physics Weekly Catchup"
                      value={newClass.title}
                      onChange={e => setNewClass({ ...newClass, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest mb-3 ml-2" style={{ color: 'var(--text-muted)' }}>Platform</label>
                      <select
                        className="w-full px-6 py-4 rounded-2xl border focus:ring-4 focus:ring-[var(--primary-light)] outline-none transition-all font-bold"
                        style={{ background: 'var(--background)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                        value={newClass.platform}
                        onChange={e => setNewClass({ ...newClass, platform: e.target.value as any })}
                      >
                        <option value="zoom">Zoom</option>
                        <option value="meet">Google Meet</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest mb-3 ml-2" style={{ color: 'var(--text-muted)' }}>Start Time</label>
                      <input
                        required
                        type="datetime-local"
                        className="w-full px-6 py-4 rounded-2xl border focus:ring-4 focus:ring-[var(--primary-light)] outline-none transition-all font-bold"
                        style={{ background: 'var(--background)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                        value={newClass.startTime}
                        onChange={e => setNewClass({ ...newClass, startTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-3 ml-2" style={{ color: 'var(--text-muted)' }}>Meeting URL</label>
                    <input
                      required
                      type="url"
                      className="w-full px-6 py-4 rounded-2xl border focus:ring-4 focus:ring-[var(--primary-light)] outline-none transition-all text-sm"
                      style={{ background: 'var(--background)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                      placeholder="https://zoom.us/j/..."
                      value={newClass.url}
                      onChange={e => setNewClass({ ...newClass, url: e.target.value })}
                    />
                  </div>

                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 text-white text-lg"
                      style={{ background: 'var(--primary)', boxShadow: '0 10px 40px var(--primary-glow)' }}
                    >
                      {submitting ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
                      Add Live Class
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
