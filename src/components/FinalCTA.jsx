// src/components/FinalCTA.jsx
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap } from 'lucide-react';

const benefits = [
  'Unlimited note uploads and sharing',
  'Real-time chat rooms by subject',
  'AI summaries for every note',
  'Free for all college students',
];

export default function FinalCTA() {
  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-[0.03]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30" />

      <div className="relative max-w-5xl mx-auto px-4 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-2 mb-8">
          <Zap size={14} className="text-indigo-600" />
          <span className="text-sm font-medium text-indigo-700">No credit card required</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Ready to Exchange
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Knowledge?
          </span>
        </h2>

        <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
          Join thousands of students already sharing notes and acing their exams together.
        </p>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto mb-12 text-left">
          {benefits.map(b => (
            <div key={b} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
              <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700">{b}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/register"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-10 rounded-xl text-lg transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5">
            Start for Free
            <ArrowRight size={20} />
          </Link>
          <Link to="/notes"
            className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 font-semibold py-4 px-10 rounded-xl text-lg hover:border-indigo-300 hover:text-indigo-600 transition-all">
            Browse Notes
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-medium">
            Sign in here
          </Link>
        </p>
      </div>
    </section>
  );
}