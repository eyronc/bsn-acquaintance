import React, { useState, useEffect, useRef } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCcw, Image as ImageIcon, Move } from 'lucide-react';
import { getSocietyTheme } from '../../utils/societyTheme';

export function FloorPlanModal({ isOpen, onClose, society = 'admin' }) {
  const [zoom, setZoom] = useState(0.5);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const isAdmin = !society || society === 'admin';
  const socTheme = !isAdmin ? getSocietyTheme(society) : null;

  // Reset position & zoom when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(0.5);
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
    setZoom(0.5);
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
      className="no-print fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-2.5 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        className={`rounded-3xl p-4 sm:p-6 max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden gap-3 sm:gap-4 border ${
          isAdmin
            ? 'bg-[#0F2A44] border-[#E7C15A]/25'
            : `${socTheme.cardBg} ${socTheme.border}`
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-3 sm:px-6 py-2.5 sm:py-4 border-b flex items-center justify-between gap-2 sm:gap-3 shrink-0 ${
            isAdmin ? 'border-[#E7C15A]/20 bg-white/[0.04]' : 'border-black/10'
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border flex items-center justify-center shrink-0 ${
                isAdmin
                  ? 'bg-[#E7C15A]/15 border-[#E7C15A]/25 text-[#E7C15A]'
                  : ''
              }`}
              style={
                !isAdmin
                  ? {
                      backgroundColor: socTheme.badge.bg,
                      borderColor: socTheme.badge.border,
                      color: socTheme.badge.text,
                    }
                  : undefined
              }
            >
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <h3
                className={`text-xs xs:text-sm sm:text-xl font-extrabold font-heading text-left leading-snug ${
                  isAdmin ? 'text-[#F3ECDF]' : socTheme.textDark
                }`}
              >
                Event Hall & Stage Floor Plan
              </h3>
              <p
                className={`text-[9.5px] sm:text-xs font-semibold text-left leading-tight mt-0.5 ${
                  isAdmin ? 'text-[#E7C15A]' : socTheme.subtext
                }`}
              >
                Mactan Expo Center &bull; BSN Acquaintance Party 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              title="Download full floor plan image"
            >
              <Download size={14} className="sm:w-[15px] sm:h-[15px]" />
              <span className="hidden sm:inline">Download Map</span>
            </button>

            <button
              onClick={onClose}
              className={`p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer ${
                isAdmin ? 'hover:bg-white/10' : 'hover:bg-black/5'
              }`}
              title="Close (Esc)"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Zoom Controls Bar & Drag Instructions */}
        <div className="flex-shrink-0 flex items-center justify-between text-xs font-semibold px-1">
          <div className="flex items-center gap-2 text-left">
            <span className="text-slate-600 font-medium">
              Zoom:{' '}
              <strong
                className={`font-bold ${
                  isAdmin ? 'text-[#E7C15A]' : socTheme.textDark
                }`}
              >
                {Math.round(zoom * 100)}%
              </strong>
            </span>
            <span
              className={`hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold border ${
                isAdmin
                  ? 'bg-[#E7C15A]/12 text-[#E7C15A] border-[#E7C15A]/20'
                  : ''
              }`}
              style={
                !isAdmin
                  ? {
                      backgroundColor: socTheme.badge.bg,
                      color: socTheme.badge.text,
                      borderColor: socTheme.badge.border,
                    }
                  : undefined
              }
            >
              <Move size={12} />
              Drag to pan freely
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleZoomOut}
              className={`p-1.5 neu-button rounded-lg text-slate-700 active:scale-95 cursor-pointer ${
                isAdmin ? 'hover:text-[#E7C15A]' : ''
              }`}
              title="Zoom out"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={handleReset}
              className={`px-2.5 py-1.5 neu-button rounded-lg text-slate-700 text-xs active:scale-95 flex items-center gap-1 cursor-pointer ${
                isAdmin ? 'hover:text-[#E7C15A]' : ''
              }`}
              title="Reset position and zoom"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
            <button
              onClick={handleZoomIn}
              className={`p-1.5 neu-button rounded-lg text-slate-700 active:scale-95 cursor-pointer ${
                isAdmin ? 'hover:text-[#E7C15A]' : ''
              }`}
              title="Zoom in"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>

        {/* Interactive Draggable Canvas */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`flex-1 min-h-0 w-full overflow-hidden rounded-2xl neu-pressed relative select-none border ${
            isAdmin
              ? 'bg-white/[0.03] border-[#E7C15A]/20'
              : `bg-white/60 ${socTheme.border}`
          } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
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
              className={`rounded-xl shadow-xl max-w-[95%] max-h-[90%] object-contain select-none block pointer-events-none border ${
                isAdmin ? 'border-[#E7C15A]/20' : socTheme.border
              }`}
            />
          </div>
        </div>

        {/* Footer Note */}
        <div
          className={`flex-shrink-0 pt-1 flex flex-col sm:flex-row justify-between items-center text-[11px] sm:text-xs text-slate-500 gap-1 px-1 border-t ${
            isAdmin ? 'border-[#E7C15A]/20' : socTheme.border
          }`}
        >
          <span className="truncate text-left">
            Stage located center top. Tables arranged in rows A through G.
          </span>
          <span
            className={`font-semibold shrink-0 ${
              isAdmin ? 'text-[#E7C15A]' : socTheme.subtext
            }`}
          >
            Click "Download Map" to save the high-res image.
          </span>
        </div>
      </div>
    </div>
  );
}


