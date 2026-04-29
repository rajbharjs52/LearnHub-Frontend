// src/components/Sidebar.jsx
import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, BookOpen, MessageCircle, User, Upload,
  Users, FileText, BarChart3, AlertTriangle,
  Settings, LogOut, Shield, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import useAuthStore from '../context/AuthContext';

// ✅ User nav items
const USER_NAV = [
  { icon: Home,          label: 'Home',         path: '/' },
  { icon: BookOpen,      label: 'Notes',        path: '/notes' },
  { icon: Upload,        label: 'Upload Note',  path: '/notes/upload' },
  { icon: MessageCircle, label: 'Chat',         path: '/chat' },
  { icon: User,          label: 'Profile',      path: '/dashboard' },
  { icon: Settings,      label: 'Settings',    path: '/settings' },
];

// ✅ Admin-only nav items (shown in separate section)
const ADMIN_NAV = [
  { icon: Users,         label: 'Manage Users', path: '/admin/users' },
  { icon: FileText,      label: 'Manage Notes', path: '/admin/managenotes' },
  { icon: BarChart3,     label: 'Analytics',    path: '/admin/analytics' },
  { icon: Settings,  label: 'Settings',     path: '/settings' },
];

function NavItem({ item, isCollapsed, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === item.path ||
    (item.path !== '/' && location.pathname.startsWith(item.path));

  return (
    <Link
      to={item.path}
      onClick={onClick}
      title={isCollapsed ? item.label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
        ${isActive
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
    >
      <item.icon
        size={18}
        className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}
      />
      {!isCollapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

export default function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  // Close drawer on route change (mobile)
  const location = useLocation();
  useEffect(() => {
    if (isOpen) onClose();
  }, [location.pathname]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className={`flex items-center h-14 border-b border-gray-100 px-3 flex-shrink-0
        ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <BookOpen size={20} className="text-indigo-600 flex-shrink-0" />
            <span className="font-bold text-gray-900 text-sm truncate">
              {isAdmin ? 'Admin Panel' : 'Knowledge Exchange'}
            </span>
          </div>
        )}
        {/* Collapse toggle — desktop only */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed
            ? <ChevronRight size={16} />
            : <ChevronLeft size={16} />
          }
        </button>
        {/* Close button — mobile drawer only */}
        <button onClick={onClose} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
          <X size={18} />
        </button>
      </div>

      {/* ── Nav items ── */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">

        {/* User section label */}
        {!isCollapsed && (
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 pb-1.5">
            Menu
          </p>
        )}

        {USER_NAV.map(item => (
          <NavItem key={item.path} item={item} isCollapsed={isCollapsed} onClick={onClose} />
        ))}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className={`pt-3 pb-1.5 ${isCollapsed ? 'px-0' : 'px-3'}`}>
              {!isCollapsed ? (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Admin
                </p>
              ) : (
                <div className="border-t border-gray-200" />
              )}
            </div>

            {ADMIN_NAV.map(item => (
              <NavItem key={item.path} item={item} isCollapsed={isCollapsed} onClick={onClose} />
            ))}
          </>
        )}
      </div>

      {/* ── Bottom: user info + logout ── */}
      <div className="border-t border-gray-100 p-2 flex-shrink-0">
        {!isCollapsed && user && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              {user.profilePic ? (
                <img src={user.profilePic} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-xs font-semibold text-indigo-600">
                  {user.name?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            {isAdmin && <Shield size={13} className="text-indigo-500 flex-shrink-0" />}
          </div>
        )}

        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors
            ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={17} className="flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile overlay backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* ── Mobile drawer ── */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-xl z-50 w-64
        transform transition-transform duration-300 ease-in-out
        md:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {sidebarContent}
      </div>

      {/* ── Desktop sidebar (always visible) ── */}
      <div className={`
        hidden md:flex flex-col bg-white border-r border-gray-100 h-full flex-shrink-0
        transition-all duration-300
        ${isCollapsed ? 'w-16' : 'w-56'}
      `}>
        {sidebarContent}
      </div>
    </>
  );
}