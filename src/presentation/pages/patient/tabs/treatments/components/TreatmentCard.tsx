// src/presentation/pages/patient/tabs/treatments/components/TreatmentCard.tsx
import React from 'react';
import { Calendar, Clock, Camera, Eye, Edit, Trash2 } from 'lucide-react';
import { TreatmentCardProps } from '../shared/types';

const TreatmentCard: React.FC<TreatmentCardProps> = ({
  treatment,
  onView,
  onEdit,
  onDelete,
  isLoadingDelete = false
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  const formatTime = (timeString: string): string => {
    return timeString.slice(0, 5);
  };

  return (
    <div 
      className="border border-cyan-200 rounded-lg p-4 hover:bg-cyan-50 transition-colors cursor-pointer"
      onClick={() => onView(treatment)}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-slate-700 text-lg">
          {treatment.nombre_servicio}
        </h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(treatment);
            }}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(treatment);
            }}
            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(treatment.id_tratamiento);
            }}
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
            title="Eliminar"
            disabled={isLoadingDelete}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {treatment.descripcion && (
        <p className="text-slate-500 mb-3 text-sm">
          {treatment.descripcion.length > 100 
            ? `${treatment.descripcion.substring(0, 100)}...` 
            : treatment.descripcion
          }
        </p>
      )}
      
      <div className="flex items-center text-sm text-slate-500">
        <Calendar className="w-4 h-4 mr-2" />
        Control: {formatDate(treatment.fecha_control)} a las {formatTime(treatment.hora_control)}
        {treatment.fecha_proximo_control && (
          <span className="ml-4 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Próximo: {formatDate(treatment.fecha_proximo_control)}
            {treatment.hora_proximo_control && ` a las ${formatTime(treatment.hora_proximo_control)}`}
          </span>
        )}
      </div>

      {(treatment.foto1 || treatment.foto2) && (
        <div className="flex items-center mt-2 text-sm text-purple-600">
          <Camera className="w-4 h-4 mr-1" />
          Incluye fotografías
        </div>
      )}
    </div>
  );
};

export { TreatmentCard };