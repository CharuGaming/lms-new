'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { GALLERY_IMAGES } from '@/backend/lib/data';
import { Award, BookOpen, Heart, Lightbulb, Star, Users } from 'lucide-react';
import { useState } from 'react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

export default function AboutPage() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <div className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <motion.div variants={fadeUp}>
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <Image src="/images/profile.png" alt="The Educator" width={500} height={500} className="w-full object-cover" />
            </div>
          </motion.div>
          <motion.div variants={fadeUp}>
            <span className="inline-block text-xs font-semibold uppercase tracking-[2px] px-4 py-1.5 rounded-full mb-4" style={{ color: 'var(--accent)', background: 'var(--accent-glow)' }}>
              👨‍🏫 Meet The Educator
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-6" style={{ fontFamily: 'var(--font-display)' }}>About Me</h1>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              I&apos;m <strong style={{ color: 'var(--accent)' }}>The Educator</strong> — a passionate teacher and content creator
              with over a decade of experience in transforming complex academic concepts into simple, engaging lessons.
            </p>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              My YouTube channel serves as a virtual classroom where thousands of students access free, high-quality education. I believe learning should be accessible, enjoyable, and transformative.
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              When I&apos;m not teaching, I explore innovative ways to integrate technology into education, create new content, and mentor the next generation of learners.
            </p>
          </motion.div>
        </motion.div>

        {/* Teaching Philosophy */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-10" style={{ fontFamily: 'var(--font-display)' }}>Teaching Philosophy</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Heart size={24} />, title: 'Passion First', desc: 'Teaching with genuine love for learning creates an infectious energy that motivates students.' },
              { icon: <Lightbulb size={24} />, title: 'Simplify Complexity', desc: 'Breaking down difficult topics into bite-sized, intuitive concepts everyone can understand.' },
              { icon: <Users size={24} />, title: 'Community Driven', desc: 'Building a supportive learning community where students help each other grow.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl text-center transition-all hover:-translate-y-2"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                  {item.icon}
                </div>
                <h3 className="font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>{item.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-10" style={{ fontFamily: 'var(--font-display)' }}>Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { num: '50K+', label: 'YouTube Subscribers' },
              { num: '150+', label: 'Video Lessons' },
              { num: '10+', label: 'Years Experience' },
              { num: '95%', label: 'Student Satisfaction' },
            ].map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl text-center transition-all hover:-translate-y-1"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
              >
                <p className="text-2xl font-extrabold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>{a.num}</p>
                <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{a.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Gallery */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-10" style={{ fontFamily: 'var(--font-display)' }}>Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GALLERY_IMAGES.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
                onClick={() => setLightbox(i)}
              >
                <Image src={img.src} alt={img.caption} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-white text-sm font-semibold">{img.caption}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-[2000] bg-black/90 flex items-center justify-center p-8" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-8 text-white text-4xl hover:text-[var(--accent)] transition-colors">&times;</button>
          <Image src={GALLERY_IMAGES[lightbox].src} alt={GALLERY_IMAGES[lightbox].caption} width={900} height={600} className="max-h-[80vh] object-contain rounded-xl" />
          <p className="absolute bottom-8 text-white text-sm font-medium">{GALLERY_IMAGES[lightbox].caption}</p>
        </div>
      )}
    </div>
  );
}
