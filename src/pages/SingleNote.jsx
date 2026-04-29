// src/pages/SingleNote.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // ✅ add useNavigate
import { Download, Heart, MessageCircle, Loader2, Sparkles, Send, Image as ImageIcon, Copy, Check, Trash2 } from 'lucide-react'; // ✅ add Trash2
import useAuthStore from '../context/AuthContext';

export default function SingleNote() {
  const { id } = useParams();
  const navigate = useNavigate(); // ✅ added
  const { token, user } = useAuthStore();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [deleting, setDeleting] = useState(false); // ✅ added
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // ✅ added

  // AI Summary states
  const [summaryText, setSummaryText] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [copied, setCopied] = useState(false);

  // Comment states
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    if (!token) { setError('Please log in to view notes'); setLoading(false); return; }
    setLoading(true);
    fetch(`http://localhost:5000/api/notes/${id}`, {
      headers: { 'x-auth-token': token },
    })
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(data => {
        setNote(data);
        if (data.summary?.content) setSummary(data.summary.content);
        setError('');
      })
      .catch(err => { console.error(err); setError('Failed to load note'); })
      .finally(() => setLoading(false));
  }, [id, token]);

  useEffect(() => {
    if (!note || !token) return;
    fetch(`http://localhost:5000/api/notes/${id}/comments`, {
      headers: { 'x-auth-token': token },
    })
      .then(res => res.json())
      .then(data => setComments(Array.isArray(data) ? data : []))
      .catch(err => console.error('Comments fetch error:', err));
  }, [note, id, token]);

  // Replace just the canDelete line in SingleNote.jsx

// ✅ Robust check — handles all possible ID formats
const canDelete = note && user && (() => {
  const uploaderId =
    note.uploader?._id?.toString()  // populated object: { _id: '...', name: '...' }
    ?? note.uploader?.toString();    // raw ObjectId string

  const userId =
    user._id?.toString()             // most common
    ?? user.id?.toString();          // some auth stores use .id instead of ._id

  const isUploader = uploaderId && userId && uploaderId === userId;
  const isAdmin = user.role === 'admin';

  // Debug — remove after confirming it works
  console.log('[canDelete] uploaderId:', uploaderId);
  console.log('[canDelete] userId:', userId);
  console.log('[canDelete] isUploader:', isUploader, '| isAdmin:', isAdmin);

  return isUploader || isAdmin;
})();

  // ✅ Delete handler
  const handleDelete = async () => {
    if (!token || !note) return;
    setDeleting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/notes/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ msg: 'Delete failed' }));
        throw new Error(err.msg || 'Delete failed');
      }
      // ✅ Redirect to notes list after successful delete
      navigate('/notes', { replace: true });
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete note.');
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async () => {
    if (!token || !note) return;
    setDownloading(true);
    setDownloadError('');
    try {
      const response = await fetch(`http://localhost:5000/api/notes/${id}/download`, {
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ msg: 'Download failed' }));
        throw new Error(err.msg || 'Download failed');
      }
      const blob = await response.blob();
      const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
      const ext = contentType.includes('pdf') ? '.pdf' : '.jpg';
      const filename = `${note.title.replace(/[^a-z0-9]/gi, '_')}${ext}`;
      const url = window.URL.createObjectURL(new Blob([blob], { type: contentType }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err.message || 'Download failed.');
    } finally {
      setDownloading(false);
    }
  };

  const handleLike = async () => {
    if (!note || !token) return;
    setLikeLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/notes/${id}/like`, {
        method: 'PUT',
        headers: { 'x-auth-token': token },
      });
      const data = await response.json();
      setNote(prev => ({ ...prev, likeCount: data.likeCount }));
    } catch (err) {
      console.error('Like error:', err);
    }
    setLikeLoading(false);
  };

  const handleGenerateSummary = async () => {
    if (!summaryText.trim()) { setSummaryError('Please paste some text to summarize.'); return; }
    setSummaryLoading(true);
    setSummaryError('');
    setSummary('');
    try {
      const response = await fetch(`http://localhost:5000/api/ai/summarize`, {
        method: 'POST',
        headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: summaryText, noteId: id }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ msg: 'Failed to generate summary' }));
        throw new Error(err.msg || 'Failed to generate summary');
      }
      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      setSummaryError(err.message || 'Failed to generate summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !token) return;
    setCommentLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/notes/${id}/comments`, {
        method: 'POST',
        headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText.trim() }),
      });
      if (!response.ok) throw new Error('Failed to post comment');
      const newComment = await response.json();
      setComments(prev => [...prev, newComment]);
      setCommentText('');
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  if (error || !note) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
      <p className="text-red-500 text-lg">{error || 'Note not found'}</p>
      <Link to="/notes" className="text-indigo-600 underline text-sm">Back to Notes</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ✅ Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete Note</h3>
                <p className="text-xs text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete <span className="font-medium text-gray-800">"{note.title}"</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting
                  ? <><Loader2 size={14} className="animate-spin" /> Deleting...</>
                  : <><Trash2 size={14} /> Delete</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1 — Hero */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6 items-start">

          {/* Cover Image */}
          <div className="w-full md:w-56 flex-shrink-0">
            <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-md">
              {note.coverImage ? (
                <img src={note.coverImage} alt={note.title} className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              ) : null}
              <div className={`w-full h-full items-center justify-center ${note.coverImage ? 'hidden' : 'flex'}`}>
                <ImageIcon className="w-14 h-14 text-indigo-300" />
              </div>
            </div>
          </div>

          {/* Note Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">{note.subject}</span>
                {note.tags?.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">{tag}</span>
                ))}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">{note.title}</h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-3">{note.description}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                <span>🏫 {note.college}</span>
                <span>👤 {note.uploader?.name}</span>
                <span>📅 {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span>❤️ {note.likeCount || 0} likes</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button onClick={handleLike} disabled={likeLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-sm hover:shadow-md disabled:opacity-60 transition-all">
                {likeLoading ? <Loader2 size={15} className="animate-spin" /> : <Heart size={15} />}
                <span>{note.likeCount} Likes</span>
              </button>

              <button onClick={handleDownload} disabled={downloading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-sm hover:shadow-md disabled:opacity-60 transition-all">
                {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                <span>{downloading ? 'Downloading...' : 'Download'}</span>
              </button>

              {/* ✅ Delete button — only visible to uploader or admin */}
              {canDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-sm hover:shadow-md disabled:opacity-60 transition-all"
                >
                  <Trash2 size={15} />
                  <span>Delete</span>
                </button>
              )}
            </div>

            {downloadError && <p className="text-xs text-red-500">{downloadError}</p>}
          </div>
        </div>
      </div>

      {/* SECTION 2 — Preview + Right Column */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Note Preview */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-800">Note Preview</h2>
          </div>
          <div className="flex items-center justify-center bg-gray-50 p-4" style={{ height: '420px' }}>
            {note.previewImage ? (
              <img src={note.previewImage} alt={`Preview of ${note.title}`}
                className="max-w-full max-h-full rounded-lg object-contain shadow-sm"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            ) : null}
            <div className="flex-col items-center justify-center gap-2 text-gray-400"
              style={{ display: note.previewImage ? 'none' : 'flex' }}>
              <ImageIcon size={40} className="text-gray-300" />
              <p className="text-sm italic">No preview available</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">

          {/* AI Summary */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-500" />
              <h2 className="text-base font-semibold text-gray-800">AI Summary</h2>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Paste text you want to summarize</label>
                <textarea value={summaryText} onChange={(e) => setSummaryText(e.target.value)}
                  placeholder="Paste your notes text here..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-gray-700 placeholder-gray-300"
                  rows={4} />
              </div>
              {summaryError && <p className="text-xs text-red-500">{summaryError}</p>}
              <button onClick={handleGenerateSummary} disabled={summaryLoading || !summaryText.trim()}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md">
                {summaryLoading
                  ? <><Loader2 size={14} className="animate-spin" /> Generating...</>
                  : <><Sparkles size={14} /> Generate Summary</>}
              </button>
              {summary && (
                <div className="relative">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-sm text-gray-700 leading-relaxed overflow-y-auto"
                    style={{ maxHeight: '180px' }}>
                    {summary}
                  </div>
                  <button onClick={handleCopySummary}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors" title="Copy summary">
                    {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} className="text-gray-400" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <MessageCircle size={16} className="text-indigo-500" />
              <h2 className="text-base font-semibold text-gray-800">
                Comments <span className="text-gray-400 font-normal">({comments.length})</span>
              </h2>
            </div>
            <div className="overflow-y-auto px-4 py-3 flex flex-col gap-3" style={{ maxHeight: '260px', minHeight: '80px' }}>
              {comments.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-4">No comments yet. Be the first!</p>
              ) : (
                comments.map((comment, index) => (
                  <div key={comment._id || index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-indigo-100 flex items-center justify-center">
                      {comment.user?.profilePic ? (
                        <img src={comment.user.profilePic} alt={comment.user?.name} className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <span className="text-xs font-semibold text-indigo-600">
                          {(comment.user?.name || 'U')[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 rounded-xl px-3 py-2">
                        <p className="text-xs font-semibold text-gray-700 mb-0.5">{comment.user?.name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-600 break-words">{comment.text}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 ml-1">
                        {new Date(comment.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={commentsEndRef} />
            </div>
            <div className="px-4 pb-4 pt-2 border-t border-gray-100">
              <div className="flex items-end gap-2">
                <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                  placeholder="Write a comment... (Enter to send)"
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder-gray-300"
                  rows={2} />
                <button onClick={handleAddComment} disabled={commentLoading || !commentText.trim()}
                  className="flex-shrink-0 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {commentLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}