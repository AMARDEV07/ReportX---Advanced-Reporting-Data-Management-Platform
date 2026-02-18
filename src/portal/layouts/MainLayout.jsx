import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "../layouts/Footer";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-gray-100">
        <Outlet />
      </main>

      <Footer />
    </div>
    
  );
};

export default MainLayout;
