'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Calendar, School, MapPin, Building2, Map,
  Save, Loader2, Camera, LogOut, Trash2, AlertTriangle, CheckCircle,
  BookOpen, Clock, GraduationCap, Shield, ChevronRight, Settings,
  BarChart3, History
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const SRI_LANKA_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Mullaitivu', 'Vavuniya', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
];

type TabId = 'overview' | 'courses' | 'settings';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    school: '',
    address: '',
    city: '',
    district: '',
  });

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  // Fetch profile
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        setProfile(data);
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth || '',
          school: data.school || '',
          address: data.address || '',
          city: data.city || '',
          district: data.district || '',
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  // Fetch enrollments
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/enrollments')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setEnrollments(data); })
      .catch(() => {});
  }, [status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/profile', { method: 'DELETE' });
      if (res.ok) {
        signOut({ callbackUrl: '/' });
      }
    } catch {}
    setDeleting(false);
  };

  const handleAvatarClick = () => avatarInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Convert to base64 for simple storage
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: base64 }),
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch {}
    };
    reader.readAsDataURL(file);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  if (!profile) return null;

  const firstName = form.name.split(' ')[0] || '';
  const lastName = form.name.split(' ').slice(1).join(' ') || '';
  const approvedEnrollments = enrollments.filter(e => e.status === 'approved');
  const memberSince = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A';

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'courses', label: 'My Courses', icon: <BookOpen size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ];

  return (
    <div className="min-h-screen py-8 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">

        {/* ─── Profile Header Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden mb-8"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, #0f0f2e 0%, #1a1a4e 30%, #0a0a2a 60%, #151540 100%)',
          }} />
          <div className="absolute inset-0 opacity-30" style={{
            background: 'radial-gradient(ellipse at 20% 50%, rgba(245,166,35,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.1) 0%, transparent 50%)',
          }} />

          <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden ring-4 ring-white/10 shadow-2xl">
                {profile.avatar ? (
                  <Image src={profile.avatar} alt="Avatar" width={112} height={112} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold"
                    style={{ background: 'linear-gradient(135deg, var(--accent), #e8941a)', color: '#0a0a1a' }}>
                    {(profile.name || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
                style={{ background: 'var(--accent)' }}>
                <Camera size={14} className="text-[#0a0a1a]" />
              </div>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-extrabold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                {profile.name || 'Student'}
              </h1>
              <p className="text-sm flex items-center justify-center md:justify-start gap-2 mb-4" style={{ color: 'var(--text-muted)' }}>
                <Mail size={14} /> {profile.email}
              </p>

              {/* Stats mini-bar */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: 'rgba(245,166,35,0.1)', color: 'var(--accent)' }}>
                  <BookOpen size={14} /> {approvedEnrollments.length} Courses
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: 'rgba(34,197,94,0.08)', color: '#22c55e' }}>
                  <Shield size={14} /> {profile.role}
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: 'rgba(59,130,246,0.08)', color: '#60a5fa' }}>
                  <Clock size={14} /> Member since {memberSince}
                </div>
              </div>
            </div>

            {/* Sign Out */}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </motion.div>

        {/* ─── Tab Navigation ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-1 p-1.5 rounded-2xl mb-8 overflow-x-auto"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap"
              style={{
                background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                color: activeTab === tab.id ? '#0a0a1a' : 'var(--text-muted)',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </motion.div>

        {/* ─── Tab Content ─── */}
        <AnimatePresence mode="wait">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Enrolled', value: enrollments.length, icon: <BookOpen size={20} />, color: 'var(--accent)', bg: 'rgba(245,166,35,0.08)' },
                  { label: 'Active', value: approvedEnrollments.length, icon: <CheckCircle size={20} />, color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
                  { label: 'Pending', value: enrollments.filter(e => e.status === 'pending').length, icon: <Clock size={20} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
                  { label: 'Completed', value: enrollments.filter(e => (e.completedLessons?.length || 0) > 0).length, icon: <GraduationCap size={20} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-5 rounded-2xl"
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: stat.bg, color: stat.color }}>
                      {stat.icon}
                    </div>
                    <p className="text-2xl font-extrabold mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>{stat.value}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Recent Enrollments */}
              <div className="rounded-2xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                  <h3 className="font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                    <History size={18} style={{ color: 'var(--accent)' }} /> Recent Activity
                  </h3>
                  <button onClick={() => setActiveTab('courses')} className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                    View All <ChevronRight size={14} />
                  </button>
                </div>
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {enrollments.length === 0 ? (
                    <div className="p-8 text-center">
                      <BookOpen size={32} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No courses enrolled yet.</p>
                      <Link href="/courses" className="text-xs font-bold mt-2 inline-block" style={{ color: 'var(--accent)' }}>
                        Browse Courses →
                      </Link>
                    </div>
                  ) : (
                    enrollments.slice(0, 5).map((enr, i) => (
                      <div key={i} className="px-5 py-4 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                            background: enr.status === 'approved' ? 'rgba(34,197,94,0.08)' : enr.status === 'pending' ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
                            color: enr.status === 'approved' ? '#22c55e' : enr.status === 'pending' ? '#f59e0b' : '#ef4444',
                          }}>
                            {enr.status === 'approved' ? <CheckCircle size={16} /> : <Clock size={16} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{enr.courseTitle || `Course`}</p>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              {enr.completedLessons?.length || 0} lessons completed
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md" style={{
                          background: enr.status === 'approved' ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
                          color: enr.status === 'approved' ? '#22c55e' : '#f59e0b',
                        }}>
                          {enr.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* COURSES TAB */}
          {activeTab === 'courses' && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {enrollments.length === 0 ? (
                <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                  <GraduationCap size={48} className="mx-auto mb-4 opacity-20" />
                  <h3 className="text-xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-display)' }}>No Courses Yet</h3>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Start your learning journey by enrolling in a course.</p>
                  <Link href="/courses" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, var(--accent), #e8941a)', color: '#0a0a1a' }}>
                    <BookOpen size={16} /> Browse Courses
                  </Link>
                </div>
              ) : (
                enrollments.map((enr, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl p-5 flex items-center justify-between"
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, var(--accent), #e8941a)' }}>
                        <BookOpen size={22} className="text-[#0a0a1a]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{enr.courseTitle || 'Course'}</h4>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {enr.completedLessons?.length || 0} lessons completed • {enr.status}
                        </p>
                      </div>
                    </div>
                    {enr.status === 'approved' && (
                      <Link
                        href={`/courses/${enr.courseId}`}
                        className="text-xs font-bold px-4 py-2 rounded-xl transition-all hover:scale-105"
                        style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid rgba(245,166,35,0.2)' }}
                      >
                        Continue →
                      </Link>
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Profile Settings Card */}
              <form onSubmit={handleSave}>
                <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                  <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
                    <h3 className="font-bold flex items-center gap-2 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                      <User size={18} style={{ color: 'var(--accent)' }} /> Profile Settings
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Update your personal information</p>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Name Row */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest mb-2 block flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                          <User size={12} /> First Name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setForm({ ...form, name: `${e.target.value} ${lastName}`.trim() })}
                          className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'var(--foreground)',
                          }}
                          onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-muted)' }}>
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setForm({ ...form, name: `${firstName} ${e.target.value}`.trim() })}
                          className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'var(--foreground)',
                          }}
                          onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                        />
                      </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest mb-2 block flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                          <Mail size={12} /> Email
                        </label>
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="w-full px-4 py-3 rounded-xl text-sm font-medium cursor-not-allowed opacity-50"
                          style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            color: 'var(--text-muted)',
                          }}
                        />
                        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Email cannot be changed</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest mb-2 block flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                          <Phone size={12} /> Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="07X XXXX XXX"
                          className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'var(--foreground)',
                          }}
                          onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                        />
                      </div>
                    </div>

                    {/* DOB & School */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest mb-2 block flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                          <Calendar size={12} /> Date of Birth
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={form.dateOfBirth}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'var(--foreground)',
                            colorScheme: 'dark',
                          }}
                          onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest mb-2 block flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                          <School size={12} /> School / Institute
                        </label>
                        <input
                          type="text"
                          name="school"
                          value={form.school}
                          onChange={handleChange}
                          placeholder="Your school or institute"
                          className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'var(--foreground)',
                          }}
                          onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest mb-2 block flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                        <MapPin size={12} /> Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Street address"
                        className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: 'var(--foreground)',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                      />
                    </div>

                    {/* City & District */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest mb-2 block flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                          <Building2 size={12} /> City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          placeholder="Your city"
                          className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'var(--foreground)',
                          }}
                          onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest mb-2 block flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                          <Map size={12} /> District
                        </label>
                        <select
                          name="district"
                          value={form.district}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none cursor-pointer appearance-none"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: form.district ? 'var(--foreground)' : 'var(--text-muted)',
                          }}
                          onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                        >
                          <option value="">Select district</option>
                          {SRI_LANKA_DISTRICTS.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Save button */}
                  <div className="px-6 py-4 flex items-center justify-end gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                    {saved && (
                      <motion.span
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xs font-bold flex items-center gap-1.5 text-green-400"
                      >
                        <CheckCircle size={14} /> Saved successfully
                      </motion.span>
                    )}
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, var(--accent), #e8941a)', color: '#0a0a1a' }}
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>

              {/* Danger Zone */}
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(239,68,68,0.15)' }}>
                <div className="px-6 py-4" style={{ background: 'rgba(239,68,68,0.04)', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                  <h3 className="font-bold flex items-center gap-2 text-red-400" style={{ fontFamily: 'var(--font-display)' }}>
                    <AlertTriangle size={18} /> Danger Zone
                  </h3>
                  <p className="text-[10px] text-red-400/60 mt-0.5">Irreversible actions. Proceed with caution.</p>
                </div>
                <div className="p-6" style={{ background: 'rgba(239,68,68,0.02)' }}>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-red-400">Delete Account</h4>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                      >
                        <Trash2 size={14} /> Delete Account
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
                          style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDelete}
                          disabled={deleting}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 disabled:opacity-60"
                          style={{ background: '#ef4444', color: '#fff' }}
                        >
                          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          Yes, Delete Forever
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
