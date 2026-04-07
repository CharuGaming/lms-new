'use client';
import { use, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Play, FileText, Download, CheckCircle, Clock,
  ChevronRight, ChevronLeft, BookOpen, Loader2, Lock, ShieldCheck,
  Layers, GraduationCap, ExternalLink
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import VideoPlayer from '@/frontend/components/VideoPlayer';

interface Lesson {
  title: string;
  type?: string;
  videoId?: string;
  fileId?: string;
  videoUrl?: string;
  content?: string;
  duration?: string;
}

interface Module {
  title: string;
  lessons: Lesson[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  instructor: string;
  modules: Module[];
}

export default function LearnPage({ params }: { params: Promise<{ id: string; lessonIndex: string }> }) {
  const { id, lessonIndex } = use(params);
  const currentIndex = parseInt(lessonIndex, 10) || 0;
  const { data: session } = useSession();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string>('none');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [videoToken, setVideoToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch course
  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then(res => res.json())
      .then(data => { if (data._id) setCourse(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  // Check enrollment
  useEffect(() => {
    if (!session) return;
    fetch('/api/enrollments')
      .then(r => r.json())
      .then(enrollments => {
        const match = enrollments.find?.((e: any) => e.courseId === id);
        if (match) {
          setEnrollmentStatus(match.status || 'approved');
          setCompletedLessons(match.completedLessons || []);
        }
      })
      .catch(() => {});
  }, [session, id]);

  // Flatten all lessons into a single ordered list
  const allLessons: { lesson: Lesson; moduleIndex: number; lessonIndex: number; moduleName: string }[] = [];
  course?.modules.forEach((mod, mi) => {
    mod.lessons.forEach((lesson, li) => {
      allLessons.push({ lesson, moduleIndex: mi, lessonIndex: li, moduleName: mod.title });
    });
  });

  const current = allLessons[currentIndex];
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Fetch video token
  useEffect(() => {
    if (!current || enrollmentStatus !== 'approved') return;
    
    // Improved detection: check type and presence of ID/URL
    const isVideo = current.lesson.type === 'video';
    const hasVideoData = current.lesson.videoId || current.lesson.videoUrl;
    
    if (isVideo || hasVideoData) {
      setTokenLoading(true);
      setVideoToken(null);
      
      const fetchToken = async () => {
        try {
          const res = await fetch(`/api/videos/token?courseId=${id}&moduleIndex=${current.moduleIndex}&lessonIndex=${current.lessonIndex}`);
          if (!res.ok) {
             const errorData = await res.json();
             console.error('Token fetch failed:', errorData.error);
             return;
          }
          const data = await res.json();
          if (data?.token) {
            setVideoToken(data.token);
          }
        } catch (err) {
          console.error('Error fetching video token:', err);
        } finally {
          setTokenLoading(false);
        }
      };
      
      fetchToken();
    } else {
      setTokenLoading(false);
      setVideoToken(null);
    }
  }, [current?.moduleIndex, current?.lessonIndex, enrollmentStatus, id, current?.lesson?.videoId]);

  const handleComplete = async (title: string) => {
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: id, lessonId: title }),
      });
      if (res.ok) setCompletedLessons(prev => [...new Set([...prev, title])]);
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!course || !current) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--background)' }}>
        <p className="text-xl" style={{ color: 'var(--text-muted)' }}>Lesson not found.</p>
        <Link href={`/courses/${id}`} className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--accent)' }}>
          <ArrowLeft size={16} /> Back to Course
        </Link>
      </div>
    );
  }

  if (enrollmentStatus !== 'approved') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6" style={{ background: 'var(--background)' }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(245,166,35,0.1)' }}>
          <Lock size={36} style={{ color: 'var(--accent)' }} />
        </div>
        <h2 className="text-2xl font-extrabold text-center" style={{ fontFamily: 'var(--font-display)' }}>
          Enrollment Required
        </h2>
        <p className="text-sm text-center max-w-md" style={{ color: 'var(--text-muted)' }}>
          You need to be enrolled and approved to access this lesson.
        </p>
        <Link
          href={`/courses/${id}`}
          className="px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, var(--accent), #e8941a)', color: '#0a0a1a' }}
        >
          <ArrowLeft size={16} /> Go to Course
        </Link>
      </div>
    );
  }

  const hasVideo = current.lesson.type === 'video' || current.lesson.videoId || current.lesson.videoUrl;
  const hasFile = current.lesson.fileId;
  const isCompleted = completedLessons.includes(current.lesson.title);
  const totalLessons = allLessons.length;
  const progress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen flex" style={{ background: '#050510' }}>

      {/* ─── Sidebar: Course Outline ─── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 340 : 0, opacity: sidebarOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col overflow-hidden flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, #0c0c24 0%, #080818 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="p-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link
            href={`/courses/${id}`}
            className="flex items-center gap-2 text-xs font-bold mb-4 transition-colors hover:opacity-80"
            style={{ color: 'var(--accent)' }}
          >
            <ArrowLeft size={14} /> Back to Course
          </Link>
          <h2 className="text-sm font-extrabold truncate mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            {course.title}
          </h2>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {course.instructor}
          </p>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] mb-1.5">
              <span style={{ color: 'var(--text-muted)' }}>Progress</span>
              <span className="font-bold" style={{ color: 'var(--accent)' }}>{progress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--accent), #e8941a)' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <p className="text-[9px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
              {completedLessons.length}/{totalLessons} completed
            </p>
          </div>
        </div>

        {/* Lesson List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
          {course.modules.map((mod, mi) => {
            let globalOffset = 0;
            for (let i = 0; i < mi; i++) globalOffset += course.modules[i].lessons.length;

            return (
              <div key={mi} className="mb-1">
                <div className="px-5 py-3 flex items-center gap-2">
                  <Layers size={12} style={{ color: 'var(--accent)', opacity: 0.6 }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    {mod.title}
                  </span>
                </div>

                {mod.lessons.map((lesson, li) => {
                  const gIdx = globalOffset + li;
                  const isCurrent = gIdx === currentIndex;
                  const isDone = completedLessons.includes(lesson.title);
                  const isFileLesson = lesson.type === 'file' || (lesson.fileId && lesson.type !== 'video');

                  return (
                    <Link
                      key={li}
                      href={`/courses/${id}/learn/${gIdx}`}
                      className="flex items-center gap-3 px-5 py-3 transition-all group relative"
                      style={{
                        background: isCurrent ? 'rgba(245,166,35,0.08)' : 'transparent',
                        borderLeft: isCurrent ? '3px solid var(--accent)' : '3px solid transparent',
                      }}
                    >
                      <div className="flex-shrink-0">
                        {isDone ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : isFileLesson ? (
                          <FileText size={16} style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-muted)' }} />
                        ) : (
                          <Play size={16} style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-muted)' }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className="text-xs font-semibold block truncate"
                          style={{ color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                        >
                          {lesson.title}
                        </span>
                        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                          {lesson.duration || '—'}
                        </span>
                      </div>
                      {isCurrent && (
                        <motion.div
                          layoutId="active-lesson"
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: 'var(--accent)' }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </motion.aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Bar */}
        <div
          className="flex items-center justify-between px-6 py-3 flex-shrink-0"
          style={{
            background: 'rgba(10,10,26,0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-muted)' }}
            >
              <BookOpen size={18} />
            </button>
            <Link
              href={`/courses/${id}`}
              className="lg:hidden flex items-center gap-2 text-xs font-bold"
              style={{ color: 'var(--accent)' }}
            >
              <ArrowLeft size={14} /> Back
            </Link>
            <div className="hidden sm:block">
              <p className="text-xs font-bold truncate max-w-[200px] md:max-w-[400px]" style={{ fontFamily: 'var(--font-display)' }}>
                {current.lesson.title}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {current.moduleName} • Lesson {currentIndex + 1} of {totalLessons}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted ? (
              <button
                onClick={() => handleComplete(current.lesson.title)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, var(--accent), #e8941a)', color: '#0a0a1a' }}
              >
                <CheckCircle size={14} /> Mark Complete
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                <CheckCircle size={14} /> Completed
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">

          {/* ─── Video Section ─── */}
          {hasVideo && (
            <div className="w-full" style={{ background: '#000' }}>
              {tokenLoading ? (
                <div className="w-full aspect-video flex items-center justify-center" style={{ background: '#080818' }}>
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--accent)' }} />
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                      Securing video access…
                    </span>
                  </div>
                </div>
              ) : videoToken ? (
                <div className="max-w-[1100px] mx-auto">
                  <VideoPlayer
                    token={videoToken}
                    title={current.lesson.title}
                    onComplete={() => handleComplete(current.lesson.title)}
                  />
                </div>
              ) : (
                <div className="w-full aspect-video flex items-center justify-center" style={{ background: '#080818' }}>
                  <div className="text-center">
                    <ShieldCheck size={48} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm opacity-40" style={{ color: 'var(--text-muted)' }}>
                      Video could not be loaded. Try refreshing.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Lesson Info + Resources ─── */}
          <div className="max-w-[1100px] mx-auto px-6 py-8">
            <div className="grid lg:grid-cols-3 gap-8">

              {/* Left: Lesson details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title block */}
                <div>
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    {hasVideo && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5"
                        style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <Play size={10} /> Video Lesson
                      </span>
                    )}
                    {hasFile && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5"
                        style={{ background: 'rgba(59,130,246,0.08)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.15)' }}>
                        <FileText size={10} /> Downloadable Resource
                      </span>
                    )}
                    {current.lesson.duration && (
                      <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <Clock size={10} /> {current.lesson.duration}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                    {current.lesson.title}
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {current.moduleName} • {course.title}
                  </p>
                </div>

                {/* Content / Description */}
                {current.lesson.content && (
                  <div
                    className="p-6 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
                      Lesson Notes
                    </h3>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                      {current.lesson.content}
                    </div>
                  </div>
                )}

                {/* File-only lessons (no video) */}
                {!hasVideo && hasFile && (
                  <div
                    className="p-8 rounded-2xl text-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(139,92,246,0.05))',
                      border: '1px solid rgba(59,130,246,0.12)',
                    }}
                  >
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
                      style={{ background: 'rgba(59,130,246,0.1)' }}>
                      <FileText size={40} className="text-blue-400" />
                    </div>
                    <h3 className="text-xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                      Download Lesson Material
                    </h3>
                    <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                      This lesson includes a downloadable resource. Click below to access the file.
                    </p>
                    <a
                      href={`/api/files/${current.lesson.fileId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        color: '#fff',
                        boxShadow: '0 8px 24px rgba(59,130,246,0.25)',
                      }}
                    >
                      <Download size={18} /> Download File
                    </a>
                  </div>
                )}

                {/* Article / Text lessons */}
                {!hasVideo && !hasFile && (
                  <div
                    className="p-8 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--accent)' }}>
                      Lesson Content
                    </h3>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                      {current.lesson.content || 'No content available for this lesson yet.'}
                    </div>
                  </div>
                )}

                {/* Prev / Next Navigation */}
                <div className="flex items-center justify-between pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {prevLesson ? (
                    <Link
                      href={`/courses/${id}/learn/${currentIndex - 1}`}
                      className="flex items-center gap-3 p-4 rounded-xl transition-all hover:bg-white/[0.03] group flex-1 mr-2"
                      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <ChevronLeft size={20} style={{ color: 'var(--text-muted)' }} className="group-hover:-translate-x-1 transition-transform" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>Previous</p>
                        <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{prevLesson.lesson.title}</p>
                      </div>
                    </Link>
                  ) : <div />}

                  {nextLesson ? (
                    <Link
                      href={`/courses/${id}/learn/${currentIndex + 1}`}
                      className="flex items-center gap-3 p-4 rounded-xl transition-all hover:bg-white/[0.03] group flex-1 ml-2 text-right justify-end"
                      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>Next</p>
                        <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{nextLesson.lesson.title}</p>
                      </div>
                      <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-xl text-right flex-1 ml-2"
                      style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5 text-green-500">🎉 Course Complete</p>
                        <p className="text-xs font-bold text-green-400">You&apos;ve reached the last lesson!</p>
                      </div>
                      <GraduationCap size={24} className="text-green-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar: Resources */}
              <div className="space-y-5">
                {/* Downloadable Resource Card */}
                {hasFile && hasVideo && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: 'linear-gradient(165deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))',
                      border: '1px solid rgba(59,130,246,0.15)',
                    }}
                  >
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText size={16} className="text-blue-400" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400">
                          Lesson Materials
                        </h3>
                      </div>
                      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                        Download the accompanying resource file for this lesson.
                      </p>
                      <a
                        href={`/api/files/${current.lesson.fileId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          color: '#fff',
                          boxShadow: '0 4px 16px rgba(59,130,246,0.2)',
                        }}
                      >
                        <Download size={16} /> Download
                      </a>
                      <p className="text-[9px] mt-3 flex items-center justify-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                        <ShieldCheck size={10} /> Secure • Enrollment verified
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Lesson Info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl p-5"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
                    About this lesson
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-glow)' }}>
                        <Clock size={16} style={{ color: 'var(--accent)' }} />
                      </div>
                      <div>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Duration</p>
                        <p className="text-sm font-bold">{current.lesson.duration || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.08)' }}>
                        {isCompleted ? <CheckCircle size={16} className="text-green-500" /> : <Play size={16} style={{ color: 'var(--text-muted)' }} />}
                      </div>
                      <div>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Status</p>
                        <p className={`text-sm font-bold ${isCompleted ? 'text-green-500' : ''}`}>
                          {isCompleted ? 'Completed' : 'In Progress'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,166,35,0.08)' }}>
                        <Layers size={16} style={{ color: 'var(--accent)' }} />
                      </div>
                      <div>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Module</p>
                        <p className="text-sm font-bold">{current.moduleName}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  {!isCompleted ? (
                    <button
                      onClick={() => handleComplete(current.lesson.title)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{ background: 'linear-gradient(135deg, var(--accent), #e8941a)', color: '#0a0a1a' }}
                    >
                      <CheckCircle size={16} /> Mark as Completed
                    </button>
                  ) : (
                    <div className="w-full py-3 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2"
                      style={{ background: 'rgba(34,197,94,0.08)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.12)' }}>
                      <CheckCircle size={16} /> Lesson Completed
                    </div>
                  )}

                  {nextLesson && (
                    <Link
                      href={`/courses/${id}/learn/${currentIndex + 1}`}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:bg-white/5"
                      style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}
                    >
                      Next Lesson <ChevronRight size={14} />
                    </Link>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
