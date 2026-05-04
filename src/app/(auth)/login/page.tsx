'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2, Info, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.error) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex overflow-hidden">
      {/* ── Left: Electric Blue Branding Panel ── */}
      <div
        className="hidden lg:flex flex-col w-[44%] relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0145F2 0%, #0136cc 60%, #0128a8 100%)' }}
      >
        {/* Decorative circles */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full" 
          style={{ background: '#ffffff' }} 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.12, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 -right-16 w-48 h-48 rounded-full" 
          style={{ background: '#ffffff' }} 
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.12, 0.08] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-20 left-1/4 w-56 h-56 rounded-full" 
          style={{ background: '#ffffff' }} 
        />

        {/* Logo */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-black text-base border border-white/30">
              E
            </div>
            <span className="font-black text-white text-lg tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              TheEducator
            </span>
          </div>
        </div>

        {/* Centre content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 -mt-12">
          {/* Isolated 3D Student Character */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -10, 0] 
            }}
            transition={{
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              duration: 1,
              ease: "easeOut"
            }}
            className="relative w-72 h-72 md:w-80 md:h-80 mb-12 flex items-center justify-center"
          >
            {/* Soft background glow/circle */}
            <div className="absolute inset-4 rounded-full bg-white opacity-10 blur-2xl" />
            <div className="absolute inset-0 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm shadow-2xl" />
            
            <img 
              src="/images/login-3d-model.png" 
              alt="Student Character" 
              className="relative z-10 w-[90%] h-[90%] object-contain rounded-full drop-shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
              style={{ objectPosition: 'center bottom' }}
            />
          </motion.div>

          <h2 className="text-3xl font-black text-white text-center leading-tight mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Welcome back to<br />TheEducator 👋
          </h2>
          <p className="text-white/60 text-sm text-center leading-relaxed max-w-xs">
            "The secret of success is constancy to purpose."
            <br /><span className="text-white/40 text-xs">— Benjamin Disraeli</span>
          </p>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10 p-10 pt-0">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {['S', 'K', 'A'].map((l, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-[#0145F2] bg-white/20 text-white text-[10px] font-bold flex items-center justify-center">
                  {l}
                </div>
              ))}
            </div>
            <p className="text-white/60 text-xs">500+ students learning today</p>
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto px-6 py-8" style={{ background: 'var(--background)' }}>
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black" style={{ background: 'var(--primary)' }}>E</div>
            <span className="font-black text-lg" style={{ fontFamily: 'var(--font-display)' }}>TheEducator</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
              Sign in to your account
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-bold" style={{ color: 'var(--primary)' }}>Register here</Link>
            </p>
          </div>

          {/* Demo hint */}
          <div
            className="flex items-start gap-2.5 p-3.5 mb-6 rounded-2xl text-xs"
            style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)' }}
          >
            <Info size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--primary)' }} />
            <div style={{ color: 'var(--primary)' }}>
              Demo admin:{' '}
              <button
                onClick={() => { setEmail('admin@educator.com'); setPassword('admin123'); }}
                className="font-bold underline decoration-dotted underline-offset-2"
              >
                Click to auto-fill credentials
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3.5 mb-5 rounded-2xl text-sm border"
              style={{ background: 'rgba(239,68,68,0.06)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
              <AlertCircle size={15} className="shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3.5 rounded-2xl text-sm transition-all outline-none"
                style={{
                  background: 'var(--card-bg)',
                  border: '1.5px solid var(--border-subtle)',
                  color: 'var(--foreground)',
                }}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3.5 rounded-2xl text-sm transition-all outline-none pr-12"
                  style={{
                    background: 'var(--card-bg)',
                    border: '1.5px solid var(--border-subtle)',
                    color: 'var(--foreground)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100 opacity-50"
                  style={{ color: 'var(--foreground)' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all hover:-translate-y-0.5 disabled:opacity-55 flex items-center justify-center gap-2 mt-2"
              style={{
                background: 'var(--primary)',
                boxShadow: '0 6px 24px var(--primary-glow)',
              }}
            >
              {loading ? <><Loader2 size={17} className="animate-spin" /> Signing in...</> : 'Sign In →'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
