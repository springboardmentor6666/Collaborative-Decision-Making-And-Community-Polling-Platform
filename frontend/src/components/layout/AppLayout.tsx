import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { MobileMenu } from "./MobileMenu";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Navigation */}
      <MobileMenu open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Desktop/Tablet Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r bg-card h-screen sticky top-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
