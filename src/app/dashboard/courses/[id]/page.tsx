'use client';
import { useState, useEffect, use, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Video, 
  FileText, 
  Clock, 
  Layout,
  Image as ImageIcon,
  Type,
  DollarSign,
  Layers,
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload,
  CloudUpload,
  X,
  File as FileIcon
} from 'lucide-react';
import Link from 'next/link';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';

function getYouTubeId(idOrUrl: string | undefined): string | null {
  if (!idOrUrl) return null;
  const trimmed = idOrUrl.trim();
  
  // 1. Check if it's already a likely ID (11 chars or starts with 'sim_')
  if (trimmed.length === 11 || trimmed.startsWith('sim_')) {
    return trimmed;
  }

  // 2. Try to extract from URL
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  
  if (match && match[2].length === 11) {
    return match[2];
  }

  // 3. Fallback: if it's not a URL (no special chars), just return as is
  if (!trimmed.includes('/') && !trimmed.includes('.') && trimmed.length > 0) {
    return trimmed;
  }

  return null;
}

interface Lesson {
  title: string;
  type: 'video' | 'file' | 'text';
  videoId?: string;
  fileId?: string;
  content: string;
  duration: string;
  _uploadingFile?: boolean;
  _uploadingVideo?: boolean;
  _fileName?: string;
}

interface Module {
  title: string;
  lessons: Lesson[];
}

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    category: 'Programming',
    price: 0,
    thumbnail: '',
  });

  const [modules, setModules] = useState<Module[]>([]);
  const [deleteConfig, setDeleteConfig] = useState<{
    isOpen: boolean;
    type: 'module' | 'lesson';
    mIndex: number;
    lIndex?: number;
    title: string;
  }>({
    isOpen: false,
    type: 'module',
    mIndex: -1,
    title: '',
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${id}`);
        if (!res.ok) throw new Error('Failed to fetch course');
        const data = await res.json();
        
        setFormData({
          title: data.title || '',
          description: data.description || '',
          instructor: data.instructor || '',
          category: data.category || 'Programming',
          price: data.price || 0,
          thumbnail: data.thumbnail || '',
        });
        setModules(data.modules || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const addModule = () => {
    setModules([...modules, { title: `New Module`, lessons: [] }]);
  };

  const removeModule = (mIndex: number) => {
    setDeleteConfig({
      isOpen: true,
      type: 'module',
      mIndex,
      title: modules[mIndex].title || `Module ${mIndex + 1}`,
    });
  };

  const confirmDelete = () => {
    if (deleteConfig.type === 'module') {
      setModules(modules.filter((_, i) => i !== deleteConfig.mIndex));
    } else if (deleteConfig.type === 'lesson' && deleteConfig.lIndex !== undefined) {
      const newModules = [...modules];
      newModules[deleteConfig.mIndex].lessons = newModules[deleteConfig.mIndex].lessons.filter((_, i) => i !== deleteConfig.lIndex);
      setModules(newModules);
    }
    setDeleteConfig({ ...deleteConfig, isOpen: false });
  };

  const updateModuleTitle = (mIndex: number, title: string) => {
    const newModules = [...modules];
    newModules[mIndex].title = title;
    setModules(newModules);
  };

  const addLesson = (mIndex: number) => {
    const newModules = [...modules];
    newModules[mIndex].lessons.push({ 
      title: 'New Lesson', 
      type: 'video', 
      videoId: '', 
      content: '', 
      duration: '10:00' 
    });
    setModules(newModules);
  };

  const removeLesson = (mIndex: number, lIndex: number) => {
    setDeleteConfig({
      isOpen: true,
      type: 'lesson',
      mIndex,
      lIndex,
      title: modules[mIndex].lessons[lIndex].title || `Lesson ${lIndex + 1}`,
    });
  };

  const updateLesson = (mIndex: number, lIndex: number, field: keyof Lesson, value: any) => {
    const newModules = [...modules];
    let finalValue = value;
    
    // Only extract YouTube ID if it looks like a URL
    if (field === 'videoId' && value && (value.includes('/') || value.includes('.'))) {
      const extracted = getYouTubeId(value);
      if (extracted) finalValue = extracted;
    }
    
    (newModules[mIndex].lessons[lIndex] as any)[field] = finalValue;
    setModules(newModules);
  };

  // ── PDF Upload ──
  const handleFileUpload = async (mIndex: number, lIndex: number, file: File) => {
    updateLesson(mIndex, lIndex, '_uploadingFile' as any, true);
    updateLesson(mIndex, lIndex, '_fileName' as any, file.name);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/files/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      updateLesson(mIndex, lIndex, 'fileId', data.fileId);
    } catch (err) {
      console.error('File upload error:', err);
      updateLesson(mIndex, lIndex, '_fileName' as any, '');
    }
    updateLesson(mIndex, lIndex, '_uploadingFile' as any, false);
  };

  // ── Video Upload ──
  const handleVideoUpload = async (mIndex: number, lIndex: number, file: File) => {
    const lesson = modules[mIndex].lessons[lIndex];
    updateLesson(mIndex, lIndex, '_uploadingVideo' as any, true);
    try {
      const fd = new FormData();
      fd.append('video', file);
      fd.append('title', lesson.title || 'LMS Lesson Video');
      const res = await fetch('/api/videos/upload', { method: 'POST', body: fd });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Upload failed');
      }
      const data = await res.json();
      
      // CRITICAL: Update both videoId AND type to ensure it renders correctly
      const newModules = [...modules];
      newModules[mIndex].lessons[lIndex].videoId = data.videoId;
      newModules[mIndex].lessons[lIndex].type = 'video';
      setModules(newModules);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      console.error('Video upload error:', err);
      setError(err.message || 'Video upload failed');
    }
    updateLesson(mIndex, lIndex, '_uploadingVideo' as any, false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    const cleanModules = modules.map(m => ({
      ...m,
      lessons: m.lessons.map(({ _uploadingFile, _uploadingVideo, _fileName, ...l }) => l)
    }));

    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, modules: cleanModules }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update course');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--accent)]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 sticky top-0 z-50 py-4 bg-[var(--background)]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="p-2.5 rounded-xl transition-all hover:bg-white/5 border border-[var(--border)]"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                Edit Course <span className="text-sm font-normal opacity-40">#{id.slice(-6)}</span>
              </h1>
              <p className="text-sm opacity-50">Manage curriculum, upload videos & documents</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {success && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-green-500 font-bold text-sm px-4 py-2 bg-green-500/10 rounded-xl"
                >
                  <CheckCircle size={16} /> Saved Successfully
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{ background: 'var(--accent)', color: '#0a0a1a' }}
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl text-red-500 bg-red-500/10 border border-red-500/20 text-sm flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Curriculum */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-[var(--accent)]" />
                <h2 className="text-xl font-bold">Curriculum Builder</h2>
              </div>
              <button
                type="button"
                onClick={addModule}
                className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-all hover:bg-[var(--accent)]/10"
                style={{ color: 'var(--accent)', border: '1px solid rgba(245,166,35,0.2)' }}
              >
                <Plus size={16} /> Add Module
              </button>
            </div>

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {modules.map((module, mIndex) => (
                  <motion.div
                    key={mIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--card-bg)]"
                  >
                    <div className="flex gap-4 items-center mb-6">
                      <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold text-sm">
                        {mIndex + 1}
                      </div>
                      <input
                        type="text"
                        value={module.title}
                        onChange={(e) => updateModuleTitle(mIndex, e.target.value)}
                        className="flex-1 text-lg font-bold bg-transparent border-none focus:outline-none focus:ring-0"
                        placeholder="Module Title"
                      />
                      <button
                        type="button"
                        onClick={() => removeModule(mIndex)}
                        className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="space-y-4 pl-4 border-l-2 border-[var(--border)] ml-4">
                      {module.lessons.map((lesson, lIndex) => (
                        <LessonEditor
                          key={lIndex}
                          lesson={lesson}
                          onUpdate={(field, value) => updateLesson(mIndex, lIndex, field, value)}
                          onRemove={() => removeLesson(mIndex, lIndex)}
                          onFileUpload={(file) => handleFileUpload(mIndex, lIndex, file)}
                          onVideoUpload={(file) => handleVideoUpload(mIndex, lIndex, file)}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => addLesson(mIndex)}
                      className="w-full mt-6 py-3.5 rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 transition-all text-[11px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center justify-center gap-2"
                    >
                      <Plus size={14} /> Add New Lesson
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Settings */}
          <div className="lg:col-span-4 space-y-8">
            <section className="p-8 rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] space-y-8 sticky top-32">
              <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
                <Layout size={20} className="text-[var(--accent)]" />
                <h3 className="font-bold text-lg">Course Settings</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest mb-3 block opacity-40">Course Identity</label>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-medium opacity-30 px-1">Display Title</span>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl text-sm bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none"
                        placeholder="Course Title"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-medium opacity-30 px-1">Description</span>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl text-sm bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none min-h-[100px] resize-none"
                        placeholder="Overview..."
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest mb-2 block opacity-40">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none"
                    >
                      <option value="Programming">Programming</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="ICT">ICT</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest mb-2 block opacity-40">Price</label>
                    <div className="relative">
                      <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-20" />
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full pl-9 pr-4 py-3 rounded-xl text-sm bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest mb-3 block opacity-40">Assets & Branding</label>
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none opacity-20">
                        <ImageIcon size={14} />
                      </div>
                      <input
                        type="text"
                        value={formData.thumbnail}
                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                        className="w-full pl-9 pr-4 py-3 rounded-xl text-sm bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none"
                        placeholder="Thumbnail Image URL"
                      />
                    </div>
                    {formData.thumbnail && (
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-[var(--border)] shadow-lg">
                        <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--border)]">
                  <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 mb-4">
                    <p className="text-[10px] font-bold text-orange-500/80 uppercase tracking-widest flex items-center gap-2 mb-1">
                      <AlertCircle size={12} /> Instructor Hint
                    </p>
                    <p className="text-[10px] opacity-40 leading-relaxed">
                      Upload PDFs directly — they auto-store in Google Drive. Upload videos — they auto-upload to YouTube as private.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteConfig.isOpen}
        onClose={() => setDeleteConfig({ ...deleteConfig, isOpen: false })}
        onConfirm={confirmDelete}
        title={`Delete ${deleteConfig.type === 'module' ? 'Module' : 'Lesson'}?`}
        message={`Are you sure you want to delete "${deleteConfig.title}"? This action cannot be undone.`}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════
// Reusable Lesson Editor with Upload
// ═══════════════════════════════════════════════
function LessonEditor({
  lesson,
  onUpdate,
  onRemove,
  onFileUpload,
  onVideoUpload,
}: {
  lesson: Lesson;
  onUpdate: (field: keyof Lesson, value: any) => void;
  onRemove: () => void;
  onFileUpload: (file: File) => void;
  onVideoUpload: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      // Auto-detect type
      if (file.type.includes('video')) {
        onUpdate('type', 'video');
        onVideoUpload(file);
      } else if (file.type.includes('pdf') || file.name.match(/\.(doc|docx|ppt|pptx)$/i)) {
        onUpdate('type', 'file');
        onFileUpload(file);
      } else {
        // Fallback to current type if unknown
        if (lesson.type === 'file') onFileUpload(file);
        else if (lesson.type === 'video') onVideoUpload(file);
      }
    }
  }, [lesson.type, onFileUpload, onVideoUpload, onUpdate]);

  const typeIcons = {
    video: { icon: Video, color: '#f87171', label: 'Video' },
    file: { icon: FileText, color: '#60a5fa', label: 'PDF' },
    text: { icon: Type, color: '#a78bfa', label: 'Article' }
  };

  const activeType = typeIcons[lesson.type];

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${dragOver ? 'ring-2 ring-[var(--accent)] bg-[var(--accent)]/5' : 'bg-[var(--background)] border-[var(--border)] hover:border-[var(--border)-hover]'}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Header: Title, Duration, Type, Delete */}
      <div className="p-4 flex flex-wrap items-center gap-4 border-b border-[var(--border)]/50">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div className="p-2 rounded-lg" style={{ background: `${activeType.color}15`, color: activeType.color }}>
            <activeType.icon size={16} />
          </div>
          <input
            type="text"
            value={lesson.title}
            onChange={(e) => onUpdate('title', e.target.value)}
            className="flex-1 text-sm font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0"
            placeholder="Lesson Title"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Duration */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
            <Clock size={12} className="opacity-30" />
            <input
              type="text"
              value={lesson.duration}
              onChange={(e) => onUpdate('duration', e.target.value)}
              className="w-12 text-[11px] font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-center"
              placeholder="10:00"
            />
          </div>

          {/* Type Toggle (Compact) */}
          <div className="flex p-1 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
            {(['video', 'file', 'text'] as const).map((t) => {
              const Icon = typeIcons[t].icon;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onUpdate('type', t)}
                  className={`p-1.5 rounded-md transition-all ${lesson.type === t ? 'bg-[var(--accent)] text-[#0a0a1a]' : 'opacity-30 hover:opacity-100 hover:bg-white/5'}`}
                  title={typeIcons[t].label}
                >
                  <Icon size={14} />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 space-y-4">
        {lesson.type === 'video' && (
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Video size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400 opacity-50" />
              <input
                type="text"
                value={lesson.videoId || ''}
                onChange={(e) => onUpdate('videoId', e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-[var(--card-bg)] border border-[var(--border)] focus:border-red-500/50 focus:outline-none transition-all"
                placeholder="YouTube URL or Video ID"
              />
            </div>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={(lesson as any)._uploadingVideo}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 border border-red-500/20 text-red-400 bg-red-500/5"
            >
              {(lesson as any)._uploadingVideo ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {(lesson as any)._uploadingVideo ? 'Uploading...' : 'Direct Upload'}
            </button>
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && onVideoUpload(e.target.files[0])} />
          </div>
        )}

        {lesson.type === 'file' && (
          <div className="flex items-center gap-4">
            {lesson.fileId ? (
              <div className="flex-1 flex items-center gap-3 p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <FileIcon size={16} className="text-blue-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-blue-400 truncate">{(lesson as any)._fileName || 'Document Linked'}</p>
                  <p className="text-[10px] opacity-40">Google Drive Storage</p>
                </div>
                <button
                  type="button"
                  onClick={() => { onUpdate('fileId', ''); onUpdate('_fileName' as any, ''); }}
                  className="p-1.5 text-red-400 hover:bg-red-500/5 rounded-lg"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={(lesson as any)._uploadingFile}
                className="flex-1 flex items-center justify-center gap-3 py-3 rounded-xl border-2 border-dashed border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-blue-400/60 font-bold text-xs"
              >
                {(lesson as any)._uploadingFile ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />}
                {(lesson as any)._uploadingFile ? 'Uploading PDF...' : 'Select or Drop PDF'}
              </button>
            )}
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" className="hidden" onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0])} />
          </div>
        )}

        <div>
          <textarea
            value={lesson.content || ''}
            onChange={(e) => onUpdate('content', e.target.value)}
            className="w-full text-xs bg-[var(--card-bg)]/50 border border-[var(--border)]/50 rounded-xl p-3 focus:border-[var(--accent)]/50 focus:outline-none resize-none transition-all h-20"
            placeholder={lesson.type === 'text' ? "Write your article content here..." : "Optional: What will students learn?"}
          />
        </div>
      </div>

      {dragOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-[var(--accent)]/10 backdrop-blur-[2px] border-2 border-dashed border-[var(--accent)]">
          <div className="text-center">
            <CloudUpload size={32} className="text-[var(--accent)] mx-auto mb-2" />
            <p className="text-sm font-bold text-[var(--accent)]">Drop to Auto-Detect Type</p>
          </div>
        </div>
      )}
    </div>
  );
}
