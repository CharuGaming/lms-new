'use client';
import { use, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, Users, Play, CheckCircle, Loader2, LogIn, Upload, Image as ImageIcon, Lock, Banknote, Download, FileText, ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react';
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
  const [checking, setChecking] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

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

  const handleEnrollFree = async () => {
    if (!session) {
      router.push('/login');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('courseId', id);
      const res = await fetch('/api/enrollments', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setEnrollmentStatus(data.status);
      }
    } catch (err) {
      console.error('Enrollment failed', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 60px)' }}>
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: 'calc(100vh - 60px)' }}>
        <BookOpen size={48} style={{ color: 'var(--text-muted)' }} />
        <p className="text-xl font-bold" style={{ color: 'var(--text-secondary)' }}>Course not found.</p>
        <Link href="/courses" className="px-6 py-2 rounded-xl text-sm font-bold text-white transition-all" style={{ background: 'var(--primary)' }}>
          Back to Courses
        </Link>
      </div>
    );
  }

  const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
  const progress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
  const isApproved = enrollmentStatus === 'approved';

  return (
    <div className="p-6 lg:p-8" style={{ minHeight: 'calc(100vh - 60px)' }}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation */}
        <Link 
          href="/courses" 
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[var(--primary)]"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={16} /> Back to Library
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-10">
          <div className="relative rounded-3xl overflow-hidden h-64 md:h-auto border" style={{ borderColor: 'var(--border-subtle)' }}>
            <Image 
              src={course.thumbnail || PLACEHOLDER_IMAGE} 
              alt={course.title} 
              fill 
              sizes="(max-width: 768px) 100vw, 50vw" 
              className="object-cover" 
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="inline-block w-fit text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg mb-4" 
              style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              {course.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
              {course.title}
            </h1>
            <p className="mb-8 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {course.description}
            </p>

            <div className="flex flex-wrap gap-4 text-sm font-semibold mb-8 pb-8 border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-subtle)' }}>
              <span className="flex items-center gap-1.5 p-2 rounded-xl" style={{ background: 'var(--card-bg)' }}>
                <BookOpen size={16} style={{ color: 'var(--primary)' }} /> {course.modules.length} Modules
              </span>
              <span className="flex items-center gap-1.5 p-2 rounded-xl" style={{ background: 'var(--card-bg)' }}>
                <Play size={16} style={{ color: 'var(--primary)' }} /> {totalLessons} Lessons
              </span>
              <span className="flex items-center gap-1.5 p-2 rounded-xl" style={{ background: 'var(--card-bg)' }}>
                <Users size={16} style={{ color: 'var(--primary)' }} /> {course.enrolledCount.toLocaleString()} Students
              </span>
            </div>

            {/* Progress bar */}
            {isApproved && (
              <div className="mb-8 p-5 rounded-2xl border flex flex-col gap-3 shadow-lg" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-subtle)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: 'var(--primary)' }} />
                    Your Progress
                  </span>
                  <span className="font-black" style={{ color: 'var(--primary)' }}>{progress}%</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--background)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'var(--primary)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Completed {completedLessons.length} out of {totalLessons} lessons
                </p>
              </div>
            )}

            {/* Action button / Status */}
            {checking ? (
              <button disabled className="w-full md:w-auto px-8 py-4 font-bold rounded-2xl flex items-center justify-center gap-2 opacity-60"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                <Loader2 size={18} className="animate-spin" /> Checking...
              </button>
            ) : enrollmentStatus === 'pending' ? (
              <div className="flex items-center gap-4 px-6 py-5 rounded-2xl" style={{ background: 'var(--card-bg)', border: '1px solid rgba(245,166,35,0.3)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(245,166,35,0.1)', color: '#f5a623' }}>
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm" style={{ color: '#f5a623' }}>Enrollment Review Pending</h4>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>We are verifying your receipt. You will get access shortly.</p>
                </div>
              </div>
            ) : enrollmentStatus === 'rejected' ? (
              <div className="flex items-center justify-between gap-4 px-6 py-5 rounded-2xl" style={{ background: 'var(--card-bg)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500/10 text-red-500">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-red-500">Enrollment Rejected</h4>
                    <p className="text-xs text-red-400 mt-0.5">Please contact support or re-upload your receipt.</p>
                  </div>
                </div>
                <button onClick={() => setEnrollmentStatus('none')} className="text-xs bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-xl transition-colors font-bold">Retry</button>
              </div>
            ) : isApproved ? (
              <div className="flex items-center gap-4 px-6 py-5 rounded-2xl" style={{ background: 'var(--card-bg)', border: '1px solid rgba(34,197,94,0.3)' }}>
                 <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500/10 text-green-500">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <span className="font-bold text-sm text-green-500 block">Enrolled Successfully</span>
                  <span className="text-xs text-green-600/70">You have full access to this course!</span>
                </div>
              </div>
            ) : session ? (
              <button
                onClick={() => {
                  if (course.price === 0) {
                    handleEnrollFree();
                  } else {
                    router.push(`/checkout/${course._id}`);
                  }
                }}
                className="w-full md:w-auto px-10 py-5 font-black text-[15px] rounded-2xl transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
                style={{ background: 'var(--primary)', color: '#ffffff', boxShadow: '0 8px 24px var(--primary-glow)' }}
              >
                {course.price === 0 ? 'Start Learning for Free' : `Enroll Now — LKR ${course.price.toLocaleString()}`}
                <ArrowRight size={18} />
              </button>
            ) : (
              <Link
                href="/login"
                className="w-full md:w-auto px-10 py-5 font-black text-[15px] rounded-2xl transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
                style={{ background: 'var(--primary)', color: '#ffffff', boxShadow: '0 8px 24px var(--primary-glow)' }}
              >
                <LogIn size={18} /> Sign In to Enroll
              </Link>
            )}
          </div>
        </motion.div>

        {/* Curriculum */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pt-8">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Course Curriculum</h2>
            <div className="h-px flex-1 ml-4" style={{ background: 'var(--border-subtle)' }} />
          </div>
          
          <div className="space-y-6">
            {(() => {
              let globalLessonIndex = 0;
              return course.modules.map((module, mi) => (
                <div key={mi} className="rounded-3xl overflow-hidden border shadow-sm transition-shadow hover:shadow-md" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
                  <div className="px-6 py-5 flex items-center justify-between border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--background)' }}>
                    <h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Module {mi + 1}: {module.title}</h3>
                    <span className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                      {module.lessons.length} lessons
                    </span>
                  </div>
                  
                  <div className="flex flex-col">
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
                          className="w-full px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-[var(--background)] group block"
                          style={{ 
                            borderBottom: li < module.lessons.length - 1 ? '1px solid var(--border-subtle)' : 'none', 
                            cursor: isApproved ? 'pointer' : 'not-allowed',
                            textDecoration: 'none',
                          }}
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                              style={{ 
                                background: isApproved ? (isCompleted ? 'rgba(34,197,94,0.1)' : 'var(--primary-light)') : 'var(--background)',
                                color: isApproved ? (isCompleted ? '#22c55e' : 'var(--primary)') : 'var(--text-muted)'
                              }}>
                              {isApproved ? (
                                isCompleted ? <CheckCircle size={20} /> : 
                                isFile ? <FileText size={18} /> :
                                <Play size={18} />
                              ) : (
                                <Lock size={18} />
                              )}
                            </div>

                            <div>
                              <span className="font-bold text-[15px] block mb-1 group-hover:text-[var(--primary)] transition-colors" 
                                style={{ color: isApproved ? 'var(--foreground)' : 'var(--text-muted)' }}>
                                {lesson.title}
                              </span>
                              
                              <div className="flex items-center gap-3">
                                <span className="text-[11px] font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                                  <Clock size={12} /> {lesson.duration || "10 mins"}
                                </span>
                                
                                {isFile && (
                                  <span className="text-[10px] flex items-center gap-1 font-bold px-2 py-0.5 rounded-md" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                    <FileText size={10} /> Document
                                  </span>
                                )}
                                
                                {lesson.type === 'video' && (
                                  <span className="text-[10px] flex items-center gap-1 font-bold px-2 py-0.5 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                                    <ShieldCheck size={10} /> Video
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {isApproved && (
                            <div className="hidden md:flex items-center gap-3 absolute right-6 md:relative md:right-0">
                              {isCompleted ? (
                                <div className="text-[10px] font-black uppercase tracking-widest text-[#22c55e] bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                  <CheckCircle size={14} /> Done
                                </div>
                              ) : (
                                <span className="text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" 
                                  style={{ background: 'var(--primary)', color: '#ffffff' }}>
                                  Play <ArrowRight size={14} />
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


