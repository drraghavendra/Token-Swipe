import React from 'react';
import { Shield, Key, UserCheck, Lock } from 'lucide-react';

export const SecurityExplanation: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
        <Shield className="w-5 h-5 mr-2" />
        Who Controls Your Funds?
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <div className="flex items-center mb-2">
            <UserCheck className="w-4 h-4 text-green-600 mr-2" />
            <span className="font-medium text-green-700">You Control</span>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Your device holds one key share</li>
            <li>• You approve every transaction</li>
            <li>• Funds cannot move without your approval</li>
            <li>• Export your backup key anytime</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <div className="flex items-center mb-2">
            <Lock className="w-4 h-4 text-blue-600 mr-2" />
            <span className="font-medium text-blue-700">TokenSwipe Helps</span>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• We hold one key share (cannot sign alone)</li>
            <li>• We help with transaction signing</li>
            <li>• We provide gas fee optimization</li>
            <li>• We enable easy recovery options</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center text-yellow-800">
          <Key className="w-4 h-4 mr-2" />
          <span className="font-medium">Important Security Note:</span>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          TokenSwipe uses MPC (Multi-Party Computation) technology. Neither you nor TokenSwipe 
          alone can access funds. Both key shares are required for transactions, ensuring 
          maximum security with user-friendly experience.
        </p>
      </div>
    </div>
  );
};
