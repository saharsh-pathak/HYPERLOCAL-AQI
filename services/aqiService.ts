
import { AQICategory, Reading, VerificationData, LocationData, ClusterData, ClusterConfidence } from '../types';
import { NAQI_BREAKPOINTS } from '../constants';

export const calculateAQI = (pm25: number): { aqi: number, category: AQICategory } => {
  const bp = NAQI_BREAKPOINTS.find(b => pm25 >= b.minPM25 && pm25 <= b.maxPM25) || NAQI_BREAKPOINTS[NAQI_BREAKPOINTS.length - 1];
  const aqi = ((bp.maxAQI - bp.minAQI) / (bp.maxPM25 - bp.minPM25)) * (pm25 - bp.minPM25) + bp.minAQI;
  return {
    aqi: Math.round(aqi),
    category: bp.category
  };
};

/**
 * General Cluster Metrics calculation for a group of sensors anchored to a ground truth.
 */
export const calculateClusterMetrics = (
  sensors: LocationData[],
  groundTruthPM: number
): ClusterData => {
  const activeSensors = sensors.filter(s => s.currentReading.pm25 > 0);
  
  if (activeSensors.length === 0) {
    return {
      avgPM25: 0,
      confidence: 'Low',
      anomalyDetected: false,
      activeSensors: 0,
      calibrationFactor: 1,
      memberStatus: {},
      anchorName: 'Unknown'
    };
  }

  const avgPM25 = activeSensors.reduce((acc, s) => acc + s.currentReading.pm25, 0) / activeSensors.length;
  
  const memberStatus: { [id: string]: { deviation: number; isAnomaly: boolean } } = {};
  let anomaliesFound = false;

  activeSensors.forEach(s => {
    const deviation = Math.abs(s.currentReading.pm25 - avgPM25) / avgPM25;
    const isAnomaly = deviation > 0.35; // Slightly relaxed threshold for multi-cluster
    if (isAnomaly) anomaliesFound = true;
    memberStatus[s.id] = { deviation, isAnomaly };
  });

  const calibrationFactor = groundTruthPM / (avgPM25 || 1);

  let confidence: ClusterConfidence = 'High';
  const maxDev = activeSensors.length > 0 ? Math.max(...Object.values(memberStatus).map(v => v.deviation)) : 0;
  
  if (activeSensors.length < 2) confidence = 'Low';
  else if (maxDev > 0.3) confidence = 'Low';
  else if (maxDev > 0.15) confidence = 'Medium';

  return {
    avgPM25,
    confidence,
    anomalyDetected: anomaliesFound,
    activeSensors: activeSensors.length,
    calibrationFactor,
    memberStatus,
    anchorName: '' // Set by caller
  };
};

export const performTriangularVerification = (localPM: number, primaryRef: number, secondaryRef: number): VerificationData => {
  const delta12 = Math.abs(localPM - primaryRef) / (primaryRef || 1);
  const delta13 = Math.abs(localPM - secondaryRef) / (secondaryRef || 1);
  const anomalyDetected = delta12 > 0.45 && delta13 > 0.45;
  const isVerified = !anomalyDetected;
  const confidence = isVerified ? (1 - (delta12 + delta13) / 2) * 100 : 15;

  return {
    leg1_local: localPM,
    leg2_primary_ref: primaryRef,
    leg3_secondary_ref: secondaryRef,
    isVerified,
    confidence: Math.max(5, Math.min(100, Math.round(confidence))),
    anomalyDetected,
    anomalyReason: anomalyDetected ? 'Abnormal localized spike detected. Reading deviates significantly from cluster peers.' : undefined
  };
};

export const generateMockHistory = (basePM: number): Reading[] => {
  const history: Reading[] = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000);
    const variation = (Math.random() - 0.5) * 15;
    const pm25 = Math.max(5, basePM + variation);
    const { aqi, category } = calculateAQI(pm25);
    history.push({
      timestamp: time.toISOString(),
      pm25: parseFloat(pm25.toFixed(1)),
      pm10: pm25 * 1.55,
      aqi,
      category
    });
  }
  return history;
};
