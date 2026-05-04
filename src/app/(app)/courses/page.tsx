'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Users, BookOpen, ArrowRight, Loader2, Sparkles, Filter } from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '@/backend/lib/constants';

interface CourseListData {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  price: number;
  modules: any[];
  enrolledCount: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseListData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCourses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch courses', err);
        setLoading(false);
      });
  }, []);

  const categories = ['All', ...new Set(courses.map((c) => c.category))];

  const filtered = courses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                       c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || c.category === category;
    return matchSearch && matchCat;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 60px)' }}>
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8" style={{ minHeight: 'calc(100vh - 60px)' }}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <BookOpen size={16} />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
                Course Catalog
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
              Explore the Library
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Find the perfect course to advance your skills and career.
            </p>
          </div>
        </motion.div>

        {/* ── Search & Filters ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="p-2 pl-4 rounded-2xl flex flex-col md:flex-row items-center gap-3 transition-shadow"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            
            <div className="flex-1 flex items-center gap-3 w-full">
              <Search size={18} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by title, description or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm font-medium outline-none py-2"
                style={{ color: 'var(--foreground)' }}
              />
            </div>

            <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide py-1 pr-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="shrink-0 px-4 py-2 text-xs font-bold rounded-xl transition-all"
                  style={{
                    background: category === cat ? 'var(--primary)' : 'transparent',
                    color: category === cat ? '#ffffff' : 'var(--text-secondary)',
                    boxShadow: category === cat ? '0 4px 12px var(--primary-glow)' : 'none',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Course Grid ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course, i) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="h-full"
            >
              <Link
                href={`/courses/${course._id}`}
                className="group h-full rounded-3xl overflow-hidden transition-all hover:-translate-y-2 hover:shadow-xl flex flex-col"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}
              >
                <div className="relative h-48 overflow-hidden shrink-0">
                <Image 
                  src={course.thumbnail || PLACEHOLDER_IMAGE} 
                  alt={course.title} 
                  fill 
                  sizes="(max-width: 768px) 100vw, 33vw" 
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg backdrop-blur-md" 
                  style={{ background: course.price === 0 ? '#22c55e' : 'var(--primary)', color: '#ffffff' }}>
                  {course.price === 0 ? 'FREE' : `$${course.price}`}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <span className="self-start text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg mb-3" 
                  style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  {course.category}
                </span>
                <h3 className="font-bold text-lg leading-tight group-hover:text-[var(--primary)] transition-colors mb-2 line-clamp-2" 
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                  {course.title}
                </h3>
                <p className="text-sm line-clamp-2 mb-6 flex-1" style={{ color: 'var(--text-secondary)' }}>
                  {course.description}
                </p>

                <div className="flex items-center justify-between pt-4 mt-auto border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center gap-4 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={14} /> {course.modules.length} mods
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={14} /> {course.enrolledCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover:bg-[var(--primary)] group-hover:text-white"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 rounded-3xl" style={{ border: '1px dashed var(--border-subtle)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Filter size={24} />
            </div>
            <h3 className="font-black text-xl mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>No courses found</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Try adjusting your search query or selected category.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
