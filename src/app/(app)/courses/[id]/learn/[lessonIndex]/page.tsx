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
  const [activeTab, setActiveTab] = useState('Overview');

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
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  if (!course || !current) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--background)' }}>
        <p className="text-xl" style={{ color: 'var(--text-muted)' }}>Lesson not found.</p>
        <Link href={`/courses/${id}`} className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--primary)' }}>
          <ArrowLeft size={16} /> Back to Course
        </Link>
      </div>
    );
  }

  if (enrollmentStatus !== 'approved') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6" style={{ background: 'var(--background)' }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(1,69,242,0.1)' }}>
          <Lock size={36} style={{ color: 'var(--primary)' }} />
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
          style={{ background: 'var(--primary)', color: 'white', boxShadow: '0 4px 12px var(--primary-glow)' }}
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
    <div className="min-h-screen pt-12 pb-24 transition-colors duration-300" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 flex flex-col xl:flex-row gap-10">
        
        {/* ─── Left Column (Main Content) ─── */}
        <div className="flex-1 min-w-0">
          {/* Top navigation */}
          <Link
            href={`/dashboard`}
            className="inline-flex items-center gap-2 text-sm font-semibold mb-6 transition-colors hover:text-white"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>

          <h1 className="text-3xl lg:text-4xl font-extrabold mb-8" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            {course.title}
          </h1>

          {/* Video Player Area */}
          <div className="w-full rounded-2xl overflow-hidden shadow-2xl mb-8" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
            {hasVideo && (
              tokenLoading ? (
                <div className="w-full aspect-video flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--primary)' }} />
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Securing video access…</span>
                  </div>
                </div>
              ) : videoToken ? (
                <VideoPlayer
                  token={videoToken}
                  title={current.lesson.title}
                  onComplete={() => handleComplete(current.lesson.title)}
                />
              ) : (
                <div className="w-full aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <ShieldCheck size={48} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm opacity-60" style={{ color: 'var(--text-muted)' }}>Video could not be loaded. Try refreshing.</p>
                  </div>
                </div>
              )
            )}
            {!hasVideo && (
              <div className="w-full aspect-video flex items-center justify-center bg-gradient-to-br from-[#0c0c24] to-[#050510]">
                <div className="text-center p-8">
                  {hasFile ? <FileText size={64} className="mx-auto mb-6 text-blue-500 opacity-80" /> : <BookOpen size={64} className="mx-auto mb-6 text-purple-500 opacity-80" />}
                  <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>{current.lesson.title}</h3>
                  <p className="max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>{hasFile ? 'This lesson contains a downloadable resource.' : 'This is a text-based lesson.'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Lesson Title */}
          <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-white" style={{ fontFamily: 'var(--font-display)' }}>
            {String(currentIndex + 1).padStart(2, '0')}. {current.lesson.title}
          </h2>

          {/* Tabs */}
          <div className="flex border-b mb-8 overflow-x-auto no-scrollbar" style={{ borderColor: 'var(--border-subtle)' }}>
             {['Overview', 'Useful materials', 'Comments', 'Lecturer'].map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`pb-4 px-2 mr-8 text-sm font-bold border-b-2 transition-colors relative whitespace-nowrap outline-none ${activeTab === tab ? 'border-[var(--primary)]' : 'border-transparent hover:opacity-80'}`}
                 style={{ color: activeTab === tab ? 'var(--foreground)' : 'var(--text-muted)' }}
               >
                 {tab}
                 {activeTab === tab && (
                   <motion.div layoutId="tab-indicator" className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-[var(--primary)] shadow-[0_0_8px_var(--primary-glow)]" />
                 )}
               </button>
             ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
              {activeTab === 'Overview' && (
                  <div className="space-y-6">
                     <p className="text-[15px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                       {current.lesson.content || 'No detailed overview provided for this lesson.'}
                     </p>
                  </div>
              )}
              {activeTab === 'Useful materials' && (
                  <div className="space-y-6">
                     {hasFile ? (
                       <div className="p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6" style={{ background: 'var(--primary-light)', border: '1px solid var(--border-subtle)' }}>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)' }}>
                              <FileText size={24} className="text-blue-500" />
                            </div>
                            <div>
                              <h4 className="font-bold mb-1" style={{ color: 'var(--foreground)' }}>Lesson Resource</h4>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Download the associated file</p>
                            </div>
                          </div>
                          <a href={`/api/files/${current.lesson.fileId}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 text-white" style={{ background: 'var(--primary)', boxShadow: '0 4px 12px var(--primary-glow)' }}>
                            <Download size={16} /> Download
                          </a>
                       </div>
                     ) : (
                       <p className="text-[15px]" style={{ color: 'var(--text-muted)' }}>No additional materials for this lesson.</p>
                     )}
                  </div>
              )}

              {activeTab === 'Comments' && (
                <p className="text-[15px]" style={{ color: 'var(--text-muted)' }}>Comments section coming soon.</p>
              )}

              {activeTab === 'Lecturer' && (
               <div className="flex items-center gap-4 p-6 rounded-2xl w-max" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
                 <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center text-white font-bold text-2xl uppercase">
                   {course.instructor.charAt(0)}
                 </div>
                 <div>
                   <h4 className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>{course.instructor}</h4>
                   <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Course Instructor</p>
                 </div>
               </div>
              )}
          </div>

        </div>

        {/* ─── Right Column (Syllabus List) ─── */}
        <div className="w-full xl:w-[460px] flex-shrink-0">
          <div className="sticky top-8">
            
            {/* Progress Header */}
            <div className="flex items-end justify-between mb-3 px-2">
               <div className="text-[13px] font-bold tracking-wide" style={{ color: 'var(--foreground)' }}>
                 <span>{completedLessons.length}/{totalLessons}</span> <span className="font-medium ml-1" style={{ color: 'var(--text-muted)' }}>completed</span>
               </div>
               <GraduationCap size={18} style={{ color: 'var(--text-muted)' }} />
            </div>

            {/* Segmented Progress Bar */}
            <div className="flex gap-[3px] mb-8 px-2">
               {allLessons.map((l, i) => {
                 const isDone = completedLessons.includes(l.lesson.title);
                 return (
                   <div key={i} className={`h-1 flex-1 rounded-full transition-all ${isDone ? 'bg-[var(--primary)] shadow-[0_0_8px_var(--primary-glow)]' : ''}`} 
                        style={{ background: isDone ? 'var(--primary)' : 'var(--border-subtle)' }} />
                 );
               })}
            </div>

            {/* Syllabus List */}
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar pr-2 space-y-1 pb-10">
              {allLessons.map((item, i) => {
                const isActive = i === currentIndex;
                const isDone = completedLessons.includes(item.lesson.title);
                
                return (
                  <div key={i}>
                    {/* Module Header if it's the first lesson in the module */}
                    {item.lessonIndex === 0 && (
                      <h4 className="text-[11px] font-bold uppercase tracking-widest mt-8 mb-3 px-4" style={{ color: 'var(--text-muted)' }}>
                        {item.moduleName}
                      </h4>
                    )}
                    
                    <Link
                      href={`/courses/${id}/learn/${i}`}
                      className={`flex items-center gap-4 p-3 rounded-2xl transition-all group ${isActive ? 'ring-1 ring-[var(--primary)]/30' : ''}`}
                      style={{ 
                        background: isActive ? 'var(--primary-light)' : 'transparent',
                        border: '1px solid transparent'
                      }}
                    >
                      {/* Thumbnail Placeholder */}
                      <div className="relative w-28 h-[4.5rem] rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/5 shadow-md">
                        <img 
                          src={course.thumbnail} 
                          alt="Thumbnail" 
                          className={`w-full h-full object-cover transition-all duration-500 ${isActive ? 'opacity-90 scale-105' : 'opacity-50 group-hover:opacity-100'}`}
                        />
                        {/* Overlay Icons */}
                        <div className="absolute inset-0 flex items-center justify-center">
                           {isDone ? (
                             <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                               <CheckCircle size={14} className="text-white drop-shadow-md" />
                             </div>
                           ) : isActive ? (
                             <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-[0_0_15px_var(--primary-glow)] border border-white/20">
                               <Play size={14} className="text-white ml-0.5" fill="white" />
                             </div>
                           ) : <Play size={18} className="text-white/40 group-hover:text-white transition-colors" />}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 py-1">
                        <h4 className={`text-sm font-bold mb-1 leading-snug line-clamp-2 transition-colors`}
                            style={{ color: isActive ? 'var(--primary)' : 'var(--foreground)' }}>
                          {String(item.lessonIndex + 1).padStart(2, '0')}. {item.lesson.title}
                        </h4>
                        
                        <div className="flex items-center text-xs gap-3 font-medium" style={{ color: 'var(--text-muted)' }}>
                           {item.lesson.type === 'file' || item.lesson.fileId ? (
                             <span className="flex items-center gap-1 text-blue-400">
                               <FileText size={12} /> External File
                             </span>
                           ) : (
                             <span className="flex items-center gap-1">
                               Video
                             </span>
                           )}
                           {item.lesson.duration && (
                             <>
                               <span className="w-1 h-1 rounded-full bg-white/20"></span>
                               <span>{item.lesson.duration}</span>
                             </>
                           )}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
              
              {/* Mark Complete Flow */}
              <div className="mt-8 pt-6 border-t px-2 space-y-3" style={{ borderColor: 'var(--border-subtle)' }}>
                 {!isCompleted && enrollmentStatus === 'approved' && (
                    <button
                      onClick={() => handleComplete(current.lesson.title)}
                      className="w-full py-4 rounded-xl font-bold text-sm bg-[var(--primary)] text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      style={{ boxShadow: '0 4px 20px var(--primary-glow)' }}
                    >
                      <CheckCircle size={18} /> Mark as Completed
                    </button>
                 )}
                 {nextLesson && (
                    <Link
                      href={`/courses/${id}/learn/${currentIndex + 1}`}
                      className="w-full py-4 rounded-xl font-bold text-sm border flex items-center justify-center gap-2 transition-all hover:bg-[var(--primary-light)]"
                      style={{ color: 'var(--foreground)', borderColor: 'var(--border-subtle)' }}
                    >
                      Next Lesson <ChevronRight size={18} />
                    </Link>
                 )}
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
