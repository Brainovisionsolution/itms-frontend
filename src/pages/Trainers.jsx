import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { toast } from 'react-toastify';
import { 
  Trash2, UserCircle, Check, Users, Settings2, X, Search, BookOpen, 
  Mail, Phone, Award, TrendingUp, Calendar, Clock 
} from 'lucide-react';
import useTitle from '../hooks/useTitle';
import { useAuth } from '../context/AuthContext';

const Trainers = () => {
  const { user } = useAuth();
  useTitle('Trainer Management');
  const [trainers, setTrainers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrainers();
    fetchGroups();
  }, []);

  const fetchTrainers = async () => {
    try {
      const res = await api.get('/admin/users?limit=1000');
      const fetchedData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setTrainers(fetchedData.filter(u => u.role === 'TRAINER'));
    } catch (err) {
      toast.error('Failed to fetch trainers');
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get('/admin/groups');
      setGroups(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/users/${id}/approve`);
      toast.success('Trainer approved successfully');
      fetchTrainers();
    } catch (err) {
      toast.error('Failed to approve trainer');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trainer? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/users/${id}`);
        toast.success('Trainer removed successfully');
        fetchTrainers();
      } catch (err) {
        toast.error('Failed to delete trainer');
      }
    }
  };

  const handleAssignGroup = async (groupId, isAssigned) => {
    if (!selectedTrainer) return;
    setLoading(true);
    try {
      await api.put(`/admin/groups/${groupId}`, { 
        trainerId: isAssigned ? selectedTrainer.id : null 
      });
      toast.success(isAssigned ? 'Group assigned successfully' : 'Group removed successfully');
      fetchGroups();
      fetchTrainers();
      const updatedTrainerRes = await api.get('/admin/users?limit=1000');
      const updatedList = Array.isArray(updatedTrainerRes.data) ? updatedTrainerRes.data : (updatedTrainerRes.data.data || []);
      const updatedTrainer = updatedList.find(t => t.id === selectedTrainer.id);
      setSelectedTrainer(updatedTrainer);
    } catch (err) {
      toast.error('Failed to update assignment');
    } finally {
      setLoading(false);
    }
  };

  const filteredTrainers = trainers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingApprovals = trainers.filter(t => !t.isApproved).length;
  const activeTrainers = trainers.filter(t => t.isApproved).length;
  const totalGroups = groups.length;

  return (
    <div className="trainers-page">
      <Sidebar role={user?.role} />
      <div className="main-content">
        {/* Header Section */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Trainer Network</h1>
            <p className="page-subtitle">Overview of all system instructors and their assigned cohorts</p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="stats-summary">
          <div className="stat-card-mini">
            <UserCircle size={20} />
            <div>
              <p className="stat-label">Total Trainers</p>
              <p className="stat-number">{trainers.length}</p>
            </div>
          </div>
          <div className="stat-card-mini">
            <Check size={20} />
            <div>
              <p className="stat-label">Active Trainers</p>
              <p className="stat-number">{activeTrainers}</p>
            </div>
          </div>
          <div className="stat-card-mini">
            <Clock size={20} />
            <div>
              <p className="stat-label">Pending Approval</p>
              <p className="stat-number">{pendingApprovals}</p>
            </div>
          </div>
          <div className="stat-card-mini">
            <Users size={20} />
            <div>
              <p className="stat-label">Total Groups</p>
              <p className="stat-number">{totalGroups}</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              className="search-input" 
              placeholder="Search by name or email..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Trainers Grid */}
        <div className="trainers-grid">
          {filteredTrainers.length === 0 ? (
            <div className="empty-state">
              <UserCircle size={48} />
              <h3>No trainers found</h3>
              <p>{searchTerm ? `No results matching "${searchTerm}"` : 'No trainers have been added yet'}</p>
            </div>
          ) : (
            filteredTrainers.map(trainer => (
              <div key={trainer.id} className={`trainer-card ${!trainer.isApproved ? 'pending' : ''}`}>
                {!trainer.isApproved && (
                  <div className="pending-badge">
                    <Clock size={12} />
                    <span>Pending Approval</span>
                  </div>
                )}
                
                <div className="trainer-header">
                  <div className="trainer-avatar">
                    {trainer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="trainer-info">
                    <h3 className="trainer-name">{trainer.name}</h3>
                    <div className="trainer-email">
                      <Mail size={12} />
                      <span>{trainer.email}</span>
                    </div>
                  </div>
                </div>

                <div className="groups-section">
                  <div className="groups-header">
                    <Users size={14} />
                    <span>Assigned Groups ({trainer.trainerGroups?.length || 0})</span>
                  </div>
                  <div className="groups-list">
                    {trainer.trainerGroups?.length > 0 ? (
                      trainer.trainerGroups.map(group => (
                        <span key={group.id} className="group-tag">
                          <BookOpen size={10} />
                          {group.name}
                          <span className="group-domain">({group.domain?.name})</span>
                        </span>
                      ))
                    ) : (
                      <p className="no-groups">No groups assigned yet</p>
                    )}
                  </div>
                </div>

                <div className="trainer-actions">
                  <button 
                    onClick={() => { setSelectedTrainer(trainer); setShowManageModal(true); }}
                    className="manage-btn"
                  >
                    <Settings2 size={16} />
                    <span>Manage Groups</span>
                  </button>
                  {!trainer.isApproved && (
                    <button onClick={() => handleApprove(trainer.id)} className="approve-btn" title="Approve Trainer">
                      <Check size={16} />
                      <span>Approve</span>
                    </button>
                  )}
                  <button onClick={() => handleDelete(trainer.id)} className="delete-btn" title="Delete Trainer">
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Manage Groups Modal */}
        {showManageModal && selectedTrainer && (
          <div className="modal-overlay" onClick={() => setShowManageModal(false)}>
            <div className="modal-content manage-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>Manage Group Assignments</h2>
                  <p>Assigning groups to <strong>{selectedTrainer.name}</strong></p>
                </div>
                <button className="close-modal" onClick={() => setShowManageModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="groups-assignment-list">
                  {groups.length === 0 ? (
                    <div className="empty-groups">
                      <Users size={32} />
                      <p>No groups available</p>
                    </div>
                  ) : (
                    groups.map(group => {
                      const isAssignedToThisTrainer = group.trainerId === selectedTrainer.id;
                      const isAssignedToOther = group.trainerId && group.trainerId !== selectedTrainer.id;
                      return (
                        <div 
                          key={group.id} 
                          className={`assignment-item ${isAssignedToThisTrainer ? 'assigned' : ''} ${isAssignedToOther ? 'assigned-other' : ''}`}
                        >
                          <div className="assignment-info">
                            <div className="assignment-icon">
                              <BookOpen size={16} />
                            </div>
                            <div>
                              <h4>{group.name}</h4>
                              <p>{group.domain?.name}</p>
                              {isAssignedToOther && (
                                <span className="other-trainer-badge">
                                  Managed by another trainer
                                </span>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={() => handleAssignGroup(group.id, !isAssignedToThisTrainer)}
                            disabled={loading || (isAssignedToOther && !isAssignedToThisTrainer)}
                            className={`assignment-btn ${isAssignedToThisTrainer ? 'remove' : 'assign'}`}
                          >
                            {loading ? (
                              <div className="spinner-small"></div>
                            ) : isAssignedToThisTrainer ? (
                              <>
                                <X size={14} />
                                <span>Remove</span>
                              </>
                            ) : (
                              <>
                                <Check size={14} />
                                <span>Assign</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button className="done-btn" onClick={() => setShowManageModal(false)}>
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{css}</style>
    </div>
  );
};

const css = `
.trainers-page {
  min-height: 100vh;
  background: #071a2e;
}

.main-content {
  margin-left: 280px;
  padding: 2rem;
  transition: all 0.3s ease;
}

/* Header */
.page-header {
  margin-bottom: 1.5rem;
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
  transition: all 0.2s;
}

.stat-card-mini:hover {
  transform: translateY(-2px);
  border-color: rgba(20, 184, 166, 0.3);
}

.stat-card-mini svg {
  color: #14b8a6;
}

.stat-label {
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.6);
  margin: 0 0 2px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

/* Search Section */
.search-section {
  margin-bottom: 2rem;
}

.search-wrapper {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(180, 220, 215, 0.5);
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 12px;
  color: #e2f8f5;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #14b8a6;
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
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.clear-search:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

/* Trainers Grid */
.trainers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.trainer-card {
  background: #0d1f35;
  border-radius: 16px;
  border: 1px solid rgba(20, 184, 166, 0.1);
  padding: 1.25rem;
  transition: all 0.3s ease;
  position: relative;
}

.trainer-card:hover {
  transform: translateY(-4px);
  border-color: rgba(20, 184, 166, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.trainer-card.pending {
  border-left: 3px solid #f59e0b;
}

.pending-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 600;
}

.trainer-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.trainer-avatar {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.trainer-info {
  flex: 1;
}

.trainer-name {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
}

.trainer-email {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: rgba(180, 220, 215, 0.6);
}

/* Groups Section */
.groups-section {
  background: #071a2e;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.25rem;
}

.groups-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(180, 220, 215, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
}

.groups-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.group-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 500;
}

.group-domain {
  opacity: 0.7;
  font-size: 0.65rem;
}

.no-groups {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(180, 220, 215, 0.4);
  font-style: italic;
}

/* Actions */
.trainer-actions {
  display: flex;
  gap: 8px;
}

.manage-btn, .approve-btn, .delete-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.manage-btn {
  flex: 1;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
}

.manage-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.approve-btn {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.approve-btn:hover {
  background: rgba(16, 185, 129, 0.25);
  transform: translateY(-2px);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.25);
  transform: translateY(-2px);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #0d1f35;
  border-radius: 20px;
  width: 600px;
  max-width: 95%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(20, 184, 166, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #fff;
}

.modal-header p {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: rgba(180, 220, 215, 0.6);
}

.close-modal {
  background: none;
  border: none;
  color: rgba(180, 220, 215, 0.6);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-modal:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.groups-assignment-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.assignment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #071a2e;
  border-radius: 12px;
  border: 1px solid rgba(20, 184, 166, 0.1);
  transition: all 0.2s;
}

.assignment-item.assigned {
  background: rgba(20, 184, 166, 0.05);
  border-color: rgba(20, 184, 166, 0.3);
}

.assignment-item.assigned-other {
  opacity: 0.6;
}

.assignment-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.assignment-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(20, 184, 166, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #14b8a6;
}

.assignment-info h4 {
  margin: 0;
  font-size: 0.9rem;
  color: #fff;
}

.assignment-info p {
  margin: 2px 0 0;
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.5);
}

.other-trainer-badge {
  display: inline-block;
  margin-top: 4px;
  font-size: 0.6rem;
  color: #f59e0b;
}

.assignment-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.assignment-btn.assign {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
}

.assignment-btn.remove {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.assignment-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.assignment-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(20, 184, 166, 0.1);
  display: flex;
  justify-content: flex-end;
}

.done-btn {
  padding: 8px 24px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.done-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  background: #0d1f35;
  border-radius: 16px;
}

.empty-state svg {
  color: #14b8a6;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #fff;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: rgba(180, 220, 215, 0.6);
  margin: 0;
}

.empty-groups {
  text-align: center;
  padding: 3rem;
  color: rgba(180, 220, 215, 0.5);
}

.spinner-small {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
    padding: 1.5rem;
  }
  
  .trainers-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  
  .stats-summary {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .trainers-grid {
    grid-template-columns: 1fr;
  }
  
  .trainer-actions {
    flex-wrap: wrap;
  }
  
  .manage-btn, .approve-btn, .delete-btn {
    flex: 1;
    justify-content: center;
  }
  
  .assignment-item {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .assignment-info {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .stats-summary {
    grid-template-columns: 1fr;
  }
  
  .trainer-header {
    flex-direction: column;
    text-align: center;
  }
  
  .trainer-email {
    justify-content: center;
  }
  
  .groups-list {
    justify-content: center;
  }
  
  .trainer-actions {
    flex-direction: column;
  }
  
  .modal-content {
    width: 95%;
  }
}
`;

export default Trainers;