import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export const HomeLayout = () => {
  const location = useLocation();

  // Detectar si estamos en la vista de detalle del paciente
  // Esto es true cuando la URL contiene ?view=detail
  const searchParams = new URLSearchParams(location.search);
  const isPatientDetailView = searchParams.get('view') === 'detail';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toaster for notifications */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand
      />

      {/* Sidebar - Solo este permanece fijo */}
      <Sidebar
        className="fixed top-0 left-0 h-full z-30"
      />

      {/* Main Content */}
      <div className="min-h-screen ml-0 md:ml-20">
        {/* Header - Pasa prop para saber si debe minimizarse */}
        <Header isMinimized={isPatientDetailView} />

        {/* Main Content Area */}
        <main className="min-h-screen overflow-y-auto bg-gradient-to-br from-slate-50 to-cyan-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};