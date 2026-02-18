import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

const DashboardLayout = ({ children }) => {
  return (
    <div className="layout-wrapper layout-content-navbar">
      <div className="layout-container">
        {/* Sidebar/Menu */}
        <Sidebar />

        {/* Layout page */}
        <div className="layout-page">
          {/* Navbar */}
          <Navbar />

          {/* Content wrapper */}
          <div className="content-wrapper">
            {/* Content - Yaha har page ka content aayega */}
            <div className="container-xxl flex-grow-1 container-p-y">
              {children}
            </div>

            {/* Footer */}
            <Footer />

            <div className="content-backdrop fade"></div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div className="layout-overlay layout-menu-toggle"></div>


    </div>
  );
};

export default DashboardLayout;