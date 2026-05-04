'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { SAMPLE_VIDEOS, VIDEO_CATEGORIES } from '@/backend/lib/data';

export default function VideosPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = SAMPLE_VIDEOS.filter((v) => {
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || v.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-[2px] px-4 py-1.5 rounded-full mb-4" style={{ color: 'var(--accent)', background: 'var(--accent-glow)', border: '1px solid rgba(245,166,35,0.12)' }}>
            📺 Video Hub
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>Video Lessons</h1>
          <p className="mt-3" style={{ color: 'var(--text-secondary)' }}>Browse our complete library of educational video content.</p>
        </motion.div>

        {/* Search & Filter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search videos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-colors"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {VIDEO_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="px-4 py-2 text-sm font-medium rounded-full transition-all"
                style={{
                  background: category === cat ? 'var(--accent)' : 'var(--card-bg)',
                  color: category === cat ? '#0a0a1a' : 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl overflow-hidden transition-all hover:-translate-y-2 hover:shadow-xl"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
            >
              <div className="relative pt-[56.25%] bg-black">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-[15px] line-clamp-2" style={{ fontFamily: 'var(--font-display)' }}>{video.title}</h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                    {video.category}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{video.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg" style={{ color: 'var(--text-muted)' }}>No videos found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
