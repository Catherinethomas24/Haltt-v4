import React from 'react';
import { UserX, ShieldAlert } from 'lucide-react';

const ManageBlocklist = () => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-cyan-900/30 p-8 shadow-2xl tab-transition">
      <div className="flex items-center mb-8">
        <UserX className="w-9 h-9 text-red-400 mr-4" />
        <h2 className="text-4xl premium-heading text-white">Manage Blocklist</h2>
      </div>
      
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <p className="premium-body text-gray-200 text-lg mb-4">
          Block suspicious addresses and prevent unwanted interactions
        </p>
        <p className="premium-body text-gray-400 text-sm leading-relaxed">
          Future features: Add or remove blocked addresses with notes, view comprehensive blocklist history with timestamps, and configure intelligent auto-block rules based on risk patterns.
        </p>
      </div>

      {/* Placeholder for future content */}
      <div className="mt-8 text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700/50">
        <ShieldAlert className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="premium-body text-gray-400">No blocked addresses</p>
      </div>
    </div>
  );
};

export default ManageBlocklist;
