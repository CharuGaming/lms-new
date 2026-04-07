'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Globe, Send } from 'lucide-react';

export default function ContactSection() {
  return (
    <section className="py-24 px-6 bg-transparent relative">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row rounded-[40px] overflow-hidden shadow-2xl shadow-black/20 min-h-[600px] border border-[var(--border)]"
          style={{ background: 'var(--card-bg)' }}
        >
          {/* Left Side: Form */}
          <div className="flex-[1.4] p-8 md:p-14">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-sm font-bold ml-2" style={{ color: 'var(--foreground)' }}>Your Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  className="w-full px-6 py-4 rounded-2xl border border-[var(--border)] outline-none transition-all placeholder:text-[var(--text-muted)]"
                  style={{ background: 'var(--background)', color: 'var(--foreground)' }}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold ml-2" style={{ color: 'var(--foreground)' }}>Mobile Number</label>
                <input 
                  type="text" 
                  placeholder="+94 77 123 4567" 
                  className="w-full px-6 py-4 rounded-2xl border border-[var(--border)] outline-none transition-all placeholder:text-[var(--text-muted)]"
                  style={{ background: 'var(--background)', color: 'var(--foreground)' }}
                />
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <label className="text-sm font-bold ml-2" style={{ color: 'var(--foreground)' }}>Email Address</label>
              <input 
                type="email" 
                placeholder="john@example.com" 
                className="w-full px-6 py-4 rounded-2xl border border-[var(--border)] outline-none transition-all placeholder:text-[var(--text-muted)]"
                style={{ background: 'var(--background)', color: 'var(--foreground)' }}
              />
            </div>

            <div className="space-y-3 mb-10">
              <label className="text-sm font-bold ml-2" style={{ color: 'var(--foreground)' }}>Your Message</label>
              <textarea 
                rows={5}
                placeholder="How can we help you?" 
                className="w-full px-6 py-4 rounded-2xl border border-[var(--border)] outline-none transition-all placeholder:text-[var(--text-muted)] resize-none"
                style={{ background: 'var(--background)', color: 'var(--foreground)' }}
              ></textarea>
            </div>

            <button 
              className="flex items-center gap-3 px-8 py-4 text-white font-bold rounded-2xl transition-all shadow-lg hover:brightness-110 active:scale-95 group"
              style={{ background: 'var(--accent)', boxShadow: '0 10px 30px var(--accent-glow)' }}
            >
              <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
              Send Message Now
            </button>
          </div>

          {/* Right Side: Contact Info */}
          <div className="flex-1 p-8 md:p-14 relative overflow-hidden flex flex-col justify-center" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #d4891a 100%)' }}>
            {/* Dot Pattern Overlay */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none" 
              style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            />
            
            <div className="relative z-10 space-y-12">
              <div>
                <h3 className="text-4xl font-black text-[#0a0a1a] mb-2 tracking-tight">CONTACT</h3>
                <div className="w-16 h-1.5 bg-[#0a0a1a] rounded-full ml-1" />
              </div>

              <div className="space-y-10">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-black/5 flex items-center justify-center border border-black/10 text-[#0a0a1a] group cursor-pointer hover:bg-black/10 transition-all font-bold">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#0a0a1a]/40 uppercase tracking-widest mb-1">CALL US</p>
                    <p className="text-xl font-bold text-[#0a0a1a]">+94 71 813 6814</p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-black/5 flex items-center justify-center border border-black/10 text-[#0a0a1a] group cursor-pointer hover:bg-black/10 transition-all font-bold">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#0a0a1a]/40 uppercase tracking-widest mb-1">EMAIL</p>
                    <p className="text-xl font-bold text-[#0a0a1a] break-all">info@niroshchaminda.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-black/5 flex items-center justify-center border border-black/10 text-[#0a0a1a] group cursor-pointer hover:bg-black/10 transition-all font-bold">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#0a0a1a]/40 uppercase tracking-widest mb-1">LOCATION</p>
                    <p className="text-xl font-bold text-[#0a0a1a]">Colombo, Sri Lanka</p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-black/5 flex items-center justify-center border border-black/10 text-[#0a0a1a] group cursor-pointer hover:bg-black/10 transition-all font-bold">
                    <Globe size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#0a0a1a]/40 uppercase tracking-widest mb-1">WEBSITE</p>
                    <p className="text-xl font-bold text-[#0a0a1a] break-all">www.niroshchaminda.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
