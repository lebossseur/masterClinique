import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaHome, FaChartBar, FaUsers, FaCalendar, FaFileInvoiceDollar,
  FaShieldAlt, FaPills, FaChartLine, FaCog,
  FaBars, FaTimes, FaSignOutAlt, FaFlask, FaStethoscope
} from 'react-icons/fa';
import './Layout.css';

const Layout = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: FaHome, label: 'Accueil', roles: ['ADMIN', 'SUPERVISOR', 'ACCUEIL', 'CAISSE', 'ASSURANCE', 'PHARMACIE', 'LABORATOIRE'] },
    { path: '/dashboard', icon: FaChartBar, label: 'Tableau de bord', roles: ['ADMIN', 'SUPERVISOR'] },
    { path: '/patients', icon: FaUsers, label: 'Patients', roles: ['ADMIN', 'SUPERVISOR', 'ACCUEIL', 'CAISSE', 'ASSURANCE'] },
    { path: '/appointments', icon: FaCalendar, label: 'Rendez-vous', roles: ['ADMIN', 'SUPERVISOR', 'ACCUEIL'] },
    { path: '/invoices', icon: FaFileInvoiceDollar, label: 'Caisse & Facturation', roles: ['ADMIN', 'SUPERVISOR', 'CAISSE'] },
    { path: '/insurance', icon: FaShieldAlt, label: 'Assurance', roles: ['ADMIN', 'SUPERVISOR', 'ASSURANCE'] },
    { path: '/pharmacy', icon: FaPills, label: 'Pharmacie', roles: ['ADMIN', 'SUPERVISOR', 'PHARMACIE'] },
    { path: '/laboratory', icon: FaFlask, label: 'Laboratoire', roles: ['ADMIN', 'SUPERVISOR', 'LABORATOIRE'] },
    { path: '/medicine', icon: FaStethoscope, label: 'Médecine', roles: ['MEDECIN'] },
    { path: '/accounting', icon: FaChartLine, label: 'Comptabilité', roles: ['ADMIN', 'SUPERVISOR'] },
    { path: '/configuration', icon: FaCog, label: 'Configuration', roles: ['ADMIN'] }
  ];

  const visibleMenuItems = menuItems.filter(item =>
    !item.roles || hasRole(...item.roles)
  );

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Master Clinique</h2>
        </div>
        <nav className="sidebar-nav">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>

          <div className="topbar-right">
            <div className="user-info">
              <span className="user-name">{user?.first_name} {user?.last_name}</span>
              <span className="user-role">{user?.role_name}</span>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              <FaSignOutAlt /> Déconnexion
            </button>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
