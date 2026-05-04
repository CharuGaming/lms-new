'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Globe, Send } from 'lucide-react';

export default function ContactSection() {
  return (
    <section className="py-24 px-6 relative" style={{ background: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="badge mb-4">📬 Get In Touch</span>
          <h2 className="section-heading text-3xl md:text-4xl">Contact Us</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row rounded-[40px] overflow-hidden shadow-2xl min-h-[600px]"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          {/* Left Side: Form */}
          <div className="flex-[1.4] p-8 md:p-14" style={{ background: 'var(--card-bg)' }}>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-sm font-bold ml-1" style={{ color: 'var(--foreground)' }}>
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-6 py-4 rounded-2xl border outline-none transition-all placeholder:text-[var(--text-muted)] text-sm"
                  style={{
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    borderColor: 'var(--border-subtle)',
                  }}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold ml-1" style={{ color: 'var(--foreground)' }}>
                  Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="+94 77 123 4567"
                  className="w-full px-6 py-4 rounded-2xl border outline-none transition-all placeholder:text-[var(--text-muted)] text-sm"
                  style={{
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    borderColor: 'var(--border-subtle)',
                  }}
                />
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <label className="text-sm font-bold ml-1" style={{ color: 'var(--foreground)' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                className="w-full px-6 py-4 rounded-2xl border outline-none transition-all placeholder:text-[var(--text-muted)] text-sm"
                style={{
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  borderColor: 'var(--border-subtle)',
                }}
              />
            </div>

            <div className="space-y-3 mb-10">
              <label className="text-sm font-bold ml-1" style={{ color: 'var(--foreground)' }}>
                Your Message
              </label>
              <textarea
                rows={5}
                placeholder="How can we help you?"
                className="w-full px-6 py-4 rounded-2xl border outline-none transition-all placeholder:text-[var(--text-muted)] resize-none text-sm"
                style={{
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  borderColor: 'var(--border-subtle)',
                }}
              />
            </div>

            <button className="btn-primary group">
              <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Send Message Now
            </button>
          </div>

          {/* Right Side: Contact Info */}
          <div
            className="flex-1 p-8 md:p-14 relative overflow-hidden flex flex-col justify-center"
            style={{ background: 'linear-gradient(135deg, #0145F2 0%, #0136cc 100%)' }}
          >
            {/* Dot Pattern */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative z-10 space-y-12">
              <div>
                <h3 className="text-4xl font-black text-white mb-2 tracking-tight">CONTACT</h3>
                <div className="w-16 h-1.5 bg-white/40 rounded-full" />
              </div>

              <div className="space-y-10">
                {[
                  { icon: <Phone size={22} />, label: 'CALL US', value: '+94 71 813 6814' },
                  { icon: <Mail size={22} />, label: 'EMAIL', value: 'info@niroshchaminda.com' },
                  { icon: <MapPin size={22} />, label: 'LOCATION', value: 'Colombo, Sri Lanka' },
                  { icon: <Globe size={22} />, label: 'WEBSITE', value: 'www.niroshchaminda.com' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-5">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">
                        {item.label}
                      </p>
                      <p className="text-xl font-bold text-white break-all">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
