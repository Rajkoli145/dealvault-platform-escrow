import React from 'react';
import { Shield, Zap, CheckCircle, RefreshCw } from 'lucide-react';

interface WalletConnectButtonProps {
  connectedAddress: string | null;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  connectedAddress,
  isConnecting,
  onConnect,
  onDisconnect,
}) => {
  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  if (connectedAddress) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 border border-green-200 bg-green-50 px-3 py-1.5 rounded-lg shadow-sm">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-xs font-mono font-semibold text-green-800">
            {truncateAddress(connectedAddress)}
          </span>
        </div>
        <button
          onClick={onDisconnect}
          className="text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-lg px-2.5 py-1.5 transition-colors font-medium"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      disabled={isConnecting}
      className="relative overflow-hidden group bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-md"
    >
      {isConnecting ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Connect Wallet</span>
        </>
      )}
      <div className="absolute inset-0 w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
    </button>
  );
};
