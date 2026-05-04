'use client';
import { useState, useEffect } from 'react';
import { Bell, Megaphone, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';

export default function NotificationBell() {
  const { data: session } = useSession();
  const [showNotices, setShowNotices] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [seenIds, setSeenIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('seenNotices');
      if (stored) setSeenIds(JSON.parse(stored));
    }
  }, []);

  const fetchNotices = async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      // Add timestamp to prevent browser cache
      const res = await fetch(`/api/notices?t=${Date.now()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const activeNotices = data.filter(n => n.isActive);
        setNotices(activeNotices);
        
        const unread = activeNotices.filter(n => !seenIds.includes(n._id)).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Failed to fetch notices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
    const interval = setInterval(fetchNotices, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [session, seenIds]);

  const toggleDropdown = () => {
    if (!showNotices) {
      // About to open: mark all current notices as seen
      const allIds = Array.from(new Set([...seenIds, ...notices.map(n => n._id)]));
      setSeenIds(allIds);
      localStorage.setItem('seenNotices', JSON.stringify(allIds));
      setUnreadCount(0);
      fetchNotices(); // Refresh to ensure we have latest data
    }
    setShowNotices(!showNotices);
  };

  if (!session) return null;

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 group relative"
        style={{ 
          background: 'rgba(1, 69, 242, 0.05)', 
          border: '1px solid rgba(1, 69, 242, 0.1)',
        }}
      >
        <Bell size={18} className="text-[#0145f2]" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-[#0145f2] border-2 border-[var(--background)] rounded-full animate-pulse shadow-[0_0_10px_rgba(1,69,242,0.5)]" />
        )}
      </button>

      <AnimatePresence>
        {showNotices && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60]"
              onClick={() => setShowNotices(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="absolute right-0 mt-4 w-80 md:w-96 p-5 rounded-[2.5rem] shadow-2xl border z-[70]"
              style={{ 
                background: 'var(--card-bg)', 
                borderColor: 'var(--border-subtle)',
                backdropFilter: 'blur(30px)',
              }}
            >
              <div className="flex items-center justify-between mb-5 px-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-[#0145f2]/10 flex items-center justify-center text-[#0145f2]">
                    <Megaphone size={16} />
                  </div>
                  <h3 className="font-black text-xs uppercase tracking-[0.2em] opacity-80" style={{ color: 'var(--foreground)' }}>
                    Announcements
                  </h3>
                </div>
                {isLoading && <Loader2 size={14} className="animate-spin text-[#0145f2] opacity-50" />}
              </div>

              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {notices.length > 0 ? (
                  notices.map((notice) => {
                    const isNew = !seenIds.includes(notice._id);
                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={notice._id} 
                        className="p-5 rounded-[1.5rem] border transition-all hover:bg-black/5 dark:hover:bg-white/5 relative bg-white/5"
                        style={{ borderColor: 'var(--border-subtle)' }}
                      >
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h4 className="font-bold text-[13px] leading-tight" style={{ color: 'var(--foreground)' }}>
                            {notice.title}
                          </h4>
                          {isNew && (
                            <span className="bg-[#0145f2] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest shrink-0">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] leading-relaxed opacity-70" style={{ color: 'var(--text-muted)' }}>
                          {notice.message}
                        </p>
                        <div className="mt-3 text-[9px] font-black uppercase tracking-widest opacity-30 flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-current" />
                          {new Date(notice.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                        </div>
                      </motion.div>
                    );
                  })
                ) : !isLoading ? (
                  <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-[#0145f2]/5 text-[#0145f2] rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
                      <Bell size={32} />
                    </div>
                    <p className="text-[14px] font-black opacity-80" style={{ color: 'var(--foreground)' }}>All Caught Up!</p>
                    <p className="text-[11px] opacity-50 mt-1" style={{ color: 'var(--text-muted)' }}>Check back later for important updates.</p>
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center gap-3">
                    <Loader2 size={32} className="animate-spin text-[#0145f2] opacity-50" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Checking for updates...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
