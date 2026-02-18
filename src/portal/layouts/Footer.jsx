import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap justify-between items-center gap-4">

          {/* Left Side */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>
              © {new Date().getFullYear()}, made with ❤️ by
            </span>

            <img
              src="/vizora-logo.svg"
              alt="VimanoTech Logo"
              className="h-6 object-contain"
            />
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
