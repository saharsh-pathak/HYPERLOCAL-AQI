import { AQIBreakpoint, AQICategory } from './types';

export const NAQI_BREAKPOINTS: AQIBreakpoint[] = [
  {
    category: AQICategory.GOOD,
    minPM25: 0,
    maxPM25: 30,
    minAQI: 0,
    maxAQI: 50,
    color: 'bg-green-500',
    textColor: 'text-green-500',
    description: 'Minimal impact'
  },
  {
    category: AQICategory.SATISFACTORY,
    minPM25: 31,
    maxPM25: 60,
    minAQI: 51,
    maxAQI: 100,
    color: 'bg-green-400',
    textColor: 'text-green-600',
    description: 'Minor breathing discomfort to sensitive people'
  },
  {
    category: AQICategory.MODERATE,
    minPM25: 61,
    maxPM25: 90,
    minAQI: 101,
    maxAQI: 200,
    color: 'bg-yellow-400',
    textColor: 'text-yellow-600',
    description: 'Breathing discomfort to people with lungs, asthma and heart diseases'
  },
  {
    category: AQICategory.POOR,
    minPM25: 91,
    maxPM25: 120,
    minAQI: 201,
    maxAQI: 300,
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    description: 'Breathing discomfort to most people on prolonged exposure'
  },
  {
    category: AQICategory.VERY_POOR,
    minPM25: 121,
    maxPM25: 250,
    minAQI: 301,
    maxAQI: 400,
    color: 'bg-red-500',
    textColor: 'text-red-600',
    description: 'Respiratory illness on prolonged exposure'
  },
  {
    category: AQICategory.SEVERE,
    minPM25: 251,
    maxPM25: 999,
    minAQI: 401,
    maxAQI: 500,
    color: 'bg-red-900',
    textColor: 'text-red-900',
    description: 'Affects healthy people and seriously impacts those with existing diseases'
  }
];

export const MAYUR_VIHAR_LOCATIONS = [
  // Cluster 1: Enveloping Mother Dairy Plant [28.6180, 77.2840]
  { id: 'mv-p1', name: 'Phase 1 - Acharya Niketan (SW Node)', coords: [28.6120, 77.2780], isOfficial: false, anchorId: 'official-md' },
  { id: 'mv-p2', name: 'Phase 2 - Pocket B (NW Node)', coords: [28.6240, 77.2780], isOfficial: false, anchorId: 'official-md' },
  { id: 'mv-p3', name: 'Phase 1 - Trilokpuri Gate (NE Node)', coords: [28.6240, 77.2900], isOfficial: false, anchorId: 'official-md' },
  { id: 'mv-p7', name: 'Phase 1 - Pocket 4 (SE Node)', coords: [28.6120, 77.2900], isOfficial: false, anchorId: 'official-md' },
  { id: 'official-md', name: 'Mother Dairy Plant (Official Core)', coords: [28.6180, 77.2840], isOfficial: true },

  // Cluster 2: Enveloping Patparganj Station [28.6235, 77.2913]
  { id: 'mv-p4', name: 'Patparganj Village (NW Node)', coords: [28.6280, 77.2850], isOfficial: false, anchorId: 'official-pg' },
  { id: 'mv-p5', name: 'Sanjay Lake (NE Node)', coords: [28.6280, 77.2980], isOfficial: false, anchorId: 'official-pg' },
  { id: 'mv-p6', name: 'Phase 2 - Main Market (SE Node)', coords: [28.6190, 77.2980], isOfficial: false, anchorId: 'official-pg' },
  { id: 'mv-p8', name: 'IP Extension (SW Node)', coords: [28.6190, 77.2850], isOfficial: false, anchorId: 'official-pg' },
  { id: 'official-pg', name: 'Patparganj (Official Core)', coords: [28.6235, 77.2913], isOfficial: true },
];