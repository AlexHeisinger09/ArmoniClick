// src/presentation/pages/configuration/tabs/PreferencesTab.tsx
import { Save, Bell, Palette } from "lucide-react";

// Componente para iconos circulares
const CircularIcon: React.FC<{ icon: React.ElementType; isActive?: boolean }> = ({
  icon: Icon,
  isActive = false
}) => (
  <div className={`
    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
    ${isActive
      ? 'bg-cyan-500 shadow-md'
      : 'bg-cyan-100 hover:bg-cyan-200'
    }
  `}>
    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-cyan-600'}`} />
  </div>
);

interface PreferencesTabProps {
  showMessage: (message: string, type: 'success' | 'error') => void;
}

const PreferencesTab: React.FC<PreferencesTabProps> = ({ showMessage }) => {
  const handleSavePreferences = () => {
    showMessage('Preferencias guardadas correctamente', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-6">
          Preferencias de la Aplicación
        </h3>

        <div className="space-y-6">
          {/* Notificaciones */}
          <div>
            <h4 className="text-md font-medium text-slate-700 mb-4 flex items-center">
              <CircularIcon icon={Bell} />
              <span className="ml-3">Notificaciones</span>
            </h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 border border-cyan-200 rounded-lg hover:bg-cyan-50 cursor-pointer">
                <div>
                  <p className="font-medium text-slate-700">Nuevas citas</p>
                  <p className="text-sm text-slate-500">Recibir notificaciones de nuevas citas agendadas</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-cyan-500 rounded" />
              </label>

              <label className="flex items-center justify-between p-3 border border-cyan-200 rounded-lg hover:bg-cyan-50 cursor-pointer">
                <div>
                  <p className="font-medium text-slate-700">Recordatorios</p>
                  <p className="text-sm text-slate-500">Recordatorios de citas próximas</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-cyan-500 rounded" />
              </label>

              <label className="flex items-center justify-between p-3 border border-cyan-200 rounded-lg hover:bg-cyan-50 cursor-pointer">
                <div>
                  <p className="font-medium text-slate-700">Reportes semanales</p>
                  <p className="text-sm text-slate-500">Resumen semanal de actividad</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-cyan-500 rounded" />
              </label>
            </div>
          </div>

          {/* Tema */}
          <div>
            <h4 className="text-md font-medium text-slate-700 mb-4 flex items-center">
              <CircularIcon icon={Palette} />
              <span className="ml-3">Apariencia</span>
            </h4>
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-cyan-200 rounded-lg hover:bg-cyan-50 cursor-pointer">
                <input type="radio" name="theme" defaultChecked className="w-4 h-4 text-cyan-500 mr-3" />
                <div>
                  <p className="font-medium text-slate-700">Modo claro</p>
                  <p className="text-sm text-slate-500">Interfaz con colores claros</p>
                </div>
              </label>

              <label className="flex items-center p-3 border border-cyan-200 rounded-lg hover:bg-cyan-50 cursor-pointer">
                <input type="radio" name="theme" className="w-4 h-4 text-cyan-500 mr-3" />
                <div>
                  <p className="font-medium text-slate-700">Modo oscuro</p>
                  <p className="text-sm text-slate-500">Interfaz con colores oscuros</p>
                </div>
              </label>

              <label className="flex items-center p-3 border border-cyan-200 rounded-lg hover:bg-cyan-50 cursor-pointer">
                <input type="radio" name="theme" className="w-4 h-4 text-cyan-500 mr-3" />
                <div>
                  <p className="font-medium text-slate-700">Automático</p>
                  <p className="text-sm text-slate-500">Sigue la configuración del sistema</p>
                </div>
              </label>
            </div>
          </div>

          <button 
            onClick={handleSavePreferences}
            className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Preferencias
          </button>
        </div>
      </div>
    </div>
  );
};

export { PreferencesTab };