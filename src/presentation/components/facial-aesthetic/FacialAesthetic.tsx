import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/presentation/components/ui/card/card";
import { Button } from "@/presentation/components/ui/button/button";
import type { FacialAestheticState, FacialZone, DrawingTool, DrawingState, Point } from './types';
import { FACIAL_ZONE_LABELS as ZONE_LABELS } from './types';

const FacialAesthetic: React.FC = () => {
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

  useEffect(() => {
    facialStateRef.current = facialState;
  }, [facialState]);

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

    const rect = svg.getBoundingClientRect();
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

    // Get viewBox dimensions
    const viewBoxParts = svgViewBox.split(' ');
    const viewBoxWidth = parseFloat(viewBoxParts[2]) || 100;
    const viewBoxHeight = parseFloat(viewBoxParts[3]) || 100;

    // Convert screen coordinates to SVG viewBox coordinates
    const svgX = ((clientX - rect.left) / rect.width) * viewBoxWidth;
    const svgY = ((clientY - rect.top) / rect.height) * viewBoxHeight;

    return {
      x: svgX,
      y: svgY,
    };
  };

  // Drawing handlers
  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (currentTool === 'select') return;

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
    e.preventDefault(); // Prevent scrolling while drawing
    if (currentTool === 'select') return;

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
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold"></h2>
          <div className="flex gap-2">
            <Button
              onClick={clearSelection}
              variant="outline"
              disabled={selectedZones.length === 0}
            >
              Limpiar Selección
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SVG Container */}
          <div className="lg:col-span-2">
            <div className="border rounded-lg p-4 bg-white overflow-auto">
              <div className="flex justify-center items-center min-h-[600px] relative" style={{ pointerEvents: 'none' }}>
                {/* Floating Toolbar - Responsive: Top on mobile, Left on desktop */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 md:left-2 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 z-10 flex flex-row md:flex-col gap-1 md:gap-2 bg-white rounded-lg shadow-lg border border-slate-200 p-1.5 md:p-2" style={{ pointerEvents: 'auto' }}>
                  {/* Select Tool */}
                  <Button
                    onClick={() => setCurrentTool('select')}
                    variant={currentTool === 'select' ? 'default' : 'outline'}
                    size="icon"
                    className={`w-9 h-9 md:w-12 md:h-12 transition-all ${currentTool === 'select' ? 'ring-2 ring-blue-500' : ''}`}
                    title="Seleccionar zonas"
                  >
                    <span className="text-base md:text-xl">✋</span>
                  </Button>

                  <div className="w-px md:w-auto md:h-px bg-slate-200 mx-0.5 md:mx-0 md:my-1" />

                  {/* Line Tool */}
                  <Button
                    onClick={() => setCurrentTool('line')}
                    variant={currentTool === 'line' ? 'default' : 'outline'}
                    size="icon"
                    className={`w-9 h-9 md:w-12 md:h-12 transition-all ${currentTool === 'line' ? 'ring-2 ring-blue-500' : ''}`}
                    title="Dibujar línea"
                  >
                    <span className="text-base md:text-xl">─</span>
                  </Button>

                  {/* Arrow Tool */}
                  <Button
                    onClick={() => setCurrentTool('arrow')}
                    variant={currentTool === 'arrow' ? 'default' : 'outline'}
                    size="icon"
                    className={`w-9 h-9 md:w-12 md:h-12 transition-all ${currentTool === 'arrow' ? 'ring-2 ring-blue-500' : ''}`}
                    title="Dibujar flecha"
                  >
                    <span className="text-base md:text-xl">→</span>
                  </Button>

                  {/* Point Tool */}
                  <Button
                    onClick={() => setCurrentTool('point')}
                    variant={currentTool === 'point' ? 'default' : 'outline'}
                    size="icon"
                    className={`w-9 h-9 md:w-12 md:h-12 transition-all ${currentTool === 'point' ? 'ring-2 ring-blue-500' : ''}`}
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
                      className="w-9 h-9 md:w-12 md:h-12 rounded cursor-pointer border-2 border-slate-300"
                      title="Seleccionar color"
                    />
                  </div>

                  <div className="w-px md:w-auto md:h-px bg-slate-200 mx-0.5 md:mx-0 md:my-1" />

                  {/* Undo */}
                  <Button
                    onClick={deleteLastDrawing}
                    variant="outline"
                    size="icon"
                    disabled={drawingState.lines.length === 0 && drawingState.arrows.length === 0 && drawingState.points.length === 0}
                    title="Deshacer último dibujo"
                    className="w-9 h-9 md:w-12 md:h-12"
                  >
                    <span className="text-base md:text-xl">↶</span>
                  </Button>

                  {/* Clear All */}
                  <Button
                    onClick={clearDrawings}
                    variant="outline"
                    size="icon"
                    disabled={drawingState.lines.length === 0 && drawingState.arrows.length === 0 && drawingState.points.length === 0}
                    title="Borrar todos los dibujos"
                    className="w-9 h-9 md:w-12 md:h-12"
                  >
                    <span className="text-base md:text-xl">🗑️</span>
                  </Button>
                </div>

                <div className="relative" style={{ maxWidth: '800px', width: '100%', pointerEvents: 'auto' }}>
                  {/* Gender Toggle Button */}
                  <Button
                    onClick={() => setIsMale(!isMale)}
                    variant="outline"
                    size="icon"
                    className="absolute bottom-2 right-2 z-20 w-12 h-12 bg-white hover:bg-slate-100 shadow-lg border-2 border-slate-300"
                    title={isMale ? "Cambiar a ficha femenina" : "Cambiar a ficha masculina"}
                  >
                    <span className="text-2xl">{isMale ? '♀' : '♂'}</span>
                  </Button>

                  <iframe
                    key={isMale ? 'male' : 'female'}
                    ref={iframeRef}
                    src={isMale ? "/Ficha_estetica_men.svg" : "/Ficha_estetica.svg"}
                    className="w-full h-auto min-h-[600px] border-0"
                    title="Ficha Estética Facial"
                    style={{
                      backgroundColor: 'transparent',
                      pointerEvents: 'auto',
                      visibility: svgLoaded ? 'visible' : 'hidden',
                      opacity: svgLoaded ? 1 : 0,
                      transition: 'opacity 0.3s ease'
                    }}
                  />
                  {/* SVG Overlay for drawings */}
                  <svg
                    ref={svgOverlayRef}
                    className="absolute top-0 left-0 w-full h-full"
                    viewBox={svgViewBox}
                    preserveAspectRatio="xMidYMid meet"
                    style={{
                      cursor: currentTool === 'select' ? 'default' : 'crosshair',
                      pointerEvents: currentTool === 'select' ? 'none' : 'auto',
                      touchAction: 'none' // Prevent default touch behaviors
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
          <div className="space-y-4">
            {/* Selected Zones List */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-700">Zonas Seleccionadas</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  {selectedZones.length}
                </span>
              </div>

              {selectedZones.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-500 mb-2">
                    No hay zonas seleccionadas
                  </p>
                  <p className="text-xs text-slate-400">
                    Activa "Modo Selección" y haz clic en las zonas del rostro
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedZones.map((zone) => (
                    <div
                      key={zone}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                        selectedZone === zone
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                      onClick={() => setSelectedZone(zone)}
                    >
                      <span className="text-sm font-medium">{ZONE_LABELS[zone]}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleZoneClick(zone);
                        }}
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Notes Section */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 text-slate-700">Notas</h3>
              {selectedZone ? (
                <textarea
                  className="w-full min-h-[140px] p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Escribe observaciones o notas generales..."
                  value={facialState[selectedZone]?.notes || ''}
                  onChange={(e) => {
                    setFacialState(prev => ({
                      ...prev,
                      [selectedZone]: {
                        ...prev[selectedZone],
                        selected: true,
                        notes: e.target.value,
                      }
                    }));
                  }}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500 mb-1">
                    Sin zona seleccionada
                  </p>
                  <p className="text-xs text-slate-400">
                    Selecciona una zona para agregar notas
                  </p>
                </div>
              )}
            </Card>

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
          <div className="text-center text-sm text-muted-foreground mt-4">
            Cargando ficha estética...
          </div>
        )}
      </Card>
    </div>
  );
};

export default FacialAesthetic;
