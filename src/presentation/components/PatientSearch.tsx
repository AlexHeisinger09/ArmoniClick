import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '@/presentation/hooks/patients/usePatients';
import type { Patient } from '@/core/use-cases/patients/get-patients.use-case';

interface PatientSearchProps {
  isMinimized?: boolean;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ isMinimized = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Hook para obtener TODOS los pacientes (sin término de búsqueda)
  const { queryPatients } = usePatients();
  const allPatients = queryPatients.data?.patients || [];

  // Función para normalizar texto (remover tildes/acentos)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD') // Descomponer caracteres con tildes
      .replace(/[\u0300-\u036f]/g, ''); // Remover diacríticos (tildes)
  };

  // Filtrado local de pacientes
  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) {
      return [];
    }

    const normalizedSearch = normalizeText(searchTerm.trim());

    return allPatients.filter(patient => {
      const fullName = normalizeText(`${patient.nombres} ${patient.apellidos}`);
      const rut = patient.rut.toLowerCase();
      const email = normalizeText(patient.email);

      return (
        fullName.includes(normalizedSearch) ||
        rut.includes(normalizedSearch) ||
        email.includes(normalizedSearch)
      );
    });
  }, [allPatients, searchTerm]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePatientClick = (patient: Patient) => {
    // Navegar usando query params como lo hace Patient.tsx
    navigate(`/dashboard/pacientes?id=${patient.id}&view=detail`);
    setSearchTerm('');
    setIsOpen(false);
    setIsFocused(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(value.length > 0);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (searchTerm.length > 0) {
      setIsOpen(true);
    }
  };

  // Calcular edad del paciente
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  return (
    <div className="relative flex-1 max-w-md mx-4" ref={searchRef}>
      {/* Input de búsqueda */}
      <div className={`relative transition-all duration-200 ${
        isFocused ? 'scale-[1.02]' : ''
      }`}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={`text-slate-400 transition-all duration-200 ${
            isMinimized ? 'w-3.5 h-3.5' : 'w-4 h-4'
          }`} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder="Buscar paciente..."
          className={`w-full bg-slate-50 border border-slate-200 rounded-lg transition-all duration-200 text-slate-700 placeholder-slate-400
            ${isMinimized ? 'pl-9 pr-8 py-1.5 text-xs' : 'pl-10 pr-10 py-2 text-sm'}
            ${isFocused ? 'bg-white border-cyan-300 ring-2 ring-cyan-100' : 'hover:bg-white hover:border-slate-300'}
            focus:outline-none focus:bg-white focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100
          `}
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className={`absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors ${
              isMinimized ? 'pr-2' : 'pr-3'
            }`}
          >
            <X className={isMinimized ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && searchTerm.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-[400px] overflow-y-auto animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {queryPatients.isLoading ? (
            <div className="p-4 text-center text-slate-500 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-500 border-t-transparent"></div>
                <span>Buscando...</span>
              </div>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">
              <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>No se encontraron pacientes</p>
              <p className="text-xs text-slate-400 mt-1">Intenta con otro término</p>
            </div>
          ) : (
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-medium text-slate-500 border-b border-slate-100">
                {filteredPatients.length} {filteredPatients.length === 1 ? 'resultado' : 'resultados'}
              </div>
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handlePatientClick(patient)}
                  className="w-full px-4 py-3 hover:bg-cyan-50 transition-colors text-left border-b border-slate-50 last:border-b-0 group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm group-hover:shadow-md transition-shadow">
                        {patient.nombres[0]}{patient.apellidos[0]}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-slate-700 group-hover:text-cyan-700 transition-colors truncate">
                          {patient.nombres} {patient.apellidos}
                        </p>
                        <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                          {calculateAge(patient.fecha_nacimiento)} años
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-500">
                        <span className="truncate">{patient.rut}</span>
                        <span className="text-slate-300">•</span>
                        <span className="truncate">{patient.email}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientSearch;
