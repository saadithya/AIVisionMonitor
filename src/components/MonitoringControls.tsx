import React, { useState } from 'react';
import { Play, Square, Settings, AlertCircle, Cloud, Brain } from 'lucide-react';
import { AIProvider } from './ApiKeySetup';

interface MonitoringControlsProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isMonitoring: boolean;
  onStartMonitoring: () => void;
  onStopMonitoring: () => void;
  detectionCount: number;
  isProcessing: boolean;
  hasApiKey: boolean;
  currentProvider: AIProvider;
}

export const MonitoringControls: React.FC<MonitoringControlsProps> = ({
  prompt,
  setPrompt,
  isMonitoring,
  onStartMonitoring,
  onStopMonitoring,
  detectionCount,
  isProcessing,
  hasApiKey,
  currentProvider
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getProviderIcon = () => {
    return currentProvider === 'google' ? <Cloud className="w-4 h-4" /> : <Brain className="w-4 h-4" />;
  };

  const getProviderName = () => {
    return currentProvider === 'google' ? 'Google Vision AI' : 'OpenAI GPT-4 Vision';
  };

  const getPromptPlaceholder = () => {
    if (currentProvider === 'google') {
      return "Describe what you want to detect... (e.g., 'person', 'red car', 'dog', 'someone wearing a hat')";
    } else {
      return "Describe what you want to detect in natural language... (e.g., 'a person at the door', 'someone wearing red', 'a delivery package')";
    }
  };

  const getPromptSuggestions = () => {
    if (currentProvider === 'google') {
      return "💡 Try: \"person\", \"car\", \"dog\", \"red object\", \"someone at the door\", \"package\"";
    } else {
      return "💡 Try: \"a person entering the room\", \"someone wearing a mask\", \"a delivery truck\", \"suspicious activity\"";
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="w-6 h-6 text-purple-400" />
        <h2 className="text-xl font-bold text-white">Monitoring Controls</h2>
        {hasApiKey && (
          <div className="flex items-center space-x-1 text-green-400 text-sm">
            {getProviderIcon()}
            <span>{getProviderName()}</span>
          </div>
        )}
      </div>

      {/* AI Prompt Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Detection Prompt
          {currentProvider === 'openai' && (
            <span className="ml-2 text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
              Natural Language
            </span>
          )}
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={getPromptPlaceholder()}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          rows={3}
          disabled={isMonitoring}
        />
        {hasApiKey && (
          <p className="text-xs text-gray-400 mt-2">
            {getPromptSuggestions()}
          </p>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-4 mb-6">
        {!isMonitoring ? (
          <button
            onClick={onStartMonitoring}
            disabled={!prompt.trim() || !hasApiKey || isProcessing}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <Play className="w-5 h-5" />
            <span>Start Monitoring</span>
          </button>
        ) : (
          <button
            onClick={onStopMonitoring}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Square className="w-5 h-5" />
            <span>Stop Monitoring</span>
          </button>
        )}

        {isProcessing && (
          <div className="flex items-center space-x-2 text-blue-400">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Analyzing with {getProviderName()}...</span>
          </div>
        )}
      </div>

      {/* Warning for missing API key */}
      {!hasApiKey && (
        <div className="bg-amber-600/20 border border-amber-500/50 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">
              AI API key required for monitoring
            </span>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl p-4 border border-purple-500/30">
          <div className="text-2xl font-bold text-purple-400">{detectionCount}</div>
          <div className="text-sm text-gray-400">Detections</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-xl p-4 border border-blue-500/30">
          <div className="text-2xl font-bold text-blue-400">
            {isMonitoring ? 'ACTIVE' : 'IDLE'}
          </div>
          <div className="text-sm text-gray-400">Status</div>
        </div>
        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-xl p-4 border border-green-500/30">
          <div className="text-2xl font-bold text-green-400">
            {hasApiKey ? 'READY' : 'SETUP'}
          </div>
          <div className="text-sm text-gray-400">AI Status</div>
        </div>
      </div>
    </div>
  );
};