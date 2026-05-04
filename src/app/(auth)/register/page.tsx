'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Mail, Lock, User, AlertCircle, CheckCircle2,
  Loader2, Phone, Calendar, ShieldCheck, ArrowRight, Eye, EyeOff
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) { setError('Name, Email and Password are required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setOtpSending(true);
    try {
      const res = await fetch('/api/auth/register/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) { setStep(2); } else { setError(data.error || 'Failed to send verification code'); }
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setOtpSending(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length !== 6) { setError('Please enter the 6-digit verification code'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, otp, phone, school, address, city, district, dateOfBirth }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return; }
      setSuccess(true);
      const signInRes = await signIn('credentials', { email, password, redirect: false });
      if (signInRes?.ok) { router.push('/dashboard'); } else { setTimeout(() => router.push('/login'), 1500); }
    } catch { setError('Something went wrong. Please try again.'); setLoading(false); }
  };

  const handleResendOtp = async () => {
    setError(''); setOtpSending(true);
    try {
      const res = await fetch('/api/auth/register/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Failed to resend code');
    } catch { setError('Failed to resend. Please try again.'); }
    finally { setOtpSending(false); }
  };

  const inputStyle = {
    background: 'var(--card-bg)',
    border: '1.5px solid var(--border-subtle)',
    color: 'var(--foreground)',
  };

  const InputField = ({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) => (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex overflow-hidden">
      {/* ── Left: Blue Panel ── */}
      <div
        className="hidden lg:flex flex-col w-[40%] relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0145F2 0%, #0136cc 60%, #0128a8 100%)' }}
      >
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full opacity-10" style={{ background: '#ffffff' }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#ffffff' }} />

        {/* Logo */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-black border border-white/30">E</div>
            <span className="font-black text-white text-lg" style={{ fontFamily: 'var(--font-display)' }}>TheEducator</span>
          </div>
        </div>

        {/* Centre */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 -mt-4">
          {/* Illustration */}
          <svg viewBox="0 0 260 260" className="w-52 h-52 mb-8" fill="none">
            {/* Mortarboard */}
            <polygon points="130,60 180,90 130,110 80,90" fill="white" fillOpacity={0.9} />
            <rect x="172" y="90" width="4" height="30" rx="2" fill="white" fillOpacity={0.7} />
            <circle cx="174" cy="122" r="6" fill="white" fillOpacity={0.8} />
            {/* Body */}
            <path d="M95 120 Q95 105 115 105 L145 105 Q165 105 165 120 L165 175 Q165 185 155 185 L105 185 Q95 185 95 175 Z" fill="white" fillOpacity={0.85} />
            {/* Arms */}
            <path d="M95 130 Q70 135 65 155" stroke="white" strokeOpacity={0.8} strokeWidth={10} strokeLinecap="round" />
            <path d="M165 130 Q190 135 195 155" stroke="white" strokeOpacity={0.8} strokeWidth={10} strokeLinecap="round" />
            {/* Certificate in hand */}
            <rect x="55" y="148" width="32" height="24" rx="4" fill="white" fillOpacity={0.9} />
            <rect x="59" y="153" width="20" height="2.5" rx="1" fill="#0145F2" fillOpacity={0.6} />
            <rect x="59" y="158" width="16" height="2" rx="1" fill="#0145F2" fillOpacity={0.4} />
            <rect x="59" y="162" width="18" height="2" rx="1" fill="#0145F2" fillOpacity={0.4} />
            {/* Star */}
            <polygon points="210,75 213,85 224,85 215,91 218,101 210,95 202,101 205,91 196,85 207,85" fill="white" fillOpacity={0.7} />
            <circle cx="45" cy="100" r="5" fill="white" fillOpacity={0.5} />
            <circle cx="220" cy="120" r="3" fill="white" fillOpacity={0.4} />
          </svg>

          <h2 className="text-2xl font-black text-white text-center leading-tight mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            Start Your<br />Learning Journey 🎓
          </h2>
          <p className="text-white/60 text-sm text-center leading-relaxed max-w-xs">
            Join thousands of students mastering new skills every day.
          </p>

          {/* Step pills */}
          <div className="flex items-center gap-3 mt-8">
            {[{ n: 1, label: 'Details' }, { n: 2, label: 'Verify' }].map(({ n, label }) => (
              <div
                key={n}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all"
                style={{
                  background: step >= n ? 'white' : 'rgba(255,255,255,0.15)',
                  color: step >= n ? 'var(--primary)' : 'rgba(255,255,255,0.6)',
                }}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black"
                  style={{ background: step >= n ? 'var(--primary)' : 'rgba(255,255,255,0.3)', color: 'white' }}>
                  {n}
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 p-10 pt-0">
          <p className="text-white/40 text-xs">© 2026 TheEducator. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--background)' }}>
        <div className="min-h-full flex items-center justify-center px-6 py-8">
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[440px]"
          >
            {/* Mobile logo */}
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black" style={{ background: 'var(--primary)' }}>E</div>
              <span className="font-black text-lg" style={{ fontFamily: 'var(--font-display)' }}>TheEducator</span>
            </div>

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                {success ? 'Account Created! 🎉' : step === 2 ? 'Verify Your Email' : 'Create Free Account'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {success ? 'Redirecting to your dashboard...'
                  : step === 2 ? `We sent a 6-digit code to ${email}`
                  : <>Already have an account? <Link href="/login" className="font-bold" style={{ color: 'var(--primary)' }}>Sign in</Link></>}
              </p>
            </div>

            {/* Mobile step indicator */}
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              {[1, 2].map(n => (
                <div key={n} className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{ background: step >= n ? 'var(--primary)' : 'var(--border)', color: step >= n ? '#fff' : 'var(--text-muted)' }}>
                    {n}
                  </div>
                  {n < 2 && <div className="w-8 h-0.5" style={{ background: step >= 2 ? 'var(--primary)' : 'var(--border)' }} />}
                </div>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3.5 mb-5 rounded-2xl text-sm border"
                style={{ background: 'rgba(239,68,68,0.06)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                <AlertCircle size={15} className="shrink-0" /> {error}
              </div>
            )}

            {success ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                  <CheckCircle2 size={32} />
                </div>
                <Loader2 size={20} className="animate-spin" style={{ color: 'var(--primary)' }} />
                <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Taking you to dashboard...</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {/* ── STEP 1: Details ── */}
                {step === 1 && (
                  <motion.form
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSendOtp}
                    className="space-y-4"
                  >
                    {/* Account info */}
                    <div className="p-4 rounded-2xl space-y-4" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
                      <p className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>Account Information</p>
                      <div className="grid grid-cols-2 gap-3">
                        <InputField label="Full Name *">
                          <div className="relative">
                            <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
                          </div>
                        </InputField>
                        <InputField label="Email *">
                          <div className="relative">
                            <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
                          </div>
                        </InputField>
                      </div>
                      <InputField label="Password *">
                        <div className="relative">
                          <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                          <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 6 characters" required minLength={6}
                            className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
                          <button type="button" onClick={() => setShowPw(!showPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100" style={{ color: 'var(--foreground)' }}>
                            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </InputField>
                    </div>

                    {/* Personal details */}
                    <div className="p-4 rounded-2xl space-y-4" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
                      <p className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>Personal Details <span className="normal-case font-medium">(optional)</span></p>
                      <div className="grid grid-cols-2 gap-3">
                        <InputField label="Phone">
                          <div className="relative">
                            <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07X XXX XXXX"
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
                          </div>
                        </InputField>
                        <InputField label="Date of Birth">
                          <div className="relative">
                            <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                            <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)}
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none" style={{ ...inputStyle, colorScheme: 'dark' }} />
                          </div>
                        </InputField>
                      </div>
                      <InputField label="School / Institute">
                        <input type="text" value={school} onChange={(e) => setSchool(e.target.value)} placeholder="School or University"
                          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
                      </InputField>
                      <div className="grid grid-cols-2 gap-3">
                        <InputField label="City">
                          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City"
                            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
                        </InputField>
                        <InputField label="District">
                          <select value={district} onChange={(e) => setDistrict(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer" style={inputStyle}>
                            <option value="">Select</option>
                            {SRI_LANKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </InputField>
                      </div>
                    </div>

                    <button type="submit" disabled={otpSending}
                      className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all hover:-translate-y-0.5 disabled:opacity-55 flex items-center justify-center gap-2"
                      style={{ background: 'var(--primary)', boxShadow: '0 6px 24px var(--primary-glow)' }}>
                      {otpSending ? <><Loader2 size={17} className="animate-spin" /> Sending Code...</> : <><ArrowRight size={17} /> Continue &amp; Verify Email</>}
                    </button>
                  </motion.form>
                )}

                {/* ── STEP 2: OTP ── */}
                {step === 2 && (
                  <motion.form
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div className="p-4 rounded-2xl text-sm" style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)', color: 'var(--primary)' }}>
                      📧 A 6-digit code was sent to <strong>{email}</strong>. Check your inbox and spam folder.
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                        Verification Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="0  0  0  0  0  0"
                        required
                        autoFocus
                        className="w-full px-6 py-4 rounded-2xl text-center text-2xl font-black outline-none tracking-[0.5em] font-mono"
                        style={{ ...inputStyle, letterSpacing: '0.5em' }}
                      />
                    </div>

                    <button type="submit" disabled={loading || otp.length !== 6}
                      className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all hover:-translate-y-0.5 disabled:opacity-55 flex items-center justify-center gap-2"
                      style={{ background: 'var(--primary)', boxShadow: '0 6px 24px var(--primary-glow)' }}>
                      {loading ? <><Loader2 size={17} className="animate-spin" /> Creating Account...</> : <><CheckCircle2 size={17} /> Create Account</>}
                    </button>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); }}
                        className="font-semibold hover:underline" style={{ color: 'var(--text-secondary)' }}>
                        ← Change details
                      </button>
                      <button type="button" onClick={handleResendOtp} disabled={otpSending}
                        className="font-semibold hover:underline flex items-center gap-1" style={{ color: 'var(--primary)' }}>
                        {otpSending ? <Loader2 size={12} className="animate-spin" /> : null}
                        Resend code
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
