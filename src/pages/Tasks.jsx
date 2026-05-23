import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api, { getFileUrl } from '../services/api';
import { toast } from 'react-toastify';
import { Plus, Download, X, Eye, ExternalLink, Trash2, Search, Layers, Cpu, CheckCircle, Clock, AlertCircle, FileText, Code, HelpCircle, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import useTitle from '../hooks/useTitle';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
  useTitle('Task Management');
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [responses, setResponses] = useState([]);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [viewingSubmission, setViewingSubmission] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '', description: '', dayNumber: 1, 
    assignedToType: 'GROUP', assignedToId: '', type: 'MIXED', taskData: null
  });
  const [taskBlocks, setTaskBlocks] = useState([]);
  const [blockTypeToAdd, setBlockTypeToAdd] = useState('QA');

  const [domains, setDomains] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('ALL');
  const [selectedDomainId, setSelectedDomainId] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [evalData, setEvalData] = useState({ taskId: null, userId: null, score: '', remarks: '', studentName: '' });
  const [reassignData, setReassignData] = useState({ taskId: null, userId: null, reason: '', studentName: '' });
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchGroups();
    fetchDomains();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/admin/tasks');
      setTasks(res.data);
    } catch (err) {
      toast.error('Failed to fetch tasks');
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

  const fetchDomains = async () => {
    try {
      const res = await api.get('/admin/domains');
      setDomains(res.data);
    } catch (err) {
      console.error('Failed to fetch domains');
    }
  };

  const handleTaskClick = async (task) => {
    try {
      const res = await api.get(`/admin/tasks/${task.id}/responses`);
      setResponses(res.data);
      setSelectedTask(task);
      setShowResponsesModal(true);
    } catch (err) {
      toast.error('Failed to fetch responses');
    }
  };

  const downloadResponses = () => {
    const data = responses.map(r => ({
      'Intern Name': r.name,
      'Email': r.email,
      'Status': r.status,
      'Score': r.score || '-',
      'Remarks': r.remarks || '-',
      'Last Updated': r.updatedAt ? new Date(r.updatedAt).toLocaleString() : 'N/A'
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Responses');
    XLSX.writeFile(wb, `${selectedTask.title}_Responses.xlsx`);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (taskBlocks.length === 0) {
      toast.error('Please add at least one task section');
      return;
    }
    try {
      await api.post('/admin/tasks', { ...newTask, type: 'MIXED', taskData: taskBlocks });
      toast.success('Task assigned to group');
      setShowModal(false);
      setNewTask({ title: '', description: '', dayNumber: 1, assignedToType: 'GROUP', assignedToId: '', type: 'MIXED', taskData: null });
      setTaskBlocks([]);
      fetchTasks();
    } catch (err) {
      toast.error('Failed to assign task');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/tasks/${taskToDelete.id}`);
      toast.success('Task deleted successfully');
      setShowDeleteModal(false);
      setTaskToDelete(null);
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/tasks/evaluate', {
        taskId: evalData.taskId,
        userId: evalData.userId,
        score: evalData.score,
        remarks: evalData.remarks
      });
      toast.success('Evaluation saved');
      setShowEvaluateModal(false);
      handleTaskClick(selectedTask);
    } catch (err) {
      toast.error('Failed to save evaluation');
    }
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/tasks/reassign', { 
        taskId: reassignData.taskId, 
        userId: reassignData.userId,
        reason: reassignData.reason
      });
      toast.success('Task reassigned');
      setShowReassignModal(false);
      handleTaskClick(selectedTask);
    } catch (err) {
      toast.error('Failed to reassign task');
    }
  };

  const handleReassignClick = (taskId, userId, studentName) => {
    setReassignData({ taskId, userId, studentName, reason: '' });
    setShowReassignModal(true);
  };

  const toggleTaskExpand = (taskId) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesDomain = selectedDomainId === 'ALL' || task.group?.domainId === parseInt(selectedDomainId);
    const matchesGroup = selectedGroupId === 'ALL' || task.groupId === parseInt(selectedGroupId);
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (task.group?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDomain && matchesGroup && matchesSearch;
  });

  const availableGroups = groups.filter(g => 
    selectedDomainId === 'ALL' || g.domainId === parseInt(selectedDomainId)
  );

  const { user } = useAuth();

  const getStatusConfig = (status) => {
    switch(status) {
      case 'COMPLETED':
        return { icon: CheckCircle, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', label: 'Completed' };
      case 'PENDING':
        return { icon: Clock, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', label: 'Pending' };
      case 'REASSIGNED':
        return { icon: AlertCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'Reassigned' };
      default:
        return { icon: HelpCircle, color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)', label: status };
    }
  };

  return (
    <div className="tasks-page">
      <Sidebar role={user?.role} />
      
      {/* Mobile Header Spacer */}
      {isMobile && (
        <div className="mobile-header-spacer">
          <div className="mobile-title-bar">
            <div className="mobile-title-info">
              <h1 className="mobile-page-title">Task Management</h1>
              <p className="mobile-page-subtitle">Create & monitor tasks</p>
            </div>
            <button className="mobile-fab" onClick={() => setShowModal(true)}>
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
              <h1 className="page-title">Task Management</h1>
              <p className="page-subtitle">Create tasks and monitor student progress</p>
            </div>
            <button className="create-task-btn" onClick={() => setShowModal(true)}>
              <Plus size={18} />
              <span>Create Task</span>
            </button>
          </div>
        )}

        {/* Filters Bar - Desktop */}
        {!isMobile && (
          <div className="filters-bar">
            <div className="filter-group">
              <Cpu size={16} className="filter-icon" />
              <select 
                className="filter-select" 
                value={selectedDomainId} 
                onChange={e => {
                  setSelectedDomainId(e.target.value);
                  setSelectedGroupId('ALL');
                }}
              >
                <option value="ALL">All Technologies</option>
                {domains.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <Layers size={16} className="filter-icon" />
              <select 
                className="filter-select" 
                value={selectedGroupId} 
                onChange={e => setSelectedGroupId(e.target.value)}
              >
                <option value="ALL">All Groups</option>
                {availableGroups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="search-group">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search tasks..." 
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
        )}

        {/* Mobile Filter Toggle */}
        {isMobile && (
          <div className="mobile-filters">
            <button 
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              <span>Filters</span>
              {(selectedDomainId !== 'ALL' || selectedGroupId !== 'ALL' || searchTerm) && (
                <span className="filter-badge">●</span>
              )}
            </button>
            
            {showFilters && (
              <div className="filter-panel">
                <div className="filter-group-mobile">
                  <label>Technology</label>
                  <select 
                    value={selectedDomainId} 
                    onChange={e => {
                      setSelectedDomainId(e.target.value);
                      setSelectedGroupId('ALL');
                    }}
                  >
                    <option value="ALL">All Technologies</option>
                    {domains.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group-mobile">
                  <label>Group</label>
                  <select 
                    value={selectedGroupId} 
                    onChange={e => setSelectedGroupId(e.target.value)}
                  >
                    <option value="ALL">All Groups</option>
                    {availableGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group-mobile">
                  <label>Search</label>
                  <input 
                    type="text" 
                    placeholder="Search tasks..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tasks List */}
        <div className="tasks-list">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <FileText size={isMobile ? 40 : 48} />
              <h3>No tasks found</h3>
              <p>{searchTerm ? `No results matching "${searchTerm}"` : 'Create your first task to get started'}</p>
              {isMobile && (
                <button className="empty-action-btn" onClick={() => setShowModal(true)}>
                  <Plus size={18} />
                  <span>Create Task</span>
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map(task => {
              const isExpanded = expandedTaskId === task.id;
              return (
                <div key={task.id} className="task-card">
                  <div className="task-card-header" onClick={() => toggleTaskExpand(task.id)}>
                    <div className="task-info-header">
                      <div className="task-badge">Day {task.dayNumber}</div>
                      <h3 className="task-title">{task.title}</h3>
                      <div className="task-meta">
                        <span className="group-tag">
                          <Layers size={12} />
                          {task.group ? `${task.group.domain?.name} (${task.group.name})` : 'All Groups'}
                        </span>
                      </div>
                    </div>
                    <div className="task-header-actions">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setTaskToDelete(task);
                          setShowDeleteModal(true);
                        }}
                        className="delete-task-btn"
                        title="Delete Task"
                      >
                        <Trash2 size={16} />
                      </button>
                      {isMobile && (
                        isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />
                      )}
                    </div>
                  </div>

                  {(isExpanded || !isMobile) && (
                    <div className="task-card-body">
                      <p className="task-description">{task.description}</p>
                      <button 
                        className="view-responses-btn"
                        onClick={() => handleTaskClick(task)}
                      >
                        <Eye size={14} />
                        <span>View Responses</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Create Task Modal - Mobile Responsive */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>Create & Assign Task</h2>
                  <p>Create a new task with multiple sections</p>
                </div>
                <button className="close-modal" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="modal-form">
                <div className="form-group">
                  <label>Task Title</label>
                  <input 
                    className="form-input" 
                    placeholder="Enter task title" 
                    value={newTask.title} 
                    onChange={e => setNewTask({...newTask, title: e.target.value})} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    className="form-textarea" 
                    placeholder="Describe the task requirements" 
                    value={newTask.description} 
                    onChange={e => setNewTask({...newTask, description: e.target.value})} 
                    rows={isMobile ? 2 : 3}
                    required 
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Day Number</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="Day 1-45" 
                      value={newTask.dayNumber} 
                      onChange={e => setNewTask({...newTask, dayNumber: e.target.value})} 
                      min="1"
                      max="45"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Assign to Group</label>
                    <select 
                      className="form-select" 
                      value={newTask.assignedToId} 
                      onChange={e => setNewTask({...newTask, assignedToId: e.target.value})} 
                      required
                    >
                      <option value="">Select Group</option>
                      {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.domain?.name} ({g.name})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Task Sections</label>
                  <div className="sections-list">
                    {taskBlocks.map((block, index) => (
                      <div key={index} className="section-item">
                        <div className="section-header">
                          <span className="section-type">
                            {block.type === 'QA' && <HelpCircle size={14} />}
                            {block.type === 'CODE' && <Code size={14} />}
                            {block.type === 'MCQ' && <CheckCircle size={14} />}
                            {block.type === 'QA' ? 'Written Question' : block.type === 'CODE' ? 'Coding Challenge' : 'Multiple Choice'}
                          </span>
                          <button 
                            type="button"
                            onClick={() => {
                              const updated = [...taskBlocks];
                              updated.splice(index, 1);
                              setTaskBlocks(updated);
                            }}
                            className="remove-section-btn"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        
                        {block.type === 'QA' && (
                          <textarea 
                            className="form-textarea" 
                            placeholder="Enter question text" 
                            value={block.question} 
                            onChange={e => {
                              const updated = [...taskBlocks];
                              updated[index].question = e.target.value;
                              setTaskBlocks(updated);
                            }} 
                            rows={isMobile ? 2 : 3}
                            required 
                          />
                        )}

                        {block.type === 'CODE' && (
                          <>
                            <textarea 
                              className="form-textarea" 
                              placeholder="Problem statement / Question" 
                              value={block.question || ''} 
                              onChange={e => {
                                const updated = [...taskBlocks];
                                updated[index].question = e.target.value;
                                setTaskBlocks(updated);
                              }} 
                              rows={isMobile ? 2 : 3}
                              required 
                            />
                            <textarea 
                              className="form-textarea code" 
                              placeholder="Starter code / Boilerplate (optional)" 
                              value={block.boilerplate} 
                              onChange={e => {
                                const updated = [...taskBlocks];
                                updated[index].boilerplate = e.target.value;
                                setTaskBlocks(updated);
                              }} 
                              rows={isMobile ? 3 : 4}
                            />
                          </>
                        )}

                        {block.type === 'MCQ' && (
                          <>
                            <textarea 
                              className="form-textarea" 
                              placeholder="Enter question text" 
                              value={block.question} 
                              onChange={e => {
                                const updated = [...taskBlocks];
                                updated[index].question = e.target.value;
                                setTaskBlocks(updated);
                              }} 
                              rows={isMobile ? 2 : 3}
                              required 
                            />
                            <div className="options-list">
                              {block.options.map((opt, optIndex) => (
                                <div key={optIndex} className="option-item">
                                  <input 
                                    type="radio" 
                                    name={`correct-${index}`} 
                                    checked={block.correctOption === optIndex} 
                                    onChange={() => {
                                      const updated = [...taskBlocks];
                                      updated[index].correctOption = optIndex;
                                      setTaskBlocks(updated);
                                    }} 
                                  />
                                  <input 
                                    className="form-input" 
                                    placeholder={`Option ${optIndex + 1}`} 
                                    value={opt} 
                                    onChange={e => {
                                      const updated = [...taskBlocks];
                                      updated[index].options[optIndex] = e.target.value;
                                      setTaskBlocks(updated);
                                    }} 
                                    required 
                                  />
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="add-section">
                    <select 
                      className="form-select" 
                      value={blockTypeToAdd} 
                      onChange={e => setBlockTypeToAdd(e.target.value)}
                    >
                      <option value="QA">Standard Question</option>
                      <option value="CODE">Coding Task</option>
                      <option value="MCQ">Multiple Choice</option>
                    </select>
                    <button 
                      type="button" 
                      className="add-section-btn" 
                      onClick={() => {
                        if (blockTypeToAdd === 'QA') setTaskBlocks([...taskBlocks, { type: 'QA', question: '' }]);
                        if (blockTypeToAdd === 'CODE') setTaskBlocks([...taskBlocks, { type: 'CODE', question: '', boilerplate: '' }]);
                        if (blockTypeToAdd === 'MCQ') setTaskBlocks([...taskBlocks, { type: 'MCQ', question: '', options: ['', '', '', ''], correctOption: 0 }]);
                      }}
                    >
                      <Plus size={14} />
                      Add Section
                    </button>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="submit" className="submit-btn">
                    <CheckCircle size={16} />
                    <span>Assign Task</span>
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Responses Modal - Mobile Responsive */}
        {showResponsesModal && selectedTask && (
          <div className="modal-overlay" onClick={() => setShowResponsesModal(false)}>
            <div className="modal-content xlarge" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>{selectedTask.title}</h2>
                  <p>Student responses for this task</p>
                </div>
                <div className="modal-header-actions">
                  <button className="download-btn" onClick={downloadResponses}>
                    <Download size={16} />
                  </button>
                  <button className="close-modal" onClick={() => setShowResponsesModal(false)}>
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="responses-list">
                {responses.length === 0 ? (
                  <div className="empty-responses">
                    <Users size={32} />
                    <p>No students assigned to this group yet</p>
                  </div>
                ) : (
                  responses.map(res => {
                    const statusConfig = getStatusConfig(res.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <div key={res.id} className="response-card">
                        <div className="response-header">
                          <div className="student-info">
                            <div className="student-avatar">
                              {res.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="student-name">{res.name}</div>
                              <div className="student-email">{res.email}</div>
                            </div>
                          </div>
                          <span className="status-badge" style={{ background: statusConfig.bg, color: statusConfig.color }}>
                            <StatusIcon size={12} />
                            {statusConfig.label}
                          </span>
                        </div>

                        <div className="response-details">
                          <div className="score-row">
                            <span>Marks:</span>
                            <strong>{res.score !== null ? res.score : '-'}</strong>
                          </div>
                          
                          <div className="submission-row">
                            <span>Submission:</span>
                            <div className="submission-links">
                              {res.submissionData && (
                                <button 
                                  className="view-data-btn"
                                  onClick={() => setViewingSubmission({ res, task: selectedTask })}
                                >
                                  View Data
                                </button>
                              )}
                              {res.fileUrl && (
                                <a 
                                  href={getFileUrl(res.fileUrl)} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="download-file-btn"
                                >
                                  <Download size={12} />
                                  File
                                </a>
                              )}
                              {!res.submissionData && !res.fileUrl && <span className="no-data">No submission</span>}
                            </div>
                          </div>

                          <div className="actions-row">
                            <button 
                              className="evaluate-btn"
                              onClick={() => {
                                setEvalData({ taskId: selectedTask.id, userId: res.id, score: res.score || '', remarks: res.remarks || '', studentName: res.name });
                                setShowEvaluateModal(true);
                              }}
                            >
                              {res.score !== null ? 'Edit Marks' : 'Evaluate'}
                            </button>
                            <button 
                              className="reassign-btn"
                              onClick={() => handleReassignClick(selectedTask.id, res.id, res.name)}
                            >
                              Reassign
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Evaluate Modal - Mobile Responsive */}
        {showEvaluateModal && (
          <div className="modal-overlay" onClick={() => setShowEvaluateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>Evaluate Task</h2>
                  <p>For <strong>{evalData.studentName}</strong></p>
                </div>
                <button className="close-modal" onClick={() => setShowEvaluateModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEvaluate} className="modal-form">
                <div className="form-group">
                  <label>Marks / Score</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="Enter marks" 
                    value={evalData.score}
                    onChange={e => setEvalData({ ...evalData, score: e.target.value })}
                    step="0.1"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Feedback / Remarks</label>
                  <textarea 
                    className="form-textarea" 
                    placeholder="Add evaluation remarks..." 
                    value={evalData.remarks}
                    onChange={e => setEvalData({ ...evalData, remarks: e.target.value })}
                    rows={isMobile ? 3 : 4}
                  />
                </div>

                <div className="modal-actions">
                  <button type="submit" className="submit-btn">
                    <CheckCircle size={16} />
                    <span>Save Evaluation</span>
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => setShowEvaluateModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reassign Modal - Mobile Responsive */}
        {showReassignModal && (
          <div className="modal-overlay" onClick={() => setShowReassignModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>Reassign Task</h2>
                  <p>For <strong>{reassignData.studentName}</strong></p>
                </div>
                <button className="close-modal" onClick={() => setShowReassignModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleReassignSubmit} className="modal-form">
                <div className="form-group">
                  <label>Reason for Reassignment</label>
                  <textarea 
                    className="form-textarea" 
                    placeholder="Tell the intern why they need to redo this task..." 
                    value={reassignData.reason}
                    onChange={e => setReassignData({ ...reassignData, reason: e.target.value })}
                    rows={isMobile ? 3 : 4}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button type="submit" className="submit-btn warning">
                    <AlertCircle size={16} />
                    <span>Confirm Reassign</span>
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => setShowReassignModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && taskToDelete && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="delete-icon">
                <Trash2 size={48} />
              </div>
              <h2>Confirm Deletion</h2>
              <p>Are you sure you want to delete "{taskToDelete.title}"? This action cannot be undone.</p>
              <div className="modal-actions">
                <button onClick={handleDelete} className="submit-btn danger">
                  <Trash2 size={16} />
                  <span>Yes, Delete</span>
                </button>
                <button onClick={() => { setShowDeleteModal(false); setTaskToDelete(null); }} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Submission Modal - Mobile Responsive */}
        {viewingSubmission && (
          <div className="modal-overlay" onClick={() => setViewingSubmission(null)}>
            <div className="modal-content submission-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>Submission</h2>
                  <p>{viewingSubmission.res.name}</p>
                </div>
                <button className="close-modal" onClick={() => setViewingSubmission(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="submission-content">
                {viewingSubmission.res.remarks && (
                  <div className="intern-remarks">
                    <strong>Intern Remarks:</strong>
                    <p>"{viewingSubmission.res.remarks}"</p>
                  </div>
                )}

                <div className="submission-data">
                  {(() => {
                    let blocks = [];
                    let answers = {};
                    try { 
                      blocks = JSON.parse(viewingSubmission.task.taskData) || []; 
                    } catch(e) {}
                    try { 
                      let rawAnswers = viewingSubmission.res.submissionData;
                      if (rawAnswers) {
                        answers = JSON.parse(rawAnswers);
                        if (typeof answers === 'string') {
                          answers = JSON.parse(answers);
                        }
                      }
                    } catch(e) {
                      answers = {};
                    }
                    
                    return blocks.map((block, idx) => (
                      <div key={idx} className="submission-section">
                        <div className="section-title">
                          <span className="section-badge">Section {idx + 1}: {block.type}</span>
                        </div>
                        
                        <div className="section-question">
                          <strong>Question:</strong>
                          <p>{block.question || (block.type === 'CODE' ? 'Coding Challenge' : 'Question')}</p>
                        </div>

                        <div className="section-answer">
                          <strong>Answer:</strong>
                          {block.type === 'QA' && (
                            <div className="answer-text">{answers[idx] || <em>Not answered</em>}</div>
                          )}
                          {block.type === 'CODE' && (
                            <pre className="code-answer">{answers[idx] || 'No code submitted'}</pre>
                          )}
                          {block.type === 'MCQ' && (
                            <div className="mcq-answers">
                              {block.options.map((opt, oIdx) => {
                                const isSelected = answers[idx] === oIdx;
                                const isCorrect = block.correctOption === oIdx;
                                let className = 'mcq-option';
                                if (isSelected && isCorrect) className += ' correct-selected';
                                else if (isSelected && !isCorrect) className += ' wrong-selected';
                                else if (isCorrect) className += ' correct';
                                return (
                                  <div key={oIdx} className={className}>
                                    <span className="option-letter">{String.fromCharCode(65 + oIdx)}</span>
                                    <span className="option-text">{opt}</span>
                                    {isSelected && <span className="selected-badge">SELECTED</span>}
                                    {isCorrect && <span className="correct-badge">✓</span>}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{css}</style>
    </div>
  );
};

const Users = ({ size }) => <div style={{ width: size, height: size }} />;

const css = `
.tasks-page {
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
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  color: rgba(180, 220, 215, 0.6);
  font-size: 0.9rem;
  margin: 0;
}

.create-task-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

/* Filters Bar Desktop */
.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-group {
  position: relative;
  flex: 1;
  min-width: 180px;
}

.filter-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(180, 220, 215, 0.6);
  pointer-events: none;
}

.filter-select {
  width: 100%;
  padding: 10px 12px 10px 36px;
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
  color: #e2f8f5;
  font-size: 0.9rem;
  cursor: pointer;
}

.search-group {
  position: relative;
  flex: 1;
  min-width: 220px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(180, 220, 215, 0.6);
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
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

/* Mobile Filters */
.mobile-filters {
  margin-bottom: 1rem;
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
  padding: 10px 16px;
  color: #e2f8f5;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  position: relative;
}

.filter-toggle.active {
  border-color: #14b8a6;
}

.filter-badge {
  position: absolute;
  right: 12px;
  color: #14b8a6;
  font-size: 10px;
}

.filter-panel {
  margin-top: 0.75rem;
  background: #0d1f35;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(20, 184, 166, 0.1);
}

.filter-group-mobile {
  margin-bottom: 1rem;
}

.filter-group-mobile label {
  display: block;
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.6);
  margin-bottom: 6px;
}

.filter-group-mobile select,
.filter-group-mobile input {
  width: 100%;
  padding: 10px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 8px;
  color: #e2f8f5;
  font-size: 0.85rem;
}

/* Tasks List */
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-card {
  background: #0d1f35;
  border-radius: 12px;
  border: 1px solid rgba(20, 184, 166, 0.1);
  overflow: hidden;
}

.task-card-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.task-info-header {
  flex: 1;
}

.task-badge {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(20, 184, 166, 0.15);
  color: #14b8a6;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 600;
  margin-bottom: 6px;
}

.task-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 6px 0;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  color: rgba(180, 220, 215, 0.5);
}

.task-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete-task-btn {
  background: rgba(239, 68, 68, 0.15);
  border: none;
  color: #ef4444;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
}

.task-card-body {
  padding: 0 1rem 1rem 1rem;
  border-top: 1px solid rgba(20, 184, 166, 0.05);
}

.task-description {
  font-size: 0.8rem;
  color: rgba(180, 220, 215, 0.7);
  margin: 0.75rem 0;
  line-height: 1.5;
}

.view-responses-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  background: rgba(20, 184, 166, 0.1);
  border: 1px solid rgba(20, 184, 166, 0.3);
  border-radius: 8px;
  color: #14b8a6;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
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
  width: 600px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(20, 184, 166, 0.2);
}

.modal-content.large {
  width: 800px;
  max-width: 100%;
}

.modal-content.xlarge {
  width: 1000px;
  max-width: 100%;
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
  font-size: 1rem;
  color: #fff;
}

.modal-header p {
  margin: 4px 0 0;
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.6);
}

.modal-header-actions {
  display: flex;
  gap: 8px;
}

.close-modal {
  background: none;
  border: none;
  color: rgba(180, 220, 215, 0.6);
  cursor: pointer;
  padding: 8px;
}

.download-btn {
  background: rgba(20, 184, 166, 0.15);
  border: none;
  color: #14b8a6;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-input, .form-select, .form-textarea {
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
  padding: 10px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
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

.submit-btn.warning {
  background: #f59e0b;
}

.submit-btn.danger {
  background: #ef4444;
}

.cancel-btn {
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  color: rgba(180, 220, 215, 0.8);
}

/* Sections List */
.sections-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 0.75rem;
}

.section-item {
  background: #071a2e;
  border-radius: 12px;
  padding: 0.75rem;
  border: 1px solid rgba(20, 184, 166, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.section-type {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #14b8a6;
}

.remove-section-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
}

.add-section {
  display: flex;
  gap: 0.5rem;
}

.add-section-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(20, 184, 166, 0.1);
  border: 1px solid rgba(20, 184, 166, 0.3);
  border-radius: 8px;
  color: #14b8a6;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-item input[type="radio"] {
  width: 16px;
  height: 16px;
  accent-color: #14b8a6;
}

/* Responses List */
.responses-list {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 500px;
  overflow-y: auto;
}

.response-card {
  background: #071a2e;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(20, 184, 166, 0.1);
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-avatar {
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

.student-name {
  font-weight: 600;
  color: #fff;
  margin-bottom: 2px;
}

.student-email {
  font-size: 0.65rem;
  color: rgba(180, 220, 215, 0.5);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 600;
}

.response-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.score-row, .submission-row, .actions-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.75rem;
}

.score-row span, .submission-row span {
  color: rgba(180, 220, 215, 0.5);
}

.submission-links {
  display: flex;
  gap: 6px;
}

.view-data-btn, .download-file-btn {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  background: none;
  border: 1px solid;
}

.view-data-btn {
  border-color: #14b8a6;
  color: #14b8a6;
}

.download-file-btn {
  border-color: #3b82f6;
  color: #3b82f6;
  text-decoration: none;
}

.no-data {
  color: rgba(180, 220, 215, 0.4);
}

.actions-row {
  gap: 0.5rem;
}

.evaluate-btn, .reassign-btn {
  flex: 1;
  padding: 6px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.evaluate-btn {
  background: #10b981;
  color: white;
}

.reassign-btn {
  background: #f59e0b;
  color: white;
}

.empty-responses {
  text-align: center;
  padding: 2rem;
  color: rgba(180, 220, 215, 0.5);
}

/* Delete Modal */
.delete-modal {
  text-align: center;
  width: 350px;
}

.delete-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: #ef4444;
}

.delete-modal h2 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.delete-modal p {
  font-size: 0.8rem;
  color: rgba(180, 220, 215, 0.6);
}

/* Submission Modal */
.submission-modal {
  width: 800px;
  max-width: 100%;
}

.submission-content {
  padding: 1rem;
}

.intern-remarks {
  background: rgba(20, 184, 166, 0.05);
  padding: 0.75rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  border-left: 3px solid #14b8a6;
}

.intern-remarks strong {
  display: block;
  font-size: 0.65rem;
  color: #14b8a6;
  margin-bottom: 4px;
}

.intern-remarks p {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(220, 240, 235, 0.9);
}

.submission-section {
  margin-bottom: 1rem;
  border: 1px solid rgba(20, 184, 166, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.section-title {
  padding: 0.5rem 0.75rem;
  background: #071a2e;
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
}

.section-badge {
  font-size: 0.65rem;
  font-weight: 600;
  color: #14b8a6;
}

.section-question, .section-answer {
  padding: 0.75rem;
}

.section-question strong, .section-answer strong {
  display: block;
  font-size: 0.65rem;
  color: rgba(180, 220, 215, 0.6);
  margin-bottom: 4px;
}

.section-question p {
  margin: 0;
  font-size: 0.8rem;
  color: #fff;
}

.answer-text {
  font-size: 0.8rem;
  color: rgba(220, 240, 235, 0.9);
}

.code-answer {
  background: #0a0f1f;
  padding: 0.75rem;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.7rem;
  overflow-x: auto;
  margin: 0;
}

.mcq-answers {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mcq-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  background: #071a2e;
}

.mcq-option.correct-selected {
  background: rgba(16, 185, 129, 0.15);
}

.mcq-option.wrong-selected {
  background: rgba(239, 68, 68, 0.15);
}

.mcq-option.correct {
  background: rgba(16, 185, 129, 0.05);
}

.option-letter {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #0d1f35;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
}

.selected-badge, .correct-badge {
  font-size: 0.6rem;
  padding: 2px 4px;
  border-radius: 4px;
}

.selected-badge {
  background: #ef4444;
  color: white;
}

.correct-badge {
  background: #10b981;
  color: white;
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
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .add-section {
    flex-direction: column;
  }
  
  .option-item {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
    padding-top: 60px;
  }
  
  .response-header {
    flex-direction: column;
  }
  
  .score-row, .submission-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .actions-row {
    flex-direction: column;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .mcq-option {
    flex-wrap: wrap;
  }
}
`;

export default Tasks;