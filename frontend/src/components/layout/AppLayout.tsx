import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { MobileMenu } from "./MobileMenu";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-full bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Navigation */}
      <MobileMenu open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Desktop/Tablet Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card h-full shrink-0 overflow-hidden">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Main Content Area */}
        <main tabIndex={-1} className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto min-h-0 focus:outline-none overscroll-contain">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
