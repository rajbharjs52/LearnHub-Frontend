// src/pages/Settings.jsx
import { useState, useRef } from 'react';
import {
  User, Lock, Shield, Loader2,
  Check, Eye, EyeOff, Camera, AlertTriangle
} from 'lucide-react';
import useAuthStore from '../context/AuthContext';
import { API_URL } from '../config/api';

// ✅ Notifications tab removed from TABS
const TABS = [
  { id: 'profile',  label: 'Profile',  icon: User   },
  { id: 'password', label: 'Password', icon: Lock   },
  { id: 'account',  label: 'Account',  icon: Shield },
];

function SuccessBanner({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700">
      <Check size={15} className="flex-shrink-0" />{msg}
    </div>
  );
}

function ErrorBanner({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
      <AlertTriangle size={15} className="flex-shrink-0" />{msg}
    </div>
  );
}

function ProfileTab({ user, token, onUpdate }) {
  const [form, setForm] = useState({
    name:    user?.name    || '',
    email:   user?.email   || '',
    college: user?.college || '',
    course:  user?.course  || '',
    bio:     user?.bio     || '',
  });
  const [saving, setSaving]             = useState(false);
  const [success, setSuccess]           = useState('');
  const [error, setError]               = useState('');
  const [picUploading, setPicUploading] = useState(false);
  const [picSuccess, setPicSuccess]     = useState('');
  const [picError, setPicError]         = useState('');
  const [picPreview, setPicPreview]     = useState(user?.profilePic || null);
  const fileInputRef = useRef(null);

  const handlePicChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { setPicError('Only JPG, PNG, WEBP allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { setPicError('Image must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setPicPreview(ev.target.result);
    reader.readAsDataURL(file);
    setPicUploading(true); setPicError(''); setPicSuccess('');
    try {
      const formData = new FormData();
      formData.append('profilePic', file);
      const res = await fetch(`${API_URL}/api/auth/profile-pic`, {
        method: 'PUT',
        headers: { 'x-auth-token': token },
        body: formData,
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.msg || 'Upload failed'); }
      const data = await res.json();
      setPicPreview(data.profilePic);
      onUpdate({ profilePic: data.profilePic });
      setPicSuccess('Profile picture updated');
      setTimeout(() => setPicSuccess(''), 3000);
    } catch (err) {
      setPicError(err.message || 'Upload failed');
      setPicPreview(user?.profilePic || null);
    } finally {
      setPicUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true); setSuccess(''); setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.msg || 'Update failed'); }
      const updated = await res.json();
      onUpdate(updated);
      setSuccess('Profile updated successfully');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
            {picUploading ? (
              <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                <Loader2 size={22} className="animate-spin text-indigo-500" />
              </div>
            ) : picPreview ? (
              <img src={picPreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-indigo-600">{user?.name?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={picUploading}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-60">
            <Camera size={11} className="text-white" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
            onChange={handlePicChange} className="hidden" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-400 truncate">{user?.email}</p>
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={picUploading}
            className="text-xs text-indigo-500 mt-1 hover:underline disabled:opacity-60">
            {picUploading ? 'Uploading...' : 'Change photo'}
          </button>
        </div>
      </div>
      {picSuccess && <SuccessBanner msg={picSuccess} />}
      {picError   && <ErrorBanner   msg={picError}   />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Full Name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Your full name" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
          <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            type="email"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Email address" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">College</label>
          <input value={form.college} onChange={e => setForm(f => ({ ...f, college: e.target.value }))}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Your college" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Course</label>
          <input value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="e.g. BSc Computer Science" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Bio</label>
        <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          rows={3} placeholder="Tell others about yourself..."
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
      </div>
      <SuccessBanner msg={success} />
      <ErrorBanner   msg={error}   />
      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
        {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Check size={14} /> Save Changes</>}
      </button>
    </div>
  );
}

// ✅ Field is now OUTSIDE PasswordTab — this is the root cause fix
// Defining it inside caused remount on every keystroke → focus lost
function PasswordField({ id, label, placeholder, value, onChange, show, onToggleShow }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

function PasswordTab({ token }) {
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (form.newPass !== form.confirm) { setError('New passwords do not match'); return; }
    if (form.newPass.length < 6) { setError('Password must be at least 6 characters'); return; }
    setSaving(true); setSuccess(''); setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.newPass }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.msg || 'Failed'); }
      setSuccess('Password changed successfully');
      setForm({ current: '', newPass: '', confirm: '' });
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4 max-w-md">
      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
        Use at least 6 characters including a number for a strong password.
      </div>

      {/* ✅ Using PasswordField as proper component with all props passed */}
      <PasswordField
        id="current" label="Current Password" placeholder="Enter current password"
        value={form.current}
        onChange={e => setForm(f => ({ ...f, current: e.target.value }))}
        show={show.current}
        onToggleShow={() => setShow(s => ({ ...s, current: !s.current }))}
      />
      <PasswordField
        id="newPass" label="New Password" placeholder="Enter new password"
        value={form.newPass}
        onChange={e => setForm(f => ({ ...f, newPass: e.target.value }))}
        show={show.newPass}
        onToggleShow={() => setShow(s => ({ ...s, newPass: !s.newPass }))}
      />
      <PasswordField
        id="confirm" label="Confirm New Password" placeholder="Confirm new password"
        value={form.confirm}
        onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
        show={show.confirm}
        onToggleShow={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
      />

      <SuccessBanner msg={success} />
      <ErrorBanner msg={error} />

      <button onClick={handleSave}
        disabled={saving || !form.current || !form.newPass || !form.confirm}
        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
        {saving
          ? <><Loader2 size={14} className="animate-spin" /> Updating...</>
          : <><Lock size={14} /> Update Password</>
        }
      </button>
    </div>
  );
}

function AccountTab({ user, token }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    setDeleting(true);
    await new Promise(r => setTimeout(r, 1000));
    setDeleting(false);
  };

  return (
    <div className="space-y-5 max-w-lg">
      <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Info</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-gray-400 text-xs">Role</p>
            <p className="font-medium text-gray-800 capitalize">{user?.role || 'user'}</p></div>
          <div><p className="text-gray-400 text-xs">Member since</p>
            <p className="font-medium text-gray-800">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}
            </p></div>
          <div><p className="text-gray-400 text-xs">Email</p>
            <p className="font-medium text-gray-800 truncate">{user?.email}</p></div>
          <div><p className="text-gray-400 text-xs">College</p>
            <p className="font-medium text-gray-800 truncate">{user?.college || '—'}</p></div>
        </div>
      </div>
      <div className="border border-red-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 bg-red-50 border-b border-red-100">
          <p className="text-sm font-semibold text-red-600 flex items-center gap-2">
            <AlertTriangle size={14} /> Danger Zone
          </p>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-700 font-medium mb-1">Delete Account</p>
          <p className="text-xs text-gray-400 mb-4">
            Permanently delete your account and all your data. This cannot be undone.
          </p>
          {!showConfirm ? (
            <button onClick={() => setShowConfirm(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors">
              Delete my account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-600">
                Type <span className="font-mono font-bold text-red-500">DELETE</span> to confirm:
              </p>
              <input value={confirmText} onChange={e => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="Type DELETE" />
              <div className="flex gap-2">
                <button onClick={() => { setShowConfirm(false); setConfirmText(''); }}
                  className="flex-1 py-2 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleDelete}
                  disabled={confirmText !== 'DELETE' || deleting}
                  className="flex-1 py-2 rounded-xl text-sm bg-red-500 text-white hover:bg-red-600 disabled:opacity-40 flex items-center justify-center gap-2">
                  {deleting
                    ? <><Loader2 size={13} className="animate-spin" /> Deleting...</>
                    : 'Confirm Delete'
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const { user, token, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileUpdate = (updated) => { updateUser(updated); };

  const renderTab = () => {
    switch (activeTab) {
      case 'profile':  return <ProfileTab  user={user} token={token} onUpdate={handleProfileUpdate} />;
      case 'password': return <PasswordTab token={token} />;
      case 'account':  return <AccountTab  user={user} token={token} />;
      default:         return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your account and preferences</p>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-52 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                      activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                    <Icon size={16} className="flex-shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
            {renderTab()}
          </div>
        </div>
      </div>
    </div>
  );
}