import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-12" style={{ background: 'var(--card-bg)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="text-2xl" style={{ color: 'var(--accent)' }}>⬡</span>
              <span className="font-bold text-lg">TheEducator</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Empowering minds through quality education, one lesson at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Quick Links</h4>
            <div className="flex flex-col gap-2">
              {['/', '/courses', '/videos', '/about'].map((href) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm transition-colors hover:text-[var(--accent)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {href === '/' ? 'Home' : href.slice(1).charAt(0).toUpperCase() + href.slice(2)}
                </Link>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Connect</h4>
            <div className="flex gap-3">
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

        <div className="text-center pt-6" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © 2026 TheEducator. All rights reserved. Made with ❤️ for learning.
          </p>
        </div>
      </div>
    </footer>
  );
}
