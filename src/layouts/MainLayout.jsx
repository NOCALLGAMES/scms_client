import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../shared/components/layout/Sidebar";
import Topbar from "../shared/components/layout/Topbar";
import CommandPalette from "../shared/components/common/CommandPalette";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle palette on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} onOpenCommandPalette={() => setCommandPaletteOpen(true)} />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 relative">
          <Outlet />
        </main>
      </div>
      
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
};

export default MainLayout;
