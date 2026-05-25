// src/pages/ChatList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Loader2, Users, X } from 'lucide-react';
import useAuthStore from '../context/AuthContext';
import { API_URL } from '../config/api';

export default function ChatList() {
  const { token, user } = useAuthStore();
  const navigate = useNavigate();

  const [allRooms, setAllRooms] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [createError, setCreateError] = useState('');

  // Fetch rooms
  useEffect(() => {
    if (!token) {
      setError('Please log in to view chat rooms');
      setLoading(false);
      return;
    }

    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError('');

        console.log('Fetching rooms with token:', token ? 'Token exists' : 'No token');

        const res = await fetch(`${API_URL}/api/chat/rooms`, {
          headers: { 
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', res.status);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error('Backend error:', errorData);
          throw new Error(errorData.msg || `Server error ${res.status}`);
        }

        const data = await res.json();
        console.log('Rooms fetched successfully:', data);

        setAllRooms(data.allRooms || []);
        setRecommended(data.recommended || []);
      } catch (err) {
        console.error('Fetch rooms error:', err);
        setError(err.message || 'Could not load chat rooms. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [token]);

  // Filtering
  const filteredAll = allRooms.filter(room =>
    room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.college?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRecommended = recommended.filter(room =>
    room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create Room Handler
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setCreateError('');

    const formData = new FormData(e.target);
    const roomData = {
      name: formData.get('name')?.trim(),
      subject: formData.get('subject'),
      description: formData.get('description')?.trim() || ''
    };

    if (!roomData.name || !roomData.subject) {
      setCreateError('Name and subject are required');
      return;
    }

    try {
      setCreatingRoom(true);
      const res = await fetch(`${API_URL}/api/chat/rooms`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.msg || 'Failed to create room');
      }

      const newRoom = await res.json();
      setShowModal(false);
      navigate(`/chat/${newRoom._id}`);
    } catch (err) {
      console.error(err);
      setCreateError(err.message || 'Failed to create room');
    } finally {
      setCreatingRoom(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-600 text-center px-4">
        <div>
          <p className="text-xl font-medium mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Chat Rooms</h1>
        <div className="relative w-full md:w-80 mt-4 md:mt-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Recommended for You */}
      {filteredRecommended.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommended.map(room => (
              <div
                key={room._id}
                onClick={() => navigate(`/chat/${room._id}`)}
                className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all"
              >
                <h3 className="font-semibold text-lg">{room.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{room.subject} • {room.college}</p>
                <div className="flex items-center mt-4 text-xs text-gray-500">
                  <Users size={16} className="mr-1" />
                  <span>{room.participants?.length || 0} members</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Public Rooms */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Public Rooms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAll.length > 0 ? (
            filteredAll.map(room => (
              <div
                key={room._id}
                onClick={() => navigate(`/chat/${room._id}`)}
                className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all"
              >
                <h3 className="font-semibold text-lg">{room.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{room.subject} • {room.college}</p>
                <div className="flex items-center mt-4 text-xs text-gray-500">
                  <Users size={16} className="mr-1" />
                  <span>{room.participants?.length || 0} members</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No public rooms found.</p>
          )}
        </div>
      </div>

      {/* Floating Create Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 flex items-center justify-center z-50"
      >
        <Plus size={24} />
      </button>

      {/* Create Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Room</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                <input 
                  id="name" 
                  name="name" 
                  type="text" 
                  placeholder="e.g., Advanced Calculus Discussion" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  required 
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select 
                  id="subject" 
                  name="subject" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  required
                >
                  <option value="">Select subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Programming">Programming</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea 
                  id="description" 
                  name="description" 
                  rows="3" 
                  placeholder="Brief description..." 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" 
                />
              </div>
              <div className="flex space-x-3">
                <button 
                  type="submit" 
                  disabled={creatingRoom} 
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {creatingRoom ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Create Room'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
              {createError && <p className="text-sm text-red-600 text-center">{createError}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}