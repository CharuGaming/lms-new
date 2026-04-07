'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle2, Loader2, Phone, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Fill details, 2: Verify email OTP
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [school, setSchool] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [otpSending, setOtpSending] = useState(false);

  const SRI_LANKA_DISTRICTS = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Mullaitivu', 'Vavuniya', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Monaragala', 'Ratnapura', 'Kegalle'
  ];

  // Step 1: Send verification code to email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Name, Email and Password are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setOtpSending(true);

    try {
      const res = await fetch('/api/auth/register/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStep(2);
      } else {
        setError(data.error || 'Failed to send verification code');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  // Step 2: Verify OTP and create account
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, password, otp,
          phone, school, address, city, district, dateOfBirth
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Auto sign-in after registration
      const signInRes = await signIn('credentials', { email, password, redirect: false });
      if (signInRes?.ok) {
        router.push('/dashboard');
      } else {
        setTimeout(() => router.push('/login'), 1500);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError('');
    setOtpSending(true);
    try {
      const res = await fetch('/api/auth/register/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to resend code');
      }
    } catch {
      setError('Failed to resend. Please try again.');
    } finally {
      setOtpSending(false);
    }
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
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: success ? 'rgba(34,197,94,0.15)' : step === 2 ? 'rgba(99,102,241,0.15)' : 'var(--accent-glow)', color: success ? '#22c55e' : step === 2 ? '#6366f1' : 'var(--accent)' }}>
            {success ? <CheckCircle2 size={24} /> : step === 2 ? <ShieldCheck size={24} /> : <UserPlus size={24} />}
          </div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>
            {success ? 'Account Created!' : step === 2 ? 'Verify Your Email' : 'Create Account'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {success ? 'Signing you in...' : step === 2 ? `We sent a 6-digit code to ${email}` : 'Start your learning journey today'}
          </p>

          {/* Step indicator */}
          {!success && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="flex items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${step >= 1 ? 'text-[#0a0a1a]' : 'text-white/30'}`} style={{ background: step >= 1 ? 'var(--accent)' : 'rgba(255,255,255,0.1)' }}>1</div>
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: step >= 1 ? 'var(--accent)' : 'var(--text-muted)' }}>Details</span>
              </div>
              <div className="w-8 h-px" style={{ background: step >= 2 ? 'var(--accent)' : 'var(--border)' }} />
              <div className="flex items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${step >= 2 ? 'text-[#0a0a1a]' : 'text-white/30'}`} style={{ background: step >= 2 ? 'var(--accent)' : 'rgba(255,255,255,0.1)' }}>2</div>
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: step >= 2 ? 'var(--accent)' : 'var(--text-muted)' }}>Verify</span>
              </div>
            </div>
          )}
        </div>

        {success ? (
          <div className="flex flex-col items-center py-4">
            <Loader2 size={24} className="animate-spin mb-2" style={{ color: 'var(--accent)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="flex items-center gap-2 p-3 mb-6 rounded-xl text-sm bg-red-500/10 text-red-400 border border-red-500/20">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSendOtp}
                  className="space-y-6"
                >
                  {/* Account Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest px-1 opacity-50" style={{ color: 'var(--text-muted)' }}>Account Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-70" style={{ color: 'var(--text-muted)' }}>Full Name *</label>
                        <div className="relative">
                          <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                          <input
                            type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:border-[var(--accent)]"
                            style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-70" style={{ color: 'var(--text-muted)' }}>Email Address *</label>
                        <div className="relative">
                          <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                          <input
                            type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:border-[var(--accent)]"
                            style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-70" style={{ color: 'var(--text-muted)' }}>Password *</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                        <input
                          type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:border-[var(--accent)]"
                          style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Personal Details Section */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest px-1 opacity-50" style={{ color: 'var(--text-muted)' }}>Personal Details (Optional)</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-70" style={{ color: 'var(--text-muted)' }}>Phone Number</label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                          <input
                            type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07X XXXX XXX"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:border-[var(--accent)]"
                            style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-70" style={{ color: 'var(--text-muted)' }}>Date of Birth</label>
                        <div className="relative">
                          <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                          <input
                            type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:border-[var(--accent)]"
                            style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)', colorScheme: 'dark' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-70" style={{ color: 'var(--text-muted)' }}>School / Institute</label>
                      <div className="relative">
                        <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                        <input
                          type="text" value={school} onChange={(e) => setSchool(e.target.value)} placeholder="School or University"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:border-[var(--accent)]"
                          style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-70" style={{ color: 'var(--text-muted)' }}>Address</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                        <input
                          type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:border-[var(--accent)]"
                          style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-70" style={{ color: 'var(--text-muted)' }}>City</label>
                        <input
                          type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Your city"
                          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:border-[var(--accent)]"
                          style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-70" style={{ color: 'var(--text-muted)' }}>District</label>
                        <select
                          value={district} onChange={(e) => setDistrict(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:border-[var(--accent)] appearance-none cursor-pointer"
                          style={{ background: 'var(--background)', border: '1px solid var(--border)', color: district ? 'var(--foreground)' : 'var(--text-muted)' }}
                        >
                          <option value="">Select district</option>
                          {SRI_LANKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit" disabled={otpSending}
                      className="w-full py-3.5 font-bold rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, var(--accent), #e8941a)', color: '#0a0a1a' }}
                    >
                      {otpSending ? <><Loader2 size={18} className="animate-spin" /> Verifying Email...</> : <><ArrowRight size={18} /> Verify Email & Continue</>}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                    <p>📧 A 6-digit verification code was sent to <strong className="text-white">{email}</strong>. Check your inbox (and spam folder).</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Verification Code</label>
                    <div className="relative">
                      <ShieldCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 6-digit code"
                        required
                        className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm outline-none bg-background border tracking-[0.5em] font-mono text-center text-lg"
                        style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit" disabled={loading || otp.length !== 6}
                    className="w-full py-3.5 font-bold rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, var(--accent), #e8941a)', color: '#0a0a1a' }}
                  >
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Creating Account...</> : <><CheckCircle2 size={18} /> Create Account</>}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => { setStep(1); setOtp(''); setError(''); }}
                      className="hover:underline"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      ← Change details
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpSending}
                      className="hover:underline flex items-center gap-1"
                      style={{ color: 'var(--accent)' }}
                    >
                      {otpSending ? <Loader2 size={12} className="animate-spin" /> : null}
                      Resend code
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <p className="text-center text-sm mt-8" style={{ color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link href="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>Sign In</Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
