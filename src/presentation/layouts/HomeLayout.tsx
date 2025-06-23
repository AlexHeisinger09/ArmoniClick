import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export const HomeLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - comentado por ahora */}
        {/* <Header /> */}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-cyan-50">
          <Outlet />
        </main>
        
        {/* Footer - comentado por ahora */}
        {/* <Footer /> */}
      </div>
    </div>
  );
};