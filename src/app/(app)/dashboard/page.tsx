'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen, Play, TrendingUp, Users, Clock, Settings,
  PlusCircle, ArrowRight, Loader2, FileCheck, CheckCircle,
  XCircle, ExternalLink, Trash2, BarChart3, Megaphone, Video, FolderOpen
} from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '@/backend/lib/constants';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import AnnouncementSection from '@/frontend/components/AnnouncementSection';

interface EnrollmentData {
  _id: string; courseId: string; userId: any;
  status: 'pending' | 'approved' | 'rejected';
  receiptUrl?: string; completedLessons: string[]; enrolledAt: string;
}
interface CourseData {
  _id: string; title: string; thumbnail: string;
  price?: number; instructor?: string; modules: any[]; enrolledCount: number;
}

const QUOTES = [
  '"The secret of success is constancy to purpose." — Benjamin Disraeli',
  '"Live as if you were to die tomorrow. Learn as if you were to live forever." — Gandhi',
  '"Education is the most powerful weapon you can use to change the world." — Nelson Mandela',
];

function StatCard({ icon, value, label, color = 'var(--primary)', delay = 0 }: {
  icon: React.ReactNode; value: string | number; label: string; color?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-5 rounded-2xl flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: `${color}18`, color }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black leading-none" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>{value}</p>
        <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string } | null>(null);

  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchData = async () => {
    try {
      const [enrRes, couRes] = await Promise.all([fetch('/api/enrollments'), fetch('/api/courses')]);
      const [enrData, couData] = await Promise.all([enrRes.json(), couRes.json()]);
      if (Array.isArray(enrData)) setEnrollments(enrData);
      if (Array.isArray(couData)) setCourses(couData);
    } catch (err) { console.error('Failed to fetch dashboard data', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (status !== 'authenticated') return; fetchData(); }, [status]);

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/enrollments/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchData();
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 60px)' }}>
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }
  if (!session) return null;

  const userRole = (session.user as any).role || 'student';
  const isAdmin = userRole === 'admin';
  const isTeacher = userRole === 'teacher';
  const canManage = isAdmin || isTeacher;
  const getCourse = (id: string) => courses.find(c => c._id === id);

  const totalCompleted = enrollments.reduce((a, e) => a + (e.completedLessons?.length || 0), 0);
  const totalLessons = enrollments.reduce((a, e) => {
    const c = getCourse(e.courseId);
    return a + (c ? c.modules.reduce((b, m) => b + m.lessons.length, 0) : 0);
  }, 0);
  const progress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;
  const pendingEnrollments = enrollments.filter(e => e.status === 'pending');
  const displayCourses = isTeacher ? courses.filter(c => c.instructor === (session.user as any).id) : courses;

  return (
    <div className="p-6 lg:p-8" style={{ minHeight: 'calc(100vh - 60px)' }}>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-8"
          style={{ background: 'linear-gradient(135deg, #0145F2 0%, #0136cc 60%, #0128a8 100%)' }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10" style={{ background: '#fff' }} />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full opacity-10" style={{ background: '#fff' }} />

          <div className="relative z-10 flex items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="text-xs font-black px-3 py-1 rounded-full"
                  style={{
                    background: isAdmin ? 'rgba(239,68,68,0.25)' : isTeacher ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.2)',
                    color: '#fff',
                  }}
                >
                  {isAdmin ? '🛡️ Admin' : isTeacher ? '👨‍🏫 Teacher' : '🎓 Student'}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Hello, {session.user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-white/70 text-sm leading-relaxed max-w-md mb-5">
                {quote}
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}
              >
                <BookOpen size={15} />
                {canManage ? 'Manage Courses' : 'Browse All Courses'}
              </Link>
            </div>

            {/* Right: SVG Illustration */}
            <div className="hidden md:block shrink-0">
              <svg viewBox="0 0 160 160" className="w-32 h-32 md:w-40 md:h-40" fill="none">
                <circle cx="80" cy="80" r="65" fill="white" fillOpacity={0.08} />
                <circle cx="80" cy="80" r="45" fill="white" fillOpacity={0.1} />
                {/* Book */}
                <rect x="45" y="55" width="70" height="75" rx="8" fill="white" fillOpacity={0.88} />
                <rect x="45" y="55" width="35" height="75" rx="8" fill="white" />
                <line x1="80" y1="55" x2="80" y2="130" stroke="#0145F2" strokeOpacity={0.4} strokeWidth={1.5} />
                <rect x="52" y="70" width="18" height="3.5" rx="1.5" fill="#0145F2" fillOpacity={0.4} />
                <rect x="52" y="79" width="14" height="3" rx="1.5" fill="#0145F2" fillOpacity={0.3} />
                <rect x="52" y="87" width="16" height="3" rx="1.5" fill="#0145F2" fillOpacity={0.3} />
                <rect x="88" y="70" width="18" height="3.5" rx="1.5" fill="#0145F2" fillOpacity={0.4} />
                <rect x="88" y="79" width="14" height="3" rx="1.5" fill="#0145F2" fillOpacity={0.3} />
                <circle cx="80" cy="45" r="14" fill="white" fillOpacity={0.88} />
                <circle cx="80" cy="45" r="8" fill="#0145F2" fillOpacity={0.7} />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {canManage ? (
            <>
              {isAdmin && <StatCard icon={<FileCheck size={22} />} value={pendingEnrollments.length} label="Pending Approvals" color="#f59e0b" delay={0.05} />}
              <StatCard icon={<BookOpen size={22} />} value={displayCourses.length} label="Total Courses" delay={0.1} />
              <StatCard icon={<Users size={22} />} value={displayCourses.reduce((a, c) => a + (c.enrolledCount || 0), 0)} label="Total Students" color="#8b5cf6" delay={0.15} />
              <StatCard icon={<BarChart3 size={22} />} value={isAdmin ? '4.8K' : displayCourses.reduce((acc, c) => acc + ((c.enrolledCount || 0) * (c.price || 0)), 0)} label="Total Revenue" color="#22c55e" delay={0.2} />
            </>
          ) : (
            <>
              <StatCard icon={<BookOpen size={22} />} value={enrollments.length} label="Enrolled Courses" delay={0.05} />
              <StatCard icon={<Play size={22} />} value={totalCompleted} label="Lessons Completed" color="#8b5cf6" delay={0.1} />
              <StatCard icon={<Clock size={22} />} value={`${Math.round(totalCompleted * 0.25)}h`} label="Learning Time" color="#f59e0b" delay={0.15} />
              <StatCard icon={<TrendingUp size={22} />} value={`${progress}%`} label="Overall Progress" color="#22c55e" delay={0.2} />
            </>
          )}
        </div>
        
        {/* ── Live Classes & Announcements (Student/Teacher) ── */}
        {!isAdmin && (
          <div className="space-y-8">
            <AnnouncementSection />
          </div>
        )}

        {/* ── Admin: Pending Approvals ── */}
        {isAdmin && pendingEnrollments.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                  <FileCheck size={16} />
                </span>
                Pending Enrollments
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                  {pendingEnrollments.length}
                </span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {pendingEnrollments.map((enr) => {
                const course = getCourse(enr.courseId);
                return (
                  <div key={enr._id} className="p-5 rounded-2xl flex flex-col gap-4"
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate mb-1" style={{ color: 'var(--foreground)' }}>{course?.title || 'Unknown Course'}</h3>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Student: <strong style={{ color: 'var(--foreground)' }}>{enr.userId?.name || 'Unknown'}</strong> · {enr.userId?.email}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {new Date(enr.enrolledAt).toLocaleDateString()}
                        </p>
                      </div>
                      {enr.receiptUrl && (
                        <a href={enr.receiptUrl} target="_blank" rel="noopener noreferrer"
                          className="shrink-0 flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                          style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-border)' }}>
                          <ExternalLink size={12} /> Receipt
                        </a>
                      )}
                    </div>
                    <div className="flex gap-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                      <button onClick={() => handleUpdateStatus(enr._id, 'approved')} disabled={actionLoading === enr._id}
                        className="flex-1 py-2 rounded-xl text-xs font-bold flex justify-center items-center gap-1.5 disabled:opacity-50 transition-all"
                        style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                        {actionLoading === enr._id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />} Approve
                      </button>
                      <button onClick={() => { if (confirm('Reject this enrollment?')) handleUpdateStatus(enr._id, 'rejected'); }}
                        disabled={actionLoading === enr._id}
                        className="flex-1 py-2 rounded-xl text-xs font-bold flex justify-center items-center gap-1.5 disabled:opacity-50 transition-all"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                        {actionLoading === enr._id ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />} Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Quick Actions (admin/teacher) ── */}
        {canManage && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-lg font-black mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <Settings size={16} />
              </span>
              Quick Actions
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: <PlusCircle size={20} />, label: 'Create Course', desc: 'Add a new course with modules & lessons', href: '/dashboard/courses/new', show: true },
                { icon: <Video size={20} />, label: 'Manage Live Classes', desc: 'Manage Zoom & Meet links', href: '/dashboard/live-classes', show: isAdmin },
                { icon: <Users size={20} />, label: 'Manage Users', desc: 'View and manage student accounts', href: '/dashboard/users', show: isAdmin },
                { icon: <Megaphone size={20} />, label: 'Manage Notices', desc: 'Broadcast news to all students', href: '/dashboard/notices', show: isAdmin },
                { icon: <FolderOpen size={20} />, label: 'Manage Resources', desc: 'Upload papers & study materials', href: '/dashboard/resources', show: isAdmin },
                { icon: <Settings size={20} />, label: 'Platform Settings', desc: 'Update site configuration', href: '/dashboard/settings', show: isAdmin },
              ].filter(a => a.show).map((action, i) => (
                <Link key={i} href={action.href}
                  className="group p-5 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg block"
                  style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all group-hover:scale-110"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    {action.icon}
                  </div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--foreground)' }}>{action.label}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{action.desc}</p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Courses Section ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <BookOpen size={16} />
              </span>
              {canManage ? (isAdmin ? 'All Courses' : 'My Courses') : 'My Enrolled Courses'}
            </h2>
            <Link href="/courses" className="text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-full transition-all hover:scale-105"
              style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-border)' }}>
              {canManage ? 'Manage' : 'Browse More'} <ArrowRight size={13} />
            </Link>
          </div>

          {!canManage && enrollments.length === 0 ? (
            <div className="text-center py-16 rounded-3xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <BookOpen size={32} />
              </div>
              <h3 className="font-black text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>No Courses Yet</h3>
              <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Start exploring our course catalog and enroll in your first course!
              </p>
              <Link href="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-full text-white transition-all hover:-translate-y-0.5"
                style={{ background: 'var(--primary)', boxShadow: '0 6px 20px var(--primary-glow)' }}>
                <BookOpen size={16} /> Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(canManage ? displayCourses : enrollments.map(e => {
                const c = getCourse(e.courseId);
                return c ? { ...c, _completed: e.completedLessons, _status: e.status } : null;
              }).filter(Boolean)).map((item: any, i) => {
                const totalL = item.modules?.reduce((a: number, m: any) => a + m.lessons.length, 0) || 0;
                const completed = canManage ? totalL : (item._completed?.length || 0);
                const prog = totalL > 0 ? Math.round((completed / totalL) * 100) : 0;

                return (
                  <div key={i} className="rounded-2xl overflow-hidden transition-all hover:-translate-y-2 hover:shadow-xl group"
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
                    <Link href={canManage ? `/dashboard/courses/${item._id}` : `/courses/${item._id}`}
                      className="block relative h-[140px] overflow-hidden">
                      <Image src={item.thumbnail || PLACEHOLDER_IMAGE} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      {/* Status badge */}
                      {!canManage && item._status === 'pending' && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black backdrop-blur-sm"
                          style={{ background: 'rgba(245,158,11,0.9)', color: '#000' }}>
                          ⏳ Pending
                        </div>
                      )}
                      {/* Progress overlay at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div className="h-full transition-all" style={{ width: `${prog}%`, background: prog === 100 ? '#22c55e' : 'var(--primary)' }} />
                      </div>
                    </Link>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Link href={canManage ? `/dashboard/courses/${item._id}` : `/courses/${item._id}`} className="flex-1">
                          <h3 className="font-bold text-sm leading-tight group-hover:text-[var(--primary)] transition-colors line-clamp-2"
                            style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>
                            {item.title}
                          </h3>
                        </Link>
                        {canManage && (
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCourseToDelete({ id: item._id, title: item.title }); setIsDeleteModalOpen(true); }}
                            className="shrink-0 p-1.5 rounded-lg transition-colors hover:bg-red-500/10" title="Delete Course">
                            <Trash2 size={14} style={{ color: '#ef4444' }} />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] mt-3" style={{ color: 'var(--text-muted)' }}>
                        <span>{totalL} lessons</span>
                        <span className="font-bold" style={{ color: prog === 100 ? '#22c55e' : 'var(--primary)' }}>{prog}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full mt-1.5 overflow-hidden" style={{ background: 'var(--background)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${prog}%`, background: prog === 100 ? '#22c55e' : 'var(--primary)' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          if (!courseToDelete) return;
          setActionLoading(courseToDelete.id);
          try {
            const res = await fetch(`/api/courses/${courseToDelete.id}`, { method: 'DELETE' });
            if (res.ok) { fetchData(); setIsDeleteModalOpen(false); }
          } catch (err) { console.error(err); }
          setActionLoading(null);
        }}
        loading={actionLoading === courseToDelete?.id}
        title="Delete Course?"
        message={`This will permanently delete "${courseToDelete?.title}". All student enrollments will be affected.`}
      />
    </div>
  );
}
