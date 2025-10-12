import React from 'react';
import { UsersRound, UserPlus } from 'lucide-react';

const ManageTrustedContacts = () => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-cyan-900/30 p-8 shadow-2xl tab-transition">
      <div className="flex items-center mb-8">
        <UsersRound className="w-9 h-9 text-green-400 mr-4" />
        <h2 className="text-4xl premium-heading text-white">Manage Trusted Contacts</h2>
      </div>
      
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <p className="premium-body text-gray-200 text-lg mb-4">
          Add and manage your trusted wallet addresses securely
        </p>
        <p className="premium-body text-gray-400 text-sm leading-relaxed">
          Future features: Add trusted contacts with custom labels, organize addresses by category, enable quick send to verified wallets, and implement multi-factor contact verification.
        </p>
      </div>

      {/* Placeholder for future content */}
      <div className="mt-8 text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700/50">
        <UserPlus className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="premium-body text-gray-400 mb-5">No trusted contacts added</p>
        <button className="premium-subheading px-7 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all shadow-lg hover:shadow-green-500/20">
          Add Trusted Contact
        </button>
      </div>
    </div>
  );
};

export default ManageTrustedContacts;
