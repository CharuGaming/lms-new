'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from './ThemeProvider';
import { Menu, X, Sun, Moon, LogOut, BookOpen, LayoutDashboard, User } from 'lucide-react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/courses', label: 'Courses' },
    { href: '/videos', label: 'Videos' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${
        scrolled ? 'w-[90%] md:w-[85%] shadow-2xl py-1' : 'w-[95%] md:w-[92%] shadow-xl py-2'
      }`}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backgroundColor: 'var(--glass)',
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        border: '1px solid var(--border)',
        borderRadius: '100px',
        maxWidth: '1200px',
      }}
    >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-14 md:h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl" style={{ fontFamily: 'var(--font-display)' }}>
          <span className="text-2xl" style={{ color: 'var(--accent)' }}>⬡</span>
          <span>TheEducator</span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:text-[var(--accent)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {session ? (
            <div className="hidden md:flex items-center gap-2">
              {(session.user as any)?.role === 'admin' || (session.user as any)?.role === 'teacher' ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all hover:-translate-y-0.5"
                  style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
              ) : null}
              <Link
                href="/profile"
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold transition-all hover:scale-110 hover:ring-2 hover:ring-[var(--accent)]/30"
                style={{ background: 'linear-gradient(135deg, var(--accent), #e8941a)', color: '#0a0a1a' }}
                title="My Profile"
              >
                {(session.user?.name || 'U')[0].toUpperCase()}
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full transition-all hover:-translate-y-0.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium rounded-full transition-all hover:-translate-y-0.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 text-sm font-bold rounded-full transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, var(--accent), #e8941a)', color: '#0a0a1a' }}
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="md:hidden fixed inset-4 top-[84px] p-8 flex flex-col items-center justify-center gap-6 z-40 shadow-2xl"
          style={{ background: 'var(--background)', borderRadius: '2rem', border: '1px solid var(--border)' }}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-xl font-medium hover:text-[var(--accent)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
          {session ? (
            <>
              <Link href="/profile" onClick={() => setOpen(false)} className="text-xl font-medium flex items-center gap-2">
                <User size={20} /> My Profile
              </Link>
              {((session.user as any)?.role === 'admin' || (session.user as any)?.role === 'teacher') && (
                <Link href="/dashboard" onClick={() => setOpen(false)} className="text-xl font-medium flex items-center gap-2">
                  <LayoutDashboard size={20} /> Dashboard
                </Link>
              )}
              <button onClick={() => { signOut(); setOpen(false); }} className="text-xl font-medium flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <LogOut size={20} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="text-xl font-medium">Log In</Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="px-8 py-3 text-lg font-bold rounded-full"
                style={{ background: 'linear-gradient(135deg, var(--accent), #e8941a)', color: '#0a0a1a' }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
