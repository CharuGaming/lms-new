'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from './ThemeProvider';
import { Menu, X, LogOut, LayoutDashboard, User, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserAvatar from './UserAvatar';

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
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
        scrolled ? 'w-[90%] md:w-[85%] shadow-xl py-1' : 'w-[95%] md:w-[92%] shadow-md py-2'
      }`}
      style={{
        background: theme === 'dark' ? 'rgba(9, 14, 26, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        border: theme === 'dark' ? '1px solid rgba(1, 69, 242, 0.2)' : '1px solid rgba(1, 69, 242, 0.1)',
        borderRadius: '100px',
        maxWidth: '1200px',
        boxShadow: scrolled
          ? '0 8px 32px rgba(1, 69, 242, 0.12)'
          : '0 2px 16px rgba(1, 69, 242, 0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-14 md:h-16">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
            style={{ background: 'var(--primary)' }}
          >
            E
          </div>
          <span style={{ color: 'var(--foreground)' }}>TheEducator</span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="px-4 py-2 text-sm font-medium rounded-full transition-all hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-border)' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {session ? (
            <div className="hidden md:flex items-center gap-2">
              {(session.user as any)?.role === 'admin' || (session.user as any)?.role === 'teacher' ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all hover:bg-[var(--primary-light)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
              ) : null}
              <Link
                href="/profile"
                className="transition-all hover:scale-110 hover:shadow-lg rounded-full"
                title="My Profile"
              >
                <UserAvatar size={36} />
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full transition-all hover:bg-[var(--primary-light)]"
                style={{ color: 'var(--text-muted)' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium rounded-full transition-all hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 text-sm font-bold rounded-full text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: 'var(--primary)', boxShadow: '0 2px 16px var(--primary-glow)' }}
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full transition-all hover:bg-[var(--primary-light)]"
            aria-label="Toggle menu"
            style={{ color: 'var(--primary)' }}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div
          className="md:hidden fixed inset-4 top-[84px] p-8 flex flex-col items-center justify-center gap-6 z-40 shadow-2xl"
          style={{
            background: 'var(--card-bg)',
            backdropFilter: 'blur(20px)',
            borderRadius: '2rem',
            border: '1px solid var(--border)',
          }}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-xl font-medium transition-colors hover:text-[var(--primary)]"
              style={{ color: 'var(--foreground)' }}
            >
              {l.label}
            </Link>
          ))}
          {session ? (
            <>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="text-xl font-medium flex items-center gap-2"
                style={{ color: 'var(--foreground)' }}
              >
                <User size={20} /> My Profile
              </Link>
              {((session.user as any)?.role === 'admin' || (session.user as any)?.role === 'teacher') && (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="text-xl font-medium flex items-center gap-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  <LayoutDashboard size={20} /> Dashboard
                </Link>
              )}
              <button
                onClick={() => { signOut(); setOpen(false); }}
                className="text-xl font-medium flex items-center gap-2"
                style={{ color: 'var(--text-muted)' }}
              >
                <LogOut size={20} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-xl font-medium"
                style={{ color: 'var(--foreground)' }}
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="px-8 py-3 text-lg font-bold rounded-full text-white"
                style={{ background: 'var(--primary)', boxShadow: '0 4px 20px var(--primary-glow)' }}
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
