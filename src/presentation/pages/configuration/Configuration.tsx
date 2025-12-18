// src/presentation/pages/configuration/Configuration.tsx - ACTUALIZADO CON TAB DE SERVICIOS
import { useState } from "react";
import {
  User,
  Lock,
  Camera,
  Settings,
  Cog,
  Check,
  AlertCircle,
  Clock,
  Briefcase,
  MapPin,
} from "lucide-react";
import { useLoginMutation, useProfile } from "@/presentation/hooks";

// Importar componentes de tabs
import { ProfileTab } from "./tabs/ProfileTab";
import { PhotoTab } from "./tabs/PhotoTab";
import { SecurityTab } from "./tabs/SecurityTab";
import { ScheduleBlocksTab } from "./tabs/ScheduleBlocksTab"; // ✅ REEMPLAZA PREFERENCES
import { ServicesTab } from "./tabs/ServicesTab";
import { LocationsTab } from "./tabs/LocationsTab";

// Componente de animación de engranajes
const GearsAnimation: React.FC = () => (
  <div className="relative w-20 h-20 flex items-center justify-center">
    <div className="absolute inset-0 flex items-center justify-center">
      <Settings
        className="w-12 h-12 text-cyan-500 animate-spin"
        style={{
          animation: 'spin 4s linear infinite',
          transformOrigin: 'center'
        }}
      />
    </div>

    <div className="absolute top-1 right-1">
      <Cog
        className="w-6 h-6 text-cyan-600 animate-spin"
        style={{
          animation: 'spin 3s linear infinite reverse',
          transformOrigin: 'center'
        }}
      />
    </div>

    <div className="absolute bottom-2 left-2">
      <Settings
        className="w-4 h-4 text-cyan-400 animate-spin"
        style={{
          animation: 'spin 5s linear infinite',
          transformOrigin: 'center'
        }}
      />
    </div>

    <div className="absolute inset-0">
      <div className="absolute top-2 left-3 w-1 h-1 bg-cyan-300 rounded-full animate-ping"
        style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-4 right-2 w-1 h-1 bg-cyan-400 rounded-full animate-ping"
        style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-3 left-4 w-1 h-1 bg-cyan-500 rounded-full animate-ping"
        style={{ animationDelay: '2s' }}></div>
    </div>
  </div>
);

// Componente principal de Configuración
const Configuration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('perfil');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Hooks para datos reales del usuario
  const { token } = useLoginMutation();
  const { queryProfile } = useProfile(token || '');

  // Función para mostrar mensajes temporales
  const showMessage = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMessage(message);
      setErrorMessage('');
    } else {
      setErrorMessage(message);
      setSuccessMessage('');
    }

    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 5000);
  };

  // ✅ PESTAÑAS ACTUALIZADAS - SIN SEGURIDAD (se movió al header)
  const tabs = [
    { id: 'perfil', label: 'Información Personal', icon: User },
    { id: 'foto', label: 'Fotos', icon: Camera },
    { id: 'bloques', label: 'Bloqueos de Agenda', icon: Clock },
    { id: 'servicios', label: 'Servicios', icon: Briefcase },
    { id: 'ubicaciones', label: 'Ubicaciones', icon: MapPin },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'perfil':
        return <ProfileTab showMessage={showMessage} />;
      case 'foto':
        return <PhotoTab showMessage={showMessage} />;
      case 'bloques':
        return <ScheduleBlocksTab showMessage={showMessage} />;
      case 'servicios':
        return <ServicesTab showMessage={showMessage} />;
      case 'ubicaciones':
        return <LocationsTab showMessage={showMessage} />;
      default:
        return null;
    }
  };

  // Mostrar loading mientras se cargan los datos
  if (queryProfile.isLoading) {
    return (
      <div className="bg-slate-50 min-h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <GearsAnimation />
          <p className="mt-4 text-slate-600 font-medium">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si no se pueden cargar los datos
  if (queryProfile.isError) {
    return (
      <div className="bg-slate-50 min-h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Error al cargar los datos</h3>
          <p className="text-slate-500 mb-4">No se pudieron cargar los datos del perfil</p>
          <button
            onClick={() => queryProfile.refetch()}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-full flex flex-col">
      <div className="flex-1 p-6">
        {/* Encabezado con animación de engranajes */}
        <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6 mb-6">
          <div className="flex items-stretch gap-4 mb-4">
            <GearsAnimation />
            <div>
              <h3 className="font-medium text-slate-700 sm:text-lg">
                Configuración del Perfil
              </h3>
              <p className="mt-0.5 text-slate-500">
                Administra tu información personal, servicios, configuraciones de seguridad y preferencias.
              </p>
            </div>
          </div>

          {/* Mensajes de éxito/error */}
          {(successMessage || errorMessage) && (
            <div className={`flex items-center p-4 rounded-xl mb-4 ${successMessage ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
              {successMessage ? (
                <Check className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              <span className="text-sm font-medium">
                {successMessage || errorMessage}
              </span>
            </div>
          )}
        </div>

        {/* Pestañas de configuración - Estilo compacto como en Pacientes */}
        <div className="bg-white rounded-xl shadow-sm border border-cyan-200 overflow-hidden">
          <div className="border-b border-cyan-200">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-0 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap
                      ${activeTab === tab.id
                        ? 'border-cyan-500 text-slate-700 bg-cyan-50'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-cyan-25'
                      }
                    `}
                  >
                    <Icon className="w-3.5 h-3.5 mr-1.5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Navigation - Solo íconos */}
            <nav className="md:hidden flex justify-around px-2 py-2.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200
                      ${activeTab === tab.id
                        ? 'bg-cyan-500 text-white shadow-lg scale-110'
                        : 'text-slate-600 hover:bg-cyan-100 hover:text-cyan-700 hover:scale-105'
                      }
                    `}
                    title={tab.label}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenido de la pestaña activa */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Configuration };