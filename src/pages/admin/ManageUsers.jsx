// src/pages/admin/ManageUsers.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Loader2, Trash2, Edit3, X, Check,
  ChevronLeft, ChevronRight, Shield, User as UserIcon,
  Mail, Building, Calendar, BookOpen, MessageCircle
} from 'lucide-react';
import useAuthStore from '../../context/AuthContext';
import { API_URL } from '../../config/api';

const ROLES = ['user', 'admin'];

function EditUserModal({ user, token, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    college: user.college || '',
    role: user.role || 'user',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

// ── EditUserModal — fix fetch URL ──
const handleSave = async () => {
  setSaving(true);
  setError('');
  try {
    const userId = user._id || user.id; // ✅ fallback
    const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.msg || 'Update failed');
    }
    const updated = await res.json();
    onSaved(updated);
  } catch (err) {
    setError(err.message);
  } finally {
    setSaving(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit User</h2>
            <p className="text-xs text-gray-400 mt-0.5">Update user information</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Full Name</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
            <input
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Email address"
              type="email"
            />
          </div>

          {/* College */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">College</label>
            <input
              value={form.college}
              onChange={e => setForm(f => ({ ...f, college: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="College name"
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Role</label>
            <div className="flex gap-2">
              {ROLES.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: r }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                    form.role === r
                      ? r === 'admin'
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-gray-800 border-gray-800 text-white'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {r === 'admin' ? '🛡️ Admin' : '👤 User'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-3 px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Check size={14} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ user, token, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

// ── DeleteConfirm — fix fetch URL ──
const handleDelete = async () => {
  setDeleting(true);
  try {
    const userId = user._id || user.id; // ✅ fallback
    const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'x-auth-token': token },
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.msg || 'Delete failed');
    }
    onDeleted(user._id || user.id);
  } catch (err) {
    setError(err.message);
  } finally {
    setDeleting(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Delete User</h3>
            <p className="text-xs text-gray-400">This will also delete their notes and comments</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to delete <span className="font-medium text-gray-800">"{user.name}"</span>?
        </p>
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2">
            {deleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : <><Trash2 size={14} /> Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManageUsers() {
  const { token, user: adminUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, page, limit: 10 });
      const res = await fetch(`${API_URL}/api/admin/users?${params}`, {
        headers: { 'x-auth-token': token },
      });
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, search, page]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

// ── handleSaved — match by id or _id ──
const handleSaved = (updated) => {
  setUsers(prev => prev.map(u => {
    const uId = u._id || u.id;
    const updatedId = updated._id || updated.id;
    return uId === updatedId ? { ...u, ...updated } : u; // ✅ merge to preserve id field
  }));
  setEditUser(null);
};

// ── handleDeleted — match by id or _id ──
const handleDeleted = (deletedId) => {
  setUsers(prev => prev.filter(u => (u._id || u.id) !== deletedId));
  setTotal(t => t - 1);
  setDeleteUser(null);
};

  return (
    <div className="min-h-screen bg-gray-50">
      {editUser && <EditUserModal user={editUser} token={token} onClose={() => setEditUser(null)} onSaved={handleSaved} />}
      {deleteUser && <DeleteConfirm user={deleteUser} token={token} onClose={() => setDeleteUser(null)} onDeleted={handleDeleted} />}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Manage Users</h1>
            <p className="text-sm text-gray-400 mt-0.5">{total} total users</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, college..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <UserIcon size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <>
            {/* Table — desktop */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">College</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
{/* // ── Table row — fix key prop + self-delete guard ──

// Replace the .map() opening line — add proper key */}
{users.map(u => {
  const uId = u._id || u.id; // ✅ derive once
  const adminId = adminUser?._id || adminUser?.id;
  const isSelf = uId === adminId;

  return (
    <tr key={uId} className="hover:bg-gray-50 transition-colors"> {/* ✅ fixes key warning */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            {u.profilePic ? (
              <img src={u.profilePic} alt={u.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-sm font-semibold text-indigo-600">{u.name?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{u.name}</p>
            <p className="text-xs text-gray-400">{u.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-gray-500 text-sm">{u.college || '—'}</td>
      <td className="px-5 py-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
          u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {u.role === 'admin' ? <Shield size={10} /> : <UserIcon size={10} />}
          {u.role}
        </span>
      </td>
      <td className="px-5 py-4 text-gray-400 text-xs">
        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setEditUser(u)}
            className="p-2 rounded-xl hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <Edit3 size={15} />
          </button>
          {/* ✅ Hide delete for self */}
          {!isSelf && (
            <button
              onClick={() => setDeleteUser(u)}
              className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
})}
                </tbody>
              </table>
            </div>

            {/* Cards — mobile */}
            <div className="md:hidden space-y-3">
              {users.map(u => (
                <div key={u._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-indigo-600">{u.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                    <span>🏫 {u.college || 'N/A'}</span>
                    <span>📅 {new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditUser(u)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                      <Edit3 size={13} /> Edit
                    </button>
                    {u._id !== adminUser?._id && u._id !== adminUser?.id && (
                      <button onClick={() => setDeleteUser(u)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                        <Trash2 size={13} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between mt-5">
                <p className="text-sm text-gray-400">
                  Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-gray-600 px-2">
                    {page} / {pages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}