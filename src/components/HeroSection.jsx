// src/components/HeroSection.jsx
import { Link } from 'react-router-dom';
import { BookOpen, Users, Sparkles, ArrowRight, Star } from 'lucide-react';
import hero from '../assets/Herosectionimg.jpg';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden flex items-center">

      {/* Background decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 py-20 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">

          {/* Left content */}
          <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">

            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-2 mb-8">
              <div className="flex -space-x-1">
                {['🎓', '📚', '✨'].map((e, i) => (
                  <span key={i} className="w-6 h-6 rounded-full bg-white border border-indigo-100 flex items-center justify-center text-xs">{e}</span>
                ))}
              </div>
              <span className="text-sm font-medium text-indigo-700">Trusted by 10,000+ students</span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Share Notes,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Ace Your Exams
              </span>
              Together
            </h1>

            <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
              Upload study materials, discuss doubts in real-time chat rooms,
              and get AI-powered summaries — all in one platform built for students.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-10">
              {[
                { icon: BookOpen, label: 'Upload Notes',     color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
                { icon: Users,    label: 'Live Chat Rooms',  color: 'bg-purple-50 text-purple-700 border-purple-100' },
                { icon: Sparkles, label: 'AI Summaries',     color: 'bg-blue-50 text-blue-700 border-blue-100'   },
              ].map(({ icon: Icon, label, color }) => (
                <span key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${color}`}>
                  <Icon size={14} />
                  {label}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Link to="/register"
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-8 rounded-xl text-base transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5">
                Get Started Free
                <ArrowRight size={18} />
              </Link>
              <Link to="/login"
                className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold py-3.5 px-8 rounded-xl text-base hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                Sign In
              </Link>
            </div>

            {/* Social proof numbers */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 mt-12 pt-8 border-t border-gray-100">
              {[
                { value: '10K+', label: 'Students' },
                { value: '50K+', label: 'Notes Shared' },
                { value: '500+', label: 'Colleges' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center lg:text-left">
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image with floating cards */}
          <div className="flex-1 relative flex justify-center lg:justify-end">
            <div className="relative">
              <img
                src={hero}
                alt="Students using Knowledge Exchange"
                loading="lazy"
                className="rounded-2xl shadow-2xl w-full max-w-md lg:max-w-lg object-cover"
                style={{ maxHeight: '520px' }}
              />

              {/* Floating card 1 — top left */}
              <div className="absolute -left-6 top-8 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-3 border border-gray-100">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Note Uploaded</p>
                  <p className="text-xs text-gray-400">Calculus Basics.pdf</p>
                </div>
              </div>

              {/* Floating card 2 — bottom right */}
              <div className="absolute -right-6 bottom-12 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-3 border border-gray-100">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">AI Summary Ready</p>
                  <p className="text-xs text-gray-400">200 words generated</p>
                </div>
              </div>

              {/* Floating card 3 — bottom left */}
              <div className="absolute -left-4 bottom-4 bg-white rounded-2xl shadow-xl px-4 py-2.5 border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['🧑', '👩', '👨'].map((e, i) => (
                      <span key={i} className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs">{e}</span>
                    ))}
                  </div>
                  <p className="text-xs font-medium text-gray-700">+42 online now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}