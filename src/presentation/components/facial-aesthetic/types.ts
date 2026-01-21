// Types for Facial Aesthetic component

export type FacialZone =
  | 'cuello'
  | 'Ojera-2'
  | 'Ojera-1'
  | 'Boca-2'
  | 'boca-1'
  | 'Frente-1'
  | 'frente-2'
  | 'Cuello-izq'
  | 'Cuello-der'
  | 'Cuello-centro'
  | 'Rectangulo-izq'
  | 'Rectangulo-der'
  | 'menton'
  | 'elipse-der-1'
  | 'elipse-izq-1'
  | 'elipse-der-2'
  | 'elipse-izq-2'
  | 'elipse-der-2-'
  | 'elipse-izq-2-'
  | 'nariz'
  | 'Labios';

export interface FacialZoneState {
  selected: boolean;
  notes?: string;
  color?: string;
}

export type FacialAestheticState = {
  [key in FacialZone]?: FacialZoneState;
};

export const FACIAL_ZONE_LABELS: Record<FacialZone, string> = {
  'cuello': 'Cuello',
  'Ojera-2': 'Ojera Derecha',
  'Ojera-1': 'Ojera Izquierda',
  'Boca-2': 'Boca Derecha',
  'boca-1': 'Boca Izquierda',
  'Frente-1': 'Frente Superior',
  'frente-2': 'Frente Inferior',
  'Cuello-izq': 'Cuello Izquierdo',
  'Cuello-der': 'Cuello Derecho',
  'Cuello-centro': 'Cuello Centro',
  'Rectangulo-izq': 'Mejilla Izquierda',
  'Rectangulo-der': 'Mejilla Derecha',
  'menton': 'Mentón',
  'elipse-der-1': 'Zona Temporal Derecha',
  'elipse-izq-1': 'Zona Temporal Izquierda',
  'elipse-der-2': 'Pómulo Derecho',
  'elipse-izq-2': 'Pómulo Izquierdo',
  'elipse-der-2-': 'Pómulo Derecho Inferior',
  'elipse-izq-2-': 'Pómulo Izquierdo Inferior',
  'nariz': 'Nariz',
  'Labios': 'Labios',
};

// Drawing tool types
export type DrawingTool = 'select' | 'line' | 'arrow' | 'point';

export interface Point {
  x: number;
  y: number;
}

export interface DrawingLine {
  id: string;
  start: Point;
  end: Point;
  color: string;
  strokeWidth: number;
}

export interface DrawingArrow {
  id: string;
  start: Point;
  end: Point;
  color: string;
  strokeWidth: number;
}

export interface DrawingPoint {
  id: string;
  position: Point;
  color: string;
  radius: number;
}

export interface DrawingState {
  lines: DrawingLine[];
  arrows: DrawingArrow[];
  points: DrawingPoint[];
}
