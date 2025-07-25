import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export const HomeLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar - Solo este permanece fijo */}
      <Sidebar
        className="fixed top-0 left-0 h-full z-30"
      />

      {/* Main Content */}
      <div className="min-h-screen ml-0 md:ml-20">
        {/* Header - Ya no es sticky, se mueve con el scroll */}
        <Header />

        {/* Main Content Area */}
        <main className="min-h-screen overflow-y-auto bg-gradient-to-br from-slate-50 to-cyan-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};