'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Users, BookOpen, ArrowRight, Loader2 } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-[2px] px-4 py-1.5 rounded-full mb-4" style={{ color: 'var(--accent)', background: 'var(--accent-glow)', border: '1px solid rgba(245,166,35,0.12)' }}>
            📚 Course Catalog
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>Explore Courses</h1>
          <p className="mt-3" style={{ color: 'var(--text-secondary)' }}>Find the perfect course to advance your learning.</p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-colors"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
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

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course, i) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl overflow-hidden group transition-all hover:-translate-y-2 hover:shadow-xl"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
            >
              <div className="relative h-48 overflow-hidden">
                <Image src={course.thumbnail || PLACEHOLDER_IMAGE} alt={course.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md" style={{ background: 'var(--accent)', color: '#0a0a1a' }}>
                  {course.price === 0 ? 'Free' : `$${course.price}`}
                </div>
              </div>
              <div className="p-6">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                  {course.category}
                </span>
                <h3 className="font-bold mt-3 text-lg" style={{ fontFamily: 'var(--font-display)' }}>{course.title}</h3>
                <p className="text-sm mt-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{course.description}</p>

                <div className="flex items-center gap-4 mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1"><BookOpen size={12} /> {course.modules.length} modules</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {course.enrolledCount.toLocaleString()}</span>
                </div>

                <Link
                  href={`/courses/${course._id}`}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-3 font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5"
                  style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid rgba(245,166,35,0.12)' }}
                >
                  View Course <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg" style={{ color: 'var(--text-muted)' }}>No courses found. Try a different search or category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
