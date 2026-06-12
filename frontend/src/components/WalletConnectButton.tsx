import React from 'react';
import { CheckCircle, RefreshCw } from 'lucide-react';

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
          <span className="text-xs font-semibold text-green-800">
            Connected
          </span>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      disabled={isConnecting}
      className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium whitespace-nowrap bg-white disabled:opacity-50"
    >
      {isConnecting ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <span>Connect Wallet</span>
      )}
    </button>
  );
};
