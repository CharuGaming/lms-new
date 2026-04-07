'use client';
import { use, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, Users, Play, CheckCircle, Loader2, LogIn, Upload, Image as ImageIcon, Lock, Banknote, Download, FileText, ShieldCheck } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PLACEHOLDER_IMAGE } from '@/backend/lib/constants';

function getYouTubeId(url: string | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : (url.length === 11 ? url : null);
}

interface Lesson {
  title: string;
  type?: string;
  videoId?: string;
  fileId?: string;
  videoUrl?: string;
  pdfUrl?: string;
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
  price: number;
  instructor: string;
  modules: Module[];
  enrolledCount: number;
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [enrolling, setEnrolling] = useState(false);
  const [checking, setChecking] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // Form states
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch course data
  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data._id) setCourse(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch course', err);
        setLoading(false);
      });
  }, [id]);

  // Check enrollment status
  useEffect(() => {
    if (!session || !id) {
      setChecking(false);
      return;
    }
    fetch('/api/enrollments')
      .then((r) => r.json())
      .then((enrollments) => {
        const match = enrollments.find?.((e: any) => e.courseId === id);
        if (match) {
          setEnrollmentStatus(match.status || 'approved');
          setCompletedLessons(match.completedLessons || []);
        }
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [session, id]);

  const handleEnroll = async () => {
    if (!session) {
      router.push('/login');
      return;
    }
    if (!receipt && course?.price! > 0) return;

    setEnrolling(true);
    try {
      const formData = new FormData();
      formData.append('courseId', id);
      if (receipt) formData.append('receipt', receipt);

      const res = await fetch('/api/enrollments', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setEnrollmentStatus(data.status);
        setShowEnrollForm(false);
      }
    } catch (err) {
      console.error('Enrollment failed', err);
    }
    setEnrolling(false);
  };

  const handleCompleteLesson = async (lessonTitle: string) => {
    if (enrollmentStatus !== 'approved') return;
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: id, lessonId: lessonTitle }),
      });
      if (res.ok) {
        setCompletedLessons((prev) => [...new Set([...prev, lessonTitle])]);
      }
    } catch (err) {
      console.error('Progress update failed', err);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl" style={{ color: 'var(--text-muted)' }}>Course not found.</p>
      </div>
    );
  }

  const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
  const progress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
  const isApproved = enrollmentStatus === 'approved';

  return (
    <div className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-10 mb-16">
          <div className="relative rounded-2xl overflow-hidden h-64 md:h-auto shadow-2xl">
            <Image src={course.thumbnail || PLACEHOLDER_IMAGE} alt={course.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="inline-block w-fit text-xs font-semibold px-3 py-1 rounded-full mb-3" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
              {course.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ fontFamily: 'var(--font-display)' }}>{course.title}</h1>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{course.description}</p>

            <div className="flex flex-wrap gap-4 text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1"><BookOpen size={14} /> {course.modules.length} Modules</span>
              <span className="flex items-center gap-1"><Play size={14} /> {totalLessons} Lessons</span>
              <span className="flex items-center gap-1"><Users size={14} /> {course.enrolledCount.toLocaleString()} Students</span>
            </div>

            {/* Progress bar */}
            {isApproved && (
              <div className="mb-6 p-4 rounded-2xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                <div className="flex justify-between text-xs mb-2">
                  <span style={{ color: 'var(--text-muted)' }}>Your Progress</span>
                  <span className="font-bold" style={{ color: 'var(--accent)' }}>{progress}%</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--background)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, var(--accent), #e8941a)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <p className="text-[10px] mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                  {completedLessons.length} of {totalLessons} lessons completed
                </p>
              </div>
            )}

            {/* Action button / Status */}
            {checking ? (
              <button disabled className="w-full md:w-auto px-8 py-3.5 font-bold rounded-full flex items-center justify-center gap-2 opacity-60"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                <Loader2 size={18} className="animate-spin" /> Checking...
              </button>
            ) : enrollmentStatus === 'pending' ? (
              <div className="flex items-center gap-3 px-6 py-4 rounded-xl" style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}>
                <Clock size={20} style={{ color: 'var(--accent)' }} />
                <div>
                  <h4 className="font-bold text-sm" style={{ color: 'var(--accent)' }}>Enrollment Pending</h4>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Your receipt is being reviewed. You will get access soon.</p>
                </div>
              </div>
            ) : enrollmentStatus === 'rejected' ? (
              <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div className="flex items-center gap-2 font-bold text-red-500 text-sm mb-1">
                  <Lock size={16} /> Enrollment Rejected
                </div>
                <p className="text-xs text-red-400">Please contact support or re-upload your receipt.</p>
                <button onClick={() => setEnrollmentStatus('none')} className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full mt-3 font-bold">Try Again</button>
              </div>
            ) : isApproved ? (
              <div className="flex items-center gap-3 px-6 py-3.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <CheckCircle size={20} className="text-green-500" />
                <span className="font-bold text-green-500">Enrolled & Approved</span>
              </div>
            ) : session ? (
              <button
                onClick={() => {
                  if (course.price === 0) {
                    handleEnroll();
                  } else {
                    router.push(`/checkout/${course._id}`);
                  }
                }}
                className="w-full md:w-auto px-8 py-3.5 font-bold rounded-full transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-xl shadow-accent/20"
                style={{ background: 'linear-gradient(135deg, var(--accent), #e8941a)', color: '#0a0a1a' }}
              >
                {course.price === 0 ? 'Enroll Now (Free)' : `Enroll Now — LKR ${course.price.toLocaleString()}`}
              </button>
            ) : (
              <Link
                href="/login"
                className="w-full md:w-auto px-8 py-3.5 font-bold rounded-full transition-all hover:-translate-y-0.5 text-center inline-flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, var(--accent), #e8941a)', color: '#0a0a1a' }}
              >
                <LogIn size={18} /> Sign In to Enroll
              </Link>
            )}
          </div>
        </motion.div>

        {/* Curriculum */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-extrabold mb-8" style={{ fontFamily: 'var(--font-display)' }}>Course Curriculum</h2>
          <div className="space-y-4">
            {(() => {
              let globalLessonIndex = 0;
              return course.modules.map((module, mi) => (
                <div key={mi} className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                  <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <h3 className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>{module.title}</h3>
                    <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ background: 'var(--background)', color: 'var(--text-muted)' }}>{module.lessons.length} lessons</span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    {module.lessons.map((lesson, li) => {
                      const currentGlobalIndex = globalLessonIndex++;
                      const isCompleted = completedLessons.includes(lesson.title);
                      const isFile = lesson.type === 'file' || (lesson.fileId && lesson.type !== 'video');
                      
                      const LessonWrapper = isApproved ? Link : 'div';
                      const wrapperProps = isApproved 
                        ? { href: `/courses/${id}/learn/${currentGlobalIndex}` } 
                        : {};

                      return (
                        <LessonWrapper
                          key={li}
                          {...wrapperProps as any}
                          className="w-full px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-white/[0.03] text-left group/lesson block"
                          style={{ 
                            borderBottom: li < module.lessons.length - 1 ? '1px solid var(--border)' : 'none', 
                            background: isCompleted ? 'rgba(34,197,94,0.03)' : 'transparent', 
                            opacity: isApproved ? 1 : 0.6,
                            cursor: isApproved ? 'pointer' : 'not-allowed',
                            textDecoration: 'none',
                            color: 'inherit',
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              {isApproved ? (
                                isCompleted ? <CheckCircle size={20} className="text-green-500" /> : 
                                isFile ? <FileText size={18} style={{ color: 'var(--accent)' }} /> :
                                <Play size={18} style={{ color: 'var(--accent)' }} />
                              ) : (
                                <Lock size={18} style={{ color: 'var(--text-muted)' }} />
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-sm block mb-1">{lesson.title}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] flex items-center gap-1 opacity-50"><Clock size={10} /> {lesson.duration}</span>
                                {isFile && (
                                  <span className="text-[10px] flex items-center gap-1 font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa' }}>
                                    <FileText size={10} /> PDF
                                  </span>
                                )}
                                {lesson.type === 'video' && (
                                  <span className="text-[10px] flex items-center gap-1 font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171' }}>
                                    <ShieldCheck size={10} /> Protected
                                  </span>
                                )}
                                {!isApproved && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded tracking-widest" style={{ background: 'var(--background)', color: 'var(--text-muted)' }}>Locked</span>}
                              </div>
                            </div>
                          </div>
                          
                          {isApproved && (
                            <div className="flex items-center gap-3">
                              {isCompleted ? (
                                <div className="text-[10px] font-bold uppercase tracking-widest text-green-500 bg-green-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                  <CheckCircle size={12} /> Completed
                                </div>
                              ) : (
                                <span className="text-xs font-bold px-4 py-2 rounded-xl" style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid rgba(245,166,35,0.2)' }}>
                                  Open Lesson →
                                </span>
                              )}
                            </div>
                          )}
                        </LessonWrapper>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
