// src/presentation/pages/calendar/Calendar.tsx - CON MENÚ CONTEXTUAL
import React from 'react';
import { useCalendar } from './hooks/useCalendar';
import { CalendarHeader } from './components/CalendarHeader';
import { MonthView } from './components/MonthView';
import { WeekView } from './components/WeekView';
import { DayView } from './components/DayView';
import { AppointmentModal } from './components/AppointmentModal';
import { NewAppointmentModal } from './components/NewAppointmentModal';
import { AppointmentContextMenu } from './components/AppointmentContextMenu';
import { Spinner } from '@/presentation/components/ui/spinner';
import { Alert, AlertDescription } from '@/presentation/components/ui/alert';
import { AlertCircle, WifiOff } from 'lucide-react';

const Calendar: React.FC = () => {
  const {
    // Estado original
    currentDate,
    selectedDate,
    showModal,
    showNewAppointmentModal,
    appointments,
    viewMode,
    newAppointment,
    scheduleBlocks,
    isLoading,
    error,
    isCreating,
    isUpdatingStatus,

    // Estados del menú contextual
    showContextMenu,
    contextMenuPosition,
    selectedAppointment,

    // Acciones
    setViewMode,
    setSelectedDate,
    setShowModal,
    setNewAppointment,
    navigateDate,
    goToToday,
    handleDateClick,
    handleNewAppointment,
    handleCreateAppointment,
    handleAppointmentClick,
    handleDateSelect,
    closeModal,
    closeNewAppointmentModal,

    // Acciones del menú contextual
    closeContextMenu,
    handleUpdateStatus,
    handleNavigateToPatient,
    handleAppointmentEdit,
    handleDeleteAppointment
  } = useCalendar();

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

          <div className="mt-4 opacity-50">
            {renderCalendarContent()}
          </div>
        </div>
      );
    }

    return renderCalendarContent();
  };

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
            onAppointmentClick={handleAppointmentClick}
            scheduleBlocks={scheduleBlocks}
          />
        );
      case 'day':
        return (
          <DayView
            currentDate={currentDate}
            appointments={appointments}
            onTimeSlotClick={handleNewAppointment}
            onAppointmentClick={handleAppointmentClick}
            scheduleBlocks={scheduleBlocks}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Selector de vista flotante - Entre header principal y calendario */}
        <div className="flex justify-start mb-3">
          <div className="inline-flex bg-white rounded-lg p-0.5 shadow-sm border border-slate-200">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-md transition-all duration-200 font-medium ${viewMode === 'day'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
            >
              Día
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-md transition-all duration-200 font-medium ${viewMode === 'week'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-md transition-all duration-200 font-medium ${viewMode === 'month'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
            >
              Mes
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative">
          {/* Header del calendario */}
          <CalendarHeader
            currentDate={currentDate}
            viewMode={viewMode}
            onNavigate={navigateDate}
            onToday={goToToday}
            onDateSelect={handleDateSelect}
          />

          {/* Contenido del calendario */}
          <div className="calendar-content">
            {renderCalendarView()}
          </div>

          {/* Overlay de carga */}
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

        {/* Modal para ver citas */}
        {showModal && selectedDate && (
          <AppointmentModal
            selectedDate={selectedDate}
            appointments={appointments}
            onClose={closeModal}
            onNewAppointment={handleNewAppointment}
          />
        )}

        {/* Modal para crear citas */}
        <NewAppointmentModal
          isOpen={showNewAppointmentModal}
          newAppointment={newAppointment}
          appointments={appointments}
          onClose={closeNewAppointmentModal}
          onChange={setNewAppointment}
          onSubmit={handleCreateAppointment}
          isCreating={isCreating}
          isEditing={!!(window as any).__editingAppointmentId}
          scheduleBlocks={scheduleBlocks}
        />

        {/* Menú contextual */}
        <AppointmentContextMenu
          isOpen={showContextMenu}
          onClose={closeContextMenu}
          appointment={selectedAppointment}
          position={contextMenuPosition}
          onUpdateStatus={handleUpdateStatus}
          onNavigateToPatient={handleNavigateToPatient}
          onEditAppointment={handleAppointmentEdit as any}
          onDeleteAppointment={handleDeleteAppointment}
        />
      </div>
    </div>
  );
};

export { Calendar };