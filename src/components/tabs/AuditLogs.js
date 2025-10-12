import React from 'react';
import { FileText, Clock } from 'lucide-react';

const AuditLogs = () => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-cyan-900/30 p-8 shadow-2xl tab-transition">
      <div className="flex items-center mb-8">
        <FileText className="w-9 h-9 text-cyan-400 mr-4" />
        <h2 className="text-4xl premium-heading text-white">Audit Logs</h2>
      </div>
      
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <p className="premium-body text-gray-200 text-lg mb-4">
          Track all wallet activities and system events with comprehensive audit trails
        </p>
        <p className="premium-body text-gray-400 text-sm leading-relaxed">
          Future features: View connection history, transaction approvals, security events, and detailed activity logs with timestamps and user attribution.
        </p>
      </div>

      {/* Placeholder for future content */}
      <div className="mt-8 space-y-4">
        <div className="bg-gray-800/30 rounded-lg p-5 border border-gray-700/50 flex items-center hover:bg-gray-800/50 transition-all">
          <Clock className="w-5 h-5 text-cyan-400 mr-4" />
          <div>
            <p className="premium-subheading text-white text-base">Recent Activity</p>
            <p className="premium-body text-gray-400 text-sm mt-1">No recent activities to display</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
