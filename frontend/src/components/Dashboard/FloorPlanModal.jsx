import React, { useState, useEffect, useRef } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCcw, Image as ImageIcon, Move } from 'lucide-react';

export function FloorPlanModal({ isOpen, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Reset position & zoom when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Mouse wheel zoom listener on container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 0.15 : -0.15;
      setZoom((prev) => Math.min(Math.max(Number((prev + zoomFactor).toFixed(2)), 0.5), 3));
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isOpen]);

  if (!isOpen) return null;

  // Zoom button handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.5));
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch drag handlers for mobile devices
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      };
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/STAGE.png';
    link.download = 'UCLM-BSN-2026-Stage-Floor-Plan.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-[#3b1427]/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="bg-[#f7e5ee] border border-rose-200/90 rounded-3xl p-4 sm:p-6 max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden gap-3 sm:gap-4">
        {/* Modal Header */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-rose-200/80 pb-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-sm">
              <ImageIcon size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-xl font-extrabold text-[#3b1427] font-heading truncate">
                Event Hall & Stage Floor Plan
              </h3>
              <p className="text-[11px] sm:text-xs text-rose-600 font-semibold truncate">
                Official layout map for BSN Acquaintance Party 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              title="Download full floor plan image"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Download Map</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-rose-200/60 rounded-xl transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Zoom Controls Bar & Drag Instructions */}
        <div className="flex-shrink-0 flex items-center justify-between text-xs font-semibold px-1">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">
              Zoom: <strong className="text-rose-700 font-bold">{Math.round(zoom * 100)}%</strong>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-rose-100/70 text-rose-700 rounded-full font-bold">
              <Move size={12} />
              Drag to pan freely
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleZoomOut}
              className="p-1.5 neu-button rounded-lg text-slate-700 hover:text-rose-600 active:scale-95 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={handleReset}
              className="px-2.5 py-1.5 neu-button rounded-lg text-slate-700 hover:text-rose-600 text-xs active:scale-95 flex items-center gap-1 cursor-pointer"
              title="Reset position and zoom"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 neu-button rounded-lg text-slate-700 hover:text-rose-600 active:scale-95 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>

        {/* Interactive Draggable Canvas (NO Sliders / Scrollbars) */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`flex-1 min-h-0 w-full overflow-hidden rounded-2xl neu-pressed bg-slate-900/10 border border-rose-200/60 relative select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          title="Click and drag anywhere to pan the map"
        >
          {/* Draggable & Scalable Inner Map Wrapper */}
          <div
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.08s ease-out',
            }}
            className="w-full h-full flex items-center justify-center pointer-events-none p-4"
          >
            <img
              src="/STAGE.png"
              alt="Official Event Stage Floor Plan"
              draggable={false}
              className="rounded-xl shadow-xl max-w-[95%] max-h-[90%] object-contain select-none block pointer-events-none border border-rose-200/50"
            />
          </div>

          {/* Quick Helper Pill Badge Overlay */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-[#3b1427]/70 backdrop-blur-md text-white text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full pointer-events-none shadow-md flex items-center gap-1.5">
            <Move size={12} className="text-rose-400" />
            <span>Click and drag to pan • Scroll or buttons to zoom</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="flex-shrink-0 pt-1 flex flex-col sm:flex-row justify-between items-center text-[11px] sm:text-xs text-slate-500 gap-1 px-1 border-t border-rose-200/60">
          <span className="truncate">Stage located center top. Tables arranged in rows A through G.</span>
          <span className="font-semibold text-rose-600 shrink-0">Click "Download Map" to save the high-res image.</span>
        </div>
      </div>
    </div>
  );
}


