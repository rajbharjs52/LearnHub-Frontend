// src/components/UserSidebar.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, BookOpen, MessageCircle, User, ChevronLeft } from 'lucide-react';

export default function UserSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: BookOpen, label: 'Notes', path: '/notes' },
    { icon: MessageCircle, label: 'Chat', path: '/chat' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className={`bg-white shadow-lg h-screen transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 flex items-center justify-between">
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-gray-600">
          <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
        {!isCollapsed && <h1 className="text-xl font-bold text-gray-900">Knowledge Exchange</h1>}
      </div>
      <nav className="mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded-r-md transition-colors w-full"
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