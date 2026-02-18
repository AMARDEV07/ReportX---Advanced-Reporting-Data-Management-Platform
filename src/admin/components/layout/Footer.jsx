import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="content-footer footer bg-footer-theme">
      <div className="container-xxl">
        <div className="footer-container d-flex align-items-center justify-content-between py-4 flex-md-row flex-column">
          <div className="mb-2 mb-md-0">
            &copy; {currentYear}, made with ❤️ by
            <a href="https://themeselection.com" target="_blank" className="footer-link fw-medium" rel="noopener noreferrer">
              Amardev panwar
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}