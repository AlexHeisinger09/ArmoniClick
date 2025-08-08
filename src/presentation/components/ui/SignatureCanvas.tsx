import React, { useRef, useCallback, useState, useImperativeHandle } from 'react';
import { RotateCcw, PenTool } from 'lucide-react';

interface SignatureCanvasProps {
  onSignatureChange?: (signatureData: string) => void;
  width?: number;
  height?: number;
  className?: string;
}

export const SignatureCanvas = React.forwardRef<any, SignatureCanvasProps>(
  ({ onSignatureChange, width = 400, height = 150, className = '' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

    const getCoordinates = useCallback((event: any) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      
      const rect = canvas.getBoundingClientRect();
      
      if (event.touches && event.touches[0]) {
        return {
          x: event.touches[0].clientX - rect.left,
          y: event.touches[0].clientY - rect.top
        };
      }
      
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }, []);

    const startDrawing = useCallback((event: any) => {
      event.preventDefault();
      setIsDrawing(true);
      const coords = getCoordinates(event);
      setLastPos(coords);
    }, [getCoordinates]);

    const draw = useCallback((event: any) => {
      if (!isDrawing) return;
      event.preventDefault();
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const coords = getCoordinates(event);
      
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      
      setLastPos(coords);
      
      if (onSignatureChange) {
        onSignatureChange(canvas.toDataURL());
      }
    }, [isDrawing, lastPos, getCoordinates, onSignatureChange]);

    const stopDrawing = useCallback(() => {
      setIsDrawing(false);
    }, []);

    const clearSignature = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (onSignatureChange) {
        onSignatureChange('');
      }
    };

    useImperativeHandle(ref, () => ({
      clear: clearSignature,
      getSignatureData: () => canvasRef.current?.toDataURL() || ''
    }));

    return (
      <div className={`border-2 border-dashed border-cyan-300 rounded-xl p-4 bg-cyan-50 ${className}`}>
        <div className="text-center mb-3">
          <PenTool className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-cyan-800">Firma aquí</p>
          <p className="text-xs text-cyan-600">Usa tu dedo o mouse para firmar</p>
        </div>
        
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full h-32 bg-white rounded-lg border-2 border-cyan-200 cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ touchAction: 'none' }}
        />
        
        <div className="flex justify-center mt-3">
          <button
            onClick={clearSignature}
            className="flex items-center text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Limpiar firma
          </button>
        </div>
      </div>
    );
  }
);

SignatureCanvas.displayName = 'SignatureCanvas';
