import { Link, NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function Sidebar() {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({
    accessManagement: false,
  });

  // Auto-open menu based on current path
  useEffect(() => {
    const path = location.pathname;
    if (['/Login/admin/users', '/Login/admin/roles', '/Login/admin/user-roles', '/Login/admin/modules', '/Login/admin/module-list'].includes(path) || path.startsWith('/Login/admin/view-module')) {
      setOpenMenus({ accessManagement: true });
    }
  }, [location.pathname]);

  //toggle menu drop down
  const toggleMenu = (menuName) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  return (
    <>
      <aside
        id="layout-menu"
        className="layout-menu menu-vertical menu bg-menu-theme"
        style={{ 
          borderRight: "1px solid #e0e0e0",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}
      >
        <div className="app-brand demo">
          <Link to="/Login/admin" className="app-brand-link">
            <span className="app-brand-logo demo me-1">
              <img
                src="/assets/img/logo.png"
                alt="Vizora Logo"
                style={{ width: '160px' }}
              />
            </span>
          </Link>
        </div>

        <div className="menu-inner-shadow" />

        <ul className="menu-inner py-1">
          {/* Dashboards */}
          <li className={`menu-item ${location.pathname === '/Login/admin/dashboard' ? 'active' : ''}`}>
            <NavLink to="/Login/admin/dashboard" className="menu-link">
              <i className="menu-icon icon-base ri ri-home-smile-line" />
              <div data-i18n="Dashboards">Dashboard</div>
            </NavLink>
          </li>

          <li className="menu-header small text-uppercase"><span className="menu-header-text">System Settings</span></li>

          {/* Access Management Dropdown */}
          <li className={`menu-item ${openMenus.accessManagement ? 'open' : ''}`}>
            <Link
              to="#"
              className="menu-link menu-toggle"
              onClick={(e) => {
                e.preventDefault();
                toggleMenu('accessManagement');
              }}
            >
              <i className="menu-icon icon-base ri ri-shield-keyhole-line" />
              <div data-i18n="Access Management">Access Management</div>
            </Link>
            <ul className="menu-sub">

              <li className={`menu-item ${location.pathname === '/Login/admin/roles' ? 'active' : ''}`}>
                <NavLink to="/Login/admin/roles" className="menu-link">
                  <div data-i18n="Roles">Roles</div>
                </NavLink>
              </li>
              <li className={`menu-item ${location.pathname === '/Login/admin/users' ? 'active' : ''}`}>
                <NavLink to="/Login/admin/users" className="menu-link">
                  <div data-i18n="Users">Users</div>
                </NavLink>
              </li>
              <li className={`menu-item ${location.pathname === '/Login/admin/user-roles' ? 'active' : ''}`}>
                <NavLink to="/Login/admin/user-roles" className="menu-link">
                  <div data-i18n="User Roles">User Roles</div>
                </NavLink>
              </li>
              <li className={`menu-item ${location.pathname === '/Login/admin/modules' ? 'active' : ''}`}>
                <NavLink to="/Login/admin/modules" className="menu-link">
                  <div data-i18n="Modules">view Modules</div>
                </NavLink>
              </li>
              <li className={`menu-item ${location.pathname === '/Login/admin/module-list' ? 'active' : ''}`}>
                <NavLink to="/Login/admin/module-list" className="menu-link">
                  <div data-i18n="User Module List">Module List</div>
                </NavLink>
              </li>
            </ul>
          </li>

        </ul>
      </aside>
    </>
  );
}

export default Sidebar;