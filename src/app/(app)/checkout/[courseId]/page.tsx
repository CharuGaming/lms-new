'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { Loader2, Calendar, Upload, CheckCircle2, AlertCircle, Phone, MessageCircle, ChevronDown, Check } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PLACEHOLDER_IMAGE } from '@/backend/lib/constants';

// ─── Constants ───
const BANKS = [
  { name: 'Sampath Bank', branch: 'Athurugiriya | 47', number: '1067 5715 1914', holder: 'W.M.N. Chaminda', color: '#ff6600' },
  { name: 'HNB Bank', branch: 'Homagama | 73', number: '077020227702', holder: 'W.M.N. Chaminda', color: '#004a99' },
  { name: 'Commercial Bank', branch: 'Homagama | 35', number: '8750009246', holder: 'W.M.N. Chaminda', color: '#0070bb' },
  { name: 'Bank of Ceylon', branch: 'Homagama | 568', number: '0078540170', holder: 'W.M.N. Chaminda', color: '#ffcc00' },
  { name: 'Peoples Bank', branch: 'Homagama | 049', number: '049200160508491', holder: 'W.M.N. Chaminda', color: '#ee1c25' },
];

export default function MonthlyClassEnrollment({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form State
  const [paidAmount, setPaidAmount] = useState('');
  const [depositedDate, setDepositedDate] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }

    fetch(`/api/courses/${courseId}`)
      .then(res => res.json())
      .then(data => {
        setCourse(data);
        if (data.price) setPaidAmount(data.price.toString());
      })
      .catch(() => setError('Failed to load course details'))
      .finally(() => setLoading(false));
  }, [courseId, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receipt || !selectedBank || !depositedDate || !paidAmount) {
      setError('Please fill in all details and upload your receipt.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('courseId', courseId);
      formData.append('receipt', receipt);
      formData.append('paymentMethod', 'bank_transfer');
      formData.append('details', JSON.stringify({
        paidAmount,
        depositedDate,
        selectedBank
      }));

      const res = await fetch('/api/enrollments', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Submission failed. Please try again.');
      
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin" size={48} style={{ color: 'var(--accent)' }} />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-32 px-4 md:px-8 max-w-6xl mx-auto space-y-16">
      
      {/* ─── Header Section ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/20 bg-red-500/5 text-red-500 text-xs font-bold uppercase tracking-widest">
           <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> 
           Payment Verification Required
        </div>
        <h1 className="text-4xl md:text-5xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
          Monthly Class Enrollment
        </h1>
        <p className="text-[#a1a1aa] max-w-xl mx-auto">
          Secure your spot for this month&apos;s live sessions. Transfer the fees and upload your proof to get instant access.
        </p>
      </motion.div>

      {/* ─── Important Notice ─── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="p-6 md:p-8 rounded-[30px] border border-red-500/20 bg-red-500/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
            <AlertCircle size={80} className="text-red-500" />
          </div>
          <div className="flex gap-5">
             <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-500/30">
                <AlertCircle size={24} />
             </div>
             <div className="space-y-2">
                <p className="font-black text-red-500 uppercase tracking-widest text-xs">IMPORTANT / වැදගත්</p>
                <p className="text-xl md:text-2xl font-bold">Please mention your <span className="underline decoration-wavy">Name</span> in the Beneficiary (Remarks) Section.</p>
                <p className="text-sm text-red-500/60 font-medium italic">බැංකු නිවේදන කටයුතු නිවැරදිව සිදු කිරීමට ඔබගේ නම සදහන් කරන්න.</p>
                <div className="pt-2 text-sm text-[#a1a1aa] flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#a1a1aa]" />
                   Keep your Payment Proof (Bank Slip, ATM Receipt, or Screenshot) safe.
                </div>
             </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-12">
        <div className="text-center">
           <h2 className="text-xs font-black uppercase tracking-[4px] text-[#a1a1aa]">BANK ACCOUNTS</h2>
        </div>
        
        {/* ─── Bank Cards Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {BANKS.map((bank, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.1 + i * 0.05 }}
              className="p-6 rounded-[30px] border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all group relative h-full flex flex-col justify-between"
              style={{ background: 'var(--card-bg)' }}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full" />
              <div className="space-y-6">
                <div className="h-10 flex items-center justify-center font-bold text-lg">
                  {bank.name}
                </div>
                <div className="space-y-4 text-center">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#a1a1aa] mb-1">BRANCH</p>
                    <p className="text-sm font-bold">{bank.branch}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#a1a1aa] mb-1">ACCOUNT NUMBER</p>
                    <div className="p-2 rounded-xl bg-[var(--background)] font-black text-lg tracking-tighter">
                      {bank.number}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#a1a1aa] mb-1">ACCOUNT HOLDER</p>
                    <p className="text-sm font-bold">{bank.holder}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border)]">
                 <div className="h-1 rounded-full w-full" style={{ background: bank.color }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── Submission Details Form ─── */}
      <AnimatePresence mode="wait">
      {success ? (
         <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 md:p-20 rounded-[40px] border border-green-500/20 bg-green-500/5 space-y-8"
         >
           <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-white mx-auto shadow-2xl shadow-green-500/40">
              <CheckCircle2 size={48} />
           </div>
           <div className="space-y-3">
              <h2 className="text-3xl font-black">Submission Successful!</h2>
              <p className="text-xl text-[#a1a1aa] max-w-lg mx-auto">We will verify your payment and grant access within <span className="text-white font-bold">24 hours</span>.</p>
           </div>
           <button 
            onClick={() => router.push('/dashboard/courses')}
            className="px-10 py-4 rounded-2xl font-bold bg-green-500 text-white hover:scale-105 transition-transform"
           >
             Go to My Courses
           </button>
         </motion.div>
      ) : (
        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[40px] border border-[var(--border)] overflow-hidden"
          style={{ background: 'var(--card-bg)' }}
        >
          <div className="p-8 md:p-12 border-b border-[var(--border)] flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-[#0a0a1a]">
                <Upload size={24} />
             </div>
             <div>
                <h2 className="text-2xl font-black">Submission Details</h2>
                <p className="text-sm text-[#a1a1aa]">Fill in the details below to complete your enrollment.</p>
             </div>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            
            {/* Step 1: Select Class */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--background)] flex items-center justify-center text-xs font-black">1</div>
                <h3 className="font-bold">Select Class(s)</h3>
              </div>
              <div className="p-5 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent-glow)] flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[var(--accent)]">
                      <Check size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold">{course.title}</h4>
                    <p className="text-xs text-[#a1a1aa] uppercase tracking-widest">{course.category}</p>
                  </div>
                </div>
                <div className="text-[var(--accent)] font-black">
                  LKR {course.price.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Step 2: Payment Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--background)] flex items-center justify-center text-xs font-black">2</div>
                <h3 className="font-bold">Payment Details</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-[#a1a1aa] ml-2">Paid Amount (LKR) *</label>
                  <input 
                    type="number" 
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] outline-none focus:border-[var(--accent)] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-[#a1a1aa] ml-2">Deposited Date *</label>
                  <input 
                    type="date" 
                    value={depositedDate}
                    onChange={(e) => setDepositedDate(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] outline-none focus:border-[var(--accent)] transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#a1a1aa] ml-2">Deposited Bank Account *</label>
                <div className="relative group">
                  <select 
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] outline-none focus:border-[var(--accent)] appearance-none transition-all cursor-pointer"
                  >
                    <option value="">Select the bank account...</option>
                    {BANKS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#a1a1aa]" size={18} />
                </div>
              </div>
            </div>

            {/* Step 3: Proof of Payment */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--background)] flex items-center justify-center text-xs font-black">3</div>
                <h3 className="font-bold">Proof of Payment *</h3>
              </div>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`p-10 md:p-16 rounded-[30px] border-2 border-dashed transition-all cursor-pointer text-center space-y-4 hover:bg-[var(--background)]/50 ${receipt ? 'border-green-500/50' : 'border-[var(--border)]'}`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,.pdf"
                  onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                />
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${receipt ? 'bg-green-500 text-white' : 'bg-white/5 text-[#a1a1aa]'}`}>
                   {receipt ? <CheckCircle2 size={32} /> : <Upload size={32} />}
                </div>
                <div>
                   <p className="font-bold text-lg">{receipt ? receipt.name : 'Upload Receipt'}</p>
                   <p className="text-sm text-[#a1a1aa]">Drag and drop or click to browse</p>
                </div>
              </div>
            </div>

            <button 
              disabled={submitting}
              className="w-full py-5 rounded-[25px] font-black text-xl bg-[var(--accent)] text-[#0a0a1a] shadow-2xl shadow-[var(--accent-glow)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 mt-6"
            >
              {submitting ? 'Submitting Payment Proof...' : 'Submit Payment Proof'}
            </button>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 text-sm font-bold flex items-center gap-3">
                 <AlertCircle size={18} /> {error}
              </div>
            )}
          </div>
        </motion.form>
      )}
      </AnimatePresence>

      {/* ─── Support Footer ─── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-10 pt-16">
         <div className="flex items-center justify-center gap-4 text-green-500 text-lg font-bold">
            <CheckCircle2 size={24} />
            We will verify your payment and grant access within 24 hours.
         </div>
         
         <div className="space-y-4">
            <p className="text-[#a1a1aa] font-medium leading-relaxed">
              ඔබගේ ගෙවීම් පරීක්ෂා කර විනාඩි කිහිපයක් ඇතුළත ඔබට පාඨමාලාව සඳහා ප්‍රවේශය හිමිවනු ඇත. <br/>
              If there is any problem, please contact us via WhatsApp message or phone call
            </p>
            <div className="flex flex-wrap justify-center gap-4">
               <button className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 text-white transition-all font-bold">
                  <MessageCircle size={20} /> WhatsApp
               </button>
               <button className="flex items-center gap-3 px-8 py-3.5 rounded-2xl border border-[var(--border)] hover:bg-white/5 transition-all font-bold">
                  <Phone size={20} /> Call Now
               </button>
            </div>
         </div>
      </motion.div>

    </div>
  );
}
