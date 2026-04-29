// src/pages/admin/Analytics.jsx
import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { Users, BookOpen, MessageSquare, TrendingUp, Loader2, Activity } from 'lucide-react';
import useAuthStore from '../../context/AuthContext';

const MONTHLY_DATA = [
  { month: 'Aug', users: 12, notes: 45, chats: 8,  comments: 30  },
  { month: 'Sep', users: 28, notes: 92, chats: 15, comments: 74  },
  { month: 'Oct', users: 45, notes: 138, chats: 22, comments: 110 },
  { month: 'Nov', users: 61, notes: 175, chats: 31, comments: 148 },
  { month: 'Dec', users: 88, notes: 210, chats: 44, comments: 182 },
  { month: 'Jan', users: 120, notes: 268, chats: 58, comments: 230 },
];

const SUBJECT_DATA = [
  { subject: 'Mathematics', count: 48 },
  { subject: 'Programming', count: 72 },
  { subject: 'Physics', count: 35 },
  { subject: 'Chemistry', count: 28 },
  { subject: 'Biology', count: 19 },
  { subject: 'Other', count: 22 },
];

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

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

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Analytics() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch('http://localhost:5000/api/admin/stats', {
      headers: { 'x-auth-token': token },
    })
      .then(res => res.json())
      .then(data => setStats(data.stats || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-400 mt-0.5">Detailed platform metrics and trends</p>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users',    value: stats?.totalUsers,    icon: Users,        color: 'bg-indigo-500' },
            { label: 'Total Notes',    value: stats?.totalNotes,    icon: BookOpen,     color: 'bg-emerald-500' },
            { label: 'Total Chatrooms',value: stats?.totalRooms,    icon: MessageSquare,color: 'bg-amber-500' },
            { label: 'Total Messages', value: stats?.totalMessages, icon: Activity,     color: 'bg-rose-500' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-xl font-bold text-gray-900">{item.value?.toLocaleString() ?? '—'}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* User + Note growth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title="User Growth" subtitle="Monthly new user registrations">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={MONTHLY_DATA}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="users" name="Users" stroke="#6366f1"
                  strokeWidth={2} fill="url(#userGrad)" dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard title="Notes Uploaded" subtitle="Monthly note upload activity">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={MONTHLY_DATA}>
                <defs>
                  <linearGradient id="noteGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="notes" name="Notes" stroke="#10b981"
                  strokeWidth={2} fill="url(#noteGrad)" dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        {/* Engagement + Subject breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SectionCard title="Engagement Trends" subtitle="Comments and chat activity over time">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={MONTHLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="comments" name="Comments" stroke="#8b5cf6"
                    strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="chats" name="Chats" stroke="#f59e0b"
                    strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </SectionCard>
          </div>

          <SectionCard title="Notes by Subject" subtitle="Distribution across subjects">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={SUBJECT_DATA} dataKey="count" nameKey="subject"
                  cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                  {SUBJECT_DATA.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name) => [val, name]} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {SUBJECT_DATA.map((item, i) => (
                <div key={item.subject} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="truncate">{item.subject}</span>
                  <span className="ml-auto font-medium text-gray-700">{item.count}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* All metrics bar chart */}
        <SectionCard title="Full Platform Overview" subtitle="All key metrics combined — monthly view">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={MONTHLY_DATA} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="users"    name="Users"    fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="notes"    name="Notes"    fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="comments" name="Comments" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="chats"    name="Chats"    fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

      </div>
    </div>
  );
}