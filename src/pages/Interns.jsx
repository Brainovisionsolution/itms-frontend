import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Upload, Plus, Trash2, Download, Edit2, X, Check, Search, Filter, Users, FileSpreadsheet, AlertCircle, ChevronLeft, ChevronRight, MoreVertical, ChevronDown, ChevronUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import useTitle from '../hooks/useTitle';

const allFields = [
  { name: 'name', label: 'Name', type: 'text', source: 'user' },
  { name: 'email', label: 'Email', type: 'email', source: 'user' },
  { name: 'phone', label: 'Mobile Number', type: 'text', source: 'profile' },
  { name: 'college', label: 'College Name', type: 'text', source: 'user' },
  { name: 'gender', label: 'Gender', type: 'text', source: 'profile' },
  { name: 'state', label: 'State', type: 'text', source: 'profile' },
  { name: 'paymentPageTitle', label: 'Payment Page Title', type: 'text', source: 'profile' },
  { name: 'paymentDate', label: 'Payment Date', type: 'date', source: 'profile' },
  { name: 'registrationAmount', label: 'Registration Amount', type: 'number', source: 'profile' },
  { name: 'branch', label: 'Branch', type: 'text', source: 'profile' },
  { name: 'yearOfPassingOut', label: 'Passing Year', type: 'text', source: 'profile' },
  { name: 'internshipProgram', label: 'Internship Program', type: 'text', source: 'profile' },
  { name: 'technology', label: 'Technology', type: 'text', source: 'profile' },
  { name: 'startDate', label: 'Start Date', type: 'date', source: 'profile' },
  { name: 'timings', label: 'Timings', type: 'text', source: 'profile' },
  { name: 'duration', label: 'Duration', type: 'text', source: 'profile' },
  { name: 'venuePreference', label: 'Venue Preference', type: 'text', source: 'profile' },
  { name: 'referredPersonName', label: 'Referred By', type: 'text', source: 'profile' },
  { name: 'internshipId', label: 'Internship ID', type: 'text', source: 'profile' },
  { name: 'studentComingDate', label: 'Coming Date', type: 'date', source: 'profile' },
  { name: 'officeInDate', label: 'Office In Date', type: 'date', source: 'profile' },
  { name: 'studentStatus', label: 'Student Status', type: 'text', source: 'profile' },
  { name: 'studentRemarks', label: 'Student Remarks', type: 'text', source: 'profile' },
  { name: 'offerLetter', label: 'Offer Letter', type: 'text', source: 'profile' },
  { name: 'idCard', label: 'ID Card', type: 'text', source: 'profile' },
  { name: 'welcomeKit', label: 'Welcome Kit', type: 'text', source: 'profile' },
  { name: 'totalPayment', label: 'Total Payment', type: 'number', source: 'profile' },
  { name: 'registrationPayment', label: 'Registration Payment', type: 'number', source: 'profile' },
  { name: 'discount', label: 'Discount', type: 'number', source: 'profile' },
  { name: 'balance', label: 'Balance', type: 'number', source: 'profile' },
  { name: 'installment1', label: '1st Installment', type: 'number', source: 'profile' },
  { name: 'installDate1', label: '1st Install Date', type: 'date', source: 'profile' },
  { name: 'paymentMode', label: 'Payment Mode', type: 'text', source: 'profile' },
  { name: 'installment2', label: '2nd Installment', type: 'number', source: 'profile' },
  { name: 'dateOfFullPayment', label: 'Date of Full Payment', type: 'date', source: 'profile' },
  { name: 'totalPaymentMode', label: 'Total Payment Mode', type: 'text', source: 'profile' },
  { name: 'balanceAfterInstallments', label: 'Balance After Installments', type: 'number', source: 'profile' },
  { name: 'cashAmount', label: 'Cash Amount', type: 'number', source: 'profile' },
  { name: 'classTimings', label: 'Class Timings', type: 'text', source: 'profile' },
  { name: 'attendance', label: 'Attendance', type: 'text', source: 'profile' },
  { name: 'assignments', label: 'Assignments', type: 'text', source: 'profile' },
  { name: 'projectTitle', label: 'Project Title', type: 'text', source: 'profile' },
  { name: 'internshipCompletionCertificate', label: 'Internship Cert', type: 'text', source: 'profile' },
  { name: 'projectCompletionCertificate', label: 'Project Cert', type: 'text', source: 'profile' },
  { name: 'exitDate', label: 'Exit Date', type: 'date', source: 'profile' },
  { name: 'remarks', label: 'Remarks', type: 'text', source: 'profile' },
];

const Interns = () => {
  useTitle('Intern Management');
  const [interns, setInterns] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIntern, setEditingIntern] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', college: '', totalFee: 0 });
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [expandedIntern, setExpandedIntern] = useState(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
  // Mapping Wizard States
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [excelHeaders, setExcelHeaders] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [mappingPreview, setMappingPreview] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { 
    fetchGroups(); 
    fetchInterns(1, true); 
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchInterns(1, true);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, groupFilter]);

  const fetchInterns = async (pageNum = 1, refresh = false) => { 
    setPageLoading(true);
    try { 
      const query = new URLSearchParams({
        page: pageNum,
        limit: 10,
        ...(searchTerm && { searchTerm }),
        ...(groupFilter && { groupId: groupFilter })
      });
      const res = await api.get(`/admin/interns?${query.toString()}`); 
      const fetchedData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      if (refresh) {
        setInterns(fetchedData);
        setPage(1);
      } else {
        setInterns(prev => [...(prev || []), ...fetchedData]);
        setPage(pageNum);
      }
      setHasMore(res.data.hasMore || false);
    } catch (err) { 
      toast.error('Failed to fetch interns'); 
    } finally {
      setPageLoading(false);
    }
  };
  
  const fetchGroups = async () => { 
    try { 
      const res = await api.get('/admin/groups'); 
      setGroups(res.data); 
    } catch (err) { 
      toast.error('Failed to fetch groups'); 
    } 
  };

  const handleLoadMore = () => {
    if (!pageLoading && hasMore) {
      fetchInterns(page + 1);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

      if (jsonData.length > 0) {
        const headers = Object.keys(jsonData[0]);
        setExcelHeaders(headers);
        setExcelData(jsonData);
        
        const initialMapping = {};
        allFields.slice(0, 10).forEach(field => {
          const match = headers.find(h => 
            h.toLowerCase().includes(field.name.toLowerCase()) || 
            h.toLowerCase().includes(field.label.toLowerCase())
          );
          if (match) initialMapping[field.name] = match;
        });
        
        setColumnMapping(initialMapping);
        setShowMappingModal(true);
      } else {
        toast.error('Excel file is empty');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleBulkImport = async () => {
    setLoading(true);
    const toastId = toast.loading('Importing interns...');
    
    try {
      const mappedInterns = excelData.map(row => {
        const intern = {};
        Object.entries(columnMapping).forEach(([sysField, excelCol]) => {
          if (excelCol) intern[sysField] = row[excelCol];
        });
        return intern;
      }).filter(i => i.email);

      const res = await api.post('/admin/bulk-interns', { interns: mappedInterns });
      toast.update(toastId, { render: res.data.message, type: 'success', isLoading: false, autoClose: 3000 });
      setShowMappingModal(false);
      fetchInterns(1, true);
    } catch (err) {
      toast.update(toastId, { render: 'Import failed', type: 'error', isLoading: false, autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleAddIntern = async (e) => { 
    e.preventDefault(); 
    try { 
      await api.post('/admin/interns', formData); 
      toast.success('Intern added'); 
      setShowAddModal(false); 
      setFormData({}); 
      fetchInterns(1, true); 
    } catch (err) { 
      toast.error('Failed to add intern'); 
    } 
  };
  
  const handleEditIntern = async (e) => { 
    e.preventDefault(); 
    try { 
      await api.put(`/admin/interns/${editingIntern.id}`, formData); 
      toast.success('Intern updated'); 
      setShowEditModal(false); 
      setEditingIntern(null); 
      setFormData({}); 
      fetchInterns(1, true); 
    } catch (err) { 
      toast.error('Failed to update intern'); 
    } 
  };

  const openEditModal = (intern) => {
    setEditingIntern(intern); 
    const profileData = intern.profile || {}; 
    const formattedData = { groupId: intern.groups?.[0]?.id || '' };
    allFields.forEach(f => { 
      let val = f.source === 'user' ? intern[f.name] : profileData[f.name]; 
      if (f.type === 'date' && val) { 
        formattedData[f.name] = val.split('T')[0]; 
      } else { 
        formattedData[f.name] = val || ''; 
      } 
    });
    setFormData(formattedData); 
    setShowEditModal(true);
  };

  const handleDelete = async (id) => { 
    if (window.confirm('Are you sure you want to delete this intern?')) { 
      try { 
        await api.delete(`/admin/interns/${id}`); 
        toast.success('Intern deleted'); 
        fetchInterns(1, true); 
      } catch (err) { 
        toast.error('Failed to delete'); 
      } 
    } 
  };
  
  const downloadReport = async () => { 
    try { 
      const res = await api.get('/admin/reports?type=interns', { responseType: 'blob' }); 
      const url = window.URL.createObjectURL(new Blob([res.data])); 
      const link = document.createElement('a'); 
      link.href = url; 
      link.setAttribute('download', 'Intern_Report.xlsx'); 
      document.body.appendChild(link); 
      link.click(); 
      link.remove(); 
      window.URL.revokeObjectURL(url);
    } catch (err) { 
      toast.error('Failed to download report'); 
    } 
  };

  const handleGroupChange = async (internId, groupId) => { 
    try { 
      const res = await api.put(`/admin/interns/${internId}`, { groupId: groupId ? parseInt(groupId) : null }); 
      setInterns(interns.map(i => i.id === internId ? res.data : i)); 
      toast.success('Group updated'); 
    } catch (err) { 
      toast.error('Failed to update group'); 
    } 
  };

  const toggleInternExpand = (internId) => {
    setExpandedIntern(expandedIntern === internId ? null : internId);
  };

  const totalInterns = interns.length;
  const activeInterns = interns.filter(i => i.profile?.studentStatus === 'Active').length;

  return (
    <div className="interns-page">
      <Sidebar role="ADMIN" />
      
      {/* Mobile Header Spacer */}
      {isMobile && (
        <div className="mobile-header-spacer">
          <div className="mobile-title-bar">
            <div className="mobile-title-info">
              <h1 className="mobile-page-title">Interns</h1>
              <p className="mobile-page-subtitle">Manage all interns</p>
            </div>
            <div className="mobile-stats-badge">
              <span>{totalInterns} total</span>
            </div>
          </div>
        </div>
      )}

      <div className="main-content">
        {/* Desktop Header */}
        {!isMobile && (
          <div className="page-header">
            <div>
              <h1 className="page-title">Intern Management</h1>
              <p className="page-subtitle">Manage all interns, their details, and assignments</p>
            </div>
            <div className="header-stats">
              <div className="stat-badge">
                <Users size={16} />
                <span>{totalInterns} Total Interns</span>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary - Desktop */}
        {!isMobile && (
          <div className="stats-summary">
            <div className="stat-card-mini">
              <Users size={20} />
              <div>
                <p className="stat-label">Total Interns</p>
                <p className="stat-number">{totalInterns}</p>
              </div>
            </div>
            <div className="stat-card-mini">
              <Users size={20} />
              <div>
                <p className="stat-label">Active Interns</p>
                <p className="stat-number">{activeInterns}</p>
              </div>
            </div>
            <div className="stat-card-mini">
              <FileSpreadsheet size={20} />
              <div>
                <p className="stat-label">Groups</p>
                <p className="stat-number">{groups.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Stats Scroll */}
        {isMobile && (
          <div className="mobile-stats-scroll">
            <div className="mobile-stat-item">
              <Users size={14} />
              <span>Total: {totalInterns}</span>
            </div>
            <div className="mobile-stat-item">
              <Users size={14} />
              <span>Active: {activeInterns}</span>
            </div>
            <div className="mobile-stat-item">
              <FileSpreadsheet size={14} />
              <span>Groups: {groups.length}</span>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="action-bar">
          <div className="filters">
            <div className="search-wrapper">
              <Search size={16} className="search-icon" />
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
            <div className="filter-wrapper">
              <Filter size={16} className="filter-icon" />
              <select 
                className="filter-select" 
                value={groupFilter} 
                onChange={e => setGroupFilter(e.target.value)}
              >
                <option value="">All Groups</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.domain?.name} ({g.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="actions">
            <button className="action-btn primary" onClick={() => { setFormData({}); setShowAddModal(true); }}>
              <Plus size={16} />
              <span>{isMobile ? 'Add' : 'Add Intern'}</span>
            </button>
            <label className="action-btn upload" style={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              <Upload size={16} />
              <span>{isMobile ? 'Import' : 'Upload Excel'}</span>
              <input type="file" hidden onChange={handleFileUpload} accept=".xlsx, .xls" disabled={loading} />
            </label>
            <button className="action-btn report" onClick={downloadReport}>
              <Download size={16} />
              <span>{isMobile ? 'Report' : 'Report'}</span>
            </button>
          </div>
        </div>

        {/* Interns Table - Desktop */}
        {!isMobile && (
          <div className="table-container">
            <div className="table-wrapper">
              <table className="interns-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>College</th>
                    <th>Group</th>
                    <th>Domain</th>
                    <th>Technology</th>
                    <th>Status</th>
                    <th className="actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageLoading && interns.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="loading-cell">
                        <div className="spinner"></div>
                        <p>Loading interns...</p>
                      </td>
                    </tr>
                  ) : interns.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="empty-cell">
                        <Users size={48} />
                        <h3>No interns found</h3>
                        <p>{searchTerm ? `No results matching "${searchTerm}"` : 'Start by adding your first intern'}</p>
                      </td>
                    </tr>
                  ) : (
                    interns.map(intern => {
                      const profile = intern.profile || {};
                      return (
                        <tr key={intern.id}>
                          <td className="name-cell">
                            <div className="intern-avatar">
                              {intern.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{intern.name}</span>
                          </td>
                          <td className="email-cell">{intern.email}</td>
                          <td className="college-cell">{intern.college || '-'}</td>
                          <td className="group-cell">
                            <select 
                              className="group-select-inline"
                              value={intern.groups?.[0]?.id || ''}
                              onChange={(e) => handleGroupChange(intern.id, e.target.value)}
                            >
                              <option value="">Unassigned</option>
                              {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="domain-cell">
                            {intern.groups?.[0]?.domain?.name || '-'}
                          </td>
                          <td className="tech-cell">{profile.technology || '-'}</td>
                          <td className="status-cell">
                            <span className={`status-badge ${profile.studentStatus === 'Active' ? 'active' : 'inactive'}`}>
                              {profile.studentStatus || 'Pending'}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button onClick={() => openEditModal(intern)} className="edit-btn" title="Edit">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(intern.id)} className="delete-btn" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {hasMore && interns.length > 0 && (
              <div className="load-more-container">
                <button 
                  className="load-more-btn" 
                  onClick={handleLoadMore} 
                  disabled={pageLoading}
                >
                  {pageLoading ? (
                    <>
                      <div className="spinner-small"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <span>Load More Interns</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile Cards View */}
        {isMobile && (
          <div className="mobile-cards">
            {pageLoading && interns.length === 0 ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading interns...</p>
              </div>
            ) : interns.length === 0 ? (
              <div className="empty-state-mobile">
                <Users size={40} />
                <h3>No interns found</h3>
                <p>{searchTerm ? `No results matching "${searchTerm}"` : 'Start by adding your first intern'}</p>
              </div>
            ) : (
              interns.map(intern => {
                const profile = intern.profile || {};
                const isExpanded = expandedIntern === intern.id;
                return (
                  <div key={intern.id} className="intern-card">
                    <div className="intern-card-header" onClick={() => toggleInternExpand(intern.id)}>
                      <div className="intern-avatar-mobile">
                        {intern.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="intern-card-info">
                        <div className="intern-name-mobile">{intern.name}</div>
                        <div className="intern-email-mobile">{intern.email}</div>
                      </div>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>

                    {isExpanded && (
                      <div className="intern-card-details">
                        <div className="detail-row">
                          <span className="detail-label">College:</span>
                          <span className="detail-value">{intern.college || '-'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Group:</span>
                          <select 
                            className="group-select-mobile"
                            value={intern.groups?.[0]?.id || ''}
                            onChange={(e) => handleGroupChange(intern.id, e.target.value)}
                          >
                            <option value="">Unassigned</option>
                            {groups.map(g => (
                              <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Domain:</span>
                          <span className="detail-value">{intern.groups?.[0]?.domain?.name || '-'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Technology:</span>
                          <span className="detail-value">{profile.technology || '-'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Status:</span>
                          <span className={`status-badge-mobile ${profile.studentStatus === 'Active' ? 'active' : 'inactive'}`}>
                            {profile.studentStatus || 'Pending'}
                          </span>
                        </div>
                        <div className="intern-card-actions">
                          <button onClick={() => openEditModal(intern)} className="edit-btn-mobile">
                            <Edit2 size={14} />
                            <span>Edit</span>
                          </button>
                          <button onClick={() => handleDelete(intern.id)} className="delete-btn-mobile">
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            
            {hasMore && interns.length > 0 && (
              <div className="load-more-container">
                <button 
                  className="load-more-btn" 
                  onClick={handleLoadMore} 
                  disabled={pageLoading}
                >
                  {pageLoading ? (
                    <>
                      <div className="spinner-small"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <span>Load More</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Modal - Mobile Responsive */}
        {(showAddModal || showEditModal) && (
          <div className="modal-overlay" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>{showAddModal ? 'Add New Intern' : 'Edit Intern'}</h2>
                  <p>{showAddModal ? 'Create a new intern profile' : 'Update intern information'}</p>
                </div>
                <button className="close-modal" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={showAddModal ? handleAddIntern : handleEditIntern} className="modal-form">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input 
                    type="text"
                    className="form-input"
                    value={formData.name || ''}
                    placeholder="Enter full name"
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input 
                    type="email"
                    className="form-input"
                    value={formData.email || ''}
                    placeholder="Enter email address"
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>College Name</label>
                  <input 
                    type="text"
                    className="form-input"
                    value={formData.college || ''}
                    placeholder="Enter college name"
                    onChange={e => setFormData({...formData, college: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel"
                    className="form-input"
                    value={formData.phone || ''}
                    placeholder="Enter phone number"
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Technology</label>
                  <input 
                    type="text"
                    className="form-input"
                    value={formData.technology || ''}
                    placeholder="Enter technology"
                    onChange={e => setFormData({...formData, technology: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Assign Group</label>
                  <select 
                    className="form-select"
                    value={formData.groupId || ''}
                    onChange={e => setFormData({...formData, groupId: e.target.value})}
                  >
                    <option value="">-- Select Group --</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.domain?.name} - {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-actions">
                  <button type="submit" className="submit-btn">
                    <Check size={16} />
                    <span>{showAddModal ? 'Create Intern' : 'Save Changes'}</span>
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Excel Mapping Modal - Mobile Responsive */}
        {showMappingModal && (
          <div className="modal-overlay" onClick={() => setShowMappingModal(false)}>
            <div className="modal-content mapping-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>Map Excel Columns</h2>
                  <p>Connect your file headers to our system fields</p>
                </div>
                <button className="close-modal" onClick={() => setShowMappingModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="mapping-container">
                <div className="mapping-columns">
                  <h3>Column Configuration</h3>
                  <div className="mapping-list">
                    {allFields.slice(0, isMobile ? 8 : 15).map(field => {
                      const isMapped = !!columnMapping[field.name];
                      return (
                        <div key={field.name} className="mapping-item">
                          <div className="mapping-label">
                            <span className={isMapped ? 'mapped' : ''}>{field.label}</span>
                            {isMapped && <Check size={12} className="check-icon" />}
                          </div>
                          <select 
                            className="mapping-select"
                            value={columnMapping[field.name] || ''}
                            onChange={(e) => setColumnMapping({...columnMapping, [field.name]: e.target.value})}
                          >
                            <option value="">-- Ignore --</option>
                            {excelHeaders.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {!isMobile && (
                  <div className="preview-column">
                    <h3>Data Preview</h3>
                    <p className="preview-note">Previewing first 3 rows:</p>
                    <div className="preview-table-wrapper">
                      <table className="preview-table">
                        <thead>
                          <tr>
                            {excelHeaders.slice(0, 4).map(h => <th key={h}>{h}</th>)}
                            {excelHeaders.length > 4 && <th>...</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {excelData.slice(0, 3).map((row, idx) => (
                            <tr key={idx}>
                              {excelHeaders.slice(0, 4).map(h => <td key={h}>{row[h] || '-'}</td>)}
                              {excelHeaders.length > 4 && <td>...</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="import-summary">
                      <AlertCircle size={16} />
                      <div>
                        <p>Ready to Import?</p>
                        <ul>
                          <li>Total rows: <strong>{excelData.length}</strong></li>
                          <li>Fields mapped: <strong>{Object.values(columnMapping).filter(Boolean).length}</strong></li>
                          <li>Email field is required</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {isMobile && (
                <div className="import-summary-mobile">
                  <AlertCircle size={16} />
                  <div>
                    <p>{excelData.length} rows to import</p>
                    <p>{Object.values(columnMapping).filter(Boolean).length} fields mapped</p>
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setShowMappingModal(false)}>Cancel</button>
                <button 
                  className="submit-btn" 
                  onClick={handleBulkImport} 
                  disabled={loading || !columnMapping.email}
                >
                  {loading ? 'Importing...' : 'Start Import'}
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
.interns-page {
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

.header-stats {
  display: flex;
  gap: 1rem;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #0d1f35;
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid rgba(20, 184, 166, 0.2);
  color: #14b8a6;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Stats Summary Desktop */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
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

/* Action Bar */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.filters {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.search-wrapper {
  position: relative;
  flex: 1;
  max-width: 300px;
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

.filter-wrapper {
  position: relative;
  width: 220px;
}

.filter-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(180, 220, 215, 0.5);
}

.filter-select {
  width: 100%;
  padding: 10px 12px 10px 36px;
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 12px;
  color: #e2f8f5;
  font-size: 0.9rem;
  cursor: pointer;
}

.actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
}

.action-btn.upload {
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.3);
  color: #e2f8f5;
}

.action-btn.report {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
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

.interns-table {
  width: 100%;
  border-collapse: collapse;
}

.interns-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(180, 220, 215, 0.8);
  text-transform: uppercase;
  background: #071a2e;
  border-bottom: 2px solid rgba(20, 184, 166, 0.1);
}

.interns-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(20, 184, 166, 0.05);
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #fff;
}

.intern-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
}

.group-select-inline {
  padding: 4px 8px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 6px;
  color: #e2f8f5;
  font-size: 0.8rem;
  cursor: pointer;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status-badge.inactive {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn {
  padding: 6px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.edit-btn {
  background: rgba(20, 184, 166, 0.15);
  color: #14b8a6;
}

.delete-btn {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* Mobile Cards */
.mobile-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 70px;
}

.intern-card {
  background: #0d1f35;
  border-radius: 14px;
  border: 1px solid rgba(20, 184, 166, 0.1);
  overflow: hidden;
}

.intern-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem;
  cursor: pointer;
}

.intern-avatar-mobile {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  color: white;
  flex-shrink: 0;
}

.intern-card-info {
  flex: 1;
}

.intern-name-mobile {
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.intern-email-mobile {
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.5);
}

.intern-card-details {
  padding: 0 1rem 1rem 1rem;
  border-top: 1px solid rgba(20, 184, 166, 0.1);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 0.8rem;
}

.detail-label {
  color: rgba(180, 220, 215, 0.5);
}

.detail-value {
  color: #e2f8f5;
}

.group-select-mobile {
  padding: 6px 10px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 8px;
  color: #e2f8f5;
  font-size: 0.75rem;
}

.status-badge-mobile {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
}

.intern-card-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(20, 184, 166, 0.1);
}

.edit-btn-mobile, .delete-btn-mobile {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.edit-btn-mobile {
  background: rgba(20, 184, 166, 0.15);
  color: #14b8a6;
}

.delete-btn-mobile {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* Load More */
.load-more-container {
  text-align: center;
  padding: 1rem;
}

.load-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.3);
  color: #e2f8f5;
  padding: 10px 24px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

/* Loading States */
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(20, 184, 166, 0.2);
  border-top-color: #14b8a6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
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

.loading-cell, .empty-cell, .loading-container, .empty-state-mobile {
  text-align: center;
  padding: 3rem 1.5rem;
}

.empty-cell svg, .empty-state-mobile svg {
  color: #14b8a6;
  margin-bottom: 1rem;
}

.empty-cell h3, .empty-state-mobile h3 {
  color: #fff;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.empty-cell p, .empty-state-mobile p {
  color: rgba(180, 220, 215, 0.6);
  margin: 0;
  font-size: 0.85rem;
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
  width: 500px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(20, 184, 166, 0.2);
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: #0d1f35;
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
}

.modal-header p {
  margin: 4px 0 0;
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.6);
}

.close-modal {
  background: none;
  border: none;
  color: rgba(180, 220, 215, 0.6);
  cursor: pointer;
  padding: 8px;
}

.modal-form {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(180, 220, 215, 0.8);
}

.form-input, .form-select {
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

.submit-btn, .cancel-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
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

/* Mapping Modal */
.mapping-modal {
  width: 100%;
  max-width: 500px;
}

.mapping-container {
  padding: 1rem;
}

.mapping-columns h3 {
  font-size: 0.9rem;
  margin-bottom: 1rem;
  color: #fff;
}

.mapping-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
}

.mapping-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mapping-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: rgba(180, 220, 215, 0.8);
}

.mapping-label .mapped {
  color: #14b8a6;
  font-weight: 600;
}

.mapping-select {
  padding: 8px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 8px;
  color: #e2f8f5;
  font-size: 0.8rem;
}

.import-summary-mobile {
  display: flex;
  gap: 10px;
  padding: 0.75rem;
  margin: 0 1rem 1rem 1rem;
  background: rgba(20, 184, 166, 0.05);
  border-radius: 10px;
}

.import-summary-mobile svg {
  color: #f59e0b;
}

.import-summary-mobile p {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(180, 220, 215, 0.7);
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid rgba(20, 184, 166, 0.1);
  display: flex;
  gap: 0.75rem;
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
  
  .action-bar {
    flex-direction: column;
  }
  
  .filters {
    width: 100%;
  }
  
  .search-wrapper {
    max-width: none;
  }
  
  .filter-wrapper {
    width: 100%;
  }
  
  .actions {
    width: 100%;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
    padding-top: 60px;
  }
  
  .action-btn span {
    font-size: 0.75rem;
  }
  
  .intern-avatar-mobile {
    width: 38px;
    height: 38px;
    font-size: 0.85rem;
  }
  
  .intern-name-mobile {
    font-size: 0.85rem;
  }
}
`;

export default Interns;