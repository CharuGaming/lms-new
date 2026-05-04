'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, ExternalLink, Calendar, Loader2, Globe } from 'lucide-react';

interface LiveClass {
  _id: string;
  title: string;
  url: string;
  platform: 'zoom' | 'meet' | 'other';
  startTime: string;
}

export default function LiveClassesSection() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch('/api/live-classes');
        const data = await res.json();
        if (Array.isArray(data)) setClasses(data);
      } catch (e) {
        console.error('Failed to fetch live classes', e);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  if (loading) return null;
  if (classes.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-black flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
            <Video size={16} />
          </span>
          Live Sessions
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
            {classes.length}
          </span>
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {classes.map((c) => (
          <div 
            key={c._id} 
            className="p-5 rounded-2xl flex flex-col gap-4 group transition-all hover:shadow-lg"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 ${c.platform === 'zoom' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                   {c.platform === 'zoom' ? <Globe size={10} /> : <Video size={10} />}
                   {c.platform === 'zoom' ? 'Zoom' : 'Google Meet'}
                </div>
                <h3 className="font-bold text-sm truncate" style={{ color: 'var(--foreground)' }}>{c.title}</h3>
                <div className="flex items-center gap-1.5 mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  <Calendar size={12} />
                  {new Date(c.startTime).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
              
              <a 
                href={c.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                style={{ background: 'var(--primary)', color: '#fff', boxShadow: '0 4px 12px var(--primary-glow)' }}
              >
                <ExternalLink size={16} />
              </a>
            </div>

            <a 
              href={c.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-border)' }}
            >
              Join Live Class Now
            </a>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
