import { Link, useNavigate } from 'react-router-dom';
import { showToast } from '../../../shared/utils/toast';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const userName = user?.name || 'Admin';
  const userRole = user?.role || 'Super Admin';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    showToast('success', "Logged out successfully!");
    navigate('/Login/admin', { replace: true });
  }

  return (
    <nav
      className="layout-navbar container-xxl navbar-detached navbar navbar-expand-xl align-items-center bg-navbar-theme"
      id="layout-navbar"
      style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
    >
      {/* Sidebar Toggle Button (Only visible on mobile/small screens) */}
      <div className="layout-menu-toggle navbar-nav align-items-xl-center me-4 me-xl-0 d-xl-none">
        <a className="nav-item nav-link px-0 me-xl-6" href="#">
          <i className="icon-base ri ri-menu-line icon-md"></i>
        </a>
      </div>

      <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
        <div className="navbar-nav align-items-center flex-grow-1 ms-3">
          <div className="nav-item d-flex align-items-center" style={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '8px 12px', maxWidth: '300px' }}>
            <i className="icon-base ri ri-search-line icon-lg lh-0" style={{ marginRight: '8px', color: '#666' }}></i>
            <input
              type="text"
              className="form-control border-0 shadow-none"
              placeholder="Search..."
              aria-label="Search..."
              style={{ backgroundColor: 'transparent', fontSize: '14px' }}
            />
          </div>
        </div>

        <ul className="navbar-nav flex-row align-items-center ms-md-auto gap-2">
          <li className="nav-item">
            <a className="nav-link style-toggler px-3 py-2" href="#" style={{ borderRadius: '8px', transition: 'all 0.3s ease' }}>
              <i className="icon-base ri ri-sun-line icon-lg" id="style-toggle"></i>
            </a>
          </li>

          <li className="nav-item">
            <a className="nav-link style-toggler px-3 py-2" href="#" style={{ borderRadius: '8px', transition: 'all 0.3s ease' }}>
              <i className="icon-base ri ri-star-line icon-lg"></i>
            </a>
          </li>

          <li className="nav-item position-relative">
            <a className="nav-link style-toggler px-3 py-2" href="#" style={{ borderRadius: '8px', transition: 'all 0.3s ease' }}>
              <i className="icon-base ri ri-notification-4-line icon-lg"></i>
              <span className="badge rounded-pill badge-dot bg-danger" style={{ position: 'absolute', top: '0', right: '0' }}></span>
            </a>
          </li>

          <li className="nav-item navbar-dropdown dropdown-user dropdown ms-2">
            <a
              className="nav-link dropdown-toggle hide-arrow p-0 d-flex align-items-center"
              href="#"
              data-bs-toggle="dropdown"
              style={{ cursor: 'pointer' }}
            >
              <div className="avatar avatar-online">
                <span className="avatar-initial rounded-circle shadow-sm" style={{ backgroundColor: '#C14F0E', color: '#fff', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700 }}>{userInitial}</span>
              </div>
            </a>
            <ul className="dropdown-menu dropdown-menu-end mt-3 py-2 border-0 shadow-lg" style={{ borderRadius: '15px', minWidth: '230px', overflow: 'hidden' }}>
              <li className="px-4 py-3">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0 me-3">
                    <div className="avatar avatar-online">
                      <span className="avatar-initial rounded-circle shadow-sm" style={{ backgroundColor: '#C14F0E', color: '#fff', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700 }}>{userInitial}</span>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-0 fw-bold" style={{ color: '#323232' }}>{userName}</h6>
                    <small className="text-muted text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>{userRole.toUpperCase()}</small>
                  </div>
                </div>
              </li>

              <li><div className="dropdown-divider my-1 opacity-50"></div></li>

              <li>
                <Link className="dropdown-item px-4 py-2 d-flex align-items-center" to="/Login/admin/dashboard" style={{ transition: 'all 0.2s' }}>
                  <i className="ri-dashboard-line me-3 ri-lg text-primary"></i>
                  <span className="align-middle fw-medium">Dashboard</span>
                </Link>
              </li>

              <li><div className="dropdown-divider my-1 opacity-50"></div></li>

              <li className="px-3 mt-2">
                <a
                  className="dropdown-item text-white d-flex align-items-center justify-content-center py-2 shadow-sm"
                  onClick={handleLogout}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: '#C14F0E',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    height: '42px'
                  }}
                >
                  <i className="ri-logout-box-r-line me-2"></i>
                  <span className="align-middle fw-bold">Log Out</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
}