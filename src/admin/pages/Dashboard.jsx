import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const userName = user?.name || 'User';

  const stats = [
    {
      label: "Reports Configured",
      value: "158",
      growth: "+4",
      description: "new this week",
      icon: "ri-file-chart-line",
      color: "primary"
    },
    {
      label: "Reports Generated",
      value: "1,284",
      growth: "+15%",
      description: "last 24 hours",
      icon: "ri-pulse-line",
      color: "success"
    },
    {
      label: "Active Tenants",
      value: "12",
      growth: "Steady",
      description: "all systems online",
      icon: "ri-database-2-line",
      color: "info"
    },
    {
      label: "Active Support Users",
      value: "42",
      growth: "+2",
      description: "currently online",
      icon: "ri-user-received-line",
      color: "warning"
    }
  ];

  const recentActivity = [
    { id: 1, user: "Admin", action: "Updated Role Permissions", time: "2 mins ago", type: "update" },
    { id: 2, user: "Shardul", action: "Added New User", time: "15 mins ago", type: "add" },
    { id: 3, user: "Mehta", action: "Generated Disbursement Report", time: "1 hr ago", type: "report" },
    { id: 4, user: "Admin", action: "Configured New Tenant", time: "3 hrs ago", type: "setup" },
    { id: 5, user: "Rohit", action: "Deleted Inactive Role", time: "5 hrs ago", type: "delete" },
  ];

  return (
    <DashboardLayout>
      {/* Report Summary Cards */}
      <div className="row gy-4 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="col-sm-6 col-lg-3">
            <div className={`card card-border-shadow-${stat.color} h-100`}>
              <div className="card-body">
                <div className="d-flex align-items-center mb-2 pb-1">
                  <div className="avatar me-2">
                    <span className={`avatar-initial rounded bg-label-${stat.color}`}>
                      <i className={`${stat.icon} ri-24px`}></i>
                    </span>
                  </div>
                  <h4 className="ms-1 mb-0">{stat.value}</h4>
                </div>
                <p className="mb-1">{stat.label}</p>
                <p className="mb-0">
                  <span className="fw-medium me-1">{stat.growth}</span>
                  <small className="text-muted">{stat.description}</small>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header border-bottom bg-transparent py-3">
              <div className="d-flex align-items-center">
                <i className="ri-history-line me-2 text-primary ri-xl"></i>
                <h5 className="mb-0 fw-bold">Recent System Activity</h5>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4">User</th>
                      <th>Action</th>
                      <th className="text-end px-4">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((activity) => (
                      <tr key={activity.id}>
                        <td className="px-4">
                          <div className="d-flex align-items-center">
                            <div className="avatar me-2 avatar-xs">
                              <span className="avatar-initial rounded-circle bg-label-secondary small">
                                {activity.user.charAt(0)}
                              </span>
                            </div>
                            <span className="fw-semibold small">{activity.user}</span>
                          </div>
                        </td>
                        <td>
                          <span className="small text-muted">{activity.action}</span>
                        </td>
                        <td className="text-end px-4">
                          <small className="text-muted">{activity.time}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-footer border-top bg-transparent text-center py-2">
              <button className="btn btn-link btn-sm text-primary text-decoration-none fw-bold">
                View All Activity <i className="ri-arrow-right-s-line ms-1"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card h-100 shadow-sm border-0 bg-primary text-white overflow-hidden">
            <div className="card-body position-relative z-index-1 d-flex flex-column justify-content-center py-5 px-4 text-center">
              <div className="mb-4">
                <i className="ri-admin-line ri-4x opacity-50"></i>
              </div>
              <h4 className="card-title text-white fw-bold mb-3">System Control Panel</h4>
              <p className="card-text mb-4 opacity-75">
                Welcome back, {userName}! Use this dashboard to monitor report generations, manage user access, and oversee tenant database health.
              </p>
              <div className="d-grid gap-2">
                <button className="btn btn-light fw-bold shadow-sm">
                  <i className="ri-settings-4-line me-1"></i> System Settings
                </button>
                <button className="btn btn-outline-light">
                  <i className="ri-file-list-3-line me-1"></i> View System Logs
                </button>
              </div>
            </div>
            {/* Subtle Background Pattern */}
            <i className="ri-bubble-chart-line position-absolute" style={{ right: '-20px', bottom: '-20px', fontSize: '150px', opacity: '0.1', transform: 'rotate(-15deg)' }}></i>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;