'use client';

import { useState, useEffect } from 'react';
import { FaWifi, FaExclamationTriangle } from 'react-icons/fa';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export default function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
        isConnected 
          ? 'bg-green-100 text-green-800 border border-green-200'
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        {isConnected ? (
          <>
            <FaWifi className="text-lg" />
            <div>
              <div className="font-semibold">Reconnected</div>
              <div className="text-sm">Real-time updates restored</div>
            </div>
          </>
        ) : (
          <>
            <FaExclamationTriangle className="text-lg" />
            <div>
              <div className="font-semibold">Connection Lost</div>
              <div className="text-sm">Attempting to reconnect...</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}