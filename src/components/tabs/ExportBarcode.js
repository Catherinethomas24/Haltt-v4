import React from 'react';
import { Barcode, QrCode } from 'lucide-react';

const ExportBarcode = () => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-cyan-900/30 p-8 shadow-2xl tab-transition">
      <div className="flex items-center mb-8">
        <Barcode className="w-9 h-9 text-cyan-400 mr-4" />
        <h2 className="text-4xl premium-heading text-white">Export Barcode</h2>
      </div>
      
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <p className="premium-body text-gray-200 text-lg mb-4">
          Generate QR codes for your wallet addresses instantly
        </p>
        <p className="premium-body text-gray-400 text-sm leading-relaxed">
          Future features: Create customizable QR codes, export wallet addresses in multiple formats, and share payment requests with embedded amount details.
        </p>
      </div>

      {/* Placeholder for future content */}
      <div className="mt-8 text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700/50">
        <QrCode className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="premium-body text-gray-400">Select a wallet to generate QR code</p>
      </div>
    </div>
  );
};

export default ExportBarcode;
