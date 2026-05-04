'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Upload, Trash2, Plus, X, Loader2, FileText,
  CheckCircle2, AlertCircle, Download, BookOpen, Tag, FileCheck
} from 'lucide-react';
import ResourcesSection from '@/frontend/components/ResourcesSection';

interface Resource {
  _id: string;
  title: string;
  description: string;
  fileName: string;
  fileId: string;
  mimeType: string;
  category: string;
  createdAt: string;
}

const getCategoryColor = (category: string) => {
  // Simple deterministic color generation or predefined colors
  const colors = [
    { bg: 'rgba(239,68,68,0.12)', text: '#ef4444' },
    { bg: 'rgba(59,130,246,0.12)', text: '#3b82f6' },
    { bg: 'rgba(168,85,247,0.12)', text: '#a855f7' },
    { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
    { bg: 'rgba(20,184,166,0.12)', text: '#14b8a6' },
    { bg: 'rgba(236,72,153,0.12)', text: '#ec4899' },
  ];
  const index = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

export default function AdminResourcesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    file: null as File | null,
  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resData, catData] = await Promise.all([
        fetch('/api/resources').then(r => r.json()),
        fetch('/api/resources/categories').then(r => r.json())
      ]);
      if (Array.isArray(resData)) setResources(resData);
      if (Array.isArray(catData)) {
        setCategories(catData);
        if (catData.length > 0 && !form.category) {
          setForm(f => ({ ...f, category: catData[0].name }));
        }
      }
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
      const role = (session.user as any).role;
      // Allow students, teachers, and admins
      fetchData();
    }
  }, [status, router, session]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.file || !form.title) return;
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('file', form.file);
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category', form.category);

      const res = await fetch('/api/resources', { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }
      const data = await res.json();
      setResources((prev) => [data, ...prev]);
      setShowModal(false);
      setForm({ title: '', description: '', category: categories[0]?.name || '', file: null });
      showToast('Resource uploaded successfully!');
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setResources((prev) => prev.filter((r) => r._id !== id));
        showToast('Resource removed.');
      }
    } catch (e) {
      showToast('Failed to delete resource', 'error');
    } finally {
      fetchData();
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setAddingCat(true);
    try {
      const res = await fetch('/api/resources/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCategories(prev => [...prev, data].sort((a,b) => a.name.localeCompare(b.name)));
      setNewCatName('');
      showToast('Category created!');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setAddingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Resources in this category will not be deleted but will lose their label.')) return;
    try {
      const res = await fetch(`/api/resources/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c._id !== id));
        showToast('Category removed');
      }
    } catch (e) {
      showToast('Delete failed', 'error');
    }
  };

  const role = (session?.user as any)?.role || 'student';
  const isAdminOrTeacher = role === 'admin' || role === 'teacher';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={36} />
      </div>
    );
  }

  // Student view
  if (!isAdminOrTeacher) {
    return (
      <div className="min-h-screen p-6 md:p-8" style={{ background: 'var(--background)' }}>
        <div className="max-w-6xl mx-auto">
          <ResourcesSection />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--background)' }}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold"
            style={{
              background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: toast.type === 'success' ? '#10b981' : '#ef4444',
              border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              backdropFilter: 'blur(12px)',
            }}
          >
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(20,184,166,0.15)', color: '#14b8a6' }}>
                <FolderOpen size={20} />
              </span>
              Manage Resources
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Upload learning materials for students to download
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCatModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:bg-white/5"
              style={{ border: '1px solid var(--border-subtle)', color: 'var(--foreground)' }}
            >
              <Tag size={16} /> Manage Categories
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{ background: 'var(--accent)', color: '#0a0a1a' }}
            >
              <Plus size={16} /> Upload Resource
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
          {categories.map((cat) => {
            const count = resources.filter((r) => r.category === cat.name).length;
            const color = getCategoryColor(cat.name);
            return (
              <div
                key={cat._id}
                className="shrink-0 p-4 rounded-2xl flex items-center gap-3 min-w-[160px]"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color.bg, color: color.text }}>
                  <FileText size={16} />
                </div>
                <div>
                  <p className="text-lg font-black">{count}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{cat.name}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resources Grid */}
        {resources.length === 0 ? (
          <div className="text-center py-24" style={{ color: 'var(--text-muted)' }}>
            <FolderOpen size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold text-lg opacity-40">No resources uploaded yet</p>
            <p className="text-sm mt-1 opacity-30">Click "Upload Resource" to get started</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {resources.map((r) => {
                const color = getCategoryColor(r.category);
                return (
                  <motion.div
                    key={r._id}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-5 rounded-2xl flex gap-4 group"
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}
                  >
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: color.bg, color: color.text }}>
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm truncate" style={{ color: 'var(--foreground)' }}>{r.title}</h3>
                          {r.description && (
                            <p className="text-[12px] mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{r.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(r._id)}
                          disabled={deleting === r._id}
                          className="shrink-0 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500/50 hover:text-red-500"
                        >
                          {deleting === r._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: color.bg, color: color.text }}>
                            {r.category}
                          </span>
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <a
                          href={`/api/files/${r.fileId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                          style={{ background: 'rgba(20,184,166,0.1)', color: '#14b8a6', border: '1px solid rgba(20,184,166,0.2)' }}
                        >
                          <Download size={12} /> Preview
                        </a>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-8 rounded-3xl"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <Upload size={20} style={{ color: 'var(--accent)' }} /> Upload Resource
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-white/5 transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
                    style={{ background: 'var(--background)', border: '1px solid var(--border-subtle)', color: 'var(--foreground)' }}
                    placeholder="e.g. Mathematics Past Paper 2023"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all resize-none h-20"
                    style={{ background: 'var(--background)', border: '1px solid var(--border-subtle)', color: 'var(--foreground)' }}
                    placeholder="Optional short description..."
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
                    style={{ background: 'var(--background)', border: '1px solid var(--border-subtle)', color: 'var(--foreground)' }}
                  >
                    {categories.length === 0 && <option value="">No categories created</option>}
                    {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                {/* File Picker */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-muted)' }}>File *</label>
                  <label
                    className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all hover:border-teal-500/40 hover:bg-teal-500/5"
                    style={{ borderColor: form.file ? 'rgba(20,184,166,0.4)' : 'var(--border-subtle)' }}
                  >
                    {form.file ? (
                      <>
                        <FileCheck size={24} style={{ color: '#14b8a6' }} />
                        <p className="text-sm font-bold" style={{ color: '#14b8a6' }}>{form.file.name}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{(form.file.size / 1024).toFixed(0)} KB</p>
                      </>
                    ) : (
                      <>
                        <Upload size={24} style={{ color: 'var(--text-muted)' }} />
                        <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Click to select file</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>PDF, DOC, PPT supported</p>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                      onChange={(e) => e.target.files?.[0] && setForm({ ...form, file: e.target.files[0] })}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={uploading || !form.file || !form.title}
                  className="w-full py-3.5 rounded-xl font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'var(--accent)', color: '#0a0a1a' }}
                >
                  {uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : <><Upload size={16} /> Upload Resource</>}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
