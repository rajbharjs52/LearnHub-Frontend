// src/pages/ChatRoomDetail.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Send, Loader2, ArrowLeft, Users, LogIn,
  MessageSquare, X, LogOut, Trash2, ChevronRight
} from 'lucide-react';
import { API_URL, SOCKET_URL } from '../config/api';
import useAuthStore from '../context/AuthContext';
import io from 'socket.io-client';

export default function ChatRoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  // ✅ Track sending state to prevent double send
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket setup
  useEffect(() => {
    if (!token || !roomId) return;
    const newSocket = io(SOCKET_URL, { auth: { token } });
    newSocket.on('connect', () => newSocket.emit('joinRoom', roomId));

    // ✅ Fix 1 — deduplicate messages by _id
    // When socket broadcasts back, check if message already exists
    // This prevents the double message from optimistic update + socket broadcast
    newSocket.on('newMessage', (msg) => {
      setMessages(prev => {
        // Check if this message ID already exists in state
        const alreadyExists = prev.some(m =>
          m._id === msg._id ||
          // Also check if optimistic message matches by text + sender + approximate time
          (m._isOptimistic &&
           m.text === msg.text &&
           (m.sender?._id || m.sender?.id) === (msg.sender?._id || msg.sender?.id))
        );
        if (alreadyExists) {
          // Replace optimistic message with real server message
          return prev.map(m =>
            (m._isOptimistic && m.text === msg.text) ? msg : m
          );
        }
        return [...prev, msg];
      });
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, [roomId, token]);

  // ✅ Fix 2 — fetch room with populated participants
  useEffect(() => {
    if (!token || !roomId) return;
    setLoading(true);
    fetch(`${API_URL}/api/chat/rooms/${roomId}/messages`, {
      headers: { 'x-auth-token': token }
    })
      .then(res => { if (!res.ok) throw new Error('Failed to load room'); return res.json(); })
      .then(data => {
        setRoom(data.room);
        setMessages(data.messages || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [roomId, token]);

  const currentUserId = user?.id?.toString() || user?._id?.toString();

  const isMember = room?.participants?.some(p => {
    const pid = typeof p === 'string' ? p : (p._id || p.id)?.toString();
    return pid === currentUserId;
  }) ?? false;

  const isCreator = [
    room?.createdBy?.toString(),
    room?.createdBy?._id?.toString(),
    room?.createdBy?.id?.toString(),
  ].includes(currentUserId);

  const memberCount = room?.participants?.length ?? 0;

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await fetch(`${API_URL}/api/chat/rooms/${roomId}/join`, {
        method: 'POST', headers: { 'x-auth-token': token }
      });
      if (!res.ok) throw new Error('Failed to join');
      const updated = await res.json();
      setRoom(updated);
    } catch (err) { setError(err.message); }
    finally { setJoining(false); }
  };

  const handleLeave = async () => {
    setLeaving(true);
    try {
      const res = await fetch(`${API_URL}/api/chat/rooms/${roomId}/leave`, {
        method: 'POST', headers: { 'x-auth-token': token }
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.msg || 'Failed to leave'); }
      navigate('/chat');
    } catch (err) {
      setError(err.message);
      setShowLeaveConfirm(false);
    }
    finally { setLeaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/chat/rooms/${roomId}`, {
        method: 'DELETE', headers: { 'x-auth-token': token }
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.msg || 'Failed to delete'); }
      navigate('/chat');
    } catch (err) {
      setError(err.message);
      setShowDeleteConfirm(false);
    }
    finally { setDeleting(false); }
  };

  // ✅ Fix 1 — no optimistic update, wait for socket broadcast
  // Message will appear when server confirms and broadcasts back
  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || sending) return;
    setSending(true);
    socket.emit('sendMessage', { roomId, text: newMessage.trim() });
    setNewMessage('');
    // Reset sending after short delay
    setTimeout(() => setSending(false), 500);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  if (error || !room) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
      <p className="text-red-500">{error || 'Room not found'}</p>
      <Link to="/chat" className="text-indigo-600 hover:underline text-sm">Back to Rooms</Link>
    </div>
  );

  // ✅ Fix 2 — get populated members
  const populatedMembers = room.participants?.filter(
    p => typeof p === 'object' && p !== null
  ) || [];

  // ✅ Fix 2 — if participants are not populated (just IDs)
  // we show count but tell user details unavailable
  const hasPopulatedMembers = populatedMembers.length > 0;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete Room</h3>
                <p className="text-xs text-gray-400">This cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Delete <span className="font-medium">"{room.name}"</span> and all its messages?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2">
                {deleting ? <><Loader2 size={13} className="animate-spin" /> Deleting...</> : <><Trash2 size={13} /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave confirm modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <LogOut size={18} className="text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Leave Room</h3>
                <p className="text-xs text-gray-400">You can rejoin anytime</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Leave <span className="font-medium">"{room.name}"</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowLeaveConfirm(false)} disabled={leaving}
                className="flex-1 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleLeave} disabled={leaving}
                className="flex-1 py-2.5 rounded-xl text-sm bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2">
                {leaving ? <><Loader2 size={13} className="animate-spin" /> Leaving...</> : <><LogOut size={13} /> Leave</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members sidebar */}
      {showMembers && (
        <>
          <div className="fixed inset-0 z-30 bg-black/20 md:hidden"
            onClick={() => setShowMembers(false)} />
          <div className="fixed md:relative top-0 right-0 h-full w-72 bg-white border-l border-gray-100 shadow-xl z-40 flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Members</h3>
                <p className="text-xs text-gray-400">{memberCount} in this room</p>
              </div>
              <button onClick={() => setShowMembers(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {/* ✅ Fix 2 — show message if participants not populated */}
              {!hasPopulatedMembers ? (
                <div className="text-center py-8">
                  <Users size={28} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 italic">
                    {memberCount > 0
                      ? `${memberCount} member${memberCount !== 1 ? 's' : ''} — refresh to see details`
                      : 'No members yet'
                    }
                  </p>
                </div>
              ) : (
                populatedMembers.map((member, i) => {
                  const memberId = (member._id || member.id)?.toString();
                  const isMe = memberId === currentUserId;
                  const isRoomCreator = [
                    room.createdBy?._id?.toString(),
                    room.createdBy?.id?.toString(),
                    room.createdBy?.toString(),
                  ].includes(memberId);

                  return (
                    <div key={memberId || i}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">

                      {/* ✅ Fix 3 — profile pic with proper fallback */}
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-white shadow-sm">
                        {member.profilePic ? (
                          <img
                            src={member.profilePic}
                            alt={member.name || 'Member'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-full items-center justify-center bg-indigo-100"
                          style={{ display: member.profilePic ? 'none' : 'flex' }}
                        >
                          <span className="text-sm font-semibold text-indigo-600">
                            {member.name?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {member.name || 'Unknown'}
                          </p>
                          {isMe && (
                            <span className="text-xs text-gray-400 flex-shrink-0">(you)</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">
                          {member.college || member.email || ''}
                        </p>
                      </div>

                      {isRoomCreator && (
                        <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full font-medium flex-shrink-0">
                          Host
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
          <Link to="/chat"
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <MessageSquare size={17} className="text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-gray-900 text-sm truncate">{room.name || 'Chat Room'}</h1>
            <p className="text-xs text-gray-400">{room.subject || 'General'}</p>
          </div>
          <button onClick={() => setShowMembers(s => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 text-xs font-medium transition-colors">
            <Users size={14} />
            <span>{memberCount}</span>
            <ChevronRight size={12} className={`transition-transform ${showMembers ? 'rotate-90' : ''}`} />
          </button>
          {isMember && !isCreator && (
            <button onClick={() => setShowLeaveConfirm(true)}
              className="p-2 rounded-xl hover:bg-amber-50 text-gray-400 hover:text-amber-500 transition-colors"
              title="Leave room">
              <LogOut size={16} />
            </button>
          )}
          {(user?.role === 'admin' || isCreator) && (
            <button onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete room">
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Join screen */}
        {!isMember ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
            <div className="text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={28} className="text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Join the Conversation</h2>
              {room.subject && (
                <p className="text-sm mb-2">
                  <span className="font-medium text-indigo-600">{room.subject}</span>
                </p>
              )}
              <p className="text-gray-400 text-sm mb-6">
                {memberCount} member{memberCount !== 1 ? 's' : ''} in this room
              </p>
              <button onClick={handleJoin} disabled={joining}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium">
                {joining
                  ? <><Loader2 size={18} className="animate-spin" /> Joining...</>
                  : <><LogIn size={18} /> Join Room</>
                }
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare size={28} className="text-gray-300" />
                  </div>
                  <p className="text-gray-400 font-medium">No messages yet</p>
                  <p className="text-gray-300 text-sm mt-1">Be the first to say something!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = [
                    msg.sender?._id?.toString(),
                    msg.sender?.id?.toString(),
                  ].includes(currentUserId);

                  return (
                    <div key={msg._id || index}
                      className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>

                      {/* Avatar for others */}
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full flex-shrink-0 mb-1 overflow-hidden border border-gray-100 shadow-sm bg-indigo-100 flex items-center justify-center">
                          {/* ✅ Fix 3 — sender profile pic */}
                          {msg.sender?.profilePic ? (
                            <img
                              src={msg.sender.profilePic}
                              alt={msg.sender?.name || 'User'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="w-full h-full items-center justify-center bg-indigo-100"
                            style={{ display: msg.sender?.profilePic ? 'none' : 'flex' }}
                          >
                            <span className="text-xs font-semibold text-indigo-600">
                              {msg.sender?.name?.[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className={`max-w-[72%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {!isMe && (
                          <p className="text-xs font-medium text-indigo-600 mb-1 ml-1">
                            {msg.sender?.name || 'Unknown'}
                          </p>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm break-words ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm'
                        }`}>
                          <p>{msg.text}</p>
                          <p className={`text-[10px] mt-1 text-right ${
                            isMe ? 'text-indigo-200' : 'text-gray-400'
                          }`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Avatar for me */}
                      {isMe && (
                        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mb-1 overflow-hidden">
                          {/* ✅ Fix 3 — current user profile pic */}
                          {user?.profilePic ? (
                            <img
                              src={user.profilePic}
                              alt={user?.name || 'Me'}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <span className="text-xs font-semibold text-white">
                              {user?.name?.[0]?.toUpperCase() || 'M'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-100 px-4 py-3">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0">
                  {sending
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Send size={16} />
                  }
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}