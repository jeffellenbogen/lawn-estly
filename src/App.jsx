import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Upload, 
  Ruler, 
  PenTool, 
  Trash2, 
  Menu, 
  X, 
  Calculator, 
  Settings, 
  Info, 
  DollarSign, 
  Maximize,
  ChevronRight,
  Printer,
  MousePointer2,
  Sprout,
  Move,
  Truck
} from 'lucide-react';

/**
 * LAWN ESTLY - v3.9.1
 * - Interactive Editing: Added drag-to-move for Scale endpoints and Polygon vertices.
 * - Refined Interaction: Editing enabled in IDLE mode.
 * - Metric Updates: Real-time recalculation during calibration adjustments.
 */

// --- Helper Math Functions ---

const getDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const getPolygonArea = (points) => {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
};

const getPolygonPerimeter = (points) => {
  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    perimeter += getDistance(points[i], points[(i + 1) % points.length]);
  }
  return perimeter;
};

const getPolygonCenter = (points) => {
  if (!points || points.length === 0) return { x: 0.5, y: 0.5 };
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2
  };
};

// --- Components ---

const Tooltip = ({ text, children }) => (
  <div className="group relative flex flex-col items-center">
    {children}
    <div className="absolute bottom-full mb-2 hidden flex-col items-center group-hover:flex pointer-events-none">
      <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-800 shadow-lg rounded-md">
        {text}
      </span>
      <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-800"></div>
    </div>
  </div>
);

const Header = ({ onToggleSidebar, sidebarOpen }) => (
  <header className="bg-white/90 backdrop-blur-md border-b border-emerald-100 text-emerald-950 p-4 shadow-sm flex justify-between items-center z-50 relative shrink-0 print:hidden">
    <div className="flex items-center space-x-3">
      <div className="bg-emerald-100 p-2 rounded-lg flex items-center justify-center relative">
        <Calculator className="h-5 w-5 text-emerald-700 absolute -left-1 -bottom-1 bg-white rounded-full p-0.5" />
        <Sprout className="h-6 w-6 text-emerald-600" />
      </div>
      <h1 className="text-xl font-bold tracking-tight font-sans">Lawn<span className="text-emerald-600">Estly</span></h1>
    </div>
    
    <button 
      onClick={onToggleSidebar} 
      className={`md:hidden p-2 rounded-full transition-colors flex items-center gap-2 ${sidebarOpen ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-700'}`}
    >
      <span className="text-sm font-semibold">{sidebarOpen ? 'Close' : 'Estimate'}</span>
      {sidebarOpen ? <X className="h-5 w-5" /> : <Calculator className="h-5 w-5" />}
    </button>
  </header>
);

const CalibrationModal = ({ isOpen, onClose, onConfirm, initialValue }) => {
  const [value, setValue] = useState(initialValue || '10');

  useEffect(() => {
      if(isOpen && initialValue) setValue(initialValue);
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-emerald-900/20 z-[100] flex items-center justify-center p-4 backdrop-blur-sm print:hidden">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100">
        <div className="flex items-center gap-3 mb-4 text-emerald-800">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <Ruler className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold">Calibrate Scale</h3>
        </div>
        
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Great! You've drawn a reference line. How long is this line in the real world?
        </p>

        <div className="relative mb-6 group">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-emerald-500 text-xl font-mono font-bold text-emerald-900 transition-colors outline-none bg-gray-50 focus:bg-white"
            placeholder="e.g. 10"
            autoFocus
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium pointer-events-none">Feet</span>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-xl font-semibold transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(parseFloat(value))}
            disabled={!value || isNaN(parseFloat(value))}
            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Set Scale
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ 
  isOpen, 
  onClose, 
  rates, 
  setRates, 
  complexity, 
  setComplexity, 
  totals, 
  onClear,
  onPrint,
  hasContent,
  scaleSet
}) => {
  const complexityMultipliers = {
    simple: 1.0,
    moderate: 1.15,
    complex: 1.3
  };

  const laborCost = (
    (totals.area * rates.pricePerSqFt) + 
    (totals.perimeter * rates.pricePerLinFt)
  ) * complexityMultipliers[complexity];

  const estimatedBid = laborCost + rates.serviceFee;

  return (
    <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) z-[60] flex flex-col border-l border-gray-100 ${isOpen ? 'translate-x-0' : 'translate-x-full'} print:hidden`}>
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
        <h2 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-emerald-500" /> Estimate Details
        </h2>
        <button onClick={onClose} className="md:hidden p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50">
        
        {/* Pricing Configuration */}
        <section className="space-y-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Settings className="h-3 w-3" /> Pricing Rates
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Mowing <span className="font-normal text-gray-400">($/sq.ft)</span></label>
              <input
                type="number"
                value={rates.pricePerSqFt}
                onChange={(e) => setRates({...rates, pricePerSqFt: parseFloat(e.target.value) || 0})}
                className="block w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                step="0.001"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Edging <span className="font-normal text-gray-400">($/lin.ft)</span></label>
              <input
                type="number"
                value={rates.pricePerLinFt}
                onChange={(e) => setRates({...rates, pricePerLinFt: parseFloat(e.target.value) || 0})}
                className="block w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                step="0.01"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                <Truck className="h-3 w-3" /> Service Fee <span className="font-normal text-gray-400">(Flat Rate)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                    type="number"
                    value={rates.serviceFee}
                    onChange={(e) => setRates({...rates, serviceFee: parseFloat(e.target.value) || 0})}
                    className="block w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 pl-7 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                    step="1.00"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Complexity */}
        <section className="space-y-3">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 ml-1">
            Terrain Complexity
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {['simple', 'moderate', 'complex'].map((level) => (
              <button
                key={level}
                onClick={() => setComplexity(level)}
                className={`py-3 px-2 text-xs font-bold rounded-xl capitalize transition-all duration-200 border-2 ${
                  complexity === level
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm scale-[1.02]'
                    : 'bg-white border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </section>

        {/* Measurements */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 ml-1">
            <Maximize className="h-3 w-3" /> Metrics
          </h3>
          
          {!scaleSet && hasContent ? (
             <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800 flex items-start gap-3 shadow-sm">
                <div className="bg-amber-100 p-1.5 rounded-full shrink-0">
                    <Info className="h-4 w-4 text-amber-600" />
                </div>
                <span className="mt-0.5 font-medium">Draw a calibration line on the map to calculate real-world distances.</span>
             </div>
          ) : (
            <div className="bg-white rounded-2xl p-1 space-y-1 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center p-4 border-b border-gray-50">
                    <span className="text-gray-500 text-sm font-medium">Total Area</span>
                    <span className="font-mono font-bold text-gray-800 text-lg">{totals.area.toFixed(0)} <span className="text-xs text-gray-400 font-sans font-normal">ft²</span></span>
                </div>
                <div className="flex justify-between items-center p-4">
                    <span className="text-gray-500 text-sm font-medium">Perimeter</span>
                    <span className="font-mono font-bold text-gray-800 text-lg">{totals.perimeter.toFixed(0)} <span className="text-xs text-gray-400 font-sans font-normal">ft</span></span>
                </div>
            </div>
          )}
        </section>

        {/* Total */}
        <div className="mt-auto pt-6">
          <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-2xl p-6 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
             <div className="flex items-center justify-between mb-2 relative z-10">
                <span className="text-emerald-200 uppercase text-[10px] font-bold tracking-wider">Estimated Bid</span>
                <DollarSign className="h-4 w-4 text-emerald-400" />
             </div>
             <div className="text-4xl font-bold relative z-10 tracking-tight">
                ${estimatedBid.toFixed(2)}
             </div>
             <div className="mt-2 text-xs text-emerald-300/80 font-medium relative z-10">
                Includes ${rates.serviceFee} service fee
             </div>
          </div>
          
          <div className="space-y-3 mt-6">
            {hasContent && (
                <button 
                    onClick={onPrint}
                    className="w-full flex items-center justify-center gap-2 bg-white border-2 border-emerald-100 text-emerald-800 hover:bg-emerald-50 hover:border-emerald-200 py-3 rounded-xl transition-all text-sm font-bold"
                >
                    <Printer className="h-4 w-4" /> Generate Report
                </button>
            )}

            {hasContent && (
                <button 
                    onClick={onClear}
                    className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 py-3 rounded-xl transition-colors text-sm font-semibold"
                >
                    Reset All
                </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Main Application Component ---

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [image, setImage] = useState(null);
  const [mode, setMode] = useState('IDLE'); 
  const [rates, setRates] = useState({ 
      pricePerSqFt: 0.025, 
      pricePerLinFt: 0.05,
      serviceFee: 25.00
  });
  const [complexity, setComplexity] = useState('simple');
  const [calibrationValue, setCalibrationValue] = useState(10); // Store known distance
  
  // Drawing State
  const [polygons, setPolygons] = useState([]); 
  const [currentPoly, setCurrentPoly] = useState([]); 
  const [calibrationLine, setCalibrationLine] = useState(null); 
  const [scaleFactor, setScaleFactor] = useState(null); 
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [dragTarget, setDragTarget] = useState(null); // { type: 'poly'|'calib', index, pointIndex, p1/p2 }
  
  // Canvas Resolution
  const [canvasResolution, setCanvasResolution] = useState({ width: 800, height: 600 });

  // Zoom & Pan State
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [touchDist, setTouchDist] = useState(null); 
  
  // Modal State
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const wrapperRef = useRef(null); 
  const fileInputRef = useRef(null);

  const complexityMultipliers = {
    simple: 1.0,
    moderate: 1.15,
    complex: 1.3
  };

  // --- Calculation Helpers ---
  const totals = useMemo(() => {
    if (!scaleFactor) return { area: 0, perimeter: 0 };

    let totalArea = 0;
    let totalPerimeter = 0;

    polygons.forEach(poly => {
      totalArea += getPolygonArea(poly);
      totalPerimeter += getPolygonPerimeter(poly);
    });

    return {
      area: totalArea * (scaleFactor * scaleFactor), 
      perimeter: totalPerimeter * scale