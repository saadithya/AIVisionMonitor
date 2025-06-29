import React, { useState } from 'react';
import { Key, Eye, AlertCircle, CheckCircle, Brain, Cloud } from 'lucide-react';

export type AIProvider = 'google' | 'openai';

interface ApiKeySetupProps {
  onApiKeySet: (apiKey: string, provider: AIProvider) => void;
  hasApiKey: boolean;
  currentProvider: AIProvider;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ 
  onApiKeySet, 
  hasApiKey, 
  currentProvider 
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(currentProvider);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsValidating(true);
    try {
      // Basic validation - just check if it looks like a valid API key
      if (apiKey.length < 20) {
        throw new Error('API key appears to be too short');
      }
      
      onApiKeySet(apiKey.trim(), selectedProvider);
    } catch (error) {
      console.error('API key validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  if (hasApiKey) {
    return (
      <div className="bg-green-600/20 border border-green-500/50 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">
              {currentProvider === 'google' ? 'Google Cloud Vision' : 'OpenAI GPT-4 Vision'} API Connected
            </span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-green-400 hover:text-green-300 text-sm underline"
          >
            Change Provider
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-600/20 border border-amber-500/50 rounded-xl p-6 mb-6">
      <div className="flex items-start space-x-3 mb-4">
        <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">AI Vision API Required</h3>
          <p className="text-gray-300 text-sm mb-4">
            Choose your preferred AI provider for real-time object detection and monitoring.
          </p>
        </div>
      </div>

      {/* Provider Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Select AI Provider
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setSelectedProvider('google')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedProvider === 'google'
                ? 'border-blue-500 bg-blue-600/20'
                : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Cloud className="w-6 h-6 text-blue-400" />
              <div className="text-left">
                <div className="font-semibold text-white">Google Cloud Vision</div>
                <div className="text-xs text-gray-400">Advanced object detection & localization</div>
              </div>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setSelectedProvider('openai')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedProvider === 'openai'
                ? 'border-purple-500 bg-purple-600/20'
                : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Brain className="w-6 h-6 text-purple-400" />
              <div className="text-left">
                <div className="font-semibold text-white">OpenAI GPT-4 Vision</div>
                <div className="text-xs text-gray-400">Natural language understanding</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
        <p className="text-xs text-gray-400 mb-2">
          {selectedProvider === 'google' ? 'Google Cloud Vision Setup:' : 'OpenAI API Setup:'}
        </p>
        {selectedProvider === 'google' ? (
          <ol className="text-xs text-gray-300 space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Cloud Console</a></li>
            <li>Create a new project or select an existing one</li>
            <li>Enable the Cloud Vision API</li>
            <li>Go to "Credentials" and create an API key</li>
            <li>Restrict the key to Cloud Vision API for security</li>
          </ol>
        ) : (
          <ol className="text-xs text-gray-300 space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">OpenAI API Keys</a></li>
            <li>Sign in to your OpenAI account</li>
            <li>Click "Create new secret key"</li>
            <li>Copy the API key (starts with sk-)</li>
            <li>Ensure you have GPT-4 Vision access</li>
          </ol>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Key className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`Enter your ${selectedProvider === 'google' ? 'Google Cloud Vision' : 'OpenAI'} API key`}
            className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <Eye className={`w-5 h-5 ${showKey ? 'text-purple-400' : 'text-gray-400'}`} />
          </button>
        </div>
        
        <button
          type="submit"
          disabled={!apiKey.trim() || isValidating}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isValidating ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Connecting...</span>
            </div>
          ) : (
            `Connect ${selectedProvider === 'google' ? 'Google Vision' : 'OpenAI'} API`
          )}
        </button>
      </form>
    </div>
  );
};