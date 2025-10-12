import React from 'react';
import { Flag, AlertTriangle } from 'lucide-react';

const ManualFraudReporting = () => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-cyan-900/30 p-8 shadow-2xl tab-transition">
      <div className="flex items-center mb-8">
        <Flag className="w-9 h-9 text-red-400 mr-4" />
        <h2 className="text-4xl premium-heading text-white">Manual Fraud Reporting</h2>
      </div>
      
      <div className="bg-red-900/20 rounded-lg p-6 border border-red-800/50">
        <div className="flex items-start">
          <AlertTriangle className="w-6 h-6 text-red-400 mr-4 mt-1" />
          <div>
            <p className="premium-subheading text-red-200 text-lg mb-2">
              Report Suspicious Activity
            </p>
            <p className="premium-body text-red-300/80 text-sm leading-relaxed">
              Report suspicious transactions and addresses to help protect the community
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <p className="premium-body text-gray-400 text-sm leading-relaxed">
          Future features: Submit detailed fraud reports with evidence, track investigation status in real-time, and receive automated alerts about flagged addresses and suspicious patterns.
        </p>
      </div>
    </div>
  );
};

export default ManualFraudReporting;
