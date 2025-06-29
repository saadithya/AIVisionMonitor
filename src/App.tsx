import React, { useState, useCallback } from 'react';
import { Shield, Eye, Zap } from 'lucide-react';
import { CameraFeed } from './components/CameraFeed';
import { MonitoringControls } from './components/MonitoringControls';
import { AlertSystem } from './components/AlertSystem';
import { ApiKeySetup, AIProvider } from './components/ApiKeySetup';
import { BoltBadge } from './components/BoltBadge';
import { useAIDetection } from './hooks/useAIDetection';
import { playAlertSound } from './utils/audioUtils';

interface Alert {
  id: string;
  timestamp: Date;
  message: string;
  confidence?: number;
}

function App() {
  const [prompt, setPrompt] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [detectionCount, setDetectionCount] = useState(0);
  
  const { analyzeFrame, isProcessing, hasApiKey, setApiKey, currentProvider } = useAIDetection();

  const handleFrameCapture = useCallback(async (imageData: string) => {
    if (!isMonitoring || !prompt.trim() || !hasApiKey) return;

    try {
      const detection = await analyzeFrame(imageData, prompt);
      
      if (detection.detected) {
        const newAlert: Alert = {
          id: Date.now().toString(),
          timestamp: new Date(),
          message: detection.description,
          confidence: detection.confidence
        };

        setAlerts(prev => [...prev, newAlert]);
        setDetectionCount(prev => prev + 1);
        playAlertSound();

        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification('AI Monitor Alert', {
            body: detection.description,
            icon: '/vite.svg'
          });
        }
      }
    } catch (error) {
      console.error('Frame analysis error:', error);
      
      // Show error alert
      const errorAlert: Alert = {
        id: Date.now().toString(),
        timestamp: new Date(),
        message: `Detection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        confidence: 0
      };
      setAlerts(prev => [...prev, errorAlert]);
    }
  }, [isMonitoring, prompt, hasApiKey, analyzeFrame]);

  const handleStartMonitoring = useCallback(async () => {
    if (!prompt.trim() || !hasApiKey) return;

    // Request notification permission
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    setIsMonitoring(true);
  }, [prompt, hasApiKey]);

  const handleStopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const handleDismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">AI Vision Monitor</h1>
              <p className="text-gray-400">Advanced webcam monitoring with Google Cloud Vision & OpenAI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* API Key Setup */}
        <ApiKeySetup 
          onApiKeySet={setApiKey} 
          hasApiKey={hasApiKey} 
          currentProvider={currentProvider}
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Camera Feed - Takes up more space */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Live Camera Feed</h2>
                {isMonitoring && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-400 text-sm font-medium">LIVE</span>
                  </div>
                )}
              </div>
              <CameraFeed
                isMonitoring={isMonitoring}
                onFrameCapture={handleFrameCapture}
              />
            </div>

            {/* Monitoring Controls */}
            <MonitoringControls
              prompt={prompt}
              setPrompt={setPrompt}
              isMonitoring={isMonitoring}
              onStartMonitoring={handleStartMonitoring}
              onStopMonitoring={handleStopMonitoring}
              detectionCount={detectionCount}
              isProcessing={isProcessing}
              hasApiKey={hasApiKey}
              currentProvider={currentProvider}
            />
          </div>

          {/* Alert System - Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 sticky top-8">
              <AlertSystem
                alerts={alerts}
                onDismissAlert={handleDismissAlert}
              />
            </div>
          </div>
        </div>

        {/* Features Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-600/10 to-purple-800/10 rounded-2xl p-6 border border-purple-500/20">
            <Eye className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Dual AI Providers</h3>
            <p className="text-gray-400 text-sm">
              Choose between Google Cloud Vision for precise object detection or OpenAI GPT-4 Vision for natural language understanding.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-600/10 to-blue-800/10 rounded-2xl p-6 border border-blue-500/20">
            <Shield className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Smart Monitoring</h3>
            <p className="text-gray-400 text-sm">
              Continuous monitoring with customizable prompts and intelligent alert systems with confidence scoring.
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-600/10 to-green-800/10 rounded-2xl p-6 border border-green-500/20">
            <Zap className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Alerts</h3>
            <p className="text-gray-400 text-sm">
              Instant notifications and audio alerts when your specified events are detected with detailed descriptions.
            </p>
          </div>
        </div>
      </div>

      {/* Bolt.new Badge */}
      <BoltBadge />
    </div>
  );
}

export default App;