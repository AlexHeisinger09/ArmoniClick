import React, { useState, useCallback } from 'react';
import FacialAesthetic from './FacialAesthetic';
import type { FacialAestheticState, DrawingState } from './types';

interface FacialAestheticWrapperProps {
  onDataChange?: (data: { facialData: FacialAestheticState; drawingsData: DrawingState; gender: 'female' | 'male' }) => void;
}

/**
 * Wrapper para el componente FacialAesthetic que expone los datos
 * hacia el componente padre sin usar campos hidden
 */
const FacialAestheticWrapper: React.FC<FacialAestheticWrapperProps> = ({ onDataChange }) => {
  // Este componente podría capturar los cambios y notificar al padre
  // Por ahora, simplemente renderiza el componente
  return <FacialAesthetic />;
};

export { FacialAestheticWrapper };
