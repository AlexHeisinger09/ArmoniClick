// src/presentation/pages/configuration/tabs/ScheduleBlocksTab.tsx
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Clock, AlertCircle, Loader, X, Copy, Check, Share2 } from 'lucide-react';
import { useLoginMutation, useProfile } from "@/presentation/hooks";
import { useScheduleBlocks } from '@/presentation/hooks/schedule-blocks/useScheduleBlocks';
import { ConfirmationModal } from '@/presentation/components/ui/ConfirmationModal';
import { useConfirmation } from '@/presentation/hooks/useConfirmation';
import { CreateScheduleBlockData, UpdateScheduleBlockData } from '@/core/use-cases/schedule-blocks';

interface ScheduleBlocksTabProps {
  showMessage: (message: string, type: 'success' | 'error') => void;
}

const DAYS_OF_WEEK = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
};

const BLOCK_REASONS = {
  lunch: 'Almuerzo',
  break: 'Descanso',
  training: 'Capacitación',
  meeting: 'Reunión',
  personal: 'Asunto personal',
  vacation: 'Vacaciones',
  sick_leave: 'Licencia médica',
  other: 'Otro'
};

const ScheduleBlocksTab: React.FC<ScheduleBlocksTabProps> = ({ showMessage }) => {
  const { token } = useLoginMutation();
  const { queryProfile } = useProfile(token || '');
  const doctorId = queryProfile.data?.id || 0;
  const { blocks, isLoading, createBlock, updateBlock, deleteBlock, isCreating, isUpdating, isDeleting } = useScheduleBlocks(doctorId);

  const confirmation = useConfirmation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<any | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'single_date' | 'recurring'>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [availableDurations, setAvailableDurations] = useState<number[]>([30, 60]);

  // Form state
  const [formData, setFormData] = useState({
    blockType: 'recurring' as 'single_date' | 'recurring',
    blockDate: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '15:00',
    recurringPattern: 'monday' as any,
    recurringEndDate: '',
    reason: ''
  });

  const handleOpenModal = (block?: any) => {
    if (block) {
      setEditingBlock(block);
      setFormData({
        blockType: block.blockType,
        blockDate: block.blockDate,
        startTime: block.startTime,
        endTime: block.endTime,
        recurringPattern: block.recurringPattern || '',
        recurringEndDate: block.recurringEndDate || '',
        reason: block.reason || ''
      });
    } else {
      setEditingBlock(null);
      setFormData({
        blockType: 'recurring',
        blockDate: new Date().toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '15:00',
        recurringPattern: 'monday',
        recurringEndDate: '',
        reason: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBlock(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.startTime || !formData.endTime) {
      showMessage('Por favor ingresa hora de inicio y fin', 'error');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      showMessage('La hora de fin debe ser posterior a la hora de inicio', 'error');
      return;
    }

    try {
      if (editingBlock) {
        const updateData: UpdateScheduleBlockData = {
          blockType: formData.blockType,
          blockDate: formData.blockDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          reason: formData.reason || undefined
        };

        if (formData.blockType === 'recurring') {
          updateData.recurringPattern = formData.recurringPattern;
          updateData.recurringEndDate = formData.recurringEndDate || null;
        }

        await updateBlock(editingBlock.id, updateData);
        showMessage('Bloqueo actualizado correctamente', 'success');
      } else {
        const createData: CreateScheduleBlockData = {
          blockType: formData.blockType,
          blockDate: formData.blockDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          reason: formData.reason || undefined
        };

        if (formData.blockType === 'recurring') {
          createData.recurringPattern = formData.recurringPattern;
          createData.recurringEndDate = formData.recurringEndDate || undefined;
        }

        await createBlock(createData);
        showMessage('Bloqueo creado correctamente', 'success');
      }
      handleCloseModal();
    } catch (error: any) {
      showMessage(error.message || 'Error al guardar el bloqueo', 'error');
    }
  };

  const handleDelete = async (blockId: number) => {
    const confirmed = await confirmation.confirm({
      title: 'Eliminar bloqueo',
      message: '¿Estás seguro de eliminar este bloqueo de agenda?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger'
    });

    if (!confirmed) {
      confirmation.close();
      return;
    }

    try {
      await deleteBlock(blockId);
      showMessage('Bloqueo eliminado correctamente', 'success');
      confirmation.close();
    } catch (error: any) {
      showMessage(error.message || 'Error al eliminar el bloqueo', 'error');
      confirmation.close();
    }
  };

  // Generar link de reserva pública
  const generatePublicBookingLink = (): string => {
    const baseUrl = window.location.origin;
    const durations = availableDurations.sort((a, b) => a - b).join(',');
    return `${baseUrl}/book-appointment/${doctorId}?durations=${durations}`;
  };

  const handleCopyLink = async () => {
    const link = generatePublicBookingLink();
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      showMessage('Link copiado al portapapeles', 'success');
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (error) {
      showMessage('Error al copiar el link', 'error');
    }
  };

  // Filtrar bloques
  const filteredBlocks = blocks.filter(block =>
    filterType === 'all' || block.blockType === filterType
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Public Booking Link Section */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Share2 className="w-6 h-6 text-cyan-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Link de Reserva Pública
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Comparte este link con tus pacientes para que puedan agendar citas sin iniciar sesión.
            </p>

            {/* Link Display */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 bg-white border border-slate-300 rounded-lg px-4 py-2.5 flex items-center gap-2">
                <input
                  type="text"
                  value={generatePublicBookingLink()}
                  readOnly
                  className="flex-1 bg-transparent outline-none text-sm text-slate-700 font-mono"
                />
              </div>
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  copiedLink
                    ? 'bg-green-500 text-white'
                    : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </button>
            </div>

            {/* Available Durations Configuration */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Duraciones disponibles para reserva:
              </label>
              <div className="flex flex-wrap gap-3">
                {[30, 60, 90, 120].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => {
                      setAvailableDurations(prev =>
                        prev.includes(duration)
                          ? prev.filter(d => d !== duration)
                          : [...prev, duration].sort((a, b) => a - b)
                      );
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      availableDurations.includes(duration)
                        ? 'bg-cyan-500 text-white shadow-md'
                        : 'bg-white border border-slate-300 text-slate-700 hover:border-cyan-400'
                    }`}
                  >
                    {duration} min
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-700 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Bloqueos de Agenda
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Bloquea horarios para no recibir citas
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Bloqueo
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {(['all', 'single_date', 'recurring'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterType === type
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? 'Todos' : type === 'single_date' ? 'Un día' : 'Recurrente'}
          </button>
        ))}
      </div>

      {/* Lista de bloques */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filteredBlocks.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {filteredBlocks.map((block) => (
              <div key={block.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {block.blockType === 'single_date' ? 'Un día' : 'Recurrente'}
                      </span>
                      {block.reason && (
                        <span className="text-sm text-gray-600">{block.reason}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Fecha</p>
                        <p className="font-medium text-gray-900">
                          {new Date(block.blockDate).toLocaleDateString('es-CL')}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600">Horario</p>
                        <p className="font-medium text-gray-900">
                          {block.startTime} - {block.endTime}
                        </p>
                      </div>

                      {block.blockType === 'recurring' && (
                        <div>
                          <p className="text-gray-600">Se repite</p>
                          <p className="font-medium text-gray-900">
                            {block.recurringPattern && (DAYS_OF_WEEK as any)[block.recurringPattern] || block.recurringPattern}
                            {block.recurringEndDate && ` hasta ${new Date(block.recurringEndDate).toLocaleDateString('es-CL')}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleOpenModal(block)}
                      disabled={isUpdating}
                      className="p-2 text-cyan-600 hover:text-cyan-800 hover:bg-cyan-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(block.id)}
                      disabled={isDeleting}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No hay bloqueos registrados</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleCloseModal}
          />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4 rounded-t-xl flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    {editingBlock ? 'Editar Bloqueo' : 'Nuevo Bloqueo'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* Tipo de bloqueo */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipo de Bloqueo *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, blockType: 'single_date' }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.blockType === 'single_date'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <span className={`text-sm font-medium ${
                          formData.blockType === 'single_date' ? 'text-blue-700' : 'text-slate-600'
                        }`}>
                          Un día
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, blockType: 'recurring' }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.blockType === 'recurring'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-slate-200 hover:border-purple-300'
                        }`}
                      >
                        <span className={`text-sm font-medium ${
                          formData.blockType === 'recurring' ? 'text-purple-700' : 'text-slate-600'
                        }`}>
                          Recurrente
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Fecha */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Fecha {formData.blockType === 'recurring' ? '(inicio de recurrencia)' : ''} *
                    </label>
                    <input
                      type="date"
                      value={formData.blockDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, blockDate: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Hora de inicio */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Hora de inicio *
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Hora de fin */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Hora de fin *
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Patrón de recurrencia */}
                  {formData.blockType === 'recurring' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Se repite cada *
                        </label>
                        <select
                          value={formData.recurringPattern}
                          onChange={(e) => setFormData(prev => ({ ...prev, recurringPattern: e.target.value }))}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        >
                          <option value="monday">Lunes</option>
                          <option value="tuesday">Martes</option>
                          <option value="wednesday">Miércoles</option>
                          <option value="thursday">Jueves</option>
                          <option value="friday">Viernes</option>
                          <option value="saturday">Sábado</option>
                          <option value="sunday">Domingo</option>
                          <option value="daily">Diariamente</option>
                          <option value="weekly">Semanalmente</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Hasta (opcional)
                        </label>
                        <input
                          type="date"
                          value={formData.recurringEndDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, recurringEndDate: e.target.value }))}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Si dejas vacío, se repetirá indefinidamente
                        </p>
                      </div>
                    </>
                  )}

                  {/* Razón */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Razón (opcional)
                    </label>
                    <select
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">Selecciona una razón</option>
                      {Object.entries(BLOCK_REASONS).map(([key, label]) => (
                        <option key={key} value={label}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating || isUpdating}
                      className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isCreating || isUpdating ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        editingBlock ? 'Actualizar' : 'Crear Bloqueo'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        variant={confirmation.variant}
        isLoading={confirmation.isLoading}
        onConfirm={confirmation.onConfirm}
        onCancel={confirmation.onCancel}
      />
    </div>
  );
};

export { ScheduleBlocksTab };
