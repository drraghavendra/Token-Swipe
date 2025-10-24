const SecurityExplanation = () => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
    <h3 className="text-lg font-semibold text-blue-900 mb-2">
      🔒 You Control Your Funds
    </h3>
    <p className="text-blue-800 mb-4">
      Token Swipe uses advanced MPC technology to secure your assets. 
      <strong> We cannot access your funds without your approval.</strong>
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div className="flex items-center">
        <Shield className="w-4 h-4 text-green-500 mr-2" />
        <span>Non-custodial - You own your keys</span>
      </div>
      <div className="flex items-center">
        <Lock className="w-4 h-4 text-green-500 mr-2" />
        <span>MPC-protected transactions</span>
      </div>
    </div>
  </div>
);
