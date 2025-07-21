import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export const HomeLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar - Ahora maneja su propia responsividad */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        className="fixed top-0 left-0 h-full z-30"
      />

      {/* Main Content */}
      <div className={`
        transition-all duration-300 min-h-screen
        ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}
        pt-20 md:pt-0
      `}>
        {/* Header - comentado por ahora */}
        {/* <Header /> */}

        {/* Main Content Area */}
        <main className="min-h-screen overflow-y-auto bg-gradient-to-br from-slate-50 to-cyan-50">
          <Outlet />
        </main>
        
        {/* Footer - comentado por ahora */}
        {/* <Footer /> */}
      </div>
    </div>
  );
};