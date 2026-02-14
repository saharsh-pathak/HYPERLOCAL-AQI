
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { LocationData, AQICategory, ClusterData } from './types';
import { MAYUR_VIHAR_LOCATIONS, NAQI_BREAKPOINTS } from './constants';
import { calculateAQI, performTriangularVerification, generateMockHistory, calculateClusterMetrics } from './services/aqiService';
import AQIMap from './components/AQIMap';
import TrendChart from './components/TrendChart';
import VerificationBadge from './components/VerificationBadge';
import ClusterStats from './components/ClusterStats';

const App: React.FC = () => {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<string>('');
  const [clusters, setClusters] = useState<Record<string, ClusterData>>({});

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      const data: LocationData[] = MAYUR_VIHAR_LOCATIONS.map(loc => {
        const basePM = loc.isOfficial ? 85 + Math.random() * 30 : 95 + Math.random() * 50;
        const currentReading = {
          timestamp: new Date().toISOString(),
          pm25: parseFloat(basePM.toFixed(1)),
          pm10: parseFloat((basePM * 1.6).toFixed(1)),
          ...calculateAQI(basePM)
        };
        return {
          ...loc,
          coordinates: loc.coords as [number, number],
          currentReading,
          history: generateMockHistory(basePM),
          isOfficial: loc.isOfficial,
          anchorId: loc.anchorId
        };
      });

      const officialStations = data.filter(l => l.isOfficial);
      const newClusters: Record<string, ClusterData> = {};

      officialStations.forEach(official => {
        const clusterSensors = data.filter(l => l.anchorId === official.id);
        if (clusterSensors.length > 0) {
          const metrics = calculateClusterMetrics(clusterSensors, official.currentReading.pm25);
          newClusters[official.id] = { ...metrics, anchorName: official.name };
          clusterSensors.forEach(sensor => {
            sensor.verification = performTriangularVerification(
              sensor.currentReading.pm25,
              official.currentReading.pm25,
              official.currentReading.pm25 * (0.95 + Math.random() * 0.1)
            );
          });
        }
      });

      setClusters(newClusters);
      setLocations(data);
      setSelectedId(data[0].id);
      setLoading(false);
    };
    initData();
  }, []);

  const selectedLocation = useMemo(() => locations.find(l => l.id === selectedId), [locations, selectedId]);
  const activeCluster = useMemo(() => selectedLocation?.anchorId ? clusters[selectedLocation.anchorId] : null, [selectedLocation, clusters]);

  useEffect(() => {
    if (selectedLocation) {
      const getAiInsights = async () => {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Location: ${selectedLocation.name}, Mayur Vihar. AQI: ${selectedLocation.currentReading.aqi}. Advise residents concisely based on trust tier: ${selectedLocation.verification?.tier}.`
          });
          setInsights(response.text || 'Air quality is within typical range.');
        } catch (e) {
          setInsights('Health recommendation unavailable.');
        }
      };
      getAiInsights();
    }
  }, [selectedLocation]);

  const getAqiInfo = (category: AQICategory) => NAQI_BREAKPOINTS.find(b => b.category === category);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 font-black tracking-tight uppercase text-xs">Calibrating Trust Tiers...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-12">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-700 rounded-lg shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Mayur Vihar Mesh</h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-blue-600">Dynamic Confidence Engine v3.1</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-blue-600 uppercase">Trust Network: {Object.keys(clusters).length} Meshes Active</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4">
            <AQIMap locations={locations} selectedId={selectedId} onSelectLocation={setSelectedId} clusters={clusters} />
          </div>

          <div className="space-y-6">
            {Object.entries(clusters).map(([anchorId, cluster]) => (
              <div key={anchorId} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 mb-5 flex items-center justify-between">
                   <span>{cluster.anchorName} Mesh Cluster</span>
                   <span className={`text-[10px] px-3 py-1 rounded-full font-black ${cluster.confidence === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {cluster.confidence} VERIFICATION
                  </span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {locations.filter(l => l.anchorId === anchorId).map(loc => (
                    <button key={loc.id} onClick={() => setSelectedId(loc.id)} className={`p-4 rounded-2xl text-left border-2 transition-all ${selectedId === loc.id ? 'bg-blue-50 border-blue-500 shadow-lg' : 'bg-slate-50 border-transparent hover:border-blue-200'}`}>
                       <h4 className="text-[10px] font-black text-slate-700 line-clamp-1 mb-1">{loc.name}</h4>
                       <span className="text-xl font-black text-slate-900">{loc.currentReading.aqi}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          {selectedLocation ? (
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden sticky top-24">
              <div className={`h-4 ${getAqiInfo(selectedLocation.currentReading.category)?.color}`} />
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 block">Station Detail</span>
                    <h2 className="text-3xl font-black text-slate-900 leading-tight">{selectedLocation.name}</h2>
                  </div>
                  <div className={`px-6 py-4 rounded-3xl text-center ${getAqiInfo(selectedLocation.currentReading.category)?.color} text-white shadow-xl`}>
                    <div className="text-4xl font-black tracking-tighter">{selectedLocation.currentReading.aqi}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mt-1">NAQI</div>
                  </div>
                </div>

                {activeCluster && !selectedLocation.isOfficial && <ClusterStats cluster={activeCluster} />}

                <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 italic text-sm text-slate-800 leading-relaxed shadow-inner">
                  <span className="font-black text-blue-700 text-[10px] uppercase tracking-widest block mb-2">Confidence Insight:</span>
                  {insights || "Calculating dynamic trust score..."}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">PM2.5</span>
                      <span className="text-2xl font-black text-slate-800">{selectedLocation.currentReading.pm25}</span>
                   </div>
                   <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">PM10</span>
                      <span className="text-2xl font-black text-slate-800">{selectedLocation.currentReading.pm10.toFixed(0)}</span>
                   </div>
                </div>

                {selectedLocation.verification && (
                  <div className="mb-8">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-3">
                      Spatial Trust Analysis
                      <div className="h-px flex-1 bg-slate-100" />
                    </h3>
                    <VerificationBadge data={selectedLocation.verification} />
                  </div>
                )}

                <div>
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">History (24H)</h3>
                   <TrendChart data={selectedLocation.history} />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center p-12 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-bold text-center">
              Select a node to evaluate trust tiers.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
