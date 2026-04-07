'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Play, TrendingUp, Users, Clock, BarChart3, Settings, PlusCircle, ArrowRight, Loader2, FileCheck, CheckCircle, XCircle, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '@/backend/lib/constants';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';

interface EnrollmentData {
  _id: string;
  courseId: string;
  userId: any;
  status: 'pending' | 'approved' | 'rejected';
  receiptUrl?: string;
  completedLessons: string[];
  enrolledAt: string;
}

interface CourseData {
  _id: string;
  title: string;
  thumbnail: string;
  price?: number;
  instructor?: string;
  modules: any[];
  enrolledCount: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Custom Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<{ id: string, title: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchData = async () => {
    try {
      const [enrRes, couRes] = await Promise.all([
        fetch('/api/enrollments'),
        fetch('/api/courses')
      ]);
      const [enrData, couData] = await Promise.all([
        enrRes.json(),
        couRes.json()
      ]);
      
      if (Array.isArray(enrData)) setEnrollments(enrData);
      if (Array.isArray(couData)) setCourses(couData);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch real data
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetchData();
  }, [status]);

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/enrollments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchData(); // Refresh list
      }
    } catch (e) {
      console.error(e);
    }
    setActionLoading(null);
  };

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const userRole = (session.user as any).role || 'student';
  const isAdmin = userRole === 'admin';
  const isTeacher = userRole === 'teacher';
  const canManageCourses = isAdmin || isTeacher;

  // Helper to find course by ID
  const getCourse = (id: string) => courses.find(c => c._id === id);

  // Calculate real stats
  const totalCompletedLessons = enrollments.reduce((a, e) => a + (e.completedLessons?.length || 0), 0);
  const totalLessonsInEnrolled = enrollments.reduce((a, e) => {
    const course = getCourse(e.courseId);
    return a + (course ? course.modules.reduce((b, m) => b + m.lessons.length, 0) : 0);
  }, 0);
  const overallProgress = totalLessonsInEnrolled > 0 ? Math.round((totalCompletedLessons / totalLessonsInEnrolled) * 100) : 0;

  const pendingEnrollments = enrollments.filter(e => e.status === 'pending');

  // Filter courses for teachers
  const displayCourses = isTeacher 
    ? courses.filter(c => c.instructor === (session.user as any).id)
    : courses;

  return (
    <div className="py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Welcome back, <span style={{ color: 'var(--accent)' }}>{session.user?.name}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isAdmin ? 'Manage your platform and track analytics.' : 
             isTeacher ? 'Manage your courses and track student progress.' : 
             'Continue your learning journey.'}
          </p>
          <span className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full" 
                style={{ 
                  background: isAdmin ? 'rgba(239,68,68,0.15)' : isTeacher ? 'rgba(59,130,246,0.15)' : 'var(--accent-glow)', 
                  color: isAdmin ? '#ef4444' : isTeacher ? '#3b82f6' : 'var(--accent)' 
                }}>
            {isAdmin ? '🛡️ Admin' : isTeacher ? '👨‍🏫 Teacher' : '🎓 Student'}
          </span>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          {(canManageCourses
            ? [
              ...(isAdmin ? [{ icon: <FileCheck size={20} />, num: pendingEnrollments.length, label: 'Pending Approvals' }] : []),
              { icon: <BookOpen size={20} />, num: displayCourses.length, label: 'Total Courses' },
              { icon: <Users size={20} />, num: displayCourses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0) + (isAdmin ? '1.2K' : ''), label: 'Total Students' },
              { icon: <TrendingUp size={20} />, num: isAdmin ? '4.8K' : displayCourses.reduce((acc, c) => acc + ((c.enrolledCount || 0) * (c.price || 0)), 0), label: 'Total Sales' },
            ]
            : [
              { icon: <BookOpen size={20} />, num: enrollments.length, label: 'Enrolled Courses' },
              { icon: <Play size={20} />, num: totalCompletedLessons, label: 'Lessons Done' },
              { icon: <Clock size={20} />, num: `${Math.round(totalCompletedLessons * 0.25)}h`, label: 'Learning Time' },
              { icon: <TrendingUp size={20} />, num: `${overallProgress}%`, label: 'Overall Progress' },
            ]
          ).map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl transition-all hover:-translate-y-1"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                {stat.icon}
              </div>
              <p className="text-2xl font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>{stat.num}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Admin: Pending Approvals */}
        {isAdmin && pendingEnrollments.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <FileCheck size={20} style={{ color: 'var(--accent)' }} /> Pending Enrollments
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {pendingEnrollments.map((enr) => {
                const course = getCourse(enr.courseId);
                return (
                  <div key={enr._id} className="p-5 rounded-2xl border flex flex-col gap-4" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-sm mb-1">{course?.title || 'Unknown Course'}</h3>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Student: <strong>{enr.userId?.name || 'Unknown'}</strong> ({enr.userId?.email})</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Date: {new Date(enr.enrolledAt).toLocaleDateString()}</p>
                      </div>
                      {enr.receiptUrl && (
                        <a href={enr.receiptUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border" style={{ background: 'var(--background)', color: 'var(--accent)', borderColor: 'var(--border)' }}>
                          <ExternalLink size={14} /> View Receipt
                        </a>
                      )}
                    </div>

                    <div className="flex gap-3 mt-auto pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                      <button
                        onClick={() => handleUpdateStatus(enr._id, 'approved')}
                        disabled={actionLoading === enr._id}
                        className="flex-1 py-2 rounded-xl text-xs font-bold flex justify-center items-center gap-2 disabled:opacity-50"
                        style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}
                      >
                        {actionLoading === enr._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Approve
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to reject this enrollment?')) {
                            handleUpdateStatus(enr._id, 'rejected');
                          }
                        }}
                        disabled={actionLoading === enr._id}
                        className="flex-1 py-2 rounded-xl text-xs font-bold flex justify-center items-center gap-2 disabled:opacity-50"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                      >
                        {actionLoading === enr._id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Admin/Teacher: Quick Actions */}
        {canManageCourses && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-10">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: <PlusCircle size={20} />, label: 'Create Course', desc: 'Add a new course with modules and lessons', href: '/dashboard/courses/new', show: true },
                { icon: <Users size={20} />, label: 'Manage Users', desc: 'View and manage student accounts', href: '/dashboard/users', show: isAdmin },
                { icon: <Settings size={20} />, label: 'Platform Settings', desc: 'Update site configuration and preferences', href: '/dashboard/settings', show: isAdmin },
              ].filter(a => a.show).map((action, i) => (
                <Link href={action.href} key={i} className="p-5 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg block" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>{action.icon}</div>
                  <h3 className="font-bold text-sm">{action.label}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{action.desc}</p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Enrolled Courses */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              {canManageCourses ? (isAdmin ? 'All Courses' : 'My Courses') : 'My Enrolled Courses'}
            </h2>
            <Link href="/courses" className="text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--accent)' }}>
              {canManageCourses ? 'Manage' : 'Browse More'} <ArrowRight size={14} />
            </Link>
          </div>

          {!canManageCourses && enrollments.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <BookOpen size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>No Courses Yet</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Start exploring our course catalog and enroll in your first course!</p>
              <Link href="/courses" className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-full transition-all hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, var(--accent), #e8941a)', color: '#0a0a1a' }}>
                <BookOpen size={16} /> Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(canManageCourses ? displayCourses : enrollments.map((e) => {
                const c = getCourse(e.courseId);
                return c ? { ...c, _completed: e.completedLessons, _status: e.status } : null;
              }).filter(Boolean)).map((item: any, i) => {
                const course = item;
                const totalLessons = course.modules?.reduce((a: number, m: any) => a + m.lessons.length, 0) || 0;
                const completedCount = canManageCourses ? totalLessons : (item._completed?.length || 0);
                const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

                return (
                  <div
                    key={i}
                    className="rounded-2xl overflow-hidden transition-all hover:-translate-y-2 hover:shadow-xl group relative"
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
                  >
                    {/* Navigation Wrapper for Image */}
                    <Link href={canManageCourses ? `/dashboard/courses/${course._id}` : `/courses/${course._id}`} className="block relative h-36 overflow-hidden">
                      <Image src={course.thumbnail || PLACEHOLDER_IMAGE} alt={course.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      {!isAdmin && item._status === 'pending' && (
                        <div className="absolute top-2 right-2 bg-yellow-500/90 text-yellow-950 text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm shadow-lg flex items-center gap-1">
                          <Clock size={12} /> Pending
                        </div>
                      )}
                    </Link>

                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2 text-sm">
                        {/* Navigation Wrapper for Title */}
                        <Link href={canManageCourses ? `/dashboard/courses/${course._id}` : `/courses/${course._id}`} className="block flex-1 group-hover:text-[var(--accent)] transition-colors">
                          <h3 className="font-bold mb-2 pr-2" style={{ fontFamily: 'var(--font-display)' }}>{course.title}</h3>
                        </Link>
                        
                        {canManageCourses && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCourseToDelete({ id: course._id, title: course.title });
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                            title="Delete Course"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                        <span>{totalLessons} lessons</span>
                        <span>{course.enrolledCount?.toLocaleString()} students</span>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: 'var(--text-muted)' }}>{canManageCourses ? 'Total Lessons' : 'Progress'}</span>
                          <span className="font-bold" style={{ color: progress === 100 ? '#22c55e' : 'var(--accent)' }}>{progress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--background)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: progress === 100 ? '#22c55e' : 'var(--accent)' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          if (!courseToDelete) return;
          setActionLoading(courseToDelete.id);
          try {
            const res = await fetch(`/api/courses/${courseToDelete.id}`, { method: 'DELETE' });
            if (res.ok) {
              fetchData();
              setIsDeleteModalOpen(false);
            }
          } catch (err) {
            console.error(err);
          }
          setActionLoading(null);
        }}
        loading={actionLoading === courseToDelete?.id}
        title="Delete Course?"
        message={`This will permanently delete "${courseToDelete?.title}". All student enrollments for this course will be affected.`}
      />
    </div>
  );
}
