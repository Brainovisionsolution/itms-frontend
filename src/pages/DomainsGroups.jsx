import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Plus, UserPlus, UserMinus, Search, X, Users, Trash2, Send, Layers, Briefcase, Mail, MessageSquare, ChevronRight, CheckCircle, AlertCircle, Filter, ChevronDown, ChevronUp, Menu } from 'lucide-react';
import useTitle from '../hooks/useTitle';
import { useAuth } from '../context/AuthContext';

const DomainsGroups = () => {
  const { user } = useAuth();
  useTitle('Tech & Groups');
  const [technologies, setTechnologies] = useState([]);
  const [newGroup, setNewGroup] = useState({ name: '', domainId: '', trainerId: '' });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [interns, setInterns] = useState([]);
  const [internSearch, setInternSearch] = useState('');
  const [confirmingIntern, setConfirmingIntern] = useState(null);
  const [activeTab, setActiveTab] = useState('interns');
  const [messageText, setMessageText] = useState('');
  const [groupMessages, setGroupMessages] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [groupInterns, setGroupInterns] = useState([]);
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [expandedTech, setExpandedTech] = useState({});

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchTechnologies();
    fetchInterns();
    fetchTrainers();
  }, []);

  const fetchGroupInterns = async () => {
    if (!selectedGroup) {
      setGroupInterns([]);
      return;
    }
    setLoadingGroup(true);
    try {
      const res = await api.get(`/admin/interns?groupId=${selectedGroup.id}`);
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setGroupInterns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGroup(false);
    }
  };

  const fetchGroupMessages = async () => {
    if (!selectedGroup) return;
    try {
      const res = await api.get(`/admin/groups/${selectedGroup.id}/messages`);
      setGroupMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroupInterns();
    fetchGroupMessages();
    setActiveTab('interns');
  }, [selectedGroup]);

  const fetchTechnologies = async () => {
    try {
      const res = await api.get('/admin/domains');
      setTechnologies(res.data);
    } catch (err) {
      toast.error('Failed to fetch technologies');
    }
  };

  const fetchInterns = async () => {
    try {
      const res = await api.get('/admin/interns?limit=1000');
      const fetchedData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setInterns(fetchedData);
    } catch (err) {
      toast.error('Failed to fetch interns');
    }
  };

  const fetchTrainers = async () => {
    try {
      const res = await api.get('/admin/users?limit=1000');
      const users = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setTrainers(users.filter(u => u.role === 'TRAINER'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/groups', newGroup);
      toast.success('Group created successfully');
      setNewGroup({ name: '', domainId: '', trainerId: '' });
      setShowCreateForm(false);
      fetchTechnologies();
    } catch (err) {
      toast.error('Error creating group');
    }
  };

  const handleGroupToggle = async (internId, action = 'TOGGLE', disconnectId = null) => {
    const intern = interns.find(i => i.id === internId);
    const newGroupId = selectedGroup?.id;

    if (disconnectId) {
      try {
        await api.put(`/admin/interns/${internId}`, { disconnectGroupId: disconnectId });
        fetchInterns();
        fetchGroupInterns();
        fetchTechnologies();
        toast.success('Removed from group');
        return;
      } catch (err) {
        toast.error('Failed to remove from group');
        return;
      }
    }

    if (intern && intern.groups && intern.groups.length > 0 && action !== 'ACTION_TAKEN') {
      const alreadyIn = intern.groups.find(g => g.id === newGroupId);
      if (alreadyIn) {
        try {
          await api.put(`/admin/interns/${internId}`, { disconnectGroupId: newGroupId });
          fetchInterns();
          fetchGroupInterns();
          fetchTechnologies();
          toast.success('Removed from group');
        } catch (err) {
          toast.error('Failed to remove');
        }
        return;
      }
      setConfirmingIntern(internId);
      return;
    }

    try {
      await api.put(`/admin/interns/${internId}`, { groupId: newGroupId });
      fetchInterns();
      fetchGroupInterns();
      fetchTechnologies();
      setConfirmingIntern(null);
      toast.success('Added to group');
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleGroupAction = async (internId, replaceGroups) => {
    const newGroupId = selectedGroup?.id;
    try {
      await api.put(`/admin/interns/${internId}`, { 
        groupId: newGroupId, 
        replaceGroups: replaceGroups,
        actionTaken: true
      });
      fetchInterns();
      fetchGroupInterns();
      fetchTechnologies();
      setConfirmingIntern(null);
      toast.success(replaceGroups ? 'Shifted to new group' : 'Joined additional group');
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleUpdateGroupTrainer = async (groupId, trainerId) => {
    try {
      await api.put(`/admin/groups/${groupId}`, { trainerId: trainerId ? parseInt(trainerId) : null });
      toast.success('Trainer assigned successfully');
      fetchTechnologies();
    } catch (err) {
      toast.error('Failed to assign trainer');
    }
  };

  const filteredInterns = interns.filter(i => {
    const nameMatch = (i.name || '').toLowerCase().includes(internSearch.toLowerCase());
    const emailMatch = (i.email || '').toLowerCase().includes(internSearch.toLowerCase());
    return nameMatch || emailMatch;
  });

  const handleDeleteGroup = async () => {
    if (window.confirm(`Are you sure you want to delete the group "${selectedGroup.name}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/admin/groups/${selectedGroup.id}`);
        toast.success('Group deleted successfully');
        setSelectedGroup(null);
        fetchTechnologies();
      } catch (err) {
        toast.error('Failed to delete group');
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    try {
      const res = await api.post(`/admin/groups/${selectedGroup.id}/messages`, { content: messageText });
      setGroupMessages([...groupMessages, res.data]);
      setMessageText('');
      toast.success('Message sent to group');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const toggleTechExpand = (techId) => {
    setExpandedTech(prev => ({ ...prev, [techId]: !prev[techId] }));
  };

  const existingInterns = groupInterns;
  const otherInterns = filteredInterns.filter(i => !i.groups?.some(g => g.id == selectedGroup?.id));

  const totalInterns = interns.length;
  const totalGroups = technologies.reduce((sum, tech) => sum + tech.groups.length, 0);
  const totalTrainersCount = trainers.length;

  return (
    <div className="domains-page">
      <Sidebar role={user?.role} />
      
      {/* Mobile Header Spacer */}
      {isMobile && (
        <div className="mobile-header-spacer">
          <div className="mobile-title-bar">
            <div className="mobile-title-info">
              <h1 className="mobile-page-title">Tech & Groups</h1>
              <p className="mobile-page-subtitle">Manage cohorts & members</p>
            </div>
            <button className="mobile-create-btn" onClick={() => setShowCreateForm(true)}>
              <Plus size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="main-content">
        {/* Desktop Header */}
        {!isMobile && (
          <div className="page-header">
            <div>
              <h1 className="page-title">Technologies & Groups</h1>
              <p className="page-subtitle">Manage groups and assign interns to their respective technology cohorts</p>
            </div>
            <button className="create-group-btn" onClick={() => setShowCreateForm(true)}>
              <Plus size={18} />
              <span>Create Group</span>
            </button>
          </div>
        )}

        {/* Stats Summary - Desktop */}
        {!isMobile && (
          <div className="stats-summary">
            <div className="stat-card-mini">
              <Layers size={20} />
              <div>
                <p className="stat-label">Technologies</p>
                <p className="stat-number">{technologies.length}</p>
              </div>
            </div>
            <div className="stat-card-mini">
              <Users size={20} />
              <div>
                <p className="stat-label">Total Groups</p>
                <p className="stat-number">{totalGroups}</p>
              </div>
            </div>
            <div className="stat-card-mini">
              <UserPlus size={20} />
              <div>
                <p className="stat-label">Total Interns</p>
                <p className="stat-number">{totalInterns}</p>
              </div>
            </div>
            <div className="stat-card-mini">
              <Briefcase size={20} />
              <div>
                <p className="stat-label">Trainers</p>
                <p className="stat-number">{totalTrainersCount}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Stats Scroll */}
        {isMobile && (
          <div className="mobile-stats-scroll">
            <div className="mobile-stat-item">
              <Layers size={14} />
              <span>{technologies.length} Tech</span>
            </div>
            <div className="mobile-stat-item">
              <Users size={14} />
              <span>{totalGroups} Groups</span>
            </div>
            <div className="mobile-stat-item">
              <UserPlus size={14} />
              <span>{totalInterns} Interns</span>
            </div>
            <div className="mobile-stat-item">
              <Briefcase size={14} />
              <span>{totalTrainersCount} Trainers</span>
            </div>
          </div>
        )}

        {/* Create Group Modal - Mobile Responsive */}
        {showCreateForm && (
          <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Group</h2>
                <button className="close-modal" onClick={() => setShowCreateForm(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateGroup} className="modal-form">
                <div className="form-group">
                  <label>Select Technology</label>
                  <select 
                    className="form-select" 
                    value={newGroup.domainId}
                    onChange={e => setNewGroup({...newGroup, domainId: e.target.value})}
                    required
                  >
                    <option value="">Select Technology</option>
                    {technologies.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Group Name</label>
                  <input 
                    type="text"
                    className="form-input" 
                    placeholder="e.g., Group A, Frontend Team" 
                    value={newGroup.name}
                    onChange={e => setNewGroup({...newGroup, name: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Assign Trainer (Optional)</label>
                  <select 
                    className="form-select" 
                    value={newGroup.trainerId}
                    onChange={e => setNewGroup({...newGroup, trainerId: e.target.value})}
                  >
                    <option value="">No Trainer</option>
                    {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="submit-btn">
                    <Plus size={16} />
                    <span>Create Group</span>
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Technologies Section */}
        <div className="technologies-section">
          <h2 className="section-title">Existing Structure</h2>
          <div className="technologies-grid">
            {technologies.map(tech => {
              const isExpanded = expandedTech[tech.id];
              const visibleGroups = isMobile ? (isExpanded ? tech.groups : tech.groups.slice(0, 2)) : tech.groups;
              
              return (
                <div key={tech.id} className="tech-card">
                  <div className="tech-header" onClick={() => isMobile && toggleTechExpand(tech.id)}>
                    <div className="tech-info">
                      <div className="tech-icon">
                        <Layers size={20} />
                      </div>
                      <h3>{tech.name}</h3>
                    </div>
                    <div className="tech-header-right">
                      <span className="group-count">{tech.groups.length} Groups</span>
                      {isMobile && tech.groups.length > 2 && (
                        isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />
                      )}
                    </div>
                  </div>
                  <div className="groups-list">
                    {tech.groups.length === 0 ? (
                      <p className="no-groups">No groups created yet</p>
                    ) : (
                      visibleGroups.map(group => (
                        <div 
                          key={group.id} 
                          className="group-item"
                          onClick={() => setSelectedGroup(group)}
                        >
                          <div className="group-info">
                            <div className="group-dot"></div>
                            <div>
                              <div className="group-name">{group.name}</div>
                              <div className="group-trainer">
                                <Briefcase size={12} />
                                <span>
                                  {group.trainer ? group.trainer.name : 'No trainer assigned'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="group-meta">
                            <span className="intern-count">
                              <Users size={12} />
                              {group._count?.users || 0}
                            </span>
                            <ChevronRight size={16} className="arrow-icon" />
                          </div>
                        </div>
                      ))
                    )}
                    {isMobile && tech.groups.length > 2 && !isExpanded && (
                      <div className="expand-hint" onClick={() => toggleTechExpand(tech.id)}>
                        <span>+{tech.groups.length - 2} more groups</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Group Management Modal - Mobile Responsive */}
        {selectedGroup && (
          <div className="modal-overlay" onClick={() => setSelectedGroup(null)}>
            <div className="modal-content group-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">
                  <Users size={24} className="title-icon" />
                  <div>
                    <h2>{selectedGroup.name}</h2>
                    <p className="group-domain">{selectedGroup.domain?.name}</p>
                  </div>
                </div>
                <div className="modal-actions-buttons">
                  <button 
                    onClick={handleDeleteGroup}
                    className="delete-group-btn"
                    title="Delete Group"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button className="close-modal" onClick={() => setSelectedGroup(null)}>
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="group-tabs">
                <button 
                  onClick={() => setActiveTab('interns')}
                  className={`tab-btn ${activeTab === 'interns' ? 'active' : ''}`}
                >
                  <Users size={16} />
                  <span>{isMobile ? 'Members' : 'Manage Interns'}</span>
                </button>
                <button 
                  onClick={() => setActiveTab('messages')}
                  className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
                >
                  <MessageSquare size={16} />
                  <span>{isMobile ? 'Chat' : 'Messages & Updates'}</span>
                </button>
              </div>

              {activeTab === 'interns' ? (
                <div className="interns-management">
                  <div className="search-wrapper">
                    <Search size={16} className="search-icon" />
                    <input 
                      className="search-input" 
                      placeholder="Search interns..." 
                      value={internSearch}
                      onChange={e => setInternSearch(e.target.value)}
                    />
                    {internSearch && (
                      <button className="clear-search" onClick={() => setInternSearch('')}>
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {confirmingIntern && (() => {
                    const intern = interns.find(i => i.id === confirmingIntern);
                    if (!intern) return null;
                    return (
                      <div className="confirm-box">
                        <div className="confirm-header">
                          <div className="confirm-user">
                            <div className="user-avatar">
                              {intern.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4>{intern.name}</h4>
                              <p>Current: {intern.groups.map(g => g.name).join(', ') || 'None'}</p>
                            </div>
                          </div>
                          <button onClick={() => setConfirmingIntern(null)} className="close-confirm">
                            <X size={18} />
                          </button>
                        </div>
                        <div className="confirm-actions">
                          <button 
                            onClick={() => handleGroupAction(intern.id, false)}
                            className="confirm-keep"
                          >
                            <CheckCircle size={16} />
                            <span>Add to existing</span>
                          </button>
                          <button 
                            onClick={() => handleGroupAction(intern.id, true)}
                            className="confirm-shift"
                          >
                            <AlertCircle size={16} />
                            <span>Shift group</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="interns-split">
                    <div className="interns-column">
                      <h4 className="column-title existing">
                        <UserCheck size={16} />
                        Members ({existingInterns.length})
                      </h4>
                      <div className="interns-list">
                        {loadingGroup ? (
                          <div className="loading-state">
                            <div className="spinner-small"></div>
                            <p>Loading...</p>
                          </div>
                        ) : existingInterns.length === 0 ? (
                          <p className="empty-list">No members yet.</p>
                        ) : (
                          existingInterns.map(i => (
                            <div key={i.id} className="intern-item">
                              <div className="intern-info">
                                <div className="intern-avatar small">
                                  {i.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="intern-name">{i.name}</div>
                                  <div className="intern-email">{i.email}</div>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleGroupToggle(i.id, 'REMOVE', selectedGroup.id)} 
                                className="remove-intern-btn"
                                title="Remove"
                              >
                                <UserMinus size={16} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="interns-column">
                      <h4 className="column-title add">
                        <UserPlus size={16} />
                        Add Interns ({otherInterns.length})
                      </h4>
                      <div className="interns-list">
                        {otherInterns.length === 0 ? (
                          <p className="empty-list">No interns found.</p>
                        ) : (
                          otherInterns.map(i => (
                            <div key={i.id} className="intern-item">
                              <div className="intern-info">
                                <div className="intern-avatar small">
                                  {i.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="intern-name">{i.name}</div>
                                  <div className="intern-email">{i.email}</div>
                                  {i.groups && i.groups.length > 0 && (
                                    <div className="current-groups">
                                      In: {i.groups.map(g => g.name).join(', ')}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button 
                                onClick={() => handleGroupToggle(i.id)} 
                                className="add-intern-btn"
                                title="Add"
                              >
                                <UserPlus size={16} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="messages-management">
                  <form onSubmit={handleSendMessage} className="message-form">
                    <textarea 
                      className="message-input" 
                      placeholder="Send announcement..." 
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      rows={isMobile ? 2 : 3}
                      required
                    />
                    <button type="submit" className="send-message-btn">
                      <Send size={16} />
                      <span>Send</span>
                    </button>
                  </form>

                  <div className="messages-history">
                    <h4 className="history-title">Recent Messages</h4>
                    <div className="messages-list">
                      {groupMessages.length === 0 ? (
                        <div className="empty-messages">
                          <MessageSquare size={32} />
                          <p>No messages yet.</p>
                        </div>
                      ) : (
                        groupMessages.slice().reverse().map(msg => (
                          <div key={msg.id} className="message-item">
                            <div className="message-header">
                              <div className="message-sender">
                                <div className="sender-avatar small">
                                  {msg.sender.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="sender-name">{msg.sender.name}</span>
                              </div>
                              <span className="message-date">
                                {new Date(msg.createdAt).toLocaleDateString(isMobile ? 'short' : undefined)}
                              </span>
                            </div>
                            <div className="message-content">{msg.content}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{css}</style>
    </div>
  );
};

// Helper component for UserCheck (not imported)
const UserCheck = ({ size }) => <Users size={size} />;

const css = `
.domains-page {
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

.mobile-create-btn {
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
}

/* Desktop Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  color: rgba(180, 220, 215, 0.6);
  font-size: 0.9rem;
  margin: 0;
}

.create-group-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
}

/* Stats Summary */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card-mini {
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.1);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-card-mini svg {
  color: #14b8a6;
}

.stat-label {
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.6);
  margin: 0 0 2px 0;
  text-transform: uppercase;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

/* Mobile Stats */
.mobile-stats-scroll {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1rem;
  padding-bottom: 4px;
}

.mobile-stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #0d1f35;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
  color: #14b8a6;
  white-space: nowrap;
}

/* Technologies Section */
.technologies-section {
  margin-top: 1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 1rem;
}

.technologies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1rem;
}

.tech-card {
  background: #0d1f35;
  border-radius: 16px;
  border: 1px solid rgba(20, 184, 166, 0.1);
  overflow: hidden;
}

.tech-header {
  padding: 1rem;
  background: rgba(20, 184, 166, 0.05);
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tech-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tech-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(20, 184, 166, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #14b8a6;
}

.tech-header h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
}

.tech-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-count {
  font-size: 0.65rem;
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.1);
  padding: 4px 8px;
  border-radius: 8px;
}

.groups-list {
  padding: 0.5rem;
}

.group-item {
  padding: 0.75rem;
  margin: 0.25rem 0;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.group-item:active {
  background: rgba(20, 184, 166, 0.08);
}

.group-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.group-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #14b8a6;
}

.group-name {
  font-weight: 600;
  color: #fff;
  font-size: 0.85rem;
  margin-bottom: 2px;
}

.group-trainer {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.6rem;
  color: rgba(180, 220, 215, 0.5);
}

.group-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.intern-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  color: rgba(180, 220, 215, 0.6);
}

.expand-hint {
  text-align: center;
  padding: 8px;
  font-size: 0.7rem;
  color: #14b8a6;
  cursor: pointer;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  background: #0d1f35;
  border-radius: 20px;
  width: 900px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(20, 184, 166, 0.2);
}

.group-modal {
  width: 1000px;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  position: sticky;
  top: 0;
  background: #0d1f35;
  z-index: 10;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  color: #14b8a6;
}

.modal-title h2 {
  margin: 0;
  font-size: 1rem;
  color: #fff;
}

.group-domain {
  margin: 2px 0 0;
  font-size: 0.65rem;
  color: rgba(180, 220, 215, 0.5);
}

.modal-actions-buttons {
  display: flex;
  gap: 8px;
}

.delete-group-btn {
  background: rgba(239, 68, 68, 0.15);
  border: none;
  color: #ef4444;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
}

.close-modal {
  background: none;
  border: none;
  color: rgba(180, 220, 215, 0.6);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
}

/* Form */
.modal-form {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: rgba(180, 220, 215, 0.8);
  font-size: 0.8rem;
  font-weight: 500;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
  color: #e2f8f5;
  font-size: 0.85rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.submit-btn,
.cancel-btn {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.submit-btn {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  border: none;
  color: white;
}

.cancel-btn {
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  color: rgba(180, 220, 215, 0.8);
}

/* Group Tabs */
.group-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem;
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: none;
  border: none;
  color: rgba(180, 220, 215, 0.6);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  color: #14b8a6;
  border-bottom-color: #14b8a6;
}

/* Interns Management */
.interns-management {
  padding: 1rem;
}

.search-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
  color: #e2f8f5;
  font-size: 0.85rem;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(180, 220, 215, 0.5);
}

.clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(180, 220, 215, 0.5);
  cursor: pointer;
}

.confirm-box {
  background: rgba(20, 184, 166, 0.1);
  border: 1px solid #14b8a6;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.confirm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.confirm-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
}

.confirm-user h4 {
  margin: 0;
  font-size: 0.9rem;
  color: #fff;
}

.confirm-user p {
  margin: 2px 0 0;
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.7);
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
  flex-direction: column;
}

.confirm-keep,
.confirm-shift {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.confirm-keep {
  background: #14b8a6;
  border: none;
  color: white;
}

.confirm-shift {
  background: #f59e0b;
  border: none;
  color: white;
}

/* Interns Split */
.interns-split {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.interns-column {
  background: #071a2e;
  border-radius: 12px;
  overflow: hidden;
}

.column-title {
  padding: 0.75rem;
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.column-title.existing {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
}

.column-title.add {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.interns-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
}

.intern-item {
  padding: 0.75rem;
  margin: 0.25rem 0;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.intern-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.intern-avatar.small {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 0.8rem;
}

.intern-name {
  font-weight: 500;
  color: #fff;
  font-size: 0.8rem;
}

.intern-email {
  font-size: 0.6rem;
  color: rgba(180, 220, 215, 0.5);
}

.current-groups {
  font-size: 0.6rem;
  color: #14b8a6;
  margin-top: 2px;
}

.remove-intern-btn,
.add-intern-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
}

.remove-intern-btn { color: #ef4444; }
.add-intern-btn { color: #10b981; }

.empty-list,
.loading-state {
  text-align: center;
  padding: 1.5rem;
  color: rgba(180, 220, 215, 0.5);
  font-size: 0.8rem;
}

/* Messages */
.messages-management {
  padding: 1rem;
}

.message-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.message-input {
  padding: 10px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
  color: #e2f8f5;
  font-size: 0.85rem;
  font-family: inherit;
}

.send-message-btn {
  align-self: flex-end;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
}

.messages-history {
  margin-top: 1rem;
}

.history-title {
  font-size: 0.85rem;
  color: rgba(180, 220, 215, 0.7);
  margin-bottom: 0.75rem;
}

.messages-list {
  max-height: 350px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.message-item {
  background: #071a2e;
  border-radius: 10px;
  padding: 0.75rem;
  border-left: 3px solid #14b8a6;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.message-sender {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sender-avatar.small {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  font-size: 0.7rem;
}

.sender-name {
  font-weight: 600;
  color: #14b8a6;
  font-size: 0.75rem;
}

.message-date {
  font-size: 0.6rem;
  color: rgba(180, 220, 215, 0.4);
}

.message-content {
  color: rgba(220, 240, 235, 0.9);
  font-size: 0.8rem;
  line-height: 1.4;
}

.empty-messages {
  text-align: center;
  padding: 2rem;
  color: rgba(180, 220, 215, 0.5);
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(20, 184, 166, 0.2);
  border-top-color: #14b8a6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
    padding-top: 70px;
  }
  
  .technologies-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 0.875rem;
    padding-top: 65px;
  }
  
  .modal-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .modal-actions-buttons {
    align-self: flex-end;
  }
  
  .group-tabs {
    padding: 0 0.75rem;
  }
  
  .tab-btn span {
    display: inline;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
    padding-top: 60px;
  }
  
  .tab-btn span {
    display: none;
  }
  
  .tab-btn {
    padding: 10px;
  }
  
  .group-meta {
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
  
  .intern-name {
    font-size: 0.75rem;
  }
  
  .intern-email {
    font-size: 0.55rem;
  }
}
`;

export default DomainsGroups;