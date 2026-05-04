'use client';
import { useState, useRef, useCallback } from 'react';
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
  Upload,
  CheckCircle,
  Loader2,
  CloudUpload,
  X,
  File as FileIcon
} from 'lucide-react';
import Link from 'next/link';

function getYouTubeId(url: string | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : (url.length === 11 ? url : null);
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
  _uploadProgress?: number;
}

interface Module {
  title: string;
  lessons: Lesson[];
}

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    category: 'Programming',
    price: 0,
    thumbnail: '',
  });

  const [modules, setModules] = useState<Module[]>([
    {
      title: 'Module 1: Introduction',
      lessons: [{ title: 'Welcome to the course', type: 'video', videoId: '', content: '', duration: '05:00' }]
    }
  ]);

  const addModule = () => {
    setModules([...modules, { title: `Module ${modules.length + 1}`, lessons: [] }]);
  };

  const removeModule = (mIndex: number) => {
    setModules(modules.filter((_, i) => i !== mIndex));
  };

  const updateModuleTitle = (mIndex: number, title: string) => {
    const newModules = [...modules];
    newModules[mIndex].title = title;
    setModules(newModules);
  };

  const addLesson = (mIndex: number) => {
    const newModules = [...modules];
    newModules[mIndex].lessons.push({ title: 'New Lesson', type: 'video', videoId: '', content: '', duration: '10:00' });
    setModules(newModules);
  };

  const removeLesson = (mIndex: number, lIndex: number) => {
    const newModules = [...modules];
    newModules[mIndex].lessons = newModules[mIndex].lessons.filter((_, i) => i !== lIndex);
    setModules(newModules);
  };

  const updateLesson = (mIndex: number, lIndex: number, field: keyof Lesson, value: any) => {
    const newModules = [...modules];
    let finalValue = value;
    if (field === 'videoId' && value) {
      const extracted = getYouTubeId(value);
      if (extracted) finalValue = extracted;
    }
    (newModules[mIndex].lessons[lIndex] as any)[field] = finalValue;
    setModules(newModules);
  };

  // ── PDF Upload Handler ──
  const handleFileUpload = async (mIndex: number, lIndex: number, file: File) => {
    updateLesson(mIndex, lIndex, '_uploadingFile' as any, true);
    updateLesson(mIndex, lIndex, '_fileName' as any, file.name);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/files/upload', { method: 'POST', body: uploadFormData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      updateLesson(mIndex, lIndex, 'fileId', data.fileId);
    } catch (err: any) {
      console.error('File upload error:', err);
      setError(`PDF upload failed: ${err.message}. Please try again.`);
      updateLesson(mIndex, lIndex, '_fileName' as any, '');
    } finally {
      updateLesson(mIndex, lIndex, '_uploadingFile' as any, false);
    }
  };

  // ── Video Upload Handler ──
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
      updateLesson(mIndex, lIndex, 'videoId', data.videoId);
      updateLesson(mIndex, lIndex, '_uploadingVideo' as any, false);
    } catch (err: any) {
      console.error('Video upload error:', err);
      setError(err.message || 'Video upload failed');
      updateLesson(mIndex, lIndex, '_uploadingVideo' as any, false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Clean up internal fields before sending
    const cleanModules = modules.map(m => ({
      ...m,
      lessons: m.lessons.map(({ _uploadingFile, _uploadingVideo, _fileName, _uploadProgress, ...l }) => l)
    }));

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, modules: cleanModules }),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create course');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--background)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="p-2 rounded-xl transition-all hover:bg-white/5"
              style={{ border: '1px solid var(--border)' }}
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Create New Course</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Build your curriculum and share your knowledge</p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
            style={{ background: 'var(--accent)', color: '#0a0a1a' }}
          >
            <Save size={18} />
            {loading ? 'Creating...' : 'Publish Course'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl text-red-500 bg-red-500/10 border border-red-500/20 text-sm">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <section className="p-8 rounded-2xl space-y-6" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Layout size={18} className="text-blue-400" />
                <h2 className="text-lg font-bold">Course Details</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                    placeholder="e.g. Advanced React Architecture"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all min-h-[120px] resize-none"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                    placeholder="What will students learn in this course?"
                    required
                  />
                </div>
              </div>
            </section>

            {/* Curriculum */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Layers size={18} className="text-purple-400" />
                  <h2 className="text-lg font-bold">Curriculum</h2>
                </div>
                <button
                  type="button"
                  onClick={addModule}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:bg-white/5"
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
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-6 rounded-2xl space-y-4"
                      style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold text-sm">
                          {mIndex + 1}
                        </div>
                        <input
                          type="text"
                          value={module.title}
                          onChange={(e) => updateModuleTitle(mIndex, e.target.value)}
                          className="flex-1 text-lg font-bold bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-accent/20 rounded px-2"
                          placeholder="Module Title"
                        />
                        <button
                          type="button"
                          onClick={() => removeModule(mIndex)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
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
                        className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-white/5 hover:border-accent/20 hover:bg-accent/5 transition-all text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 flex items-center justify-center gap-2"
                      >
                        <Plus size={14} /> Add Lesson
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-8">
            <section className="p-6 rounded-2xl space-y-6" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <h3 className="font-bold flex items-center gap-2">
                <Plus size={18} className="text-accent" /> Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-2 block opacity-50">Instructor Name</label>
                  <div className="relative">
                    <Type size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                    <input
                      type="text"
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-transparent focus:outline-none"
                      style={{ border: '1px solid var(--border)' }}
                      placeholder="Your name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-2 block opacity-50">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent focus:outline-none"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    <option value="Programming">Programming</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="ICT">ICT</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-2 block opacity-50">Price (LKR)</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-transparent focus:outline-none"
                      style={{ border: '1px solid var(--border)' }}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-2 block opacity-50">Thumbnail URL</label>
                  <div className="relative">
                    <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                    <input
                      type="text"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-transparent focus:outline-none"
                      style={{ border: '1px solid var(--border)' }}
                      placeholder="Image URL"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// Reusable Lesson Editor component with upload
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
      if (lesson.type === 'file') {
        onFileUpload(file);
      } else if (lesson.type === 'video') {
        onVideoUpload(file);
      }
    }
  }, [lesson.type, onFileUpload, onVideoUpload]);

  return (
    <div
      className={`p-5 rounded-xl space-y-4 relative group transition-all ${dragOver ? 'ring-2 ring-[var(--accent)] bg-[var(--accent)]/5' : ''}`}
      style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {dragOver && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-[var(--accent)]/10 border-2 border-dashed border-[var(--accent)]">
          <div className="text-center">
            <CloudUpload size={32} className="text-[var(--accent)] mx-auto mb-2" />
            <p className="text-sm font-bold text-[var(--accent)]">Drop file here</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-5">
          {/* Row 1: Title + Duration */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5 opacity-40">Lesson Title</label>
              <input
                type="text"
                value={lesson.title}
                onChange={(e) => onUpdate('title', e.target.value)}
                className="w-full text-sm font-bold bg-transparent border-b border-white/10 focus:border-accent/40 focus:outline-none pb-1"
                placeholder="Lesson name"
              />
            </div>
            <div className="w-28">
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5 opacity-40">Duration</label>
              <div className="relative">
                <Clock size={12} className="absolute left-0 top-1/2 -translate-y-1/2 opacity-40" />
                <input
                  type="text"
                  value={lesson.duration}
                  onChange={(e) => onUpdate('duration', e.target.value)}
                  className="w-full pl-5 text-sm bg-transparent border-b border-white/10 focus:border-accent/40 focus:outline-none pb-1"
                  placeholder="10:00"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Type selector */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-2 opacity-40">Delivery Method</label>
            <div className="flex gap-2 p-1 rounded-xl bg-[var(--card-bg)] border border-[var(--border)]">
              {[
                { id: 'video', icon: Video, label: 'Video' },
                { id: 'file', icon: FileText, label: 'PDF / Doc' },
                { id: 'text', icon: Type, label: 'Article' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => onUpdate('type', btn.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold transition-all ${lesson.type === btn.id ? 'bg-[var(--accent)] text-[#0a0a1a]' : 'opacity-40 hover:opacity-100'}`}
                >
                  <btn.icon size={13} /> {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Type-specific content */}
          {lesson.type === 'video' && (
            <div className="space-y-3">
              {/* Video upload button */}
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Upload Video → YouTube (Private)</label>
                  {(lesson as any)._uploadingVideo && (
                    <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Uploading…</span>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={(lesson as any)._uploadingVideo}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    <Upload size={14} /> {(lesson as any)._uploadingVideo ? 'Uploading…' : 'Upload Video File'}
                  </button>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onVideoUpload(file);
                    }}
                  />
                  <span className="text-[10px] self-center opacity-30">or</span>
                  <div className="flex-1 relative">
                    <Video size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-red-500 opacity-50" />
                    <input
                      type="text"
                      value={lesson.videoId || ''}
                      onChange={(e) => onUpdate('videoId', e.target.value)}
                      className="w-full pl-7 text-sm bg-transparent border-b border-red-500/20 focus:border-red-500 focus:outline-none pb-1"
                      placeholder="Paste YouTube URL or ID"
                    />
                  </div>
                </div>
                {lesson.videoId && (
                  <div className="mt-2 flex items-center gap-2">
                    <CheckCircle size={12} className="text-green-500" />
                    <span className="text-[10px] text-green-400 font-bold">Video linked: {lesson.videoId}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {lesson.type === 'file' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Upload PDF → Google Drive (Auto)</label>
                  {(lesson as any)._uploadingFile && (
                    <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Uploading…</span>
                  )}
                </div>

                {lesson.fileId ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                    <FileIcon size={20} className="text-green-400" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-green-400">{(lesson as any)._fileName || 'File uploaded'}</p>
                      <p className="text-[10px] opacity-40">Stored securely on Google Drive • ID: {lesson.fileId.slice(0, 12)}…</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { onUpdate('fileId', ''); onUpdate('_fileName' as any, ''); }}
                      className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={(lesson as any)._uploadingFile}
                    className="w-full py-6 rounded-xl border-2 border-dashed border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all flex flex-col items-center gap-2 disabled:opacity-50"
                  >
                    <CloudUpload size={28} className="text-blue-400" />
                    <span className="text-xs font-bold text-blue-400">
                      {(lesson as any)._uploadingFile ? 'Uploading to Google Drive…' : 'Click or drag PDF / DOC here'}
                    </span>
                    <span className="text-[10px] opacity-30">PDF, DOC, DOCX, PPT, PPTX</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onFileUpload(file);
                  }}
                />
              </div>
            </div>
          )}

          {/* Description / Article content */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5 opacity-40">
              {lesson.type === 'text' ? 'Article Content' : 'Description'}
            </label>
            <textarea
              value={lesson.content || ''}
              onChange={(e) => onUpdate('content', e.target.value)}
              className={`w-full text-xs bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-3 focus:border-accent/40 focus:outline-none resize-none transition-all ${lesson.type === 'text' ? 'h-32' : 'h-16'}`}
              placeholder={lesson.type === 'text' ? "Write your lesson here (Markdown supported)..." : "Brief summary..."}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-white/20 hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
