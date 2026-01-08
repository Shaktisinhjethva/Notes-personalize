
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { IconButton } from './IconButton';
import { Eraser, Pen, RotateCcw, Save, Trash2 } from 'lucide-react';

interface CanvasProps {
  onSave: (dataUrl: string) => void;
  initialData?: string;
}

export const Canvas: React.FC<CanvasProps> = ({ onSave, initialData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(3);
  const [mode, setMode] = useState<'pen' | 'eraser'>('pen');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load initial data if available
    if (initialData) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = initialData;
    }

    // Handle resizing
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const temp = canvas.toDataURL();
        canvas.width = parent.clientWidth;
        canvas.height = 400; // Fixed height for canvas section
        const newImg = new Image();
        newImg.onload = () => ctx.drawImage(newImg, 0, 0);
        newImg.src = temp;
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [initialData]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
      onSave(canvas.toDataURL());
    }
  };

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = mode === 'eraser' ? '#ffffff' : color;
    
    // Support dark mode eraser
    if (mode === 'eraser' && document.documentElement.classList.contains('dark')) {
      ctx.strokeStyle = '#09090b'; 
    }

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, [isDrawing, color, brushSize, mode]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onSave('');
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex items-center space-x-2">
          <IconButton 
            icon={<Pen size={18} />} 
            active={mode === 'pen'} 
            onClick={() => setMode('pen')} 
            title="Pen"
          />
          <IconButton 
            icon={<Eraser size={18} />} 
            active={mode === 'eraser'} 
            onClick={() => setMode('eraser')} 
            title="Eraser"
          />
          <div className="h-6 w-px bg-gray-300 dark:bg-zinc-700 mx-1" />
          <input 
            type="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
          />
          <select 
            value={brushSize} 
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer"
          >
            <option value="2">Thin</option>
            <option value="5">Medium</option>
            <option value="10">Thick</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <IconButton icon={<RotateCcw size={18} />} onClick={clearCanvas} title="Clear" />
        </div>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full cursor-crosshair touch-none"
      />
    </div>
  );
};
