'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from '@/frontend/components/ThemeProvider';
import UserAvatar from '@/frontend/components/UserAvatar';
import {
  LayoutDashboard, BookOpen, Play, Users, Settings, LogOut,
  Sun, Moon, Menu, ChevronRight, PlusCircle, Video, FolderOpen,
  BookMarked, User, Loader2, GraduationCap, ShieldCheck, X
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isGuest = status === 'unauthenticated';
  const isLoading = status === 'loading';

  // Self-repair: Clear oversized cookies if they exist
  useEffect(() => {
    const checkCookies = () => {
      if (typeof document === 'undefined') return;
      
      // If the total cookie length is suspiciously large, it's likely the oversized session token
      if (document.cookie.length > 4000) {
        console.warn('Oversized cookie detected! Clearing session to fix connection errors...');
        // Force logout and clear cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        signOut({ callbackUrl: '/login' });
      }
    };
    checkCookies();
  }, [pathname]);

  useEffect(() => setMounted(true), []);

  const userRole = isGuest ? 'guest' : ((session?.user as any)?.role || 'student');
  const isAdmin = userRole === 'admin';
  const isTeacher = userRole === 'teacher';
  const isStudent = userRole === 'student';

  const navGroups = [
    {
      label: isAdmin ? 'Admin' : isTeacher ? 'Teacher' : isStudent ? 'Student' : 'Guest',
      icon: isAdmin ? <ShieldCheck size={14} /> : isTeacher ? <GraduationCap size={14} /> : <User size={14} />,
      items: [
        ...(isGuest ? [] : [{ href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> }]),
      ],
    },
    {
      label: 'Learn',
      icon: <BookOpen size={14} />,
      items: [
        { href: '/dashboard/live-classes', label: 'Live Sessions', icon: <Video size={17} /> },
        { href: '/dashboard/resources', label: 'Resources', icon: <FolderOpen size={17} /> },
        ...((isStudent || isGuest) ? [
          { href: '/courses', label: 'Browse Courses', icon: <BookOpen size={17} /> },
        ] : []),
        ...((isAdmin || isTeacher) ? [
          { href: '/dashboard/courses/new', label: 'Create Course', icon: <PlusCircle size={17} /> },
          { href: '/courses', label: 'All Courses', icon: <BookMarked size={17} /> },
        ] : []),
      ],
    },
    {
      label: 'Account',
      icon: <User size={14} />,
      items: [
        ...(isGuest ? [] : [{ href: '/profile', label: 'My Profile', icon: <User size={17} /> }]),
        ...(isAdmin ? [
          { href: '/dashboard/users', label: 'Manage Users', icon: <Users size={17} /> },
          { href: '/dashboard/settings', label: 'Settings', icon: <Settings size={17} /> },
        ] : []),
      ],
    },
  ].filter(g => g.items.length > 0);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const roleLabel = isGuest ? 'Guest' : isAdmin ? 'Admin' : isTeacher ? 'Teacher' : 'Student';
  const roleColor = isGuest ? '#64748b' : isAdmin ? '#ef4444' : isTeacher ? '#8b5cf6' : 'var(--primary)';
  const roleBg = isGuest ? 'rgba(100,116,139,0.12)' : isAdmin ? 'rgba(239,68,68,0.12)' : isTeacher ? 'rgba(139,92,246,0.12)' : 'var(--primary-light)';

  function SidebarContent() {
    return (
      <div
        className="h-full flex flex-col"
        style={{ background: 'var(--card-bg)', borderRight: '1px solid var(--border-subtle)' }}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center justify-between border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm"
              style={{ background: 'var(--primary)', boxShadow: '0 4px 12px var(--primary-glow)' }}
            >
              E
            </div>
            <div>
              <p className="font-black text-sm leading-none" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>TheEducator</p>
              <p className="text-[9px] font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>Learning Platform</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* User Card */}
        <div className="px-4 pt-4 pb-2">
          <div className="p-3 rounded-2xl flex items-center gap-3" style={{ background: 'var(--background)' }}>
            {!isGuest ? (
              <UserAvatar size={40} />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                style={{ background: '#64748b' }}
              >
                <User size={18} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate leading-tight" style={{ color: 'var(--foreground)' }}>
                {isGuest ? 'Welcome!' : session?.user?.name || 'User'}
              </p>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: roleBg, color: roleColor }}
              >
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Groups */}
        <div className="flex-1 py-2 overflow-y-auto px-3">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <p
                className="text-[9px] font-black uppercase tracking-[0.18em] px-3 mb-1.5 flex items-center gap-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {group.icon} {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                      style={{
                        background: active ? 'var(--primary)' : 'transparent',
                        color: active ? '#ffffff' : 'var(--text-secondary)',
                        boxShadow: active ? '0 4px 12px var(--primary-glow)' : 'none',
                      }}
                    >
                      <span className="shrink-0" style={{ opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {active && <ChevronRight size={13} className="opacity-70" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sign Out / Sign In */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          {isGuest ? (
            <Link
              href="/login"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-[var(--primary-light)]"
              style={{ color: 'var(--primary)' }}
            >
              <User size={17} />
              Log In to Portal
            </Link>
          ) : (
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-red-500/10"
              style={{ color: 'var(--text-secondary)' }}
            >
              <LogOut size={17} className="opacity-70" />
              Sign Out
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!mounted || isLoading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg"
            style={{ background: 'var(--primary)', boxShadow: '0 4px 20px var(--primary-glow)' }}
          >
            E
          </div>
          <Loader2 size={20} className="animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex" style={{ background: 'var(--background)' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-56 shrink-0 h-full">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[70] flex">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-60 h-full z-10">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Topbar */}
        <header
          className="flex items-center gap-4 px-5 h-[60px] shrink-0 border-b"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}
        >
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-all"
            style={{ color: 'var(--primary)', background: 'var(--primary-light)' }}
          >
            <Menu size={18} />
          </button>

          {/* Page title */}
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: 'var(--text-muted)' }}>
              {pathname === '/dashboard' ? 'Dashboard Overview'
                : pathname.includes('/courses/new') ? 'Create New Course'
                : pathname.includes('/courses') ? 'Course Manager'
                : pathname.includes('/users') ? 'User Management'
                : pathname.includes('/settings') ? 'Platform Settings'
                : pathname.includes('/profile') ? 'My Profile'
                : 'Dashboard'}
            </p>
          </div>

          {/* Theme + Notif + Avatar */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: 'var(--background)', color: 'var(--primary)', border: '1px solid var(--border)' }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>


            <Link
              href="/profile"
              className="transition-all hover:scale-105"
            >
              <UserAvatar size={36} />
            </Link>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
