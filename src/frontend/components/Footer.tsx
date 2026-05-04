import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      className="py-12"
      style={{ background: 'var(--foreground)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
                style={{ background: 'var(--primary)' }}
              >
                E
              </div>
              <span className="font-bold text-lg text-white">TheEducator</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Empowering minds through quality education, one lesson at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="font-semibold mb-3 text-xs uppercase tracking-wider"
              style={{ color: '#0145F2' }}
            >
              Quick Links
            </h4>
            <div className="flex flex-col gap-2">
              {['/', '/courses', '/videos', '/about'].map((href) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm transition-colors hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {href === '/' ? 'Home' : href.slice(1).charAt(0).toUpperCase() + href.slice(2)}
                </Link>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <h4
              className="font-semibold mb-3 text-xs uppercase tracking-wider"
              style={{ color: '#0145F2' }}
            >
              Connect
            </h4>
            <div className="flex gap-3 flex-wrap">
              {[
                { label: 'YouTube', href: 'https://youtube.com', color: '#ff0000' },
                { label: 'WhatsApp', href: 'https://wa.me/', color: '#25d366' },
                { label: 'Instagram', href: 'https://instagram.com', color: '#e1306c' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-semibold rounded-full text-white transition-transform hover:-translate-y-1"
                  style={{ background: s.color }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div
          className="text-center pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © 2026 TheEducator. All rights reserved. Made with ❤️ for learning.
          </p>
        </div>
      </div>
    </footer>
  );
}
