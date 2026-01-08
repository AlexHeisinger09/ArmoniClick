import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Settings, User, Lock, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation, useProfile } from '@/presentation/hooks';
import { useUpdatePasswordMutation } from '@/presentation/hooks/user/useUpdateProfile';
import { Spinner } from '@/presentation/components/ui/spinner';
import { NotificationBell } from '@/presentation/components/NotificationBell';

interface HeaderProps {
  isMinimized?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isMinimized = false }) => {
  const { token, logout } = useLoginMutation();
  const { queryProfile } = useProfile(token || '');
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Estados para el cambio de contraseña
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const { updatePasswordMutation, isLoadingPasswordUpdate } = useUpdatePasswordMutation();
  const userData = queryProfile.data;

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleGoToConfiguration = () => {
    navigate('/dashboard/configuracion');
    setIsMenuOpen(false);
  };

  const handleOpenPasswordModal = () => {
    setShowPasswordModal(true);
    setIsMenuOpen(false);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('Las contraseñas no coinciden', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      showNotification('Contraseña actualizada correctamente', 'success');
      handleClosePasswordModal();
    } catch (error: any) {
      showNotification(error.message || 'Error al cambiar la contraseña', 'error');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={`
      transition-all duration-300
      ${isMinimized ? 'hidden md:block md:p-2 md:pb-0' : 'p-4 sm:p-6 pb-0'}
    `}>
      <div className={`
        bg-white rounded-xl shadow-lg border border-cyan-200 transition-all duration-300
        ${isMinimized ? 'px-3 py-2' : 'px-4 sm:px-6 py-3 sm:py-4'}
      `}>
        <div className="flex justify-between items-center">
          {/* Logo y mensaje de bienvenida */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Logo con tamaño responsivo */}
            <div className="flex-shrink-0">
              <img
                src="/letras.PNG"
                alt="ArmoniClick Logo"
                className={`w-auto object-contain transition-all duration-300 ${
                  isMinimized ? 'h-6 max-w-[80px]' : 'h-8 sm:h-12 max-w-[120px] sm:max-w-none'
                }`}
              />
            </div>
          </div>

          {/* Perfil del usuario y menú de opciones */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* Información del usuario - oculta en móvil, siempre visible en desktop */}
            <div className="text-right hidden md:block">
              <p className={`font-medium text-slate-700 transition-all duration-300 ${
                isMinimized ? 'text-xs' : 'text-sm'
              }`}>
                {userData ? `${userData.name} ${userData.lastName}` : 'Cargando...'}
              </p>
              <p className={`text-slate-500 transition-all duration-300 ${
                isMinimized ? 'text-[10px]' : 'text-xs'
              }`}>
                {userData?.rut ? userData.rut : 'Profesional de la salud'}
              </p>
            </div>

            {/* Foto de perfil con tamaño responsivo */}
            <div className="relative flex-shrink-0">
              {userData?.img ? (
                <img
                  src={userData.img}
                  alt="Foto de perfil"
                  className={`rounded-full object-cover border-2 border-cyan-200 shadow-sm hover:border-cyan-300 transition-all duration-300 ${
                    isMinimized ? 'w-8 h-8' : 'w-10 h-10 sm:w-12 sm:h-12'
                  }`}
                />
              ) : (
                <div className={`bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center shadow-sm border-2 border-cyan-200 hover:border-cyan-300 transition-all duration-300 ${
                  isMinimized ? 'w-8 h-8' : 'w-10 h-10 sm:w-12 sm:h-12'
                }`}>
                  <span className={`text-white font-semibold ${
                    isMinimized ? 'text-xs' : 'text-sm sm:text-lg'
                  }`}>
                    {userData?.name?.[0]?.toUpperCase() || 'U'}
                    {userData?.lastName?.[0]?.toUpperCase() || 'S'}
                  </span>
                </div>
              )}

              {/* Indicador de estado activo */}
              <div className={`absolute bottom-0 right-0 bg-green-500 border-2 border-white rounded-full shadow-sm transition-all duration-300 ${
                isMinimized ? 'w-2.5 h-2.5' : 'w-3 h-3 sm:w-4 sm:h-4'
              }`}></div>
            </div>

            {/* Campana de notificaciones */}
            <NotificationBell isMinimized={isMinimized} />

            {/* Menú de configuración */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={toggleMenu}
                className={`group text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition-all duration-200 border border-transparent hover:border-cyan-200 shadow-sm hover:shadow-md flex-shrink-0 ${
                  isMinimized ? 'p-1.5' : 'p-2 sm:p-3'
                }`}
                title="Opciones"
              >
                <Settings className={`group-hover:scale-110 group-hover:rotate-90 transition-all duration-300 ${
                  isMinimized ? 'w-4 h-4' : 'w-4 h-4 sm:w-5 sm:h-5'
                }`} />
              </button>

              {/* Menú desplegable */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                  {/* Opción de configuración */}
                  <button
                    onClick={handleGoToConfiguration}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-cyan-700 transition-colors duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span>Configuración</span>
                  </button>

                  {/* Opción de cambiar contraseña */}
                  <button
                    onClick={handleOpenPasswordModal}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-cyan-700 transition-colors duration-200"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Cambiar Contraseña</span>
                  </button>

                  {/* Separador */}
                  <div className="my-1 h-px bg-slate-200"></div>

                  {/* Opción de cerrar sesión */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notificación flotante */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <div className={`flex items-center p-4 rounded-lg shadow-lg ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {notification.type === 'success' ? (
              <Check className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Modal de cambio de contraseña */}
      {showPasswordModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleClosePasswordModal}
          />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-4 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Cambiar Contraseña</h3>
                    <button
                      onClick={handleClosePasswordModal}
                      disabled={isLoadingPasswordUpdate}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6 space-y-4">
                  {/* Contraseña Actual */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Contraseña Actual *
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordInputChange}
                        className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                        placeholder="Ingresa tu contraseña actual"
                        disabled={isLoadingPasswordUpdate}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Nueva Contraseña */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nueva Contraseña *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordInputChange}
                        className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                        placeholder="Mínimo 6 caracteres"
                        disabled={isLoadingPasswordUpdate}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar Nueva Contraseña */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Confirmar Nueva Contraseña *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordInputChange}
                        className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                        placeholder="Repite la nueva contraseña"
                        disabled={isLoadingPasswordUpdate}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Requisitos */}
                  <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                    <h4 className="text-sm font-medium text-cyan-800 mb-2">Requisitos de la contraseña:</h4>
                    <ul className="text-sm text-cyan-700 space-y-1">
                      <li className="flex items-center">
                        <Check className={`w-3 h-3 mr-2 ${passwordForm.newPassword.length >= 6 ? 'text-green-600' : 'text-slate-400'}`} />
                        Mínimo 6 caracteres
                      </li>
                      <li className="flex items-center">
                        <Check className={`w-3 h-3 mr-2 ${/[A-Z]/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-slate-400'}`} />
                        Al menos una letra mayúscula
                      </li>
                      <li className="flex items-center">
                        <Check className={`w-3 h-3 mr-2 ${/[0-9]/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-slate-400'}`} />
                        Al menos un número
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-xl">
                  <div className="flex gap-3">
                    <button
                      onClick={handleClosePasswordModal}
                      disabled={isLoadingPasswordUpdate}
                      className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handlePasswordSubmit}
                      disabled={isLoadingPasswordUpdate || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                      className="flex-1 px-4 py-2 text-sm font-medium bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingPasswordUpdate ? (
                        <>
                          <Spinner size="small" show={true} className="text-white mr-2" />
                          Actualizando...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Actualizar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;