// src/pages/Notes.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Loader2, BookOpen, Grid, List } from 'lucide-react';
import NoteCard from '../components/NoteCard';
import useAuthStore from '../context/AuthContext';
import { API_URL } from '../config/api';

// ✅ Predefined categories with icons
// const CATEGORY_ICONS = {
//   'Mathematics': '📐',
//   'Programming': '💻',
//   'Physics': '⚛️',
//   'Chemistry': '🧪',
//   'Biology': '🧬',
//   'History': '📜',
//   'Economics': '📊',
//   'English': '📝',
// };

// const getCategoryIcon = (subject) => CATEGORY_ICONS[subject] || '📚';

export default function Notes() {
  const { token, user } = useAuthStore();
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setError('Please log in to view notes'); setLoading(false); return; }
    setLoading(true);
    fetch(`${API_URL}/api/notes`, { headers: { 'x-auth-token': token } })
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(data => { setNotes(data.notes || []); setError(''); })
      .catch(err => { console.error(err); setError('Failed to load notes'); })
      .finally(() => setLoading(false));
  }, [token]);

  // ✅ Build category list from actual notes data
  const categories = useMemo(() => {
    const subjects = [...new Set(notes.map(n => n.subject).filter(Boolean))].sort();
    return ['All', ...subjects];
  }, [notes]);

  // ✅ Filter by category + search together
  const filteredNotes = useMemo(() => {
    let result = notes;
    if (activeCategory !== 'All') {
      result = result.filter(n => n.subject === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.subject?.toLowerCase().includes(q) ||
        n.description?.toLowerCase().includes(q) ||
        (Array.isArray(n.tags) && n.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    return result;
  }, [notes, activeCategory, searchQuery]);

  // ✅ Count per category
  const categoryCount = useMemo(() => {
    const counts = { All: notes.length };
    notes.forEach(n => {
      if (n.subject) counts[n.subject] = (counts[n.subject] || 0) + 1;
    });
    return counts;
  }, [notes]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <span className="ml-2 text-gray-500">Loading notes...</span>
    </div>
  );

  if (error) return (
    <div className="p-6 text-center text-red-500 max-w-md mx-auto mt-12">
      {error}
      <Link to="/dashboard" className="underline ml-2 text-indigo-600">Go to Dashboard</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top Bar ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Notes</h1>
            <p className="text-xs text-gray-400">{filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} {activeCategory !== 'All' ? `in ${activeCategory}` : 'total'}</p>
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search notes..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ✅ Category tabs — horizontally scrollable */}
        <div className="max-w-7xl mx-auto px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat !== 'All' && <span className="text-base leading-none"></span>}
                <span>{cat}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-normal ${
                  activeCategory === cat ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {categoryCount[cat] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Notes Grid ── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No notes found</h3>
            <p className="text-gray-400 text-sm mb-6">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : activeCategory !== 'All'
                  ? `No notes in ${activeCategory} yet`
                  : 'Be the first to upload a note!'
              }
            </p>
            {/* Clear filter shortcut */}
            {(activeCategory !== 'All' || searchQuery) && (
              <button
                onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                className="text-indigo-600 text-sm underline mr-4"
              >
                Clear filters
              </button>
            )}
            <Link to="/notes/upload"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm">
              <Plus size={16} /> Upload Note
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredNotes.map(note => (
              <NoteCard
                key={note._id}
                id={note._id}
                coverImage={note.coverImage || null}
                title={note.title}
                subtitle={note.description}
                author={note.uploader?.name || 'Unknown'}
                date={new Date(note.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
                likeCount={note.likeCount || 0}
                isLiked={note.likes?.includes(user?._id) || false}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <Link to="/notes/upload"
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 flex items-center justify-center transition-all z-50 hover:scale-110"
        title="Upload Note">
        <Plus size={24} />
      </Link>
    </div>
  );
}