// src/components/Footer.jsx
import { Link } from 'react-router-dom';
import { BookOpen, Facebook, Twitter, Instagram, Github, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';

const LINKS = {
  Platform: [
    { label: 'Browse Notes',  to: '/notes'   },
    { label: 'Upload Note',   to: '/notes/upload' },
    { label: 'Chat Rooms',    to: '/chat'    },
    { label: 'Dashboard',     to: '/dashboard' },
  ],
  Company: [
    { label: 'About Us',      to: '/about'   },
    { label: 'Contact',       to: '/contact' },
    { label: 'Privacy Policy',to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
  ],
};

const SOCIALS = [
  { icon: Facebook,  href: 'https://facebook.com',  label: 'Facebook'  },
  { icon: Twitter,   href: 'https://twitter.com',   label: 'Twitter'   },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Github,    href: 'https://github.com',    label: 'GitHub'    },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    // ── Backend ready: POST /api/newsletter with { email } ──
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">

        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                <BookOpen size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white">Knowledge Exchange</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Connecting students through notes, discussions, and AI-powered learning tools. Built for students, by students.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 bg-gray-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-colors">
                  <Icon size={15} className="text-gray-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to}
                      className="text-gray-400 hover:text-white text-sm transition-colors hover:translate-x-0.5 inline-block">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Stay Updated</h4>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Get new features, study tips, and platform updates straight to your inbox.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-3">
                ✓ Thanks for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-3 py-2.5 text-sm bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <button type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors">
                  Subscribe
                </button>
              </form>
            )}

            {/* Contact info */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <Mail size={13} />
                <span>support@knowledgeexchange.in</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <MapPin size={13} />
                <span>India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Knowledge Exchange. All rights reserved.
            </p>
            <p className="text-gray-600 text-sm flex items-center gap-1">
              Made with <span className="text-red-400">❤️</span> for students across India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}