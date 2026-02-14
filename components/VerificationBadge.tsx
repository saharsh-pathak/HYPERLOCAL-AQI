
import React from 'react';
import { VerificationData } from '../types';

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);

interface Props {
  data: VerificationData;
}

const VerificationBadge: React.FC<Props> = ({ data }) => {
  return (
    <div className={`flex flex-col gap-2 p-3 rounded-lg border ${data.isVerified ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {data.isVerified ? (
            <span className="text-blue-600"><CheckIcon /></span>
          ) : (
            <span className="text-amber-600"><WarningIcon /></span>
          )}
          <span className={`text-sm font-semibold ${data.isVerified ? 'text-blue-700' : 'text-amber-700'}`}>
            {data.isVerified ? 'Cross-Verified (4 Local Nodes)' : 'Cluster Anomaly Detected'}
          </span>
        </div>
        <div className="text-xs font-bold px-2 py-0.5 rounded bg-white border border-inherit">
          Mesh Confidence: {data.confidence}%
        </div>
      </div>
      
      <p className="text-xs text-slate-500 leading-tight">
        {data.isVerified 
          ? `Validated against localized mesh cluster and official anchor station. High spatial agreement detected.`
          : data.anomalyReason}
      </p>

      <div className="flex gap-1 mt-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full ${data.isVerified ? 'bg-blue-400' : i === 1 ? 'bg-amber-400' : 'bg-slate-200'}`} />
        ))}
      </div>
    </div>
  );
};

export default VerificationBadge;
