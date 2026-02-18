import React from 'react';
import { Link } from 'react-router-dom';

const Error404 = () => {
  return (
    <div className="container-xxl">
      <div className="misc-wrapper d-flex flex-column align-items-center justify-content-center text-center p-5" style={{ minHeight: '100vh' }}>
        <h1 className="mb-2 mx-2" style={{ fontSize: '6rem', fontWeight: '800', color: '#C14F0E' }}>404</h1>
        <h4 className="mb-2">Page Not Found 🔍</h4>
        <p className="mb-6 mx-2">Oops! 😖 The requested URL was not found on this server.</p>
        <Link to="/Login/admin/dashboard" className="btn btn-primary">Back to Home</Link>
 
      </div>
    </div>
  );
};

export default Error404;
