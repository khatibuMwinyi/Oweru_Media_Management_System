import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <Header onToggleSidebar={() => setSidebarOpen((s) => !s)} />

        <main className="p-2 sm:p-4 md:p-6 flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
