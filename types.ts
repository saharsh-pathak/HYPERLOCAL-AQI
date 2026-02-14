
export enum AQICategory {
  GOOD = 'Good',
  SATISFACTORY = 'Satisfactory',
  MODERATE = 'Moderate',
  POOR = 'Poor',
  VERY_POOR = 'Very Poor',
  SEVERE = 'Severe'
}

export type ClusterConfidence = 'High' | 'Medium' | 'Low';

export interface ClusterData {
  avgPM25: number;
  confidence: ClusterConfidence;
  anomalyDetected: boolean;
  activeSensors: number;
  calibrationFactor: number;
  memberStatus: { [id: string]: { deviation: number; isAnomaly: boolean } };
  anchorName: string;
}

export interface AQIBreakpoint {
  category: AQICategory;
  minPM25: number;
  maxPM25: number;
  minAQI: number;
  maxAQI: number;
  color: string;
  textColor: string;
  description: string;
}

export interface Reading {
  timestamp: string;
  pm25: number;
  pm10: number;
  aqi: number;
  category: AQICategory;
}

export interface VerificationData {
  leg1_local: number;
  leg2_primary_ref: number;
  leg3_secondary_ref: number;
  isVerified: boolean;
  confidence: number;
  anomalyDetected: boolean;
  anomalyReason?: string;
}

export interface LocationData {
  id: string;
  name: string;
  coordinates: [number, number];
  currentReading: Reading;
  history: Reading[];
  verification?: VerificationData;
  isOfficial: boolean;
  anchorId?: string;
}
