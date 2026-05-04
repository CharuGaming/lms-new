'use client';
import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Play, BookOpen, Users, ArrowRight, ChevronDown } from 'lucide-react';
import { SAMPLE_VIDEOS } from '@/backend/lib/data';
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
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as any },
  },
};
const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function HomePage() {
  const [courses, setCourses] = useState<CourseNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses?limit=4')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCourses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden px-6">
        {/* Background blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(1,69,242,0.12) 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(1,69,242,0.08) 0%, transparent 70%)' }}
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
            className="badge mb-6 mx-auto"
          >
            Educator • Creator • Mentor
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="section-heading text-4xl sm:text-5xl md:text-7xl mb-6"
          >
            Empowering Minds,
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #0145F2, #4d8ef7)' }}
            >
              One Lesson at a Time.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Transforming complex concepts into simple, beautiful learning experiences through video content and structured courses.
          </motion.p>

          <motion.div variants={fadeUp} className="flex gap-4 justify-center flex-wrap">
            <Link href="/courses" className="btn-primary">
              <BookOpen size={18} /> Start Learning
            </Link>
            <Link href="/videos" className="btn-outline">
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
          <span className="text-[10px] uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>
            Scroll
          </span>
        </motion.div>
      </section>

      {/* ═══════ FEATURED COURSES ═══════ */}
      <section className="py-24 px-6 relative overflow-hidden" style={{ background: 'var(--card-bg)' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} className="badge mb-6">
              Featured Courses
            </motion.span>
            <motion.h2 variants={fadeUp} className="section-heading text-3xl md:text-5xl">
              Start Your Learning Journey
            </motion.h2>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-[400px] rounded-2xl animate-pulse"
                  style={{ background: 'var(--background)' }}
                />
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
              {courses.map((course: CourseNode) => (
                <motion.div
                  key={course._id}
                  variants={fadeUp}
                  className="card cursor-pointer group overflow-hidden"
                >
                  <Link href={`/courses/${course._id}`}>
                    <div className="relative h-48 overflow-hidden rounded-t-2xl">
                      <Image
                        src={course.thumbnail || PLACEHOLDER_IMAGE}
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div
                        className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black shadow-lg text-white"
                        style={{ background: 'var(--primary)' }}
                      >
                        {course.price === 0 ? 'FREE' : `$${course.price}`}
                      </div>
                    </div>
                    <div className="p-6">
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md"
                        style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                      >
                        {course.category}
                      </span>
                      <h3
                        className="font-bold mt-3 text-lg leading-tight line-clamp-2 h-12 transition-colors group-hover:text-[var(--primary)]"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {course.title}
                      </h3>
                      <div
                        className="flex items-center justify-between mt-6 pt-4 border-t"
                        style={{ borderColor: 'var(--border-subtle)' }}
                      >
                        <span
                          className="text-[10px] flex items-center gap-1.5 font-bold uppercase tracking-wider"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Users size={12} /> {course.enrolledCount?.toLocaleString() || 0}
                        </span>
                        <span
                          className="text-[10px] flex items-center gap-1.5 font-bold uppercase tracking-wider"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <BookOpen size={12} /> {course.modules?.length || 0} Modules
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div
              className="text-center py-20 px-10 rounded-3xl border-2 border-dashed"
              style={{ borderColor: 'var(--primary-border)' }}
            >
              <p className="text-xl font-bold" style={{ color: 'var(--text-muted)' }}>
                No courses found in database.
              </p>
              <Link href="/dashboard/courses/new" className="inline-block mt-4 font-bold" style={{ color: 'var(--primary)' }}>
                Create your first course →
              </Link>
            </div>
          )}

          <div className="text-center mt-16">
            <Link href="/courses" className="btn-outline">
              View All Courses <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ VIDEO HIGHLIGHTS ═══════ */}
      <section className="py-20 px-6" style={{ background: 'var(--background)' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.span variants={fadeUp} className="badge mb-4">
              📺 Video Highlights
            </motion.span>
            <motion.h2 variants={fadeUp} className="section-heading text-3xl md:text-4xl">
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
                className="card overflow-hidden"
              >
                <div className="relative pt-[56.25%] bg-black rounded-t-2xl overflow-hidden">
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
                  <h3
                    className="font-semibold text-sm line-clamp-2"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                    >
                      {video.category}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {video.date}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-10">
            <Link href="/videos" className="btn-outline">
              All Videos <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ ABOUT PREVIEW ═══════ */}
      <section className="py-20 px-6" style={{ background: 'var(--card-bg)' }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/profile.png"
                alt="The Educator"
                width={500}
                height={500}
                className="w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(1,69,242,0.15), transparent)' }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="badge mb-4">👨‍🏫 The Lecturer</span>
            <h2 className="section-heading text-3xl md:text-4xl mb-6">About Me</h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              I&apos;m{' '}
              <strong style={{ color: 'var(--primary)' }}>The Educator</strong> — a passionate teacher and content creator
              dedicated to making education accessible and transformative. With over a decade of experience,
              I&apos;ve helped thousands master complex subjects through simple, visual explanations.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {['Education', 'YouTube', 'Mentorship', 'Technology', 'Science'].map((t) => (
                <span
                  key={t}
                  className="text-xs font-medium px-3 py-1 rounded-full transition-transform hover:scale-105"
                  style={{
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    border: '1px solid var(--primary-border)',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            <Link href="/about" className="btn-outline mt-8">
              Read More <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════ CONTACT ═══════ */}
      <ContactSection />

      {/* ═══════ CTA ═══════ */}
      <section
        className="py-20 px-6 text-center"
        style={{ background: 'linear-gradient(135deg, #0145F2 0%, #0136cc 100%)' }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-2xl mx-auto"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[3px] px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}
          >
            🤝 Join the Community
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="section-heading text-3xl md:text-4xl mb-4 text-white"
          >
            Ready to Start Learning?
          </motion.h2>
          <motion.p variants={fadeUp} className="mb-8" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Join thousands of students already learning with us. Sign up for free and get access to all our courses.
          </motion.p>
          <motion.div variants={fadeUp} className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 font-bold text-lg rounded-full transition-all hover:-translate-y-1 hover:shadow-2xl"
              style={{ background: '#ffffff', color: '#0145F2', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
            >
              Get Started Free <ArrowRight size={20} />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
