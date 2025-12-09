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
 * LAWN ESTLY - v3.9.8 (Favicon Update)
 * - Update: Favicon matched to website "Sprout" branding.
 * - Previous Features: Mobile footer, Locked Zoom/Pan, One-page report.
 */

// --- Helper Components ---

// Dynamically sets the favicon
const FaviconManager = () => {
  useEffect(() => {
    // Clean Sprout Icon for Favicon (Emerald Green on Light Background)
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="16" fill="#ecfdf5"/>
        <path d="M32 52V24" stroke="#059669" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M32 40C20 40 12 32 12 20" stroke="#059669" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M32 40C44 40 52 32 52 20" stroke="#059669" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `.replace(/\n/g, '').replace(/#/g, '%23');

    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    link.href = `data:image/svg+xml,${svg}`;
    
    // Attempt to set apple-touch-icon for mobile home screen add
    let appleLink = document.querySelector("link[rel='apple-touch-icon']");
    if (!appleLink) {
        appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        document.head.appendChild(appleLink);
    }
    appleLink.href = `data:image/svg+xml,${svg}`;

    document.getElementsByTagName('head')[0].appendChild(link);
    document.title = "LawnEstly";
  }, []);
  return null;
};

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
  // Initialize Sidebar state based on screen width (Closed on mobile by default)
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
  const [dragTarget, setDragTarget] = useState(null); // { type: 'poly'|'calib'|'current', index, pointIndex, p1/p2 }
  const [isDrawingScale, setIsDrawingScale] = useState(false); // For click-move-click logic
  
  // Canvas Resolution State (Fix for disappearing images)
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
      perimeter: totalPerimeter * scaleFactor
    };
  }, [polygons, scaleFactor]);

  const estimatedBid = (
    ((totals.area * rates.pricePerSqFt) + 
    (totals.perimeter * rates.pricePerLinFt)) * complexityMultipliers[complexity]
  ) + rates.serviceFee;

  // --- Print Handler ---
  const handlePrint = () => {
      if (!canvasRef.current) return;
      
      try {
        const dataUrl = canvasRef.current.toDataURL('image/png');
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Pop-up blocked! Please allow pop-ups for this site to export the report.");
            return;
        }

        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>LawnEstly Report</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; color: #1f2937; }
                .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; border-bottom: 3px solid #059669; padding-bottom: 10px; }
                .brand { font-size: 1.5rem; font-weight: 800; color: #111827; }
                .brand span { color: #059669; }
                .price-value { font-size: 2.5rem; font-weight: 800; color: #111827; line-height: 1; margin-top: 5px; }
                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
                .stat-card { background: #f9fafb; padding: 10px; border-radius: 8px; border: 1px solid #e5e7eb; }
                .stat-label { font-size: 0.6rem; text-transform: uppercase; font-weight: 700; color: #6b7280; margin-bottom: 4px; }
                .stat-value { font-size: 1rem; font-weight: 700; color: #111827; }
                .stat-sub { font-size: 0.6rem; color: #6b7280; margin-top: 2px; }
                .map-container { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); max-height: 60vh; display: flex; justify-content: center; }
                img { max-width: 100%; max-height: 100%; object-fit: contain; }
                .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 0.6rem; }
                @media print { 
                    body { padding: 0; margin: 0.5cm; } 
                    .stat-card { border: 1px solid #d1d5db; } 
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div>
                  <div class="brand">Lawn<span>Estly</span></div>
                  <div style="color: #6b7280; font-size: 0.8rem; margin-top: 2px;">Professional Estimate Report</div>
                </div>
                <div style="text-align: right;">
                  <div style="text-transform: uppercase; font-size: 0.6rem; font-weight: 700; color: #059669; letter-spacing: 0.05em;">Estimated Total</div>
                  <div class="price-value">$${estimatedBid.toFixed(2)}</div>
                </div>
              </div>

              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-label">Mowable Area</div>
                  <div class="stat-value">${totals.area.toFixed(0)} ft²</div>
                  <div class="stat-sub">@ $${rates.pricePerSqFt.toFixed(3)}/ft²</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Perimeter Edging</div>
                  <div class="stat-value">${totals.perimeter.toFixed(0)} ft</div>
                  <div class="stat-sub">@ $${rates.pricePerLinFt.toFixed(2)}/ft</div>
                </div>
                <div class="stat-card">
                   <div class="stat-label">Service Fee</div>
                   <div class="stat-value">$${rates.serviceFee.toFixed(2)}</div>
                   <div class="stat-sub">Flat Rate</div>
                </div>
                <div class="stat-card">
                   <div class="stat-label">Terrain Factor</div>
                   <div class="stat-value" style="text-transform: capitalize;">${complexity}</div>
                   <div class="stat-sub">Markup: ${((complexityMultipliers[complexity] - 1) * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div style="font-size: 0.7rem; font-weight: 700; color: #6b7280; margin-bottom: 5px; text-transform: uppercase;">Property Analysis</div>
              <div class="map-container">
                 <img src="${dataUrl}" />
              </div>
              
              <div class="footer">
                Generated by LawnEstly. This estimate is based on image analysis and may require on-site verification.
              </div>

              <script>
                window.onload = () => { 
                    setTimeout(() => {
                        window.print();
                    }, 500);
                };
              </script>
            </body>
          </html>
        `;
        printWindow.document.write(htmlContent);
        printWindow.document.close();
      } catch (e) {
        console.error(e);
        alert("Error generating report.");
      }
  };

  // --- Interaction Handlers ---

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
            setImage(img);
            setPolygons([]);
            setCurrentPoly([]);
            setCalibrationLine(null);
            setScaleFactor(null);
            setMode('IDLE');
            setIsDrawingScale(false);
            setShowCalibrationModal(false);
            setView({ x: 0, y: 0, scale: 1 });
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  
  const deletePolygon = (index) => {
    setPolygons(prev => prev.filter((_, i) => i !== index));
  };

  const getNormalizedPoint = (clientX, clientY) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Adjust for View Transformation (Pan & Zoom)
    // Logic: Screen Pixel -> Subtract Rect -> Subtract Pan -> Divide by Scale -> Normalize
    const rawX = clientX - rect.left;
    const rawY = clientY - rect.top;
    
    const scaledX = (rawX - view.x) / view.scale;
    const scaledY = (rawY - view.y) / view.scale;
    
    return {
      x: scaledX / rect.width,
      y: scaledY / rect.height
    };
  };

  // Check if a point is close to the mouse (for hitting drag targets)
  const isClose = (pNorm, clientX, clientY) => {
      if (!canvasRef.current) return false;
      const rect = canvasRef.current.getBoundingClientRect();
      const pScreenX = (pNorm.x * rect.width * view.scale) + view.x;
      const pScreenY = (pNorm.y * rect.height * view.scale) + view.y;
      const rawX = clientX - rect.left;
      const rawY = clientY - rect.top;
      const dist = Math.sqrt(Math.pow(pScreenX - rawX, 2) + Math.pow(pScreenY - rawY, 2));
      return dist < 20; // 20px hit radius
  };

  // Check if click hits the scale label
  const isOverScaleLabel = (clientX, clientY) => {
      if (!calibrationLine || !scaleFactor || !canvasRef.current) return false;
      const rect = canvasRef.current.getBoundingClientRect();
      
      const p1 = { x: (calibrationLine.p1.x * rect.width * view.scale) + view.x, y: (calibrationLine.p1.y * rect.height * view.scale) + view.y };
      const p2 = { x: (calibrationLine.p2.x * rect.width * view.scale) + view.x, y: (calibrationLine.p2.y * rect.height * view.scale) + view.y };
      const mid = { x: (p1.x + p2.x)/2, y: (p1.y + p2.y)/2 };
      
      // Box size approx based on render logic
      const boxW = 60; // Approx width
      const boxH = 30; // Approx height
      
      const rawX = clientX - rect.left;
      const rawY = clientY - rect.top;
      
      return (
          rawX >= mid.x - boxW/2 && 
          rawX <= mid.x + boxW/2 && 
          rawY >= mid.y - boxH/2 - 10 && 
          rawY <= mid.y + boxH/2
      );
  };

  const startInteraction = (clientX, clientY) => {
    if (!image) return;
    
    // Check for Text Label Tap (Mobile/Desktop)
    if (isOverScaleLabel(clientX, clientY)) {
        setShowCalibrationModal(true);
        return;
    }

    // 1. Check for hits on EXISTING polygons (Completed ones)
    // Even in Drawing mode, if I grab an old corner, I probably want to move it, not stack a new point on top.
    for (let i = 0; i < polygons.length; i++) {
        for (let j = 0; j < polygons[i].length; j++) {
            if (isClose(polygons[i][j], clientX, clientY)) {
                setDragTarget({ type: 'poly', polyIndex: i, pointIndex: j });
                return; // Stop here! Do not add point.
            }
        }
    }

    // Check for calibration line endpoints
    if (calibrationLine) {
        if (isClose(calibrationLine.p1, clientX, clientY)) {
            setDragTarget({ type: 'calib', point: 'p1' });
            return;
        }
        if (isClose(calibrationLine.p2, clientX, clientY)) {
            setDragTarget({ type: 'calib', point: 'p2' });
            return;
        }
    }

    if (mode === 'PAN') {
        setIsPanning(true);
        setLastPanPoint({ x: clientX, y: clientY });
        return;
    }

    const p = getNormalizedPoint(clientX, clientY);

    if (mode === 'CALIBRATING') {
      // If user clicked the button to reset, allow new line
      if (!calibrationLine) {
        setCalibrationLine({ p1: p, p2: p });
        setIsDrawingScale(true); // Start "Click-Move-Click" state
      } else if (isDrawingScale) {
          // This is the second click of "Click-Move-Click"
          setIsDrawingScale(false);
          setShowCalibrationModal(true);
      } else {
        // If line exists and not drawing, allow moving handles (handled above)
      }
    } else if (mode === 'DRAWING') {
      // 2. Check for hits on CURRENT polygon vertices (Active drawing)
      if (currentPoly.length > 0) {
          // Skipping index 0 if valid close target, otherwise check all
          const startIndex = (currentPoly.length > 2) ? 1 : 0;
          for (let i = startIndex; i < currentPoly.length; i++) {
               if (isClose(currentPoly[i], clientX, clientY)) {
                   setDragTarget({ type: 'current', pointIndex: i }); 
                   return;
               }
          }
      }

      // 3. Close Logic (Existing)
      if (currentPoly.length > 2) {
        const start = currentPoly[0];
        const rect = canvasRef.current.getBoundingClientRect();
        const screenStart = {
            x: (start.x * rect.width * view.scale) + view.x,
            y: (start.y * rect.height * view.scale) + view.y
        };
        const screenCurrent = {
            x: (p.x * rect.width * view.scale) + view.x,
            y: (p.y * rect.height * view.scale) + view.y
        };
        const distPx = Math.sqrt(Math.pow(screenCurrent.x - screenStart.x, 2) + Math.pow(screenCurrent.y - screenStart.y, 2));
        
        if (distPx < 20) {
           // Close
           setPolygons([...polygons, currentPoly]);
           setCurrentPoly([]);
           return;
        }
      }
      
      // 4. Add Point (Default)
      setCurrentPoly([...currentPoly, p]);
    }
  };

  const moveInteraction = (clientX, clientY) => {
    if (!image) return;
    
    // Handle Dragging Existing Points
    if (dragTarget) {
        const p = getNormalizedPoint(clientX, clientY);
        if (dragTarget.type === 'calib') {
            const newLine = { ...calibrationLine, [dragTarget.point]: p };
            setCalibrationLine(newLine);
            // Recalculate scale factor if value exists
            if (calibrationValue) {
                const distPixels = getDistance(newLine.p1, newLine.p2);
                setScaleFactor(calibrationValue / distPixels);
            }
        } else if (dragTarget.type === 'poly') {
            const newPolys = [...polygons];
            newPolys[dragTarget.polyIndex][dragTarget.pointIndex] = p;
            setPolygons(newPolys);
        } else if (dragTarget.type === 'current') {
            const newPoly = [...currentPoly];
            newPoly[dragTarget.pointIndex] = p;
            setCurrentPoly(newPoly);
        }
        return;
    }

    if (mode === 'PAN' && isPanning) {
        const deltaX = clientX - lastPanPoint.x;
        const deltaY = clientY - lastPanPoint.y;
        setView(prev => ({ ...prev, x: prev.x + deltaX, y: prev.y + deltaY }));
        setLastPanPoint({ x: clientX, y: clientY });
        return;
    }

    const p = getNormalizedPoint(clientX, clientY);
    setMousePos(p);

    // Initial Drawing of Calibration Line (Click-Move-Click logic)
    if (mode === 'CALIBRATING' && isDrawingScale && calibrationLine) {
         setCalibrationLine({ ...calibrationLine, p2: p });
    }
  };

  const endInteraction = (clientX, clientY) => {
     if (dragTarget) {
         setDragTarget(null);
         return;
     }

     if (mode === 'PAN') {
         setIsPanning(false);
         return;
     }

     if (mode === 'CALIBRATING' && calibrationLine && !showCalibrationModal) {
        const rect = canvasRef.current.getBoundingClientRect();
        const p1 = { x: (calibrationLine.p1.x * rect.width * view.scale) + view.x, y: (calibrationLine.p1.y * rect.height * view.scale) + view.y };
        const p2 = { x: (calibrationLine.p2.x * rect.width * view.scale) + view.x, y: (calibrationLine.p2.y * rect.height * view.scale) + view.y };
        const distPx = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        
        // Enforce Minimum Scale Line Length (5% of viewport min dimension)
        const minLength = Math.min(rect.width, rect.height) * 0.05;

        // If dragging new line and it's too short, cancel it
        if (isDrawingScale && distPx < minLength) {
             setCalibrationLine(null);
             setIsDrawingScale(false);
             return;
        }

        // If we dragged significantly, assume "Drag-to-Draw" is done
        // If clicking (short time/dist), logic handles via isDrawingScale waiting for 2nd click
        // But here we check length. If user drags a long line and releases, we should finish.
        if (distPx > 30 && isDrawingScale) {
            setIsDrawingScale(false);
            setShowCalibrationModal(true);
        }
     }
  };

  const handleWheel = (e) => {
      if (!image) return;
      
      // Ensure Zoom is ONLY allowed in PAN mode
      if (mode !== 'PAN') return;

      const zoomIntensity = 0.001;
      const delta = -e.deltaY * zoomIntensity;
      const newScale = Math.min(Math.max(1, view.scale + delta), 5);
      const rect = canvasRef.current.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const unscaledX = (cx - view.x) / view.scale;
      const unscaledY = (cy - view.y) / view.scale;
      const newX = cx - (unscaledX * newScale);
      const newY = cy - (unscaledY * newScale);
      setView({ x: newX, y: newY, scale: newScale });
  };

  // --- Event Wrappers ---
  const handleMouseDown = (e) => startInteraction(e.clientX, e.clientY);
  const handleMouseMove = (e) => moveInteraction(e.clientX, e.clientY);
  const handleMouseUp = (e) => endInteraction(e.clientX, e.clientY);

  const handleTouchStart = (e) => { 
      if(e.touches.length === 2 && mode === 'PAN') {
          const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
          setTouchDist(dist);
      } else if(e.touches.length === 1) {
        startInteraction(e.touches[0].clientX, e.touches[0].clientY); 
      }
  };
  const handleTouchMove = (e) => { 
      if(e.touches.length === 2 && touchDist && mode === 'PAN') {
          const newDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
          const delta = newDist - touchDist;
          const zoomSpeed = 0.005;
          const newScale = Math.min(Math.max(1, view.scale + (delta * zoomSpeed)), 5);
          const rect = canvasRef.current.getBoundingClientRect();
          const cx = rect.width / 2;
          const cy = rect.height / 2;
          const unscaledX = (cx - view.x) / view.scale;
          const unscaledY = (cy - view.y) / view.scale;
          const newX = cx - (unscaledX * newScale);
          const newY = cy - (unscaledY * newScale);
          setView({ x: newX, y: newY, scale: newScale });
          setTouchDist(newDist);
      } else if(e.touches.length === 1) {
        moveInteraction(e.touches[0].clientX, e.touches[0].clientY); 
      }
  };
  const handleTouchEnd = (e) => { 
      if (e.touches.length < 2) setTouchDist(null);
      if (e.changedTouches.length > 0 && e.touches.length === 0) {
          endInteraction(e.changedTouches[0].clientX, e.changedTouches[0].clientY); 
      }
  };

  // --- Modal Logic ---
  const confirmCalibration = (feet) => {
      if (!calibrationLine || !feet) return;
      setCalibrationValue(feet);
      const dist = getDistance(calibrationLine.p1, calibrationLine.p2);
      setScaleFactor(feet / dist);
      setShowCalibrationModal(false);
      setMode('IDLE');
  };

  const cancelCalibration = () => {
      setCalibrationLine(null);
      setShowCalibrationModal(false);
  };

  // --- Canvas Rendering ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(view.x, view.y);
    ctx.scale(view.scale, view.scale);
    ctx.drawImage(image, 0, 0, width, height);

    const toPixels = (p) => ({ x: p.x * width, y: p.y * height });

    // Polygons
    polygons.forEach(poly => {
      if (poly.length < 2) return;
      ctx.beginPath();
      const start = toPixels(poly[0]);
      ctx.moveTo(start.x, start.y);
      for (let i = 1; i < poly.length; i++) {
        const p = toPixels(poly[i]);
        ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.fill();
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 2 / view.scale; 
      ctx.stroke();

      // Always draw editable handles for existing polys
      poly.forEach(p => {
          const sp = toPixels(p);
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, 6 / view.scale, 0, Math.PI * 2);
          ctx.fillStyle = 'white';
          ctx.fill();
          ctx.stroke();
      });
    });

    // Current Drawing
    if (currentPoly.length > 0) {
      ctx.beginPath();
      const start = toPixels(currentPoly[0]);
      ctx.moveTo(start.x, start.y);
      for (let i = 1; i < currentPoly.length; i++) {
        const p = toPixels(currentPoly[i]);
        ctx.lineTo(p.x, p.y);
      }
      if (mode === 'DRAWING') {
         // Mouse pos is already normalized, so we scale it
         const m = toPixels(mousePos);
         ctx.lineTo(m.x, m.y);
      }
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2 / view.scale;
      ctx.setLineDash([5 / view.scale, 5 / view.scale]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      currentPoly.forEach(p => {
        const sp = toPixels(p);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 4 / view.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }

    // Calibration Line
    if (calibrationLine) {
       const s1 = toPixels(calibrationLine.p1);
       const s2 = toPixels(calibrationLine.p2);
       
       ctx.beginPath();
       ctx.moveTo(s1.x, s1.y);
       ctx.lineTo(s2.x, s2.y);
       ctx.strokeStyle = '#ef4444';
       ctx.lineWidth = 3 / view.scale;
       ctx.stroke();

       // Always draw handles for calibration line (easier editing)
       ctx.fillStyle = '#ef4444';
       ctx.beginPath();
       ctx.arc(s1.x, s1.y, 6 / view.scale, 0, Math.PI * 2);
       ctx.arc(s2.x, s2.y, 6 / view.scale, 0, Math.PI * 2);
       ctx.fill();
       ctx.strokeStyle = 'white';
       ctx.lineWidth = 2 / view.scale;
       ctx.stroke();

       if (scaleFactor) {
           const mid = { x: (s1.x + s2.x)/2, y: (s1.y + s2.y)/2 };
           const distFeet = getDistance(calibrationLine.p1, calibrationLine.p2) * scaleFactor;
           ctx.fillStyle = 'white';
           ctx.font = `bold ${14/view.scale}px sans-serif`;
           const text = `${distFeet.toFixed(1)} ft`;
           const tm = ctx.measureText(text);
           // Background box for text
           ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
           const boxW = tm.width + (12/view.scale);
           const boxH = 24 / view.scale;
           ctx.fillRect(mid.x - boxW/2, mid.y - boxH/2 - (10/view.scale), boxW, boxH);
           
           ctx.fillStyle = 'white';
           ctx.fillText(text, mid.x - tm.width/2, mid.y - (5/view.scale)); 
       }
    }
    
    ctx.restore();

  }, [image, polygons, currentPoly, calibrationLine, mousePos, scaleFactor, mode, showCalibrationModal, view, canvasResolution]);

  // Resize Observer - Observe PARENT container for maximum available space
  useEffect(() => {
      if (!containerRef.current) return;
      const observer = new ResizeObserver(entries => {
          const { width, height } = entries[0].contentRect;
          setContainerSize({ width, height });
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
  }, []); 

  // Resize Observer - Observe WRAPPER to update canvas resolution
  useEffect(() => {
      if (!wrapperRef.current || !canvasRef.current) return;
      const resizeObserver = new ResizeObserver(entries => {
          for (let entry of entries) {
              const { width, height } = entry.contentRect;
              // Only update state if significantly changed to avoid loops
              // Using state triggers a re-render which triggers the useEffect canvas drawing
              setCanvasResolution({ width, height });
              canvasRef.current.width = width;
              canvasRef.current.height = height;
          }
      });
      resizeObserver.observe(wrapperRef.current);
      return () => resizeObserver.disconnect();
  }, [image]); 

  // Calculate optimal wrapper style
  const getWrapperStyle = () => {
      if (!image || !containerSize.width || !containerSize.height) return { opacity: 0 };
      
      const imageRatio = image.width / image.height;
      const containerRatio = containerSize.width / containerSize.height;
      
      if (imageRatio > containerRatio) {
          return {
              width: '100%',
              height: 'auto',
              aspectRatio: `${image.width} / ${image.height}`
          };
      } else {
          return {
              width: 'auto',
              height: '100%',
              aspectRatio: `${image.width} / ${image.height}`
          };
      }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-gray-100 overflow-hidden font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <FaviconManager />
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      
      <CalibrationModal 
        isOpen={showCalibrationModal} 
        onClose={cancelCalibration} 
        onConfirm={confirmCalibration} 
        initialValue={calibrationValue}
      />

      {/* Instructional Scale Toast */}
      {mode === 'CALIBRATING' && !calibrationLine && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-emerald-800/90 text-white px-4 py-2 rounded-full shadow-lg text-xs font-semibold animate-in slide-in-from-top-4 fade-in pointer-events-none whitespace-nowrap">
          Drag a line between two measurable endpoints to set the scale.
        </div>
      )}

      {/* Floating Estimate Button (Mobile Only) */}
      {polygons.length > 0 && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-24 right-4 md:hidden z-50 bg-emerald-600 text-white shadow-lg rounded-full px-5 py-3 font-bold flex items-center gap-2 animate-in slide-in-from-right-10"
        >
          View Estimate <ChevronRight className="h-4 w-4" />
        </button>
      )}

      <div className="flex-1 relative flex overflow-hidden">
        
        {/* Main Workspace */}
        <main className={`flex-1 relative flex flex-col bg-gray-200/50 transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:mr-96' : ''}`}>
          
          <div ref={containerRef} className="flex-1 overflow-hidden relative flex items-center justify-center p-4">
             {!image ? (
                 <div className="text-center space-y-6 max-w-md p-10 bg-white rounded-3xl shadow-xl border border-gray-100">
                     <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Upload className="h-10 w-10 text-emerald-500" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Start New Estimate</h3>
                        <p className="text-gray-500 leading-relaxed">
                            Upload a satellite map screenshot, drone photo, or plot plan to begin measuring.
                        </p>
                     </div>
                     <button 
                        onClick={() => fileInputRef.current.click()}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-1"
                     >
                         Browse Files
                     </button>
                 </div>
             ) : (
                <div 
                    ref={wrapperRef}
                    className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10 bg-white"
                    style={getWrapperStyle()}
                    onWheel={handleWheel}
                >
                     <canvas
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        className={`w-full h-full cursor-${
                            mode === 'PAN' ? (isPanning ? 'grabbing' : 'grab') :
                            mode === 'IDLE' ? 'default' : 'crosshair'
                        }`}
                        style={{ touchAction: 'none' }} 
                     />
                     
                     {/* Overlay Layer for Delete Buttons */}
                     {polygons.map((poly, i) => {
                         const center = getPolygonCenter(poly);
                         return (
                             <button
                                key={i}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deletePolygon(i);
                                }}
                                className="absolute w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center hover:bg-red-50 hover:scale-110 shadow-lg border border-red-100 transition-all z-20 group"
                                style={{ 
                                    // Use wrapper dimensions (canvasResolution) for correct positioning
                                    left: `${(center.x * canvasResolution.width * view.scale) + view.x}px`, 
                                    top: `${(center.y * canvasResolution.height * view.scale) + view.y}px`,
                                    transform: 'translate(-50%, -50%)' 
                                }}
                                title="Remove this area"
                             >
                                 <Trash2 className="w-4 h-4 group-hover:stroke-2" />
                             </button>
                         );
                     })}
                </div>
             )}
          </div>
          
          {/* Bottom Toolbar Section */}
          <div className="shrink-0 z-30 flex flex-col items-center bg-white/80 backdrop-blur-md border-t border-gray-200 relative">
             <div className="p-3 md:p-4 w-full flex justify-center">
                 <div className="flex items-center gap-1 md:gap-2 p-1.5 md:p-2 bg-white rounded-2xl shadow-sm border border-gray-200 w-full md:w-auto justify-between md:justify-start">
                  
                  <Tooltip text="Upload Image">
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      className="p-2 md:p-3 rounded-xl hover:bg-gray-100 text-gray-600 flex flex-col items-center gap-1 transition-all group relative overflow-hidden flex-1 md:flex-none"
                    >
                       <Upload className="h-5 w-5" />
                       <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Upload</span>
                    </button>
                  </Tooltip>
                  
                  <div className="w-px h-8 bg-gray-200 mx-1"></div>

                  <Tooltip text="Move / Pan">
                    <button 
                      onClick={() => setMode('PAN')}
                      disabled={!image}
                      className={`p-2 md:p-3 rounded-xl flex flex-col items-center gap-1 transition-all relative overflow-hidden flex-1 md:flex-none ${
                          mode === 'PAN' 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105' 
                          : !image ? 'opacity-40 cursor-not-allowed text-gray-400' : 'hover:bg-blue-50 text-gray-600 hover:text-blue-700'
                      }`}
                    >
                       <Move className="h-5 w-5" />
                       <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Move</span>
                    </button>
                  </Tooltip>

                  <Tooltip text="Set Scale">
                    <button 
                      onClick={() => {
                           setMode(mode === 'CALIBRATING' ? 'IDLE' : 'CALIBRATING');
                           setCalibrationLine(null); // Reset calibration line on click
                           setScaleFactor(null); // Clear scale factor
                           setIsDrawingScale(false); // Reset drawing state
                      }}
                      disabled={!image}
                      className={`p-2 md:p-3 rounded-xl flex flex-col items-center gap-1 transition-all relative overflow-hidden flex-1 md:flex-none ${
                          mode === 'CALIBRATING' 
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105' 
                          : !image ? 'opacity-40 cursor-not-allowed text-gray-400' : 'hover:bg-emerald-50 text-gray-600 hover:text-emerald-700'
                      }`}
                    >
                       <Ruler className="h-5 w-5" />
                       <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Scale</span>
                    </button>
                  </Tooltip>

                  <Tooltip text="Draw Lawn">
                    <button 
                      onClick={() => {
                           if (!scaleFactor) {
                               alert("Please set the Scale (Ruler) first!");
                               setMode('CALIBRATING');
                               return;
                           }
                           setMode(mode === 'DRAWING' ? 'IDLE' : 'DRAWING');
                      }}
                      disabled={!image}
                      className={`p-2 md:p-3 rounded-xl flex flex-col items-center gap-1 transition-all relative overflow-hidden flex-1 md:flex-none ${
                          mode === 'DRAWING' 
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105' 
                          : !image ? 'opacity-40 cursor-not-allowed text-gray-400' : 'hover:bg-amber-50 text-gray-600 hover:text-amber-700'
                      }`}
                    >
                       <PenTool className="h-5 w-5" />
                       <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Draw</span>
                    </button>
                  </Tooltip>
                 </div>
             </div>
             
             {/* Version Footer - Moved out of the flex row to be below */}
             <div className="pb-2 text-[10px] text-gray-400 font-mono w-full text-center md:text-right md:pr-4">
                LawnEstly version 3.9.8
             </div>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleImageUpload}
          />
        </main>

        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          rates={rates}
          setRates={setRates}
          complexity={complexity}
          setComplexity={setComplexity}
          totals={totals}
          hasContent={polygons.length > 0 || !!calibrationLine}
          scaleSet={!!scaleFactor}
          onPrint={handlePrint}
          onClear={() => {
              setPolygons([]);
              setCurrentPoly([]);
              setCalibrationLine(null);
              setScaleFactor(null);
              setView({ x: 0, y: 0, scale: 1 }); // Reset zoom on clear
          }}
        />
      </div>
    </div>
  );
}