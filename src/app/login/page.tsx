'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle, Loader2, Info } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await signIn('credentials', { email, password, redirect: false });

    if (res?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  const fillAdmin = () => {
    setEmail('admin@educator.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-2xl"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
            <LogIn size={24} />
          </div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>Welcome Back</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Sign in to continue learning</p>
        </div>

        {/* Demo credentials hint */}
        <div className="flex items-start gap-2 p-3 mb-4 rounded-xl text-xs" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: 'var(--text-secondary)' }}>
          <Info size={14} className="mt-0.5 shrink-0" style={{ color: '#6366f1' }} />
          <div>
            <p>Demo admin: <button onClick={fillAdmin} className="font-semibold underline" style={{ color: '#6366f1' }}>admin@educator.com / admin123</button></p>
            <p className="mt-0.5">Or <Link href="/register" className="font-semibold underline" style={{ color: 'var(--accent)' }}>create a student account</Link></p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl text-sm bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <div className="flex justify-end mt-1">
              <Link href="/forgot-password" className="text-xs font-medium hover:underline px-1" style={{ color: 'var(--accent)' }}>
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 font-bold rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, var(--accent), #e8941a)', color: '#0a0a1a' }}
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold" style={{ color: 'var(--accent)' }}>Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
}
