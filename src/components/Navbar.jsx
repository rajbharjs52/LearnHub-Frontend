// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Shield, Menu } from 'lucide-react';
import useAuthStore from '../context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-100 h-14 flex items-center px-4 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between w-full">

        {/* Left: hamburger (mobile) + logo */}
        <div className="flex items-center gap-3">
          {/* ✅ Mobile hamburger — triggers sidebar drawer */}
          {user && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <Menu size={20} />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
            <BookOpen size={22} />
            <span className="hidden sm:inline">Knowledge Exchange</span>
          </Link>
        </div>

        {/* Right: user info + logout / auth buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Admin badge */}
              {user.role === 'admin' && (
                <span className="hidden sm:flex items-center gap-1 text-xs px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                  <Shield size={11} />
                  Admin
                </span>
              )}

              {/* Avatar + name */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.name}
                      className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-indigo-600">
                      {user.name?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {user.name}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                Login
              </Link>
              <Link to="/register"
                className="text-sm font-medium bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}