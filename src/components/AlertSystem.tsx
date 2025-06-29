import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, Clock, Camera } from 'lucide-react';

interface Alert {
  id: string;
  timestamp: Date;
  message: string;
  confidence?: number;
}

interface AlertSystemProps {
  alerts: Alert[];
  onDismissAlert: (id: string) => void;
}

export const AlertSystem: React.FC<AlertSystemProps> = ({ alerts, onDismissAlert }) => {
  const [visibleAlerts, setVisibleAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    setVisibleAlerts(alerts.slice(-3)); // Show only last 3 alerts
  }, [alerts]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <AlertTriangle className="w-6 h-6 text-red-400" />
        <h2 className="text-xl font-bold text-white">Alert System</h2>
        {alerts.length > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {alerts.length}
          </span>
        )}
      </div>

      {/* Current Alerts */}
      <div className="space-y-3">
        {visibleAlerts.length === 0 ? (
          <div className="bg-gray-800/50 rounded-xl p-6 text-center border border-gray-700">
            <AlertTriangle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No alerts detected</p>
            <p className="text-sm text-gray-500 mt-1">Start monitoring to receive alerts</p>
          </div>
        ) : (
          visibleAlerts.map((alert, index) => (
            <div
              key={alert.id}
              className={`bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/50 rounded-xl p-4 animate-pulse ${
                index === 0 ? 'animate-bounce' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="bg-red-500 rounded-full p-2 flex-shrink-0">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-red-400 font-semibold text-sm">DETECTION ALERT</span>
                      {alert.confidence && (
                        <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                          {Math.round(alert.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                    <p className="text-white font-medium">{alert.message}</p>
                    <div className="flex items-center space-x-1 mt-2 text-gray-400 text-sm">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(alert.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onDismissAlert(alert.id)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alert History Summary */}
      {alerts.length > 3 && (
        <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">
            +{alerts.length - 3} more alerts in history
          </p>
        </div>
      )}
    </div>
  );
};