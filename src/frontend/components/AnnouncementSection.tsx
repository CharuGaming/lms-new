'use client';
import { useState, useEffect } from 'react';
import { Megaphone, Calendar, ChevronRight, Loader2, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnnouncementSection() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch(`/api/notices?t=${Date.now()}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setNotices(data.filter(n => n.isActive));
        }
      } catch (err) {
        console.error('Failed to fetch notices:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  if (!loading && notices.length === 0) return null;

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 md:p-8"
        style={{ 
          background: 'rgba(1, 69, 242, 0.03)', 
          border: '1px solid rgba(1, 69, 242, 0.1)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0145f2]/10 flex items-center justify-center text-[#0145f2]">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                Important Announcements
              </h2>
              <p className="text-xs opacity-60 mt-0.5" style={{ color: 'var(--text-muted)' }}>Latest updates from your instructors</p>
            </div>
          </div>
          
          {loading && <Loader2 size={16} className="animate-spin text-[#0145f2] opacity-50" />}
        </div>

        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {notices.slice(0, 3).map((notice, idx) => (
              <motion.div
                key={notice._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedNotice(notice)}
                className="group p-5 rounded-2xl border transition-all hover:translate-x-1 hover:shadow-md relative overflow-hidden cursor-pointer"
                style={{ 
                  background: 'var(--card-bg)', 
                  borderColor: 'var(--border-subtle)' 
                }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0145f2] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#0145f2] bg-[#0145f2]/5 px-2 py-0.5 rounded-full">
                        Update
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-40 ml-2">
                         <Calendar size={10} />
                         {new Date(notice.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <h3 className="font-bold text-[15px] mb-1" style={{ color: 'var(--foreground)' }}>
                      {notice.title}
                    </h3>
                    <p className="text-[13px] opacity-60 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                      {notice.message}
                    </p>
                  </div>
                  
                  <button className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] opacity-40 group-hover:opacity-100 group-hover:text-[#0145f2] transition-all shrink-0">
                    Read More <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {notices.length > 3 && (
          <button className="w-full mt-4 py-3 text-xs font-bold opacity-40 hover:opacity-100 transition-all text-center">
            View All Announcements
          </button>
        )}
      </motion.div>

      {/* Pop-out Modal */}
      <AnimatePresence>
        {selectedNotice && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNotice(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] shadow-2xl border"
              style={{ 
                background: 'var(--card-bg)', 
                borderColor: 'var(--border-subtle)'
              }}
            >
              {/* Header Image/Pattern */}
              <div className="h-32 w-full relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0145F2 0%, #0128a8 100%)' }}>
                <div className="absolute inset-0 opacity-10">
                   <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white" />
                   <div className="absolute bottom-0 left-10 w-20 h-20 rounded-full bg-white" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <Megaphone size={40} className="text-white/20" />
                </div>
                <button 
                  onClick={() => setSelectedNotice(null)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all backdrop-blur-md border border-white/20"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0145f2] bg-[#0145f2]/10 px-3 py-1 rounded-full">
                    Official Notice
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold opacity-40">
                    <Calendar size={12} />
                    {new Date(selectedNotice.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-black mb-6 leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                  {selectedNotice.title}
                </h2>
                
                <div className="w-full h-px bg-gradient-to-r from-[#0145f2]/20 via-[#0145f2]/5 to-transparent mb-8" />

                <div className="max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
                  <p className="text-[15px] md:text-[16px] leading-relaxed opacity-80 whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>
                    {selectedNotice.message}
                  </p>
                </div>

                <div className="mt-10 flex justify-end">
                  <button 
                    onClick={() => setSelectedNotice(null)}
                    className="px-8 py-3.5 rounded-full font-bold text-sm text-white transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#0145f2]/20"
                    style={{ background: '#0145f2' }}
                  >
                    Close Reading
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
