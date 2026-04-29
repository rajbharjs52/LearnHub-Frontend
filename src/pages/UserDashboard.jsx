// src/pages/UserDashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  BookOpen, Heart, MessageCircle, Loader2,
  Upload, TrendingUp, Activity, BarChart3,
  ArrowUpRight, ArrowRight
} from 'lucide-react';
import useAuthStore from '../context/AuthContext';

const CHART_OPTIONS = [
  {
    id: 'notes_likes',
    label: 'Notes & Likes',
    icon: BarChart3,
    type: 'bar',
    series: [
      { key: 'notes', label: 'Notes', color: '#6366f1' },
      { key: 'likes', label: 'Likes', color: '#f43f5e' },
    ],
  },
  {
    id: 'growth',
    label: 'My Growth',
    icon: TrendingUp,
    type: 'area',
    series: [
      { key: 'notes', label: 'Notes', color: '#6366f1' },
      { key: 'comments', label: 'Comments', color: '#10b981' },
    ],
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: Activity,
    type: 'line',
    series: [
      { key: 'notes', label: 'Notes', color: '#6366f1' },
      { key: 'likes', label: 'Likes', color: '#f43f5e' },
      { key: 'comments', label: 'Comments', color: '#10b981' },
    ],
  },
];

const SAMPLE_DATA = [
  { month: 'Aug', notes: 1, likes: 3,  comments: 2 },
  { month: 'Sep', notes: 2, likes: 7,  comments: 4 },
  { month: 'Oct', notes: 3, likes: 12, comments: 6 },
  { month: 'Nov', notes: 2, likes: 9,  comments: 5 },
  { month: 'Dec', notes: 4, likes: 15, comments: 8 },
  { month: 'Jan', notes: 5, likes: 20, comments: 11 },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-medium text-gray-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, to, loading }) {
  const card = (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4
      ${to ? 'hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer' : ''}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 mb-0.5">{label}</p>
        {loading ? (
          <div className="h-7 w-16 bg-gray-100 animate-pulse rounded-lg" />
        ) : (
          <p className="text-2xl font-bold text-gray-900">{value ?? 0}</p>
        )}
      </div>
      {to && <ArrowUpRight size={16} className="text-gray-300 flex-shrink-0" />}
    </div>
  );
  return to ? <Link to={to}>{card}</Link> : card;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChart, setActiveChart] = useState('notes_likes');

  useEffect(() => {
    if (!token) { setError('Please log in'); setLoading(false); return; }
    setLoading(true);
    fetch('http://localhost:5000/api/dashboard', {
      headers: { 'x-auth-token': token },
    })
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(data => {
        setStats(data.stats || {});
        setRecentNotes(data.recent?.notes || []);
        setError('');
      })
      .catch(err => { console.error(err); setError('Failed to load dashboard'); })
      .finally(() => setLoading(false));
  }, [token]);

  const selectedChart = CHART_OPTIONS.find(c => c.id === activeChart);

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <p className="text-red-500">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Here's your activity overview</p>
          </div>
          <Link to="/notes/upload"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Upload size={15} />
            <span className="hidden sm:inline">Upload Note</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={BookOpen} label="Notes Uploaded" value={stats?.uploadedNotes}
            color="bg-indigo-500" to="/notes" loading={loading} />
          <StatCard icon={Heart} label="Saved Notes" value={stats?.savedNotes}
            color="bg-rose-500" loading={loading} />
          <StatCard icon={Heart} label="Likes Given" value={stats?.likesGiven}
            color="bg-pink-500" loading={loading} />
          <StatCard icon={MessageCircle} label="Comments Made" value={stats?.commentsMade}
            color="bg-violet-500" loading={loading} />
        </div>

        {/* Chart + Recent Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Activity Overview</h2>
                <p className="text-xs text-gray-400 mt-0.5">Your monthly activity</p>
              </div>
              <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
                {CHART_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button key={opt.id} onClick={() => setActiveChart(opt.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeChart === opt.id
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}>
                      <Icon size={13} />
                      <span className="hidden sm:inline">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              {selectedChart.type === 'bar' ? (
                <BarChart data={SAMPLE_DATA} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  {selectedChart.series.map(s => (
                    <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              ) : selectedChart.type === 'area' ? (
                <AreaChart data={SAMPLE_DATA}>
                  <defs>
                    {selectedChart.series.map(s => (
                      <linearGradient key={s.key} id={`ugrad_${s.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={s.color} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  {selectedChart.series.map(s => (
                    <Area key={s.key} type="monotone" dataKey={s.key} name={s.label}
                      stroke={s.color} strokeWidth={2} fill={`url(#ugrad_${s.key})`}
                      dot={{ r: 3, fill: s.color }} activeDot={{ r: 5 }} />
                  ))}
                </AreaChart>
              ) : (
                <LineChart data={SAMPLE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  {selectedChart.series.map(s => (
                    <Line key={s.key} type="monotone" dataKey={s.key} name={s.label}
                      stroke={s.color} strokeWidth={2}
                      dot={{ r: 3, fill: s.color }} activeDot={{ r: 5 }} />
                  ))}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Recent Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Recent Notes</h2>
                <p className="text-xs text-gray-400 mt-0.5">Your latest uploads</p>
              </div>
              <Link to="/notes" className="text-xs text-indigo-600 hover:underline font-medium">
                View all
              </Link>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5 py-1">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : recentNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BookOpen size={32} className="text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400 mb-3">No notes yet</p>
                  <Link to="/notes/upload"
                    className="text-xs text-indigo-600 font-medium hover:underline">
                    Upload your first note →
                  </Link>
                </div>
              ) : (
                recentNotes.map(note => (
                  <div key={note._id}
                    onClick={() => navigate(`/notes/${note._id}`)}
                    className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-indigo-100 flex-shrink-0">
                      {note.coverImage ? (
                        <img src={note.coverImage} alt={note.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen size={16} className="text-indigo-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
                        {note.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(note.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-indigo-400 flex-shrink-0 mt-1 transition-colors" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Browse Notes', icon: BookOpen, path: '/notes',         color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' },
              { label: 'Upload Note',  icon: Upload,   path: '/notes/upload',  color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
              { label: 'Chat',         icon: MessageCircle, path: '/chat',     color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
              { label: 'Settings',     icon: Activity, path: '/settings',      color: 'bg-violet-50 text-violet-600 hover:bg-violet-100' },
            ].map(action => {
              const Icon = action.icon;
              return (
                <Link key={action.path} to={action.path}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${action.color}`}>
                  <Icon size={16} />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}