// src/App.jsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Notes from './pages/Notes';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import useAuthStore from './context/AuthContext';
import SingleNote from './pages/SingleNote';
import UploadNote from './pages/UploadNote';
import ChatList from './pages/ChatList';
import ChatRoomDetail from './pages/ChatRoomDetail';
import ManageUsers from './pages/admin/ManageUsers';
import ManageNotes from './pages/admin/ManageNotes';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // ✅ Sidebar state — shared between Navbar and Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);       // mobile drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop collapse

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">

      {/* Navbar — passes menu toggle down */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar — only shown when logged in */}
        {user && (
          <Sidebar
            isOpen={sidebarOpen}
            isCollapsed={sidebarCollapsed}
            onClose={() => setSidebarOpen(false)}
            onToggleCollapse={() => setSidebarCollapsed(c => !c)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                {isAdmin ? <AdminDashboard /> : <UserDashboard />}
              </ProtectedRoute>
            } />

            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Notes */}
            <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
            <Route path="/notes/upload" element={<ProtectedRoute><UploadNote /></ProtectedRoute>} />
            <Route path="/notes/:id" element={<ProtectedRoute><SingleNote /></ProtectedRoute>} />

            {/* Chat */}
            <Route path="/chat" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
            <Route path="/chat/:roomId" element={<ProtectedRoute><ChatRoomDetail /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
            <Route path="/admin/managenotes" element={<AdminRoute><ManageNotes /></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}