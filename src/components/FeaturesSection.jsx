// src/components/FeaturesSection.jsx
import { Upload, MessageCircle, Sparkles, Shield, Search, BookMarked } from 'lucide-react';

const features = [
  {
    icon: Upload,
    title: 'Upload & Share Notes',
    desc: 'Upload PDFs and images instantly. Tag by subject and college so the right students find your notes.',
    color: 'bg-indigo-50 text-indigo-600',
    border: 'hover:border-indigo-200',
  },
  {
    icon: MessageCircle,
    title: 'Live Chat Rooms',
    desc: 'Join subject-based rooms and discuss doubts in real-time with peers from your own college.',
    color: 'bg-purple-50 text-purple-600',
    border: 'hover:border-purple-200',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Summaries',
    desc: 'Paste any text and get a concise 200-word AI summary instantly. Study smarter, not harder.',
    color: 'bg-blue-50 text-blue-600',
    border: 'hover:border-blue-200',
  },
  {
    icon: Search,
    title: 'Smart Discovery',
    desc: 'Filter notes by subject, college, or tags. Find exactly what you need in seconds.',
    color: 'bg-emerald-50 text-emerald-600',
    border: 'hover:border-emerald-200',
  },
  {
    icon: BookMarked,
    title: 'Save & Organise',
    desc: 'Bookmark notes you love and build your personal study library for quick access anytime.',
    color: 'bg-amber-50 text-amber-600',
    border: 'hover:border-amber-200',
  },
  {
    icon: Shield,
    title: 'Safe Community',
    desc: 'Admin moderation keeps content clean and relevant. A trusted space for serious students.',
    color: 'bg-rose-50 text-rose-600',
    border: 'hover:border-rose-200',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-4 uppercase tracking-wider">
            Everything you need
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Why Students Love
            <span className="text-indigo-600"> Knowledge Exchange</span>
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            One platform to upload, discover, discuss, and summarise notes — built specifically for college students.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i}
                className={`group p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-lg transition-all duration-300 cursor-default ${f.border}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Stats bar */}
        <div className="mt-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { value: '10,000+', label: 'Active Students' },
              { value: '50,000+', label: 'Notes Shared' },
              { value: '500+',    label: 'Colleges' },
              { value: '4.9★',    label: 'Student Rating' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl md:text-4xl font-bold mb-1">{value}</p>
                <p className="text-indigo-200 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}