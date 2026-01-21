import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/presentation/components/ui/button";
import type { FacialAestheticState, FacialZone, DrawingTool, DrawingState, Point } from './types';
import { FACIAL_ZONE_LABELS as ZONE_LABELS } from './types';

interface FacialAestheticProps {
  onAddItem?: (zone: string, treatment: string, value: string) => void;
  services?: Array<{ id: number; nombre: string; valor: string }>;
}

const FacialAesthetic: React.FC<FacialAestheticProps> = ({ onAddItem, services = [] }) => {
  // Estados para el formulario de tratamiento
  const [selectedTreatment, setSelectedTreatment] = useState('');
  const [customTreatment, setCustomTreatment] = useState('');
  const [treatmentValue, setTreatmentValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [facialState, setFacialState] = useState<FacialAestheticState>({});
  const [selectedZone, setSelectedZone] = useState<FacialZone | null>(null);
  const [svgLoaded, setSvgLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Drawing tools state
  const [currentTool, setCurrentTool] = useState<DrawingTool>('select');
  const [drawingState, setDrawingState] = useState<DrawingState>({ lines: [], arrows: [], points: [] });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<Point | null>(null);
  const [drawEnd, setDrawEnd] = useState<Point | null>(null);
  const [currentColor, setCurrentColor] = useState('#ff0000');
  const svgOverlayRef = useRef<SVGSVGElement>(null);

  // Gender toggle state
  const [isMale, setIsMale] = useState(false);

  // SVG dimensions state for proper viewBox
  const [svgViewBox, setSvgViewBox] = useState('0 0 100 100');

  // Ref to track selected zones for hover events
  const facialStateRef = useRef(facialState);

  // Ref to track iframe dimensions
  const [iframeDimensions, setIframeDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    facialStateRef.current = facialState;
  }, [facialState]);

  // Sync SVG overlay dimensions with iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !svgLoaded) return;

    const updateDimensions = () => {
      // Wait for next frame to ensure iframe is fully rendered
      requestAnimationFrame(() => {
        const rect = iframe.getBoundingClientRect();
        console.log('Iframe dimensions:', rect);
        setIframeDimensions({ width: rect.width, height: rect.height });

        // Also update SVG overlay to match exactly
        if (svgOverlayRef.current) {
          svgOverlayRef.current.style.width = `${rect.width}px`;
          svgOverlayRef.current.style.height = `${rect.height}px`;
          console.log('SVG overlay dimensions updated to:', rect.width, 'x', rect.height);
        }
      });
    };

    // Initial update with delay
    setTimeout(updateDimensions, 100);
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [svgLoaded]);

  const handleZoneClick = (zoneId: string) => {
    console.log('Zone clicked:', zoneId);
    const zone = zoneId as FacialZone;

    setFacialState(prev => ({
      ...prev,
      [zone]: {
        selected: !(prev[zone]?.selected || false),
        notes: prev[zone]?.notes || '',
        color: prev[zone]?.color || '#00a5b3',
      }
    }));

    setSelectedZone(zone);
  };

  const clearSelection = () => {
    setFacialState({});
    setSelectedZone(null);
  };

  const getSelectedZones = () => {
    return Object.entries(facialState)
      .filter(([_, state]) => state.selected)
      .map(([zone]) => zone as FacialZone);
  };

  // Helper function to get coordinates from mouse or touch event
  // Returns coordinates in SVG viewBox coordinate system
  const getCoordinates = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>): Point | null => {
    const svg = svgOverlayRef.current;
    if (!svg) return null;

    let clientX: number;
    let clientY: number;

    if ('touches' in e && e.touches.length > 0) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
      // Touch end event
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if ('clientX' in e) {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return null;
    }

    // Use SVG's built-in coordinate transformation
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;

    // Get the inverse of the screen-to-viewBox transformation matrix
    const svgMatrix = svg.getScreenCTM();
    if (!svgMatrix) {
      console.error('Could not get screen CTM');
      return null;
    }

    const transformedPoint = pt.matrixTransform(svgMatrix.inverse());

    console.log('Click coordinates:', {
      client: { x: clientX, y: clientY },
      svg: { x: transformedPoint.x, y: transformedPoint.y },
      viewBox: svgViewBox
    });

    return {
      x: transformedPoint.x,
      y: transformedPoint.y,
    };
  };

  // Drawing handlers
  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (currentTool === 'select') return;

    // Check if click is on a button or interactive element
    const target = e.target as Element;
    if (target.closest('button') || target.closest('[role="button"]')) {
      return;
    }

    const point = getCoordinates(e);
    if (!point) return;

    if (currentTool === 'point') {
      // Add point immediately
      const newPoint = {
        id: `point-${Date.now()}`,
        position: point,
        color: currentColor,
        radius: 8, // Relative to viewBox (1024x1440)
      };
      setDrawingState(prev => ({
        ...prev,
        points: [...prev.points, newPoint],
      }));
    } else {
      // Start drawing line or arrow
      setIsDrawing(true);
      setDrawStart(point);
    }
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !drawStart) return;

    const point = getCoordinates(e);
    if (!point) return;

    setDrawEnd(point);
  };

  const handleSvgMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !drawStart) return;

    const endPoint = getCoordinates(e);
    if (!endPoint) return;

    if (currentTool === 'line') {
      const newLine = {
        id: `line-${Date.now()}`,
        start: drawStart,
        end: endPoint,
        color: currentColor,
        strokeWidth: 3, // Relative to viewBox (1024x1440)
      };
      setDrawingState(prev => ({
        ...prev,
        lines: [...prev.lines, newLine],
      }));
    } else if (currentTool === 'arrow') {
      const newArrow = {
        id: `arrow-${Date.now()}`,
        start: drawStart,
        end: endPoint,
        color: currentColor,
        strokeWidth: 3, // Relative to viewBox (1024x1440)
      };
      setDrawingState(prev => ({
        ...prev,
        arrows: [...prev.arrows, newArrow],
      }));
    }

    setIsDrawing(false);
    setDrawStart(null);
    setDrawEnd(null);
  };

  // Touch event handlers
  const handleSvgTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (currentTool === 'select') return;

    // Check if touch is on a button or interactive element
    const target = e.target as Element;
    if (target.closest('button') || target.closest('[role="button"]')) {
      return;
    }

    e.preventDefault(); // Prevent scrolling while drawing

    const point = getCoordinates(e);
    if (!point) return;

    if (currentTool === 'point') {
      // Add point immediately
      const newPoint = {
        id: `point-${Date.now()}`,
        position: point,
        color: currentColor,
        radius: 8, // Relative to viewBox (1024x1440)
      };
      setDrawingState(prev => ({
        ...prev,
        points: [...prev.points, newPoint],
      }));
    } else {
      // Start drawing line or arrow
      setIsDrawing(true);
      setDrawStart(point);
    }
  };

  const handleSvgTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    e.preventDefault(); // Prevent scrolling while drawing
    if (!isDrawing || !drawStart) return;

    const point = getCoordinates(e);
    if (!point) return;

    setDrawEnd(point);
  };

  const handleSvgTouchEnd = (e: React.TouchEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (!isDrawing || !drawStart) return;

    const endPoint = getCoordinates(e);
    if (!endPoint) return;

    if (currentTool === 'line') {
      const newLine = {
        id: `line-${Date.now()}`,
        start: drawStart,
        end: endPoint,
        color: currentColor,
        strokeWidth: 3, // Relative to viewBox (1024x1440)
      };
      setDrawingState(prev => ({
        ...prev,
        lines: [...prev.lines, newLine],
      }));
    } else if (currentTool === 'arrow') {
      const newArrow = {
        id: `arrow-${Date.now()}`,
        start: drawStart,
        end: endPoint,
        color: currentColor,
        strokeWidth: 3, // Relative to viewBox (1024x1440)
      };
      setDrawingState(prev => ({
        ...prev,
        arrows: [...prev.arrows, newArrow],
      }));
    }

    setIsDrawing(false);
    setDrawStart(null);
    setDrawEnd(null);
  };

  const clearDrawings = () => {
    setDrawingState({ lines: [], arrows: [], points: [] });
  };

  const deleteLastDrawing = () => {
    setDrawingState(prev => {
      if (prev.points.length > 0) {
        return { ...prev, points: prev.points.slice(0, -1) };
      } else if (prev.arrows.length > 0) {
        return { ...prev, arrows: prev.arrows.slice(0, -1) };
      } else if (prev.lines.length > 0) {
        return { ...prev, lines: prev.lines.slice(0, -1) };
      }
      return prev;
    });
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Reset state when gender changes
    setSvgLoaded(false);
    setFacialState({});
    setSelectedZone(null);

    const handleLoad = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          console.error('No iframe document');
          return;
        }

        // Inject CSS to set initial opacity BEFORE the SVG is visible
        const style = iframeDoc.createElement('style');
        style.textContent = `
          #Mascara > * {
            opacity: 0.01 !important;
          }
        `;
        iframeDoc.head?.appendChild(style);

        const svgElement = iframeDoc.querySelector('svg');
        if (!svgElement) {
          console.error('No SVG element found');
          return;
        }

        console.log('SVG loaded successfully');

        // Get SVG dimensions for proper viewBox
        const viewBox = svgElement.getAttribute('viewBox');
        if (viewBox) {
          setSvgViewBox(viewBox);
          console.log('SVG viewBox set to:', viewBox);
        } else {
          // Fallback: get width and height attributes
          const width = svgElement.getAttribute('width') || '100';
          const height = svgElement.getAttribute('height') || '100';
          const calculatedViewBox = `0 0 ${width} ${height}`;
          setSvgViewBox(calculatedViewBox);
          console.log('SVG viewBox calculated:', calculatedViewBox);
        }

        // Establecer opacidad del grupo Mascara a 1 para que sea visible
        const mascaraGroup = svgElement.querySelector('#Mascara');
        if (mascaraGroup) {
          mascaraGroup.setAttribute('opacity', '1');
          console.log('Mascara group opacity set to 1');
        }

        // Get all zones inside the Mascara group
        const zones = svgElement.querySelectorAll('#Mascara > *');
        console.log('Found zones:', zones.length);

        zones.forEach((zone) => {
          const zoneId = zone.getAttribute('id');
          if (!zoneId) return;

          const element = zone as SVGElement;

          // Set individual attributes (CSS already handles initial opacity)
          element.setAttribute('stroke', 'none');
          element.removeAttribute('filter');
          // Forzar la opacidad inicial directamente en el elemento
          element.setAttribute('opacity', '0.01');
          element.setAttribute('fill-opacity', '0.01');

          element.style.cursor = 'pointer';
          element.style.transition = 'opacity 0.2s ease, fill 0.2s ease';
          element.style.pointerEvents = 'all';

          element.addEventListener('click', (e) => {
            if (currentTool === 'select') {
              e.stopPropagation();
              handleZoneClick(zoneId);
            }
          });

          // Agregar eventos de hover para mejorar la visibilidad
          element.addEventListener('mouseenter', () => {
            if (!facialStateRef.current[zoneId as FacialZone]?.selected) {
              element.setAttribute('opacity', '0.7');
              const childPath = element.querySelector('path, ellipse, circle, rect, polygon');
              if (childPath) {
                (childPath as SVGElement).setAttribute('fill-opacity', '0.7');
              }
            }
          });

          element.addEventListener('mouseleave', () => {
            if (!facialStateRef.current[zoneId as FacialZone]?.selected) {
              element.setAttribute('opacity', '0.01');
              const childPath = element.querySelector('path, ellipse, circle, rect, polygon');
              if (childPath) {
                (childPath as SVGElement).setAttribute('fill-opacity', '0.01');
              }
            }
          });
        });

        // Only mark as loaded AFTER all zones are initialized and a small delay to ensure rendering
        requestAnimationFrame(() => {
          setSvgLoaded(true);
        });
      } catch (error) {
        console.error('Error loading SVG:', error);
      }
    };

    iframe.addEventListener('load', handleLoad);

    // Try immediate load if already loaded
    if (iframe.contentDocument?.readyState === 'complete') {
      handleLoad();
    }

    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [isMale]);

  // Update SVG visual state
  // Efecto separado para inicializar el grupo Mascara (solo una vez)
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !svgLoaded) return;

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      const svgElement = iframeDoc.querySelector('svg');
      if (!svgElement) return;

      // IMPORTANTE: Asegurar que el grupo Mascara sea visible
      const mascaraGroup = svgElement.querySelector('#Mascara');
      if (mascaraGroup) {
        mascaraGroup.setAttribute('opacity', '1');
      }
    } catch (error) {
      console.error('Error initializing SVG:', error);
    }
  }, [svgLoaded]);

  // Efecto optimizado para actualizar solo las zonas seleccionadas (sin hover)
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !svgLoaded) return;

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      const svgElement = iframeDoc.querySelector('svg');
      if (!svgElement) return;

      // Solo actualizar zonas que han cambiado su estado de selección
      const allZones = svgElement.querySelectorAll('#Mascara > *');
      allZones.forEach((zone) => {
        const element = zone as SVGElement;
        const zoneId = zone.getAttribute('id');
        if (!zoneId) return;

        if (facialState[zoneId as FacialZone]?.selected) {
          const color = facialState[zoneId as FacialZone]?.color || '#00a5b3';
          element.setAttribute('opacity', '1');
          element.setAttribute('fill', color);
          element.setAttribute('fill-opacity', '1');
          element.setAttribute('stroke', color);
          element.setAttribute('stroke-width', '4');
          element.setAttribute('filter', `drop-shadow(0 0 8px ${color}80)`);
          // También establecer en style para sobrescribir estilos inline
          // Buscar path, ellipse, circle, rect, etc. dentro del grupo
          let shapeElement = element.querySelector('path, ellipse, circle, rect, polygon');
          // Si no hay hijo, verificar si el elemento mismo es una forma SVG
          if (!shapeElement && (element.tagName === 'path' || element.tagName === 'ellipse' ||
              element.tagName === 'circle' || element.tagName === 'rect' || element.tagName === 'polygon')) {
            shapeElement = element;
          }
          if (shapeElement) {
            (shapeElement as SVGElement).style.fillOpacity = '1';
            (shapeElement as SVGElement).style.fill = color;
          }
        } else {
          element.setAttribute('opacity', '0.01');
          element.setAttribute('fill-opacity', '0.01');
          element.setAttribute('stroke', 'none');
          element.removeAttribute('filter');
          // Restaurar opacidad original en la forma
          let shapeElement = element.querySelector('path, ellipse, circle, rect, polygon');
          // Si no hay hijo, verificar si el elemento mismo es una forma SVG
          if (!shapeElement && (element.tagName === 'path' || element.tagName === 'ellipse' ||
              element.tagName === 'circle' || element.tagName === 'rect' || element.tagName === 'polygon')) {
            shapeElement = element;
          }
          if (shapeElement) {
            (shapeElement as SVGElement).style.fillOpacity = '0.01';
          }
        }
      });
    } catch (error) {
      console.error('Error updating SVG:', error);
    }
  }, [facialState, svgLoaded]);

  // Efecto para hover usando CSS en lugar de manipulación DOM
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !svgLoaded) return;

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      // Inyectar estilos CSS para hover en lugar de manipular DOM
      let styleElement = iframeDoc.getElementById('hover-styles') as HTMLStyleElement;
      if (!styleElement) {
        styleElement = iframeDoc.createElement('style');
        styleElement.id = 'hover-styles';
        iframeDoc.head?.appendChild(styleElement);
      }

      // Generar CSS para hover sin afectar elementos seleccionados
      const selectedZoneIds = Object.keys(facialState).filter(
        (zoneId) => facialState[zoneId as FacialZone]?.selected
      );

      const hoverRules = `
        #Mascara > * {
          transition: all 0.2s ease !important;
        }
        #Mascara > g:hover {
          opacity: 0.7 !important;
          stroke: #00a5b3 !important;
          stroke-width: 2 !important;
          filter: drop-shadow(0 0 8px rgba(0,165,179,0.8)) !important;
        }
        #Mascara > g:hover > path {
          fill: #00a5b3 !important;
          fill-opacity: 0.7 !important;
          stroke: #00a5b3 !important;
          stroke-width: 2 !important;
        }
        #Mascara > g:hover > ellipse,
        #Mascara > g:hover > circle,
        #Mascara > g:hover > rect,
        #Mascara > g:hover > polygon {
          fill: #00a5b3 !important;
          fill-opacity: 0.7 !important;
          stroke: #00a5b3 !important;
          stroke-width: 2 !important;
        }
        ${selectedZoneIds.map((id) => `
          #${id}:hover {
            opacity: 1 !important;
          }
          #${id}:hover > path,
          #${id}:hover > ellipse,
          #${id}:hover > circle,
          #${id}:hover > rect,
          #${id}:hover > polygon {
            fill-opacity: 1 !important;
          }
        `).join('\n')}
      `;

      styleElement.textContent = hoverRules;
      console.log('Hover styles injected. Selected zones:', selectedZoneIds.length);
    } catch (error) {
      console.error('Error setting hover styles:', error);
    }
  }, [facialState, svgLoaded, currentTool]);

  const selectedZones = getSelectedZones();

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex justify-end items-center mb-3">
          <Button
            onClick={clearSelection}
            size="sm"
            disabled={selectedZones.length === 0}
            className="bg-cyan-500 hover:bg-cyan-600 text-white disabled:bg-slate-300 disabled:text-slate-500 font-medium"
          >
            Limpiar Selección
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* SVG Container */}
          <div className="lg:col-span-2">
            <div className="border rounded-lg p-3 bg-gray-50 overflow-auto">
              <div className="flex justify-center items-center min-h-[500px] relative" style={{ pointerEvents: 'none' }}>
                {/* Floating Toolbar - Responsive: Top on mobile, Left on desktop */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 md:left-2 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 flex flex-row md:flex-col gap-1 md:gap-2 bg-white rounded-lg shadow-lg border border-slate-200 p-1.5 md:p-2" style={{ pointerEvents: 'auto', zIndex: 50 }}>
                  {/* Select Tool */}
                  <Button
                    onClick={() => setCurrentTool('select')}
                    size="icon"
                    className={`w-9 h-9 md:w-12 md:h-12 transition-all ${currentTool === 'select' ? 'bg-cyan-500 hover:bg-cyan-600 text-white ring-2 ring-cyan-500' : 'bg-slate-100 border-2 border-slate-300 text-slate-700 hover:bg-cyan-100 hover:border-cyan-400'}`}
                    title="Seleccionar zonas"
                  >
                    <span className="text-base md:text-xl">✋</span>
                  </Button>

                  <div className="w-px md:w-auto md:h-px bg-slate-200 mx-0.5 md:mx-0 md:my-1" />

                  {/* Line Tool */}
                  <Button
                    onClick={() => setCurrentTool('line')}
                    size="icon"
                    className={`w-9 h-9 md:w-12 md:h-12 transition-all ${currentTool === 'line' ? 'bg-cyan-500 hover:bg-cyan-600 text-white ring-2 ring-cyan-500' : 'bg-slate-100 border-2 border-slate-300 text-slate-700 hover:bg-cyan-100 hover:border-cyan-400'}`}
                    title="Dibujar línea"
                  >
                    <span className="text-base md:text-xl">─</span>
                  </Button>

                  {/* Arrow Tool */}
                  <Button
                    onClick={() => setCurrentTool('arrow')}
                    size="icon"
                    className={`w-9 h-9 md:w-12 md:h-12 transition-all ${currentTool === 'arrow' ? 'bg-cyan-500 hover:bg-cyan-600 text-white ring-2 ring-cyan-500' : 'bg-slate-100 border-2 border-slate-300 text-slate-700 hover:bg-cyan-100 hover:border-cyan-400'}`}
                    title="Dibujar flecha"
                  >
                    <span className="text-base md:text-xl">→</span>
                  </Button>

                  {/* Point Tool */}
                  <Button
                    onClick={() => setCurrentTool('point')}
                    size="icon"
                    className={`w-9 h-9 md:w-12 md:h-12 transition-all ${currentTool === 'point' ? 'bg-cyan-500 hover:bg-cyan-600 text-white ring-2 ring-cyan-500' : 'bg-slate-100 border-2 border-slate-300 text-slate-700 hover:bg-cyan-100 hover:border-cyan-400'}`}
                    title="Agregar punto"
                  >
                    <span className="text-base md:text-xl">●</span>
                  </Button>

                  <div className="w-px md:w-auto md:h-px bg-slate-200 mx-0.5 md:mx-0 md:my-1" />

                  {/* Color Picker */}
                  <div className="relative group">
                    <input
                      type="color"
                      value={currentColor}
                      onChange={(e) => setCurrentColor(e.target.value)}
                      className="w-9 h-9 md:w-12 md:h-12 rounded cursor-pointer border-2 border-slate-300 hover:border-cyan-400"
                      title="Seleccionar color"
                    />
                  </div>

                  <div className="w-px md:w-auto md:h-px bg-slate-200 mx-0.5 md:mx-0 md:my-1" />

                  {/* Undo */}
                  <Button
                    onClick={deleteLastDrawing}
                    size="icon"
                    disabled={drawingState.lines.length === 0 && drawingState.arrows.length === 0 && drawingState.points.length === 0}
                    title="Deshacer último dibujo"
                    className="w-9 h-9 md:w-12 md:h-12 bg-slate-100 border-2 border-slate-300 text-slate-700 hover:bg-cyan-100 hover:border-cyan-400 disabled:opacity-50 disabled:bg-slate-50 disabled:hover:bg-slate-50"
                  >
                    <span className="text-base md:text-xl">↶</span>
                  </Button>

                  {/* Clear All */}
                  <Button
                    onClick={clearDrawings}
                    size="icon"
                    disabled={drawingState.lines.length === 0 && drawingState.arrows.length === 0 && drawingState.points.length === 0}
                    title="Borrar todos los dibujos"
                    className="w-9 h-9 md:w-12 md:h-12 bg-red-100 border-2 border-red-300 text-red-700 hover:bg-red-200 hover:border-red-400 disabled:opacity-50 disabled:bg-slate-50 disabled:hover:bg-slate-50"
                  >
                    <span className="text-base md:text-xl">🗑️</span>
                  </Button>
                </div>

                <div className="relative" style={{ maxWidth: '800px', width: '100%', pointerEvents: 'auto' }}>
                  {/* Gender Toggle Button */}
                  <Button
                    onClick={() => setIsMale(!isMale)}
                    size="icon"
                    className="absolute bottom-2 right-2 w-12 h-12 bg-slate-100 hover:bg-cyan-100 text-slate-700 shadow-lg border-2 border-slate-300 hover:border-cyan-400"
                    style={{ zIndex: 50, pointerEvents: 'auto' }}
                    title={isMale ? "Cambiar a ficha femenina" : "Cambiar a ficha masculina"}
                  >
                    <span className="text-2xl">{isMale ? '♀' : '♂'}</span>
                  </Button>

                  <iframe
                    key={isMale ? 'male' : 'female'}
                    ref={iframeRef}
                    src={isMale ? "/Ficha_estetica_men.svg" : "/Ficha_estetica.svg"}
                    className="w-full border-0"
                    title="Ficha Estética Facial"
                    style={{
                      height: iframeDimensions.height > 0 ? `${iframeDimensions.height}px` : 'auto',
                      minHeight: '500px',
                      backgroundColor: 'transparent',
                      pointerEvents: 'auto',
                      visibility: svgLoaded ? 'visible' : 'hidden',
                      opacity: svgLoaded ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                      display: 'block'
                    }}
                  />
                  {/* SVG Overlay for drawings */}
                  <svg
                    ref={svgOverlayRef}
                    className="absolute top-0 left-0"
                    viewBox={svgViewBox}
                    preserveAspectRatio="xMidYMid meet"
                    style={{
                      width: '100%',
                      height: '100%',
                      cursor: currentTool === 'select' ? 'default' : 'crosshair',
                      pointerEvents: currentTool === 'select' ? 'none' : 'auto',
                      touchAction: 'none', // Prevent default touch behaviors
                      zIndex: currentTool === 'select' ? 0 : 10,
                      // Ensure buttons are not blocked
                      maskImage: 'none'
                    }}
                    onMouseDown={handleSvgMouseDown}
                    onMouseMove={handleSvgMouseMove}
                    onMouseUp={handleSvgMouseUp}
                    onTouchStart={handleSvgTouchStart}
                    onTouchMove={handleSvgTouchMove}
                    onTouchEnd={handleSvgTouchEnd}
                  >
                    {/* Render lines */}
                    {drawingState.lines.map(line => (
                      <line
                        key={line.id}
                        x1={line.start.x}
                        y1={line.start.y}
                        x2={line.end.x}
                        y2={line.end.y}
                        stroke={line.color}
                        strokeWidth={line.strokeWidth}
                        strokeLinecap="round"
                        pointerEvents="none"
                      />
                    ))}

                    {/* Render arrows */}
                    {drawingState.arrows.map(arrow => {
                      const angle = Math.atan2(arrow.end.y - arrow.start.y, arrow.end.x - arrow.start.x);
                      const arrowSize = 20; // Relative to viewBox (1024x1440)
                      return (
                        <g key={arrow.id} pointerEvents="none">
                          <line
                            x1={arrow.start.x}
                            y1={arrow.start.y}
                            x2={arrow.end.x}
                            y2={arrow.end.y}
                            stroke={arrow.color}
                            strokeWidth={arrow.strokeWidth}
                            strokeLinecap="round"
                          />
                          <polygon
                            points={`
                              ${arrow.end.x},${arrow.end.y}
                              ${arrow.end.x - arrowSize * Math.cos(angle - Math.PI / 6)},${arrow.end.y - arrowSize * Math.sin(angle - Math.PI / 6)}
                              ${arrow.end.x - arrowSize * Math.cos(angle + Math.PI / 6)},${arrow.end.y - arrowSize * Math.sin(angle + Math.PI / 6)}
                            `}
                            fill={arrow.color}
                          />
                        </g>
                      );
                    })}

                    {/* Render points */}
                    {drawingState.points.map(point => (
                      <circle
                        key={point.id}
                        cx={point.position.x}
                        cy={point.position.y}
                        r={point.radius}
                        fill={point.color}
                        stroke="white"
                        strokeWidth="2"
                        pointerEvents="none"
                      />
                    ))}

                    {/* Preview while drawing */}
                    {isDrawing && drawStart && drawEnd && (
                      <>
                        {currentTool === 'line' && (
                          <line
                            x1={drawStart.x}
                            y1={drawStart.y}
                            x2={drawEnd.x}
                            y2={drawEnd.y}
                            stroke={currentColor}
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeDasharray="10,10"
                            opacity={0.7}
                            pointerEvents="none"
                          />
                        )}
                        {currentTool === 'arrow' && (
                          <g opacity={0.7} pointerEvents="none">
                            <line
                              x1={drawStart.x}
                              y1={drawStart.y}
                              x2={drawEnd.x}
                              y2={drawEnd.y}
                              stroke={currentColor}
                              strokeWidth={3}
                              strokeLinecap="round"
                              strokeDasharray="10,10"
                            />
                            {(() => {
                              const angle = Math.atan2(drawEnd.y - drawStart.y, drawEnd.x - drawStart.x);
                              const arrowSize = 20;
                              return (
                                <polygon
                                  points={`
                                    ${drawEnd.x},${drawEnd.y}
                                    ${drawEnd.x - arrowSize * Math.cos(angle - Math.PI / 6)},${drawEnd.y - arrowSize * Math.sin(angle - Math.PI / 6)}
                                    ${drawEnd.x - arrowSize * Math.cos(angle + Math.PI / 6)},${drawEnd.y - arrowSize * Math.sin(angle + Math.PI / 6)}
                                  `}
                                  fill={currentColor}
                                />
                              );
                            })()}
                          </g>
                        )}
                      </>
                    )}
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Information Panel */}
          <div className="space-y-3">
            {/* Zonas Input */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
              <label className="text-sm font-semibold mb-2 text-slate-700 block">Zonas</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Selecciona zonas faciales..."
                value={selectedZones.map(zone => ZONE_LABELS[zone]).join(', ')}
                readOnly
              />
              <p className="text-xs text-slate-400 mt-1">
                Activa "Modo Selección" y haz clic en las zonas del rostro
              </p>
            </div>

            {/* Treatment Section */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
              <label className="text-sm font-semibold mb-2 text-slate-700 block">Tratamiento</label>
              <select
                className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                value={selectedTreatment}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedTreatment(value);
                  if (value === 'custom') {
                    setShowCustomInput(true);
                    setTreatmentValue('');
                  } else if (value) {
                    setShowCustomInput(false);
                    const service = services.find(s => s.id.toString() === value);
                    if (service) {
                      setTreatmentValue(service.valor);
                    }
                  } else {
                    setShowCustomInput(false);
                    setTreatmentValue('');
                  }
                }}
              >
                <option value="">Seleccionar servicio...</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.nombre}
                  </option>
                ))}
                <option value="custom">✍️ Escribir tratamiento personalizado</option>
              </select>

              {showCustomInput && (
                <input
                  type="text"
                  className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 mt-2"
                  placeholder="Escribe el nombre del tratamiento..."
                  value={customTreatment}
                  onChange={(e) => setCustomTreatment(e.target.value)}
                />
              )}
            </div>

            {/* Value Section */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
              <label className="text-sm font-semibold mb-2 text-slate-700 block">Valor</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="25.000"
                value={treatmentValue}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setTreatmentValue(value);
                }}
              />
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
              <label className="text-sm font-semibold mb-2 text-slate-700 block">Notas</label>
              <textarea
                className="w-full min-h-[80px] p-2 border rounded-md text-xs focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
                placeholder="Escribe observaciones o notas generales sobre las zonas seleccionadas..."
                value={selectedZones.length > 0 ? (facialState[selectedZones[0]]?.notes || '') : ''}
                onChange={(e) => {
                  if (selectedZones.length > 0) {
                    const updatedState = { ...facialState };
                    selectedZones.forEach(zone => {
                      updatedState[zone] = {
                        ...updatedState[zone],
                        selected: true,
                        notes: e.target.value,
                      };
                    });
                    setFacialState(updatedState);
                  }
                }}
                disabled={selectedZones.length === 0}
              />
            </div>

            {/* Add Button */}
            <Button
              onClick={() => {
                if (onAddItem && selectedZones.length > 0 && (selectedTreatment || customTreatment) && treatmentValue) {
                  const zones = selectedZones.map(zone => ZONE_LABELS[zone]).join(', ');
                  const treatment = showCustomInput ? customTreatment :
                    services.find(s => s.id.toString() === selectedTreatment)?.nombre || '';
                  onAddItem(zones, treatment, treatmentValue);

                  // Limpiar formulario
                  setSelectedTreatment('');
                  setCustomTreatment('');
                  setTreatmentValue('');
                  setShowCustomInput(false);
                  clearSelection();
                }
              }}
              disabled={selectedZones.length === 0 || (!selectedTreatment && !customTreatment) || !treatmentValue}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white disabled:bg-slate-300 disabled:cursor-not-allowed text-sm font-medium py-2.5 rounded-lg"
            >
              + Agregar Tratamiento
            </Button>

            {/* Hidden fields for form submission */}
            <input
              type="hidden"
              name="facialAestheticData"
              value={JSON.stringify(facialState)}
            />
            <input
              type="hidden"
              name="facialDrawingsData"
              value={JSON.stringify(drawingState)}
            />
          </div>
        </div>

        {!svgLoaded && (
          <div className="text-center text-xs text-slate-500 mt-3">
            Cargando ficha estética...
          </div>
        )}
      </div>
    </div>
  );
};

export default FacialAesthetic;
