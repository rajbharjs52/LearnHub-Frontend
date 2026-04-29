// src/pages/admin/ManageNotes.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Loader2, Trash2, Edit3, X, Check,
  ChevronLeft, ChevronRight, FileText, Image as ImageIcon,
  User as UserIcon, Calendar, Tag
} from 'lucide-react';
import useAuthStore from '../../context/AuthContext';

const SUBJECTS = [
  'Mathematics', 'Programming', 'Physics',
  'Chemistry', 'Biology', 'History',
  'Economics', 'English', 'Other'
];

function EditNoteModal({ note, token, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: note.title || '',
    description: note.description || '',
    subject: note.subject || '',
    college: note.college || '',
    tags: Array.isArray(note.tags) ? note.tags.join(', ') : (note.tags || ''),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const noteId = note._id || note.id;
      const res = await fetch(`http://localhost:5000/api/admin/notes/${noteId}`, {
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit Note</h2>
            <p className="text-xs text-gray-400 mt-0.5">Update note details</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Note title" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              rows={3} placeholder="Note description" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Subject</label>
              <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                <option value="">Select</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">College</label>
              <input value={form.college} onChange={e => setForm(f => ({ ...f, college: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="College name" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Tags <span className="text-gray-300">(comma separated)</span></label>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="e.g. exam, formula, calculus" />
          </div>
        </div>

        {error && (
          <div className="mt-3 px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Check size={14} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteNoteConfirm({ note, token, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const noteId = note._id || note.id;
      const res = await fetch(`http://localhost:5000/api/admin/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token },
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.msg || 'Delete failed');
      }
      onDeleted(note._id || note.id);
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
            <h3 className="font-semibold text-gray-900">Delete Note</h3>
            <p className="text-xs text-gray-400">This will also delete all comments</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-5">
          Delete <span className="font-medium text-gray-800">"{note.title}"</span>?
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

export default function ManageNotes() {
  const { token } = useAuthStore();
  const [notes, setNotes] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editNote, setEditNote] = useState(null);
  const [deleteNote, setDeleteNote] = useState(null);

  const navigate = useNavigate();

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search, page, limit: 10,
        ...(subjectFilter && { subject: subjectFilter })
      });
      const res = await fetch(`http://localhost:5000/api/admin/notes?${params}`, {
        headers: { 'x-auth-token': token },
      });
      const data = await res.json();
      setNotes(data.notes || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, search, page, subjectFilter]);

  useEffect(() => {
    const t = setTimeout(fetchNotes, 300);
    return () => clearTimeout(t);
  }, [fetchNotes]);

  const handleSaved = (updated) => {
  setNotes(prev => prev.map(n => {
    const nId = n._id || n.id;
    const updatedId = updated._id || updated.id;
    return nId === updatedId ? { ...n, ...updated } : n;
  }));
  setEditNote(null);
};

  const handleDeleted = (deletedId) => {
  setNotes(prev => prev.filter(n => (n._id || n.id) !== deletedId));
  setTotal(t => t - 1);
  setDeleteNote(null);
};

  return (
    <div className="min-h-screen bg-gray-50">
      {editNote && <EditNoteModal note={editNote} token={token} onClose={() => setEditNote(null)} onSaved={handleSaved} />}
      {deleteNote && <DeleteNoteConfirm note={deleteNote} token={token} onClose={() => setDeleteNote(null)} onDeleted={handleDeleted} />}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Manage Notes</h1>
            <p className="text-sm text-gray-400 mt-0.5">{total} total notes</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Subject filter */}
            <select
              value={subjectFilter}
              onChange={e => { setSubjectFilter(e.target.value); setPage(1); }}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
            >
              <option value="">All Subjects</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <FileText size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No notes found</p>
          </div>
        ) : (
          <>
            {/* Note cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {notes.map(note => (
                
                <div key={note._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                  {/* Cover */}
                  <div className="h-36 bg-gradient-to-br from-indigo-50 to-purple-100 relative overflow-hidden">
                    {note.coverImage ? (
                      <img src={note.coverImage} alt={note.title}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon size={32} className="text-indigo-300" />
                      </div>
                    )}
                    {/* Subject badge */}
                    <div className="absolute top-2 left-2">
                      <span className="text-xs px-2 py-1 bg-white/90 text-indigo-700 rounded-full font-medium shadow-sm">
                        {note.subject || 'General'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{note.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3 flex-1">{note.description || 'No description'}</p>

                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <UserIcon size={11} />
                        <span className="truncate">{note.uploader?.name || 'Unknown'} • {note.uploader?.email || ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar size={11} />
                        <span>{new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      {note.tags?.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Tag size={11} />
                          <span className="truncate">{note.tags.slice(0, 3).join(', ')}{note.tags.length > 3 ? '...' : ''}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-gray-50">
                      <button onClick={() => setEditNote(note)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                        <Edit3 size={13} /> Edit
                      </button>
                      <button
  onClick={() => navigate(`/notes/${note._id || note.id}`)}
  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
>
  <FileText size={13} /> View
</button>
                      <button onClick={() => setDeleteNote(note)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-400">
                  Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-gray-600 px-2">{page} / {pages}</span>
                  <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
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