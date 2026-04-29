// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, BookOpen, MessageSquare, Loader2,
  TrendingUp, ArrowUpRight, BarChart3, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../context/AuthContext';

// ✅ Chart config — each option defines what to render
const CHART_OPTIONS = [
  {
    id: 'users_notes',
    label: 'Users & Notes',
    icon: BarChart3,
    type: 'bar',
    series: [
      { key: 'users', label: 'Users', color: '#6366f1' },
      { key: 'notes', label: 'Notes', color: '#10b981' },
    ],
  },
  {
    id: 'growth',
    label: 'Growth Trend',
    icon: TrendingUp,
    type: 'area',
    series: [
      { key: 'users', label: 'Users', color: '#6366f1' },
      { key: 'notes', label: 'Notes', color: '#10b981' },
      { key: 'chats', label: 'Chats', color: '#f59e0b' },
    ],
  },
  {
    id: 'activity',
    label: 'Platform Activity',
    icon: Activity,
    type: 'line',
    series: [
      { key: 'notes', label: 'Notes', color: '#10b981' },
      { key: 'chats', label: 'Chats', color: '#f59e0b' },
      { key: 'messages', label: 'Messages', color: '#ef4444' },
    ],
  },
];

// Sample monthly data — replace with real API data when ready
const SAMPLE_DATA = [
  { month: 'Aug', users: 12, notes: 45, chats: 8,  messages: 120 },
  { month: 'Sep', users: 28, notes: 92, chats: 15, messages: 340 },
  { month: 'Oct', users: 45, notes: 138, chats: 22, messages: 580 },
  { month: 'Nov', users: 61, notes: 175, chats: 31, messages: 820 },
  { month: 'Dec', users: 88, notes: 210, chats: 44, messages: 1100 },
  { month: 'Jan', users: 120, notes: 268, chats: 58, messages: 1450 },
];

// Custom tooltip for charts
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

// Stat card component
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
          <p className="text-2xl font-bold text-gray-900">{value?.toLocaleString() ?? 0}</p>
        )}
      </div>
      {to && <ArrowUpRight size={16} className="text-gray-300 flex-shrink-0" />}
    </div>
  );

  return to ? <Link to={to}>{card}</Link> : card;
}

export default function AdminDashboard() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChart, setActiveChart] = useState('users_notes');

  useEffect(() => {
    if (!token) {
      setError('Please log in as admin');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    fetch('http://localhost:5000/api/admin/stats', {
      headers: { 'x-auth-token': token },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setStats(data.stats || {});
        setRecentUsers(data.recent?.users || []);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load stats');
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <p className="text-red-500 mb-2">{error}</p>
        <Link to="/login" className="text-indigo-600 text-sm underline">Go to login</Link>
      </div>
    </div>
  );

  const selectedChart = CHART_OPTIONS.find(c => c.id === activeChart);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Platform overview and analytics</p>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats?.totalUsers}
            color="bg-indigo-500"
            to="/admin/users"
            loading={loading}
          />
          <StatCard
            icon={BookOpen}
            label="Total Notes"
            value={stats?.totalNotes}
            color="bg-emerald-500"
            to="/admin/managenotes"
            loading={loading}
          />
          {/* ✅ Changed from Pending Moderation to Total Chatrooms */}
          <StatCard
            icon={MessageSquare}
            label="Total Chatrooms"
            value={stats?.totalRooms}
            color="bg-amber-500"
            loading={loading}
          />
          <StatCard
            icon={Activity}
            label="Total Messages"
            value={stats?.totalMessages}
            color="bg-rose-500"
            loading={loading}
          />
        </div>

        {/* ── Main content: Chart + Recent Users ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Analytics Chart — takes 2/3 width ── */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

            {/* Chart header with selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Platform Analytics</h2>
                <p className="text-xs text-gray-400 mt-0.5">Monthly platform activity overview</p>
              </div>

              {/* ✅ Chart type selector */}
              <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
                {CHART_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setActiveChart(opt.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeChart === opt.id
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon size={13} />
                      <span className="hidden sm:inline">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ✅ Dynamic chart based on selection */}
            <ResponsiveContainer width="100%" height={280}>
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
                      <linearGradient key={s.key} id={`grad_${s.key}`} x1="0" y1="0" x2="0" y2="1">
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
                    <Area
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.label}
                      stroke={s.color}
                      strokeWidth={2}
                      fill={`url(#grad_${s.key})`}
                      dot={{ r: 3, fill: s.color }}
                      activeDot={{ r: 5 }}
                    />
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
                    <Line
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.label}
                      stroke={s.color}
                      strokeWidth={2}
                      dot={{ r: 3, fill: s.color }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* ── Recent Users — takes 1/3 width ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Recent Users</h2>
                <p className="text-xs text-gray-400 mt-0.5">Latest registrations</p>
              </div>
              <Link
                to="/admin/users"
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
              >
                View all
              </Link>
            </div>

            {/* ✅ Improved recent users list */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : recentUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-300">
                  <Users size={32} className="mb-2" />
                  <p className="text-sm">No users yet</p>
                </div>
              ) : (
                recentUsers.map((u, index) => (
                  <div key={u._id || index} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      {u.profilePic ? (
                        <img src={u.profilePic} alt={u.name}
                          className="w-full h-full rounded-full object-cover"
                          onError={e => { e.target.style.display = 'none'; }} />
                      ) : (
                        <span className="text-sm font-semibold text-indigo-600">
                          {u.name?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.college || u.email}</p>
                    </div>

                    {/* Joined date */}
                    <span className="text-xs text-gray-300 flex-shrink-0 group-hover:text-gray-400 transition-colors">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short'
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Manage Users',  icon: Users,       path: '/admin/users',       color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' },
              { label: 'Manage Notes',  icon: BookOpen,    path: '/admin/managenotes', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
              { label: 'Analytics',     icon: BarChart3,   path: '/admin/analytics',   color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
              { label: 'Settings',    icon: Activity,    path: '/admin/moderation',  color: 'bg-rose-50 text-rose-600 hover:bg-rose-100' },
            ].map(action => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.path}
                  to={action.path}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${action.color}`}
                >
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