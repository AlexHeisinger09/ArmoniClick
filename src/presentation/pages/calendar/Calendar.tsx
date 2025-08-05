// Calendar.tsx
import React from 'react';
import { useCalendar } from './hooks/useCalendar';
import { CalendarHeader } from './components/CalendarHeader';
import { MonthView } from './components/MonthView';
import { WeekView } from './components/WeekView';
import { DayView } from './components/DayView';
import { AppointmentModal } from './components/AppointmentModal';
import { NewAppointmentModal } from './components/NewAppointmentModal';

const Calendar: React.FC = () => {
  const {
    // Estado
    currentDate,
    selectedDate,
    showModal,
    showNewAppointmentModal,
    appointments,
    viewMode,
    newAppointment,

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
    handleAppointmentEdit,
    handleDateSelect,
    closeModal,
    closeNewAppointmentModal
  } = useCalendar();

  const renderCalendarView = () => {
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
    <div className="h-full bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200">
          {/* Usar el nuevo CalendarHeader */}
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

        {/* Modal para crear nueva cita */}
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