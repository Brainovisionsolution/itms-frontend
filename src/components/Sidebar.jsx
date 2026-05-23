import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, Layers, CheckSquare, 
  LogOut, FolderTree, UserPlus, UserCircle, MessageSquare, BookOpen,
  Calendar, FileText, Award, Settings, HelpCircle, ChevronRight
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Sidebar = ({ role }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/approvals', label: 'Approvals', icon: <UserPlus size={20} /> },
    { path: '/admin/directories', label: 'Directories', icon: <FolderTree size={20} /> },
    { path: '/admin/interns', label: 'Interns', icon: <Users size={20} /> },
    { path: '/admin/trainers', label: 'Trainers', icon: <UserCircle size={20} /> },
    { path: '/admin/domains', label: 'Domains & Groups', icon: <Layers size={20} /> },
    { path: '/admin/tasks', label: 'Tasks', icon: <CheckSquare size={20} /> },
    { path: '/admin/reviews', label: 'Reviews', icon: <MessageSquare size={20} /> },
    { path: '/admin/materials', label: 'Materials', icon: <BookOpen size={20} /> },
    { path: '/admin/messages', label: 'Messages', icon: <MessageSquare size={20} /> },
    { path: '/admin/attendance', label: 'Attendance', icon: <Calendar size={20} /> },
  ];

  const trainerLinks = [
    { path: '/trainer/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/trainer/tasks', label: 'Tasks', icon: <CheckSquare size={20} /> },
    { path: '/trainer/reviews', label: 'Reviews', icon: <MessageSquare size={20} /> },
    { path: '/trainer/materials', label: 'Materials', icon: <BookOpen size={20} /> },
    { path: '/trainer/messages', label: 'Messages', icon: <MessageSquare size={20} /> },
    { path: '/trainer/attendance', label: 'Attendance', icon: <Calendar size={20} /> },
  ];

  const studentLinks = [
    { path: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/student/profile', label: 'Profile', icon: <UserCircle size={20} /> },
    { path: '/student/reviews', label: 'Daily Reviews', icon: <Award size={20} /> },
    { path: '/student/materials', label: 'Materials', icon: <BookOpen size={20} /> },
    { path: '/student/messages', label: 'Messages', icon: <MessageSquare size={20} /> },
  ];

  const links = role === 'ADMIN' ? adminLinks : role === 'TRAINER' ? trainerLinks : studentLinks;

  const getRoleBadge = () => {
    switch(role) {
      case 'ADMIN':
        return { label: 'Administrator', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' };
      case 'TRAINER':
        return { label: 'Trainer', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' };
      default:
        return { label: 'Student', color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.15)' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="logo-wrapper">
          <div className="logo-icon">
            <span>IT</span>
          </div>
          <div className="logo-text">
            <span className="logo-title">ITMS</span>
            <span className="logo-subtitle">Internship Tracker</span>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="role-badge" style={{ background: roleBadge.bg, borderColor: roleBadge.color }}>
        <UserCircle size={14} style={{ color: roleBadge.color }} />
        <span style={{ color: roleBadge.color }}>{roleBadge.label}</span>
      </div>

      {/* Navigation Links */}
      <div className="nav-links">
        {links.map(link => {
          const isActive = location.pathname === link.path;
          return (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon" style={{ color: isActive ? '#14b8a6' : 'inherit' }}>
                {link.icon}
              </span>
              <span className="nav-label">{link.label}</span>
              {isActive && <ChevronRight size={14} className="nav-arrow" />}
            </Link>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="sidebar-footer">
        {/* Theme Toggle */}
        <div className="theme-section">
          <div className="theme-label">
            <Settings size={16} />
            <span>Appearance</span>
          </div>
          <ThemeToggle />
        </div>

        {/* Logout Button */}
        <button onClick={logout} className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>

        {/* Version Info */}
        <div className="version-info">
          <span>v2.0.0</span>
          <span>© 2024 ITMS</span>
        </div>
      </div>

      <style>{css}</style>
    </div>
  );
};

const css = `
.sidebar {
  width: 280px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: #0a1a2f;
  border-right: 1px solid rgba(20, 184, 166, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: all 0.3s ease;
}

/* Header */
.sidebar-header {
  padding: 1.5rem 1.25rem;
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.logo-icon span {
  color: white;
  font-weight: 800;
  font-size: 1.1rem;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-weight: 800;
  font-size: 1.25rem;
  color: #fff;
  letter-spacing: -0.5px;
}

.logo-subtitle {
  font-size: 0.65rem;
  color: rgba(180, 220, 215, 0.5);
  margin-top: 2px;
}

/* Role Badge */
.role-badge {
  margin: 1rem 1.25rem;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid;
  background: rgba(20, 184, 166, 0.1);
}

/* Navigation Links */
.nav-links {
  flex: 1;
  padding: 0.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  color: rgba(180, 220, 215, 0.7);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover {
  background: rgba(20, 184, 166, 0.08);
  color: #fff;
}

.nav-link.active {
  background: rgba(20, 184, 166, 0.12);
  color: #14b8a6;
}

.nav-link.active .nav-icon {
  color: #14b8a6;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  transition: color 0.2s;
}

.nav-label {
  flex: 1;
}

.nav-arrow {
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
}

.nav-link.active .nav-arrow {
  opacity: 1;
  transform: translateX(0);
}

.nav-arrow {
  transform: translateX(-5px);
}

/* Footer */
.sidebar-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(20, 184, 166, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.theme-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.theme-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: rgba(180, 220, 215, 0.6);
}

.theme-label svg {
  color: rgba(180, 220, 215, 0.5);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  transform: translateY(-1px);
}

.version-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  color: rgba(180, 220, 215, 0.3);
  padding-top: 0.5rem;
}

/* Scrollbar Styling */
.nav-links::-webkit-scrollbar {
  width: 4px;
}

.nav-links::-webkit-scrollbar-track {
  background: rgba(20, 184, 166, 0.05);
  border-radius: 10px;
}

.nav-links::-webkit-scrollbar-thumb {
  background: rgba(20, 184, 166, 0.2);
  border-radius: 10px;
}

.nav-links::-webkit-scrollbar-thumb:hover {
  background: rgba(20, 184, 166, 0.3);
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
}

/* Active link animation */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.nav-link.active {
  animation: slideIn 0.3s ease-out;
}
`;

export default Sidebar;
