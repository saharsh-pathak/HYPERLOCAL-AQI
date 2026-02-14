import React, { useEffect, useRef } from 'react';
import { LocationData, ClusterData } from '../types';
import { NAQI_BREAKPOINTS } from '../constants';

interface AQIMapProps {
  locations: LocationData[];
  selectedId: string | null;
  onSelectLocation: (id: string) => void;
  clusters: Record<string, ClusterData>;
}

const AQIMap: React.FC<AQIMapProps> = ({ locations, selectedId, onSelectLocation, clusters }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const clusterLayersRef = useRef<{ [key: string]: any }>({});

  const getColor = (category: string) => {
    const bp = NAQI_BREAKPOINTS.find(b => b.category === category);
    const color = bp ? bp.color.replace('bg-', '') : 'gray';
    switch (color) {
      case 'red-900': return '#7f1d1d';
      case 'red-500': return '#ef4444';
      case 'orange-500': return '#f97316';
      case 'yellow-400': return '#facc15';
      case 'green-400': return '#4ade80';
      case 'green-500': return '#22c55e';
      default: return '#64748b';
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const L = (window as any).L;
    const map = L.map(mapContainerRef.current, {
      zoomControl: false, 
      scrollWheelZoom: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
      trackResize: true
    }).setView([28.620, 77.288], 14); 
    
    mapRef.current = map;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const L = (window as any).L;
    const map = mapRef.current;

    const officialStations = locations.filter(l => l.isOfficial);
    
    officialStations.forEach(official => {
      const clusterSensors = locations
        .filter(l => l.anchorId === official.id)
        .sort((a, b) => {
          const angleA = Math.atan2(a.coordinates[0] - official.coordinates[0], a.coordinates[1] - official.coordinates[1]);
          const angleB = Math.atan2(b.coordinates[0] - official.coordinates[0], b.coordinates[1] - official.coordinates[1]);
          return angleA - angleB;
        });

      if (clusterSensors.length >= 3) {
        const polygonCoords = clusterSensors.map(l => l.coordinates);
        const clusterInfo = clusters[official.id];
        
        const polyStyle = {
          color: clusterInfo?.anomalyDetected ? '#ef4444' : '#3b82f6',
          weight: 3,
          opacity: 0.6,
          fillColor: clusterInfo?.anomalyDetected ? '#ef4444' : '#3b82f6',
          fillOpacity: 0.08,
          dashArray: '10, 10',
          lineJoin: 'round'
        };

        if (clusterLayersRef.current[official.id]) {
          clusterLayersRef.current[official.id].setLatLngs(polygonCoords);
          clusterLayersRef.current[official.id].setStyle(polyStyle);
        } else {
          clusterLayersRef.current[official.id] = L.polygon(polygonCoords, polyStyle).addTo(map);
        }
      }
    });

    const currentLocIds = new Set(locations.map(l => l.id));
    Object.keys(markersRef.current).forEach(id => {
      if (!currentLocIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    locations.forEach(loc => {
      const isSelected = selectedId === loc.id;
      const color = getColor(loc.currentReading.category);
      const clusterInfo = loc.anchorId ? clusters[loc.anchorId] : null;
      const isAnomaly = clusterInfo?.memberStatus[loc.id]?.isAnomaly;
      
      let markerHtml = '';
      if (loc.isOfficial) {
        markerHtml = `
          <div class="relative flex items-center justify-center w-12 h-12 rounded-full border-[4px] border-white shadow-2xl transition-all duration-300 transform ${isSelected ? 'scale-125 ring-4 ring-blue-600/50' : 'scale-100'}" 
               style="background-color: ${color}; cursor: pointer; z-index: 1000;">
            <span class="text-white text-[13px] font-black leading-none">${loc.currentReading.aqi}</span>
            <div class="absolute -bottom-1 -right-1 bg-blue-600 p-1 rounded-full shadow-lg border border-white">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
               </svg>
            </div>
          </div>
        `;
      } else {
        markerHtml = `
          <div class="relative flex items-center justify-center w-9 h-9 rounded-full border-2 border-white shadow-lg transition-all duration-300 transform ${isSelected ? 'scale-125 ring-4 ring-blue-400/50' : 'scale-100'} ${isAnomaly ? 'animate-pulse' : ''}" 
               style="background-color: ${color}; cursor: pointer;">
            <span class="text-white text-[10px] font-bold leading-none">${loc.currentReading.aqi}</span>
            <div class="absolute -top-1 -right-1 ${isAnomaly ? 'bg-red-600' : 'bg-blue-600'} text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">
               ${isAnomaly ? '!' : 'M'}
            </div>
          </div>
        `;
      }

      const icon = L.divIcon({
        className: 'aqi-marker-container',
        html: markerHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      if (markersRef.current[loc.id]) {
        markersRef.current[loc.id].setIcon(icon);
        markersRef.current[loc.id].setZIndexOffset(isSelected ? 2000 : (loc.isOfficial ? 1500 : 500));
      } else {
        const marker = L.marker(loc.coordinates, { icon }).addTo(map);
        marker.on('click', () => onSelectLocation(loc.id));
        markersRef.current[loc.id] = marker;
      }
    });

  }, [locations, selectedId, onSelectLocation, clusters]);

  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-xl border border-slate-200">
      <div ref={mapContainerRef} className="w-full h-full bg-slate-100" />
      <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200 shadow-lg pointer-events-none">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-blue-600 bg-blue-100" />
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Enveloping Mesh</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 border-t-2 border-dashed border-blue-500" />
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest text-opacity-80">Verified Formation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AQIMap;