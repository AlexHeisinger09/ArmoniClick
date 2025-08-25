// src/presentation/pages/calendar/Calendar.tsx - CORREGIDO
import React from 'react';
import { useCalendar } from './hooks/useCalendar';
import { CalendarHeader } from './components/CalendarHeader';
import { MonthView } from './components/MonthView';
import { WeekView } from './components/WeekView';
import { DayView } from './components/DayView';
import { AppointmentModal } from './components/AppointmentModal';
import { NewAppointmentModal } from './components/NewAppointmentModal';
import { Spinner } from '@/presentation/components/ui/spinner';
import { Alert, AlertDescription } from '@/presentation/components/ui/alert';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';

const Calendar: React.FC = () => {
  const {
    // Estado original - SIN CAMBIOS
    currentDate,
    selectedDate,
    showModal,
    showNewAppointmentModal,
    appointments,
    viewMode,
    newAppointment,
    isLoading,
    error,
    isCreating,
    isUpdatingStatus,
    setViewMode,
    setSelectedDate,
    setShowModal,
    setNewAppointment,
    navigateDate,
    goToToday,
    handleDateClick,
    handleNewAppointment,
    handleCreateAppointment,
    handleAppointmentEdit,
    handleDateSelect,
    closeModal,
    closeNewAppointmentModal
  } = useCalendar();

  // Función para obtener mensaje de error de forma segura
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as any).message);
    }
    return 'Error desconocido';
  };

  const renderCalendarView = () => {
    // 🔥 MOSTRAR SPINNER MIENTRAS CARGA
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center space-y-4">
            <Spinner />
            <div className="text-center">
              <p className="text-slate-600 font-medium">Cargando citas...</p>
              <p className="text-slate-400 text-sm">Conectando con el servidor</p>
            </div>
          </div>
        </div>
      );
    }

    // 🔥 MOSTRAR ERROR SI HAY PROBLEMAS DE CONEXIÓN
    if (error) {
      return (
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <p className="font-medium">Error al cargar las citas</p>
                <p className="text-sm mt-1">{getErrorMessage(error)}</p>
              </div>
              <WifiOff className="h-5 w-5 ml-4" />
            </AlertDescription>
          </Alert>
          
          {/* Mostrar calendario vacío cuando hay error para que siga siendo funcional */}
          <div className="mt-4 opacity-50">
            {renderCalendarContent()}
          </div>
        </div>
      );
    }

    return renderCalendarContent();
  };

  // Función auxiliar para renderizar el contenido del calendario
  const renderCalendarContent = () => {
    switch (viewMode) {
      case 'month':
        return (
          <MonthView
            currentDate={currentDate}
            appointments={appointments}
            onDateClick={handleDateClick}
          />
        );
      case 'week':
        return (
          <WeekView
            currentDate={currentDate}
            appointments={appointments}
            onDateSelect={(date) => {
              setSelectedDate(date);
              setShowModal(true);
            }}
            onTimeSlotClick={handleNewAppointment}
            onAppointmentEdit={handleAppointmentEdit}
          />
        );
      case 'day':
        return (
          <DayView
            currentDate={currentDate}
            appointments={appointments}
            onTimeSlotClick={handleNewAppointment}
            onAppointmentEdit={handleAppointmentEdit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* 🔥 INDICADOR DE ESTADO DE CONEXIÓN */}
        {!isLoading && !error && (
          <div className="mb-4 flex justify-end">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <Wifi className="w-3 h-3 text-green-500" />
              <span>Conectado</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative">
          {/* Header del calendario con diseño moderno - SIN CAMBIOS */}
          <CalendarHeader
            currentDate={currentDate}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onNavigate={navigateDate}
            onToday={goToToday}
            onDateSelect={handleDateSelect}
          />

          {/* Contenido del calendario */}
          <div className="calendar-content">
            {renderCalendarView()}
          </div>

          {/* 🔥 OVERLAY DE CARGA PARA OPERACIONES EN CURSO */}
          {(isCreating || isUpdatingStatus) && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl p-6 flex items-center space-x-4 border border-cyan-200">
                <Spinner className="text-cyan-500" />
                <div className="text-left">
                  <p className="text-slate-800 font-semibold">
                    {isCreating && 'Creando cita...'}
                    {isUpdatingStatus && 'Actualizando estado...'}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {isCreating && 'Guardando en el servidor'}
                    {isUpdatingStatus && 'Sincronizando cambios'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal para ver citas - SIN CAMBIOS */}
        {showModal && selectedDate && (
          <AppointmentModal
            selectedDate={selectedDate}
            appointments={appointments}
            onClose={closeModal}
            onNewAppointment={handleNewAppointment}
          />
        )}

        {/* Modal para crear nueva cita - SIN CAMBIOS */}
        <NewAppointmentModal
          isOpen={showNewAppointmentModal}
          newAppointment={newAppointment}
          appointments={appointments}
          onClose={closeNewAppointmentModal}
          onChange={setNewAppointment}
          onSubmit={handleCreateAppointment}
        />
      </div>
    </div>
  );
};

export { Calendar };