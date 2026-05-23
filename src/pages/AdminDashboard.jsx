import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Users, BookOpen, CheckCircle, CreditCard, Layers, UserCircle, TrendingUp, Award, Calendar, Activity, ArrowRight, Plus } from 'lucide-react';
import useTitle from '../hooks/useTitle';

const AdminDashboard = () => {
  useTitle('Admin Dashboard');
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalInterns: 0,
    totalTrainers: 0,
    totalTechnologies: 0,
    totalGroups: 0,
    totalTasks: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/stats');
        setStats(res.data);
        if (res.data.recentActivities) {
          setRecentActivities(res.data.recentActivities);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const quickActions = [
    { label: 'Add Intern', icon: Users, path: '/admin/interns', color: '#3b82f6' },
    { label: 'Add Trainer', icon: UserCircle, path: '/admin/trainers', color: '#8b5cf6' },
    { label: 'Add Technology', icon: BookOpen, path: '/admin/domains', color: '#10b981' },
    { label: 'Create Group', icon: Layers, path: '/admin/domains', color: '#f59e0b' },
    { label: 'Create Task', icon: CheckCircle, path: '/admin/tasks', color: '#ef4444' },
  ];

  const statCards = [
    { 
      title: 'Total Interns', 
      value: stats.totalInterns, 
      icon: Users, 
      bgColor: 'rgba(59, 130, 246, 0.15)',
      iconColor: '#3b82f6',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      trend: '+12%',
      trendUp: true
    },
    { 
      title: 'Total Trainers', 
      value: stats.totalTrainers, 
      icon: UserCircle, 
      bgColor: 'rgba(139, 92, 246, 0.15)',
      iconColor: '#8b5cf6',
      borderColor: 'rgba(139, 92, 246, 0.3)',
      trend: '+5%',
      trendUp: true
    },
    { 
      title: 'Technologies', 
      value: stats.totalTechnologies, 
      icon: BookOpen, 
      bgColor: 'rgba(16, 185, 129, 0.15)',
      iconColor: '#10b981',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      trend: '+3',
      trendUp: true
    },
    { 
      title: 'Groups', 
      value: stats.totalGroups, 
      icon: Layers, 
      bgColor: 'rgba(139, 92, 246, 0.15)',
      iconColor: '#8b5cf6',
      borderColor: 'rgba(139, 92, 246, 0.3)',
      trend: '0',
      trendUp: false
    },
    { 
      title: 'Tasks Created', 
      value: stats.totalTasks, 
      icon: CheckCircle, 
      bgColor: 'rgba(245, 158, 11, 0.15)',
      iconColor: '#f59e0b',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      trend: '+8',
      trendUp: true
    }
  ];

  // Sample recent interns data
  const recentInterns = [
    { id: 1, name: 'John Doe', technology: 'React', joinDate: '2024-01-15', status: 'Active' },
    { id: 2, name: 'Jane Smith', technology: 'Python', joinDate: '2024-01-14', status: 'Active' },
    { id: 3, name: 'Mike Johnson', technology: 'Java', joinDate: '2024-01-12', status: 'Active' },
  ];

  return (
    <div className="admin-dashboard">
      <Sidebar role="ADMIN" />
      <div className="main-content">
        {/* Mobile Header with Menu Indicator */}
        <div className="mobile-header">
          <div>
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">Overview of your internship management system</p>
          </div>
          <div className="date-badge">
            <Calendar size={isMobile ? 14 : 16} />
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: isMobile ? 'short' : 'long', 
              month: 'short', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="stats-grid">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="stat-card skeleton">
                <div className="stat-icon skeleton-shine"></div>
                <div className="stat-info">
                  <div className="stat-title skeleton-shine"></div>
                  <div className="stat-value skeleton-shine"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="stats-grid">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="stat-card" style={{ borderLeftColor: stat.iconColor }}>
                    <div className="stat-icon" style={{ background: stat.bgColor, color: stat.iconColor }}>
                      <Icon size={isMobile ? 20 : 24} />
                    </div>
                    <div className="stat-info">
                      <p className="stat-title">{stat.title}</p>
                      <div className="stat-value-wrapper">
                        <h2 className="stat-value">{stat.value}</h2>
                        {stat.trend && (
                          <span className={`stat-trend ${stat.trendUp ? 'trend-up' : 'trend-down'}`}>
                            {stat.trendUp ? '↑' : '↓'} {stat.trend}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Quick Actions - Horizontal Scroll */}
            <div className="quick-actions">
              <div className="section-header">
                <h3 className="section-title">Quick Actions</h3>
                <button className="view-all-btn" onClick={() => {}}>
                  <span>All Actions</span>
                  <ArrowRight size={14} />
                </button>
              </div>
              <div className="actions-scroll">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button 
                      key={index} 
                      className="action-btn"
                      onClick={() => navigate(action.path)}
                    >
                      <div className="action-icon" style={{ background: `${action.color}20`, color: action.color }}>
                        <Icon size={isMobile ? 16 : 18} />
                      </div>
                      <span className="action-label">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dashboard Bottom Section */}
            <div className="dashboard-bottom">
              {/* Recent Activities / Interns */}
              <div className="card recent-activities">
                <div className="card-header">
                  <h3>Recent Interns</h3>
                  <button className="card-link" onClick={() => navigate('/admin/interns')}>
                    View All <ArrowRight size={14} />
                  </button>
                </div>
                <div className="recent-list">
                  {recentInterns.map((intern, idx) => (
                    <div key={intern.id} className="recent-item">
                      <div className="recent-avatar">
                        <span>{intern.name.charAt(0)}</span>
                      </div>
                      <div className="recent-info">
                        <p className="recent-name">{intern.name}</p>
                        <p className="recent-detail">{intern.technology} • Joined {new Date(intern.joinDate).toLocaleDateString()}</p>
                      </div>
                      <div className="recent-status active">{intern.status}</div>
                    </div>
                  ))}
                  {recentInterns.length === 0 && (
                    <div className="activity-placeholder">
                      <Users size={32} strokeWidth={1.5} />
                      <p>No interns added yet</p>
                      <button className="placeholder-btn" onClick={() => navigate('/admin/interns')}>
                        Add Your First Intern →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* System Insights */}
              <div className="card insights-card">
                <div className="card-header">
                  <h3>System Insights</h3>
                  <Award size={18} className="insights-icon" />
                </div>
                <div className="insights-list">
                  <div className="insight-item">
                    <div className="insight-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                      <TrendingUp size={18} />
                    </div>
                    <div className="insight-content">
                      <p className="insight-label">Active Internships</p>
                      <p className="insight-value">{stats.totalInterns} active</p>
                    </div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                      <Activity size={18} />
                    </div>
                    <div className="insight-content">
                      <p className="insight-label">Task Completion Rate</p>
                      <p className="insight-value">78% average</p>
                    </div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                      <Award size={18} />
                    </div>
                    <div className="insight-content">
                      <p className="insight-label">Upcoming Reviews</p>
                      <p className="insight-value">12 this week</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{css}</style>
    </div>
  );
};

const css = `
.admin-dashboard {
  min-height: 100vh;
  background: #071a2e;
}

.main-content {
  margin-left: 280px;
  padding: 2rem;
  transition: all 0.3s ease;
}

/* Mobile Header */
.mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.dashboard-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.dashboard-subtitle {
  color: rgba(180, 220, 215, 0.6);
  font-size: 0.9rem;
  margin: 0;
}

.date-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(20, 184, 166, 0.1);
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid rgba(20, 184, 166, 0.2);
  color: #14b8a6;
  font-size: 0.85rem;
  white-space: nowrap;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #0d1f35;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-title {
  color: rgba(180, 220, 215, 0.6);
  font-size: 0.8rem;
  font-weight: 500;
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value-wrapper {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  line-height: 1.2;
}

.stat-trend {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 20px;
}

.trend-up {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.trend-down {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* Skeleton Loading */
.skeleton {
  background: #0d1f35;
}

.skeleton-shine {
  background: linear-gradient(90deg, #1a2f4e 25%, #1f3857 50%, #1a2f4e 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

.stat-card.skeleton .stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
}

.stat-card.skeleton .stat-title {
  width: 100px;
  height: 12px;
  margin-bottom: 8px;
}

.stat-card.skeleton .stat-value {
  width: 60px;
  height: 28px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Quick Actions */
.quick-actions {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: #14b8a6;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.view-all-btn:hover {
  background: rgba(20, 184, 166, 0.1);
}

.actions-scroll {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
}

.actions-scroll::-webkit-scrollbar {
  height: 4px;
}

.actions-scroll::-webkit-scrollbar-track {
  background: rgba(20, 184, 166, 0.05);
  border-radius: 10px;
}

.actions-scroll::-webkit-scrollbar-thumb {
  background: rgba(20, 184, 166, 0.2);
  border-radius: 10px;
}

.action-btn {
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #e2f8f5;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.action-btn:hover {
  background: rgba(20, 184, 166, 0.1);
  border-color: rgba(20, 184, 166, 0.4);
  transform: translateY(-1px);
}

.action-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Dashboard Bottom */
.dashboard-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.card {
  background: #0d1f35;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(20, 184, 166, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.card-link {
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: #14b8a6;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.card-link:hover {
  background: rgba(20, 184, 166, 0.1);
}

/* Recent Activities List */
.recent-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem;
  background: rgba(20, 184, 166, 0.03);
  border-radius: 12px;
  transition: all 0.2s;
}

.recent-item:hover {
  background: rgba(20, 184, 166, 0.08);
}

.recent-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.recent-info {
  flex: 1;
  min-width: 0;
}

.recent-name {
  font-weight: 600;
  color: #fff;
  margin: 0 0 4px 0;
  font-size: 0.9rem;
}

.recent-detail {
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.5);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-status {
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: 20px;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  font-weight: 600;
  white-space: nowrap;
}

/* Activity Placeholder */
.activity-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  color: rgba(180, 220, 215, 0.4);
  gap: 1rem;
}

.activity-placeholder p {
  margin: 0;
  font-size: 0.9rem;
}

.placeholder-btn {
  background: rgba(20, 184, 166, 0.1);
  border: 1px solid rgba(20, 184, 166, 0.3);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  color: #14b8a6;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.placeholder-btn:hover {
  background: rgba(20, 184, 166, 0.2);
  transform: translateY(-1px);
}

/* Insights */
.insights-icon {
  color: #f59e0b;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem;
  background: rgba(20, 184, 166, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(20, 184, 166, 0.05);
}

.insight-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.insight-content {
  flex: 1;
}

.insight-label {
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.6);
  margin: 0 0 4px 0;
}

.insight-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
    padding: 1.5rem;
  }
  
  .dashboard-bottom {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
    margin-top: 60px;
  }
  
  .mobile-header {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }
  
  .dashboard-title {
    font-size: 1.5rem;
  }
  
  .dashboard-subtitle {
    font-size: 0.8rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-icon {
    width: 44px;
    height: 44px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .section-title {
    font-size: 1.1rem;
  }
  
  .actions-scroll {
    gap: 0.75rem;
  }
  
  .action-btn {
    padding: 0.6rem 1rem;
  }
  
  .action-label {
    font-size: 0.8rem;
  }
  
  .card {
    padding: 1rem;
  }
  
  .recent-item {
    padding: 0.5rem;
  }
  
  .recent-avatar {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }
  
  .recent-name {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
  }
  
  .dashboard-title {
    font-size: 1.25rem;
  }
  
  .date-badge {
    font-size: 0.7rem;
    padding: 6px 12px;
  }
  
  .stat-card {
    padding: 0.875rem;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
  }
  
  .stat-icon svg {
    width: 18px;
    height: 18px;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
  
  .stat-title {
    font-size: 0.7rem;
  }
  
  .action-btn {
    padding: 0.5rem 0.875rem;
  }
  
  .action-icon {
    width: 24px;
    height: 24px;
  }
  
  .action-icon svg {
    width: 14px;
    height: 14px;
  }
  
  .action-label {
    font-size: 0.75rem;
  }
  
  .card-header h3 {
    font-size: 1rem;
  }
  
  .recent-detail {
    font-size: 0.65rem;
  }
  
  .recent-status {
    font-size: 0.6rem;
    padding: 3px 6px;
  }
}
`;

export default AdminDashboard;