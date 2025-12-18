// src/presentation/pages/configuration/tabs/LocationsTab.tsx
import { useState } from "react";
import { MapPin, Plus, Edit2, Trash2, Building2, X, Check, AlertCircle } from "lucide-react";
import { useLocations } from "@/presentation/hooks/locations";
import type { Location } from "@/core/entities/location.entity";
import type { CreateLocationDto, UpdateLocationDto } from "@/core/use-cases/locations";

interface LocationsTabProps {
  showMessage: (message: string, type: "success" | "error") => void;
}

export const LocationsTab: React.FC<LocationsTabProps> = ({ showMessage }) => {
  const {
    locations,
    isLoading,
    createLocationMutation,
    updateLocationMutation,
    deleteLocationMutation,
  } = useLocations();

  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);

  const [formData, setFormData] = useState<CreateLocationDto>({
    name: "",
    address: "",
    city: "",
    is_active: true,
  });

  const handleOpenModal = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        address: location.address,
        city: location.city,
        is_active: location.is_active,
      });
    } else {
      setEditingLocation(null);
      setFormData({
        name: "",
        address: "",
        city: "",
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLocation(null);
    setFormData({
      name: "",
      address: "",
      city: "",
      is_active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.address.trim() || !formData.city.trim()) {
      showMessage("Por favor completa todos los campos obligatorios", "error");
      return;
    }

    try {
      if (editingLocation) {
        const updateData: UpdateLocationDto = {
          name: formData.name.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          is_active: formData.is_active,
        };
        await updateLocationMutation.mutateAsync({
          locationId: editingLocation.id,
          locationData: updateData,
        });
        showMessage("Ubicación actualizada correctamente", "success");
      } else {
        await createLocationMutation.mutateAsync({
          name: formData.name.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          is_active: formData.is_active,
        });
        showMessage("Ubicación creada correctamente", "success");
      }
      handleCloseModal();
    } catch (error: any) {
      showMessage(error.message || "Error al guardar la ubicación", "error");
    }
  };

  const handleDeleteClick = (location: Location) => {
    setLocationToDelete(location);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!locationToDelete) return;

    try {
      await deleteLocationMutation.mutateAsync(locationToDelete.id);
      showMessage("Ubicación eliminada correctamente", "success");
      setShowDeleteConfirm(false);
      setLocationToDelete(null);
    } catch (error: any) {
      showMessage(error.message || "Error al eliminar la ubicación", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Cargando ubicaciones...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de agregar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-cyan-500" />
          <div>
            <h3 className="text-lg font-semibold text-slate-700">
              Ubicaciones de Atención
            </h3>
            <p className="text-sm text-slate-500">
              Administra las sucursales donde atiendes a tus pacientes
            </p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Agregar Ubicación</span>
        </button>
      </div>

      {/* Lista de ubicaciones */}
      {!locations || locations.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No hay ubicaciones registradas</p>
          <button
            onClick={() => handleOpenModal()}
            className="text-cyan-500 hover:text-cyan-600 font-medium"
          >
            Agregar primera ubicación
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {locations.map((location) => (
            <div
              key={location.id}
              className="bg-white border border-slate-200 rounded-lg p-3 hover:border-cyan-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <MapPin className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-700 text-sm truncate">
                      {location.name}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">
                      {location.address}, {location.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      location.is_active
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {location.is_active ? "Activa" : "Inactiva"}
                  </span>
                  <button
                    onClick={() => handleOpenModal(location)}
                    className="p-1.5 text-slate-400 hover:text-cyan-500 hover:bg-cyan-50 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(location)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700">
                {editingLocation ? "Editar Ubicación" : "Nueva Ubicación"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Ej: Consulta Centro"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dirección <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Ej: Av. Principal 123"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ciudad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Ej: Santiago"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-cyan-500 border-slate-300 rounded focus:ring-cyan-500"
                />
                <label htmlFor="is_active" className="text-sm text-slate-700">
                  Ubicación activa
                </label>
              </div>

              {/* Footer */}
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    createLocationMutation.isPending ||
                    updateLocationMutation.isPending
                  }
                  className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createLocationMutation.isPending ||
                  updateLocationMutation.isPending
                    ? "Guardando..."
                    : editingLocation
                    ? "Actualizar"
                    : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && locationToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-700">
                  Eliminar Ubicación
                </h3>
                <p className="text-sm text-slate-500">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>

            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar la ubicación{" "}
              <span className="font-semibold">{locationToDelete.name}</span>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setLocationToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLocationMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLocationMutation.isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
