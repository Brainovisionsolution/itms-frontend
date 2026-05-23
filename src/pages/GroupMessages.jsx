import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { toast } from 'react-toastify';
import { MessageSquare, Send, Calendar, User, UserCircle, Layers, Bell, Inbox, ArrowRight, CheckCircle, Clock, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import useTitle from '../hooks/useTitle';
import { useAuth } from '../context/AuthContext';

const GroupMessages = () => {
  useTitle('Messages & Updates');
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showComposer, setShowComposer] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      fetchStudentMessages();
    } else {
      fetchGroups();
    }
  }, [user]);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/admin/groups');
      setGroups(res.data);
      if (res.data.length > 0) {
        setSelectedGroupId(res.data[0].id);
        fetchGroupMessages(res.data[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      toast.error('Failed to fetch groups');
      setLoading(false);
    }
  };

  const fetchGroupMessages = async (groupId) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/groups/${groupId}/messages`);
      setMessages(res.data);
    } catch (err) {
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/student/messages');
      setMessages(res.data);
    } catch (err) {
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroupId) return;

    setSending(true);
    try {
      const res = await api.post(`/admin/groups/${selectedGroupId}/messages`, { content: newMessage });
      setMessages([res.data, ...messages]);
      setNewMessage('');
      setShowComposer(false);
      toast.success('Message sent successfully');
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'ADMIN':
        return { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', label: 'Admin' };
      case 'TRAINER':
        return { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', label: 'Trainer' };
      default:
        return { color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.15)', label: 'Student' };
    }
  };

  const formatMessageDate = (date) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diffDays = Math.floor((now - msgDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return msgDate.toLocaleDateString(isMobile ? 'short' : undefined, {
        month: 'numeric',
        day: 'numeric'
      });
    }
  };

  const selectedGroup = groups.find(g => g.id === parseInt(selectedGroupId));

  return (
    <div className="messages-page">
      <Sidebar role={user?.role} />
      
      {/* Mobile Header Spacer */}
      {isMobile && (
        <div className="mobile-header-spacer">
          <div className="mobile-title-bar">
            <div className="mobile-title-info">
              <h1 className="mobile-page-title">Messages</h1>
              <p className="mobile-page-subtitle">Announcements & updates</p>
            </div>
            {user?.role !== 'STUDENT' && (
              <button className="mobile-fab" onClick={() => setShowComposer(true)}>
                <Plus size={20} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="main-content">
        {/* Desktop Header */}
        {!isMobile && (
          <div className="messages-header">
            <div>
              <div className="header-icon">
                <MessageSquare size={28} />
              </div>
              <div>
                <h1 className="page-title">Messages & Updates</h1>
                <p className="page-subtitle">Stay updated with the latest announcements from your trainers and admins</p>
              </div>
            </div>
            {user?.role !== 'STUDENT' && groups.length > 0 && (
              <div className="active-group-badge">
                <Bell size={14} />
                <span>Messaging {selectedGroup?.name || 'Group'}</span>
              </div>
            )}
          </div>
        )}

        {/* Message Composer Modal for Mobile */}
        {isMobile && showComposer && user?.role !== 'STUDENT' && (
          <div className="mobile-composer-overlay" onClick={() => setShowComposer(false)}>
            <div className="mobile-composer-modal" onClick={(e) => e.stopPropagation()}>
              <div className="composer-modal-header">
                <h3>New Announcement</h3>
                <button className="close-composer" onClick={() => setShowComposer(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSendMessage}>
                <div className="mobile-group-selector">
                  <label>Select Group</label>
                  <select 
                    className="mobile-group-select" 
                    value={selectedGroupId}
                    onChange={(e) => {
                      setSelectedGroupId(e.target.value);
                      fetchGroupMessages(e.target.value);
                    }}
                  >
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.domain?.name})
                      </option>
                    ))}
                  </select>
                </div>
                <textarea 
                  className="mobile-message-input" 
                  placeholder="Type an announcement or update..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  autoFocus
                />
                <button 
                  type="submit" 
                  className="mobile-send-btn" 
                  disabled={sending || !newMessage.trim()}
                >
                  {sending ? (
                    <>
                      <div className="spinner-small"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Desktop Composer */}
        {!isMobile && user?.role !== 'STUDENT' && (
          <div className="composer-card">
            <div className="composer-header">
              <Send size={16} className="composer-icon" />
              <span>Send Announcement</span>
            </div>
            <form onSubmit={handleSendMessage} className="composer-form">
              <div className="group-selector">
                <label>Select Group</label>
                <select 
                  className="group-select" 
                  value={selectedGroupId}
                  onChange={(e) => {
                    setSelectedGroupId(e.target.value);
                    fetchGroupMessages(e.target.value);
                  }}
                >
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.domain?.name})
                    </option>
                  ))}
                </select>
              </div>
              <div className="message-input-wrapper">
                <textarea 
                  className="message-input" 
                  placeholder="Type an announcement or update..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows="2"
                />
                <button 
                  type="submit" 
                  className="send-btn" 
                  disabled={sending || !newMessage.trim()}
                >
                  {sending ? (
                    <>
                      <div className="spinner-small"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Messages Container */}
        <div className="messages-container">
          <div className="messages-list-header">
            <Inbox size={16} />
            <h3>All Messages</h3>
            <span className="message-count">{messages.length} messages</span>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <MessageSquare size={isMobile ? 40 : 48} />
              </div>
              <h3>No Messages Yet</h3>
              <p>
                {user?.role !== 'STUDENT' 
                  ? 'Send your first announcement to get started.' 
                  : 'No messages or updates found for you yet.'}
              </p>
              {isMobile && user?.role !== 'STUDENT' && (
                <button className="empty-action-btn" onClick={() => setShowComposer(true)}>
                  <Plus size={18} />
                  <span>Send First Message</span>
                </button>
              )}
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((msg, idx) => {
                const roleBadge = getRoleBadge(msg.sender?.role || 'STUDENT');
                return (
                  <div key={msg.id || idx} className="message-card">
                    <div className="message-sidebar" style={{ background: roleBadge.color }}></div>
                    <div className="message-content-wrapper">
                      <div className="message-header">
                        <div className="sender-info">
                          <div className="sender-avatar" style={{ background: roleBadge.bg, color: roleBadge.color }}>
                            <User size={isMobile ? 12 : 14} />
                          </div>
                          <div className="sender-details">
                            <div className="sender-name">
                              {msg.sender?.name || 'Unknown'}
                              <span className="sender-role" style={{ background: roleBadge.bg, color: roleBadge.color }}>
                                {roleBadge.label}
                              </span>
                            </div>
                            <div className="message-meta">
                              <Calendar size={isMobile ? 10 : 12} />
                              <span>{formatMessageDate(msg.createdAt)}</span>
                              {user?.role === 'STUDENT' && msg.group && (
                                <>
                                  <span className="meta-separator">•</span>
                                  <Layers size={isMobile ? 10 : 12} />
                                  <span>{msg.group.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="message-body">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{css}</style>
    </div>
  );
};

const css = `
.messages-page {
  min-height: 100vh;
  background: #071a2e;
}

.main-content {
  margin-left: 280px;
  padding: 2rem;
  transition: all 0.3s ease;
}

/* Mobile Header Spacer */
.mobile-header-spacer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background: #071a2e;
  padding: 12px 16px;
  padding-left: 70px;
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
}

.mobile-title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mobile-title-info {
  flex: 1;
}

.mobile-page-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: -0.5px;
}

.mobile-page-subtitle {
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.6);
  margin: 4px 0 0 0;
}

.mobile-fab {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.mobile-fab:active {
  transform: scale(0.95);
}

/* Desktop Header */
.messages-header {
  margin-bottom: 2rem;
}

.messages-header > div {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  color: rgba(180, 220, 215, 0.6);
  font-size: 0.9rem;
  margin: 0;
}

.active-group-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(20, 184, 166, 0.1);
  border: 1px solid rgba(20, 184, 166, 0.3);
  padding: 8px 16px;
  border-radius: 12px;
  color: #14b8a6;
  font-size: 0.85rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

/* Desktop Composer */
.composer-card {
  background: #0d1f35;
  border-radius: 16px;
  border: 1px solid rgba(20, 184, 166, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.composer-header {
  padding: 1rem 1.5rem;
  background: rgba(20, 184, 166, 0.05);
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #14b8a6;
}

.composer-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.group-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group-selector label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(180, 220, 215, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.group-select {
  padding: 10px 12px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
  color: #e2f8f5;
  font-size: 0.9rem;
  cursor: pointer;
}

.message-input-wrapper {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  padding: 12px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 12px;
  color: #e2f8f5;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
}

.send-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Mobile Composer Modal */
.mobile-composer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.mobile-composer-modal {
  background: #0d1f35;
  width: 100%;
  border-radius: 20px 20px 0 0;
  padding: 1.25rem;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.composer-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
}

.composer-modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
}

.close-composer {
  background: none;
  border: none;
  color: rgba(180, 220, 215, 0.6);
  cursor: pointer;
  padding: 8px;
}

.mobile-group-selector {
  margin-bottom: 1rem;
}

.mobile-group-selector label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(180, 220, 215, 0.7);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.mobile-group-select {
  width: 100%;
  padding: 12px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
  color: #e2f8f5;
  font-size: 0.9rem;
}

.mobile-message-input {
  width: 100%;
  padding: 12px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 12px;
  color: #e2f8f5;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 1rem;
}

.mobile-send-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.mobile-send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Messages Container */
.messages-container {
  background: #0d1f35;
  border-radius: 16px;
  border: 1px solid rgba(20, 184, 166, 0.1);
  overflow: hidden;
}

.messages-list-header {
  padding: 1rem 1.5rem;
  background: rgba(20, 184, 166, 0.05);
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
}

.messages-list-header h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
}

.message-count {
  margin-left: auto;
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.5);
  background: #071a2e;
  padding: 2px 8px;
  border-radius: 12px;
}

/* Messages List */
.messages-list {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 60vh;
  overflow-y: auto;
}

.message-card {
  display: flex;
  background: #071a2e;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.message-card:active {
  transform: scale(0.99);
}

.message-sidebar {
  width: 4px;
}

.message-content-wrapper {
  flex: 1;
  padding: 1rem;
}

.message-header {
  margin-bottom: 0.75rem;
}

.sender-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.sender-avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sender-details {
  flex: 1;
  min-width: 0;
}

.sender-name {
  font-weight: 600;
  color: #fff;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.sender-role {
  font-size: 0.6rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 0.6rem;
  color: rgba(180, 220, 215, 0.5);
  flex-wrap: wrap;
}

.meta-separator {
  color: rgba(180, 220, 215, 0.3);
}

.message-body {
  font-size: 0.85rem;
  line-height: 1.5;
  color: rgba(220, 240, 235, 0.9);
  white-space: pre-wrap;
  padding: 0.5rem;
  background: rgba(20, 184, 166, 0.02);
  border-radius: 8px;
  word-break: break-word;
}

/* Loading States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(20, 184, 166, 0.2);
  border-top-color: #14b8a6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(20, 184, 166, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: #14b8a6;
}

.empty-state h3 {
  color: #fff;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.empty-state p {
  color: rgba(180, 220, 215, 0.6);
  margin: 0;
  font-size: 0.85rem;
}

.empty-action-btn {
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(20, 184, 166, 0.15);
  border: 1px solid rgba(20, 184, 166, 0.3);
  border-radius: 10px;
  padding: 8px 16px;
  color: #14b8a6;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
    padding-top: 70px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 0.875rem;
    padding-top: 65px;
  }
  
  .messages-list-header {
    padding: 0.75rem 1rem;
  }
  
  .messages-list {
    padding: 0.75rem;
    max-height: 65vh;
  }
  
  .message-content-wrapper {
    padding: 0.75rem;
  }
  
  .message-body {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
    padding-top: 60px;
  }
  
  .sender-name {
    font-size: 0.8rem;
  }
  
  .sender-avatar {
    width: 28px;
    height: 28px;
  }
  
  .message-body {
    font-size: 0.75rem;
    padding: 0.4rem;
  }
  
  .empty-icon {
    width: 60px;
    height: 60px;
  }
  
  .empty-icon svg {
    width: 28px;
    height: 28px;
  }
}
`;

export default GroupMessages;