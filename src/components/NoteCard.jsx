// src/components/NoteCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Bookmark, User, Clock, Image as ImageIcon } from 'lucide-react';

const NoteCard = ({
  id,
  coverImage,
  title,
  subtitle,
  author = 'Unknown Author',
  date = 'Jan 10',
  likeCount = 0,
  isLiked = false,
  onLike,
  onSave,
  className = ''
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(false);

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
    if (onLike) onLike(id, !liked);
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
    if (onSave) onSave(id, !saved);
  };

  return (
    <article className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${className}`}>

      {/* ✅ Cover image — fixed height, never distorted */}
      <div className="relative h-44 bg-gradient-to-br from-indigo-100 to-purple-200 overflow-hidden flex-shrink-0">
        {coverImage ? (
          <>
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback if image fails to load */}
            <div className="absolute inset-0 items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 hidden">
              <ImageIcon className="w-10 h-10 text-indigo-400" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-indigo-400" />
          </div>
        )}

        {/* Like / Save buttons — always visible on hover */}
        {/* <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleLike}
            aria-label={liked ? 'Unlike' : 'Like'}
            className="p-1.5 bg-white/90 rounded-full shadow hover:bg-white transition-colors"
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </button>
          <button
            onClick={handleSave}
            aria-label={saved ? 'Unsave' : 'Save'}
            className="p-1.5 bg-white/90 rounded-full shadow hover:bg-white transition-colors"
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-indigo-500 text-indigo-500' : 'text-gray-500'}`} />
          </button>
        </div> */}
      </div>

      {/* ✅ Content — fixed structure, no tags */}
      <div className="p-4 space-y-2">

        {/* Title */}
        <Link
          to={`/notes/${id}`}
          className="block text-base font-semibold text-gray-900 hover:text-indigo-600 transition-colors leading-snug"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {title}
        </Link>

        {/* ✅ Description — max 2 lines, never more */}
        <p
          className="text-sm text-gray-500 leading-relaxed"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {subtitle || 'No description available.'}
        </p>

        {/* Author + Date */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <User size={11} />
            <span className="truncate max-w-[120px]">{author}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={11} />
            <span>{date}</span>
          </div>
        </div>

        {/* Like count */}
        <div className="flex items-center space-x-1 text-xs text-gray-400">
          <Heart size={11} className={liked ? 'fill-red-400 text-red-400' : ''} />
          <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
        </div>

      </div>
    </article>
  );
};

export default NoteCard;