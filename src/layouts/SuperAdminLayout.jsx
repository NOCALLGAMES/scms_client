import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "../shared/components/layout/SuperAdminSidebar";
import Topbar from "../shared/components/layout/Topbar";

const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
      <SuperAdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          setSidebarOpen={setSidebarOpen}
          sidebarOpen={sidebarOpen}
          onOpenCommandPalette={() => {}}
        />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6 lg:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
