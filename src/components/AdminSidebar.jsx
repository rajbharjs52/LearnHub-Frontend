// src/components/AdminSidebar.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Book, BarChart3, AlertTriangle, ChevronLeft } from 'lucide-react';

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { icon: Users, label: 'Manage Users', path: '/admin/users' },
    { icon: Book, label: 'Manage Notes', path: '/admin/managenotes' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: AlertTriangle, label: 'Moderation', path: '/admin/moderation' },
  ];

  return (
    <div className={`bg-white shadow-lg h-screen transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 flex items-center justify-between">
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-gray-600">
          <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
        {!isCollapsed && <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>}
      </div>
      <nav className="mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 rounded-r-md transition-colors w-full"
            >
              <Icon className="w-6 h-6 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}