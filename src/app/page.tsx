'use client';
import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Play, BookOpen, Users, ArrowRight, Star, ChevronDown } from 'lucide-react';
import { SAMPLE_VIDEOS, GALLERY_IMAGES } from '@/backend/lib/data';
import { PLACEHOLDER_IMAGE } from '@/backend/lib/constants';
import ContactSection from '@/frontend/components/ContactSection';

interface CourseNode {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  price: number;
  enrolledCount: number;
  modules: any[];
}

// ─── Animation Variants ───
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.7, 
      ease: [0.16, 1, 0.3, 1] as any 
    } 
  },
};
const staggerContainer: Variants = {
  hidden: {},
  visible: { 
    transition: { 
      staggerChildren: 0.12 
    } 
  },
};

export default function HomePage() {
  const [courses, setCourses] = useState<CourseNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses?limit=4')
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

  return (
    <>
      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden px-6">
        <div className="absolute inset-0 z-0 text-center flex items-center justify-center">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 40%, var(--accent-glow), transparent), radial-gradient(ellipse 60% 80% at 20% 80%, rgba(99,102,241,0.08), transparent)',
            }}
          />
        </div>

        <motion.div
          className="relative z-10 max-w-4xl"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.p
            variants={fadeUp}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[3px] mb-6 px-5 py-2 rounded-full mx-auto"
            style={{ color: 'var(--accent)', background: 'var(--accent-glow)', border: '1px solid rgba(245,166,35,0.15)' }}
          >
            Educator • Creator • Mentor
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Empowering Minds,
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, var(--accent), #ff6b6b, var(--accent))', backgroundSize: '200% 200%' }}
            >
              One Lesson at a Time.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Transforming complex concepts into simple, beautiful learning experiences through video content and structured courses.
          </motion.p>

          <motion.div variants={fadeUp} className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-7 py-3.5 font-bold rounded-full transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, var(--accent), #e8941a)', color: '#0a0a1a', boxShadow: '0 4px 20px var(--accent-glow)' }}
            >
              <BookOpen size={18} /> Start Learning
            </Link>
            <Link
              href="/videos"
              className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold rounded-full transition-all hover:-translate-y-0.5"
              style={{ border: '2px solid var(--border)', background: 'var(--glass)' }}
            >
              <Play size={18} /> Watch Videos
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown size={20} style={{ color: 'var(--text-muted)' }} />
          <span className="text-[10px] uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>Scroll</span>
        </motion.div>
      </section>

      {/* ═══════ FEATURED COURSES ═══════ */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
            <motion.span variants={fadeUp} className="inline-block text-xs font-semibold uppercase tracking-[3px] px-5 py-2 rounded-full mb-6" style={{ color: 'var(--accent)', background: 'var(--accent-glow)', border: '1px solid rgba(245,166,35,0.15)' }}>
              Featured Courses
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>
              Start Your Learning Journey
            </motion.h2>
          </motion.div>

          {loading ? (
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-[400px] rounded-2xl animate-pulse" style={{ background: 'var(--card-bg)' }} />
                ))}
             </div>
          ) : courses.length > 0 ? (
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {courses.map((course: CourseNode, i: number) => (
                <motion.div
                  key={course._id}
                  variants={fadeUp}
                  className="rounded-2xl overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl cursor-pointer group"
                  style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
                >
                  <Link href={`/courses/${course._id}`}>
                    <div className="relative h-48 overflow-hidden">
                      <Image src={course.thumbnail || PLACEHOLDER_IMAGE} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black shadow-lg" style={{ background: 'var(--accent)', color: '#0a0a1a' }}>
                        {course.price === 0 ? 'FREE' : `$${course.price}`}
                      </div>
                    </div>
                    <div className="p-6">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                        {course.category}
                      </span>
                      <h3 className="font-bold mt-3 text-lg leading-tight line-clamp-2 h-12 group-hover:text-accent transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                        {course.title}
                      </h3>
                      <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                        <span className="text-[10px] flex items-center gap-1.5 font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                          <Users size={12} /> {course.enrolledCount?.toLocaleString() || 0}
                        </span>
                        <span className="text-[10px] flex items-center gap-1.5 font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                          <BookOpen size={12} /> {course.modules?.length || 0} Modules
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20 px-10 rounded-3xl border-2 border-dashed" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xl font-bold" style={{ color: 'var(--text-muted)' }}>No courses found in database.</p>
              <Link href="/dashboard/courses/new" className="inline-block mt-4 text-accent font-bold">Create your first course →</Link>
            </div>
          )}

          <div className="text-center mt-16">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-full transition-all hover:-translate-y-0.5 group"
              style={{ border: '2px solid var(--border)', background: 'var(--glass)' }}
            >
              View All Courses <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ VIDEO HIGHLIGHTS ═══════ */}
      <section className="py-20 px-6" style={{ background: 'var(--card-bg)' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-12">
            <motion.span variants={fadeUp} className="inline-block text-xs font-semibold uppercase tracking-[2px] px-4 py-1.5 rounded-full mb-4" style={{ color: 'var(--accent)', background: 'var(--accent-glow)', border: '1px solid rgba(245,166,35,0.12)' }}>
              📺 Video Highlights
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>
              Latest Video Lessons
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {SAMPLE_VIDEOS.slice(0, 6).map((video, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="rounded-2xl overflow-hidden transition-all hover:-translate-y-2 hover:shadow-xl"
                style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
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
                <div className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-2" style={{ fontFamily: 'var(--font-display)' }}>{video.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>{video.category}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{video.date}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-10">
            <Link
              href="/videos"
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-full transition-all hover:-translate-y-0.5"
              style={{ border: '2px solid var(--border)' }}
            >
              All Videos <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ ABOUT PREVIEW ═══════ */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <Image src="/images/profile.png" alt="The Educator" width={500} height={500} className="w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <span className="inline-block text-xs font-semibold uppercase tracking-[2px] px-4 py-1.5 rounded-full mb-4" style={{ color: 'var(--accent)', background: 'var(--accent-glow)', border: '1px solid rgba(245,166,35,0.12)' }}>
              👨‍🏫 The Lecturer
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6" style={{ fontFamily: 'var(--font-display)' }}>About Me</h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              I&apos;m <strong style={{ color: 'var(--accent)' }}>The Educator</strong> — a passionate teacher and content creator
              dedicated to making education accessible and transformative. With over a decade of experience,
              I&apos;ve helped thousands master complex subjects through simple, visual explanations.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {['Education', 'YouTube', 'Mentorship', 'Technology', 'Science'].map((t) => (
                <span
                  key={t}
                  className="text-xs font-medium px-3 py-1 rounded-full transition-transform hover:scale-105"
                  style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid rgba(245,166,35,0.12)' }}
                >
                  {t}
                </span>
              ))}
            </div>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 font-semibold rounded-full transition-all hover:-translate-y-0.5"
              style={{ border: '2px solid var(--border)' }}
            >
              Read More <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════ CONTACT ═══════ */}
      <ContactSection />

      {/* ═══════ CTA ═══════ */}
      <section className="py-20 px-6 text-center" style={{ background: 'var(--card-bg)' }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="max-w-2xl mx-auto">
          <motion.span variants={fadeUp} className="inline-block text-xs font-semibold uppercase tracking-[2px] px-4 py-1.5 rounded-full mb-4" style={{ color: 'var(--accent)', background: 'var(--accent-glow)', border: '1px solid rgba(245,166,35,0.12)' }}>
            🤝 Join the Community
          </motion.span>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-extrabold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Ready to Start Learning?
          </motion.h2>
          <motion.p variants={fadeUp} className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            Join thousands of students already learning with us. Sign up for free and get access to all our courses.
          </motion.p>
          <motion.div variants={fadeUp} className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 font-bold text-lg rounded-full transition-all hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg, var(--accent), #e8941a)', color: '#0a0a1a', boxShadow: '0 4px 20px var(--accent-glow)' }}
            >
              Get Started Free <ArrowRight size={20} />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
