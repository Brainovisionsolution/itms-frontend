import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { toast } from 'react-toastify';
import { UserCircle, Trash2, Search, Shield, GraduationCap, Briefcase, Mail, Phone, MoreVertical, Edit2, Save, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import useTitle from '../hooks/useTitle';

const Directories = () => {
  useTitle('User Directory');
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [editingRole, setEditingRole] = useState(null);
  const [tempRole, setTempRole] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users?isApproved=true&limit=1000');
      const fetchedData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setUsers(fetchedData);
    } catch (err) {
      toast.error('Failed to fetch users');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      toast.success(`Role updated to ${role}`);
      setEditingRole(null);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to PERMANENTLY DELETE this user? All their data will be removed.')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (err) {
        toast.error('Failed to delete user');
      }
    }
  };

  const startEdit = (user) => {
    setEditingRole(user.id);
    setTempRole(user.role);
  };

  const cancelEdit = () => {
    setEditingRole(null);
    setTempRole('');
  };

  const saveEdit = (userId) => {
    handleRoleChange(userId, tempRole);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role) => {
    switch(role) {
      case 'ADMIN':
        return <Shield size={16} />;
      case 'TRAINER':
        return <Briefcase size={16} />;
      default:
        return <GraduationCap size={16} />;
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'ADMIN':
        return '#ec4899';
      case 'TRAINER':
        return '#8b5cf6';
      default:
        return '#14b8a6';
    }
  };

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'STUDENT').length,
    trainers: users.filter(u => u.role === 'TRAINER').length,
    admins: users.filter(u => u.role === 'ADMIN').length
  };

  const toggleUserExpand = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  return (
    <div className="directory-page">
      <Sidebar role="ADMIN" />
      
      {/* Mobile Header Spacer */}
      {isMobile && (
        <div className="mobile-header-spacer">
          <div className="mobile-title-bar">
            <div className="mobile-title-info">
              <h1 className="mobile-page-title">User Directory</h1>
              <p className="mobile-page-subtitle">Manage platform members</p>
            </div>
            <div className="mobile-stats-badge">
              <span>{stats.total} users</span>
            </div>
          </div>
        </div>
      )}

      <div className="main-content">
        {/* Desktop Header */}
        {!isMobile && (
          <div className="directory-header">
            <div>
              <h1 className="page-title">User Directory</h1>
              <p className="page-subtitle">Manage roles and access for existing platform members</p>
            </div>
          </div>
        )}

        {/* Stats Summary - Desktop */}
        {!isMobile && (
          <div className="stats-summary">
            <div className="stat-card-mini">
              <UserCircle size={20} />
              <div>
                <p className="stat-label">Total Users</p>
                <p className="stat-number">{stats.total}</p>
              </div>
            </div>
            <div className="stat-card-mini">
              <GraduationCap size={20} />
              <div>
                <p className="stat-label">Students</p>
                <p className="stat-number">{stats.students}</p>
              </div>
            </div>
            <div className="stat-card-mini">
              <Briefcase size={20} />
              <div>
                <p className="stat-label">Trainers</p>
                <p className="stat-number">{stats.trainers}</p>
              </div>
            </div>
            <div className="stat-card-mini">
              <Shield size={20} />
              <div>
                <p className="stat-label">Admins</p>
                <p className="stat-number">{stats.admins}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Stats Summary */}
        {isMobile && (
          <div className="mobile-stats-scroll">
            <div className="mobile-stat-item">
              <UserCircle size={16} />
              <span>Total: {stats.total}</span>
            </div>
            <div className="mobile-stat-item">
              <GraduationCap size={16} />
              <span>Students: {stats.students}</span>
            </div>
            <div className="mobile-stat-item">
              <Briefcase size={16} />
              <span>Trainers: {stats.trainers}</span>
            </div>
            <div className="mobile-stat-item">
              <Shield size={16} />
              <span>Admins: {stats.admins}</span>
            </div>
          </div>
        )}

        {/* Filters Section - Desktop */}
        {!isMobile && (
          <div className="filters-section">
            <div className="search-wrapper">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                className="search-input" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="role-filters">
              <button 
                className={`role-filter-btn ${roleFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setRoleFilter('ALL')}
              >
                All
              </button>
              <button 
                className={`role-filter-btn ${roleFilter === 'STUDENT' ? 'active' : ''}`}
                onClick={() => setRoleFilter('STUDENT')}
              >
                <GraduationCap size={14} />
                Students
              </button>
              <button 
                className={`role-filter-btn ${roleFilter === 'TRAINER' ? 'active' : ''}`}
                onClick={() => setRoleFilter('TRAINER')}
              >
                <Briefcase size={14} />
                Trainers
              </button>
              <button 
                className={`role-filter-btn ${roleFilter === 'ADMIN' ? 'active' : ''}`}
                onClick={() => setRoleFilter('ADMIN')}
              >
                <Shield size={14} />
                Admins
              </button>
            </div>
          </div>
        )}

        {/* Mobile Search and Filter Toggle */}
        {isMobile && (
          <div className="mobile-search-section">
            <div className="search-wrapper-mobile">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                className="search-input-mobile" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  <X size={14} />
                </button>
              )}
            </div>
            
            <button 
              className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              <span>Filter</span>
              {roleFilter !== 'ALL' && <span className="filter-dot"></span>}
            </button>
          </div>
        )}

        {/* Mobile Filter Panel */}
        {isMobile && showFilters && (
          <div className="mobile-filter-panel">
            <div className="mobile-role-options">
              <button 
                className={`mobile-role-option ${roleFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => { setRoleFilter('ALL'); setShowFilters(false); }}
              >
                All Users
              </button>
              <button 
                className={`mobile-role-option ${roleFilter === 'STUDENT' ? 'active' : ''}`}
                onClick={() => { setRoleFilter('STUDENT'); setShowFilters(false); }}
              >
                <GraduationCap size={14} /> Students
              </button>
              <button 
                className={`mobile-role-option ${roleFilter === 'TRAINER' ? 'active' : ''}`}
                onClick={() => { setRoleFilter('TRAINER'); setShowFilters(false); }}
              >
                <Briefcase size={14} /> Trainers
              </button>
              <button 
                className={`mobile-role-option ${roleFilter === 'ADMIN' ? 'active' : ''}`}
                onClick={() => { setRoleFilter('ADMIN'); setShowFilters(false); }}
              >
                <Shield size={14} /> Admins
              </button>
            </div>
          </div>
        )}

        {/* Users Table - Desktop */}
        {!isMobile && (
          <div className="table-container">
            <div className="table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Email</th>
                    <th>Current Role</th>
                    <th>Change Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td className="member-cell">
                        <div className="member-info">
                          <div className="member-avatar">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="member-name">{u.name}</div>
                            {u.college && <div className="member-college">{u.college}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="email-cell">
                        <Mail size={14} className="email-icon" />
                        {u.email}
                      </td>
                      <td className="role-cell">
                        <span className={`role-badge ${u.role.toLowerCase()}`}>
                          {getRoleIcon(u.role)}
                          {u.role}
                        </span>
                      </td>
                      <td className="edit-cell">
                        {editingRole === u.id ? (
                          <div className="edit-controls">
                            <select 
                              className="role-select" 
                              value={tempRole} 
                              onChange={(e) => setTempRole(e.target.value)}
                            >
                              <option value="STUDENT">Student</option>
                              <option value="TRAINER">Trainer</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                            <button 
                              className="save-edit-btn"
                              onClick={() => saveEdit(u.id)}
                              title="Save"
                            >
                              <Save size={14} />
                            </button>
                            <button 
                              className="cancel-edit-btn"
                              onClick={cancelEdit}
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="edit-role-btn"
                            onClick={() => startEdit(u)}
                          >
                            <Edit2 size={14} />
                            <span>Edit Role</span>
                          </button>
                        )}
                      </td>
                      <td className="actions-cell">
                        <button 
                          onClick={() => handleDelete(u.id)} 
                          className="delete-btn"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="empty-state">
                  <UserCircle size={48} />
                  <h3>No users found</h3>
                  <p>{searchTerm ? `No results matching "${searchTerm}"` : 'No users in the directory'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Cards View */}
        {isMobile && (
          <div className="mobile-cards">
            {filteredUsers.length === 0 ? (
              <div className="empty-state-mobile">
                <UserCircle size={40} />
                <h3>No users found</h3>
                <p>{searchTerm ? `No results matching "${searchTerm}"` : 'No users in the directory'}</p>
              </div>
            ) : (
              filteredUsers.map(u => {
                const isExpanded = expandedUser === u.id;
                return (
                  <div key={u.id} className={`user-card ${isExpanded ? 'expanded' : ''}`}>
                    <div className="user-card-header" onClick={() => toggleUserExpand(u.id)}>
                      <div className="user-avatar">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-card-info">
                        <div className="user-name">{u.name}</div>
                        <div className="user-role-badge">
                          <span className={`role-badge-mobile ${u.role.toLowerCase()}`}>
                            {getRoleIcon(u.role)}
                            {u.role}
                          </span>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>

                    {isExpanded && (
                      <div className="user-card-details">
                        <div className="detail-row">
                          <Mail size={14} />
                          <span>{u.email}</span>
                        </div>
                        {u.college && (
                          <div className="detail-row">
                            <GraduationCap size={14} />
                            <span>{u.college}</span>
                          </div>
                        )}
                        {u.phone && (
                          <div className="detail-row">
                            <Phone size={14} />
                            <span>{u.phone}</span>
                          </div>
                        )}

                        <div className="user-actions">
                          {editingRole === u.id ? (
                            <div className="edit-controls-mobile">
                              <select 
                                className="role-select-mobile" 
                                value={tempRole} 
                                onChange={(e) => setTempRole(e.target.value)}
                              >
                                <option value="STUDENT">Student</option>
                                <option value="TRAINER">Trainer</option>
                                <option value="ADMIN">Admin</option>
                              </select>
                              <div className="edit-buttons">
                                <button 
                                  className="save-edit-mobile"
                                  onClick={() => saveEdit(u.id)}
                                >
                                  <Save size={14} />
                                </button>
                                <button 
                                  className="cancel-edit-mobile"
                                  onClick={cancelEdit}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button 
                                className="edit-role-mobile"
                                onClick={() => startEdit(u)}
                              >
                                <Edit2 size={14} />
                                <span>Edit Role</span>
                              </button>
                              <button 
                                onClick={() => handleDelete(u.id)} 
                                className="delete-mobile"
                              >
                                <Trash2 size={14} />
                                <span>Delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <style>{css}</style>
    </div>
  );
};

const css = `
.directory-page {
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

.mobile-stats-badge {
  background: rgba(20, 184, 166, 0.15);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #14b8a6;
}

/* Desktop Header */
.directory-header {
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

/* Stats Summary - Desktop */
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

/* Mobile Stats Scroll */
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

/* Filters Section - Desktop */
.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-wrapper {
  position: relative;
  flex: 1;
  max-width: 320px;
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
  padding: 10px 12px 10px 36px;
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 12px;
  color: #e2f8f5;
  font-size: 0.9rem;
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
  padding: 2px;
}

.role-filters {
  display: flex;
  gap: 0.5rem;
}

.role-filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
  color: rgba(180, 220, 215, 0.8);
  font-size: 0.85rem;
  cursor: pointer;
}

.role-filter-btn.active {
  background: #14b8a6;
  border-color: #14b8a6;
  color: white;
}

/* Mobile Search Section */
.mobile-search-section {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.search-wrapper-mobile {
  position: relative;
  flex: 1;
}

.search-input-mobile {
  width: 100%;
  padding: 10px 12px 10px 36px;
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 12px;
  color: #e2f8f5;
  font-size: 0.85rem;
}

.filter-toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 12px;
  color: rgba(180, 220, 215, 0.8);
  font-size: 0.85rem;
  cursor: pointer;
  position: relative;
}

.filter-toggle-btn.active {
  border-color: #14b8a6;
  background: rgba(20, 184, 166, 0.1);
}

.filter-dot {
  position: absolute;
  top: 6px;
  right: 8px;
  width: 6px;
  height: 6px;
  background: #14b8a6;
  border-radius: 50%;
}

/* Mobile Filter Panel */
.mobile-filter-panel {
  margin-bottom: 1rem;
  background: #0d1f35;
  border-radius: 12px;
  padding: 0.75rem;
  border: 1px solid rgba(20, 184, 166, 0.1);
}

.mobile-role-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.mobile-role-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 20px;
  color: rgba(180, 220, 215, 0.8);
  font-size: 0.8rem;
  cursor: pointer;
}

.mobile-role-option.active {
  background: #14b8a6;
  border-color: #14b8a6;
  color: white;
}

/* Desktop Table */
.table-container {
  background: #0d1f35;
  border-radius: 16px;
  border: 1px solid rgba(20, 184, 166, 0.1);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(180, 220, 215, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #071a2e;
  border-bottom: 2px solid rgba(20, 184, 166, 0.1);
}

.users-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(20, 184, 166, 0.05);
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-avatar {
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

.member-name {
  font-weight: 600;
  color: #fff;
}

.member-college {
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.5);
}

.email-cell {
  color: rgba(180, 220, 215, 0.7);
  font-size: 0.85rem;
}

.email-icon {
  margin-right: 6px;
  vertical-align: middle;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-badge.admin { background: rgba(236, 72, 153, 0.15); color: #ec4899; }
.role-badge.trainer { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
.role-badge.student { background: rgba(20, 184, 166, 0.15); color: #14b8a6; }

.edit-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.role-select {
  padding: 6px 8px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.3);
  border-radius: 8px;
  color: #e2f8f5;
  font-size: 0.8rem;
}

.edit-role-btn, .delete-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 8px;
  font-size: 0.75rem;
  cursor: pointer;
}

.edit-role-btn {
  color: #14b8a6;
}

.delete-btn {
  color: #ef4444;
}

.save-edit-btn, .cancel-edit-btn {
  padding: 6px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.save-edit-btn { background: #10b981; color: white; }
.cancel-edit-btn { background: #ef4444; color: white; }

/* Mobile Cards */
.mobile-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 70px;
}

.user-card {
  background: #0d1f35;
  border-radius: 14px;
  border: 1px solid rgba(20, 184, 166, 0.1);
  overflow: hidden;
}

.user-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem;
  cursor: pointer;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: white;
  flex-shrink: 0;
}

.user-card-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.user-role-badge {
  display: inline-block;
}

.role-badge-mobile {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 600;
}

.role-badge-mobile.admin { background: rgba(236, 72, 153, 0.15); color: #ec4899; }
.role-badge-mobile.trainer { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
.role-badge-mobile.student { background: rgba(20, 184, 166, 0.15); color: #14b8a6; }

.user-card-details {
  padding: 0 1rem 1rem 1rem;
  border-top: 1px solid rgba(20, 184, 166, 0.1);
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 0.8rem;
  color: rgba(180, 220, 215, 0.7);
  word-break: break-all;
}

.user-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(20, 184, 166, 0.1);
}

.edit-role-mobile, .delete-mobile {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.edit-role-mobile {
  background: rgba(20, 184, 166, 0.15);
  color: #14b8a6;
}

.delete-mobile {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.edit-controls-mobile {
  width: 100%;
}

.role-select-mobile {
  width: 100%;
  padding: 10px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.3);
  border-radius: 10px;
  color: #e2f8f5;
  margin-bottom: 8px;
}

.edit-buttons {
  display: flex;
  gap: 0.5rem;
}

.save-edit-mobile, .cancel-edit-mobile {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
}

.save-edit-mobile { background: #10b981; color: white; }
.cancel-edit-mobile { background: #ef4444; color: white; }

/* Empty States */
.empty-state, .empty-state-mobile {
  text-align: center;
  padding: 3rem 1.5rem;
}

.empty-state svg, .empty-state-mobile svg {
  color: #14b8a6;
  margin-bottom: 1rem;
}

.empty-state h3, .empty-state-mobile h3 {
  color: #fff;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.empty-state p, .empty-state-mobile p {
  color: rgba(180, 220, 215, 0.6);
  margin: 0;
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
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
    padding-top: 60px;
  }
  
  .user-avatar {
    width: 44px;
    height: 44px;
    font-size: 1rem;
  }
  
  .user-name {
    font-size: 0.9rem;
  }
}
`;

export default Directories;