'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, FileText, Download, BookOpen, Search } from 'lucide-react';

interface Resource {
  _id: string;
  title: string;
  description: string;
  fileName: string;
  fileId: string;
  mimeType: string;
  category: string;
  createdAt: string;
}

const getCategoryColor = (category: string) => {
  const colors = [
    { bg: 'rgba(239,68,68,0.12)', text: '#ef4444' },
    { bg: 'rgba(59,130,246,0.12)', text: '#3b82f6' },
    { bg: 'rgba(168,85,247,0.12)', text: '#a855f7' },
    { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
    { bg: 'rgba(20,184,166,0.12)', text: '#14b8a6' },
    { bg: 'rgba(236,72,153,0.12)', text: '#ec4899' },
  ];
  const index = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

export default function ResourcesSection() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRes, catRes] = await Promise.all([
          fetch('/api/resources'),
          fetch('/api/resources/categories')
        ]);
        const [resData, catData] = await Promise.all([resRes.json(), catRes.json()]);
        
        if (Array.isArray(resData)) setResources(resData);
        if (Array.isArray(catData)) {
          const names = catData.map((c: any) => c.name);
          setCategories(['All', ...names]);
        }
      } catch (e) {
        console.error('Failed to fetch data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || resources.length === 0) return null;

  const filtered = resources.filter((r) => {
    const matchCat = activeCategory === 'All' || r.category === activeCategory;
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="text-lg font-black flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(20,184,166,0.15)', color: '#14b8a6' }}>
            <FolderOpen size={16} />
          </span>
          Learning Resources
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(20,184,166,0.15)', color: '#14b8a6' }}>
            {resources.length}
          </span>
        </h2>

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="pl-8 pr-4 py-2 text-xs rounded-xl focus:outline-none transition-all w-44"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--foreground)',
            }}
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const count = cat === 'All' ? resources.length : resources.filter((r) => r.category === cat).length;
          if (cat !== 'All' && count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all"
              style={{
                background: isActive ? 'var(--accent)' : 'var(--card-bg)',
                color: isActive ? '#0a0a1a' : 'var(--text-muted)',
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-subtle)'}`,
              }}
            >
              {cat} {count > 0 && <span className="opacity-60">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Resources Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
          <BookOpen size={32} className="mx-auto mb-2 opacity-20" />
          <p className="text-sm opacity-40 font-semibold">No resources found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((r, i) => {
              const color = getCategoryColor(r.category);
              return (
                <motion.div
                  key={r._id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-5 rounded-2xl flex flex-col gap-3 group transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}
                >
                  {/* Icon + Category */}
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: color.bg, color: color.text }}>
                      <FileText size={18} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: color.bg, color: color.text }}>
                      {r.category}
                    </span>
                  </div>

                  {/* Title + Description */}
                  <div className="flex-1">
                    <h3 className="font-bold text-sm leading-snug" style={{ color: 'var(--foreground)' }}>{r.title}</h3>
                    {r.description && (
                      <p className="text-[12px] mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{r.description}</p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {new Date(r.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <a
                      href={`/api/files/${r.fileId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-black transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: 'rgba(20,184,166,0.12)',
                        color: '#14b8a6',
                        border: '1px solid rgba(20,184,166,0.25)',
                      }}
                    >
                      <Download size={12} /> Download
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
