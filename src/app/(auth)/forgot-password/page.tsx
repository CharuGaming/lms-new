'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ShieldCheck, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStep(2);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-2xl border"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
      >
        <div className="mb-8">
          <Link href="/login" className="flex items-center gap-2 text-xs mb-6 hover:underline" style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft size={14} /> Back to Login
          </Link>
          
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>Reset Password</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {step === 1 ? 'Enter your email to receive a verification code.' : 'Enter the code sent to your email and your new password.'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 rounded-xl text-sm bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {success ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-bold mb-2">Success!</h2>
            <p className="text-sm text-secondary">Your password has been reset. Redirecting to login...</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOtp}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none bg-background border"
                      style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  style={{ background: 'var(--accent)', color: '#0a0a1a' }}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Verification Code'}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleResetPassword}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>6-Digit Code</label>
                  <div className="relative">
                    <ShieldCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none bg-background border tracking-[0.5em] font-mono"
                      style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none bg-background border"
                      style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Confirm Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none bg-background border"
                      style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  style={{ background: 'var(--accent)', color: '#0a0a1a' }}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Reset Password'}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="w-full text-xs text-center py-2 hover:underline" 
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Request another code
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
