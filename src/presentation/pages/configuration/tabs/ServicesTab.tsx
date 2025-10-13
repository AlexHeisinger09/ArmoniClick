// src/presentation/pages/configuration/tabs/ServicesTab.tsx
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Stethoscope, Sparkles, Search, Filter } from 'lucide-react';
import { useServices } from '@/presentation/hooks/services/useServices';
import { Service } from '@/core/use-cases/services';

interface ServicesTabProps {
  showMessage: (message: string, type: 'success' | 'error') => void;
}

const ServicesTab: React.FC<ServicesTabProps> = ({ showMessage }) => {
  const { 
    services, 
    isLoading, 
    createService, 
    updateService, 
    deleteService,
    isCreating,
    isUpdating,
    isDeleting 
  } = useServices();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'odontologico' | 'estetica'>('all');

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'odontologico' as 'odontologico' | 'estetica',
    valor: ''
  });

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        nombre: service.nombre,
        tipo: service.tipo,
        valor: formatCurrency(parseFloat(service.valor))
      });
    } else {
      setEditingService(null);
      setFormData({
        nombre: '',
        tipo: 'odontologico',
        valor: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({
      nombre: '',
      tipo: 'odontologico',
      valor: ''
    });
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('es-CL');
  };

  const parseCurrency = (value: string): string => {
    return value.replace(/\./g, '');
  };

  const handleValueChange = (value: string) => {
    const cleanValue = value.replace(/[^\d]/g, '');
    const formatted = cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    setFormData(prev => ({ ...prev, valor: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.valor) {
      showMessage('Por favor completa todos los campos', 'error');
      return;
    }

    const valorNum = parseFloat(parseCurrency(formData.valor));
    if (isNaN(valorNum) || valorNum <= 0) {
      showMessage('El valor debe ser un número válido mayor a 0', 'error');
      return;
    }

    try {
      if (editingService) {
        await updateService({
          serviceId: editingService.id,
          serviceData: {
            ...formData,
            valor: parseCurrency(formData.valor)
          }
        });
        showMessage('Servicio actualizado exitosamente', 'success');
      } else {
        await createService({
          ...formData,
          valor: parseCurrency(formData.valor)
        });
        showMessage('Servicio creado exitosamente', 'success');
      }
      handleCloseModal();
    } catch (error: any) {
      showMessage(error.message || 'Error al guardar el servicio', 'error');
    }
  };

  const handleDelete = async (serviceId: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este servicio?')) {
      return;
    }

    try {
      await deleteService(serviceId);
      showMessage('Servicio eliminado exitosamente', 'success');
    } catch (error: any) {
      showMessage(error.message || 'Error al eliminar el servicio', 'error');
    }
  };

  // Filtrado de servicios
  const filteredServices = services.filter(service => {
    const matchesSearch = service.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || service.tipo === filterType;
    return matchesSearch && matchesFilter;
  });

  // Estadísticas
  const stats = {
    total: services.length,
    odontologico: services.filter(s => s.tipo === 'odontologico').length,
    estetica: services.filter(s => s.tipo === 'estetica').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-700">
            Mantenedor de Servicios
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Gestiona los servicios y prestaciones disponibles
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Servicio
        </button>
      </div>
      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar servicios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400 w-5 h-5" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="odontologico">Odontológicos</option>
            <option value="estetica">Estéticos</option>
          </select>
        </div>
      </div>

      {/* Lista de servicios */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filteredServices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Servicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-3 ${
                          service.tipo === 'odontologico' 
                            ? 'bg-blue-100' 
                            : 'bg-purple-100'
                        }`}>
                          {service.tipo === 'odontologico' ? (
                            <Stethoscope className={`w-4 h-4 ${
                              service.tipo === 'odontologico' 
                                ? 'text-blue-600' 
                                : 'text-purple-600'
                            }`} />
                          ) : (
                            <Sparkles className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                        <span className="font-medium text-slate-700">
                          {service.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.tipo === 'odontologico'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {service.tipo === 'odontologico' ? 'Odontológico' : 'Estético'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-green-600">
                        ${formatCurrency(parseFloat(service.valor))}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(service)}
                          disabled={isUpdating}
                          className="p-2 text-cyan-600 hover:text-cyan-800 hover:bg-cyan-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          disabled={isDeleting}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <Stethoscope className="w-16 h-16 mx-auto text-slate-300" />
            </div>
            <p className="text-slate-500 mb-4">
              {searchTerm || filterType !== 'all' 
                ? 'No se encontraron servicios con los filtros aplicados'
                : 'No hay servicios registrados'
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Servicio
              </button>
            )}
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
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4 rounded-t-xl">
                  <h3 className="text-lg font-semibold text-white">
                    {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
                  </h3>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nombre del Servicio *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Ej: Limpieza dental"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipo de Servicio *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tipo: 'odontologico' }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.tipo === 'odontologico'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <Stethoscope className={`w-5 h-5 mx-auto mb-1 ${
                          formData.tipo === 'odontologico' ? 'text-blue-600' : 'text-slate-400'
                        }`} />
                        <span className={`text-xs font-medium ${
                          formData.tipo === 'odontologico' ? 'text-blue-700' : 'text-slate-600'
                        }`}>
                          Odontológico
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tipo: 'estetica' }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.tipo === 'estetica'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-slate-200 hover:border-purple-300'
                        }`}
                      >
                        <Sparkles className={`w-5 h-5 mx-auto mb-1 ${
                          formData.tipo === 'estetica' ? 'text-purple-600' : 'text-slate-400'
                        }`} />
                        <span className={`text-xs font-medium ${
                          formData.tipo === 'estetica' ? 'text-purple-700' : 'text-slate-600'
                        }`}>
                          Estético
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Valor */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Valor del Servicio *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                        $
                      </span>
                      <input
                        type="text"
                        value={formData.valor}
                        onChange={(e) => handleValueChange(e.target.value)}
                        placeholder="25.000"
                        className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Ingresa el valor sin puntos ni comas
                    </p>
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
                      className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating || isUpdating ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Guardando...
                        </span>
                      ) : (
                        editingService ? 'Actualizar' : 'Crear Servicio'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export { ServicesTab };