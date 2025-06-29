import { useState, useCallback } from 'react';
import { visionService, VisionDetection } from '../services/visionService';
import { openaiService, OpenAIDetection } from '../services/openaiService';
import { AIProvider } from '../components/ApiKeySetup';

interface Detection {
  detected: boolean;
  confidence: number;
  description: string;
  objects?: Array<{
    name: string;
    confidence: number;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
}

export const useAIDetection = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<AIProvider>('google');

  const setApiKey = useCallback((apiKey: string, provider: AIProvider) => {
    if (provider === 'google') {
      visionService.setApiKey(apiKey);
    } else {
      openaiService.setApiKey(apiKey);
    }
    setCurrentProvider(provider);
    setHasApiKey(true);
  }, []);

  const analyzeFrame = useCallback(async (imageData: string, prompt: string): Promise<Detection> => {
    if (!hasApiKey) {
      throw new Error('AI API key not configured');
    }

    setIsProcessing(true);
    
    try {
      let result: VisionDetection | OpenAIDetection;
      
      if (currentProvider === 'google') {
        result = await visionService.analyzeImage(imageData, prompt);
      } else {
        result = await openaiService.analyzeImage(imageData, prompt);
      }
      
      return {
        detected: result.detected,
        confidence: result.confidence,
        description: result.description,
        objects: result.objects
      };
    } catch (error) {
      console.error('AI Detection error:', error);
      
      // Fallback to simulation if API fails
      console.warn('Falling back to simulated detection due to API error');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const keywords = prompt.toLowerCase().split(' ');
      const commonObjects = ['person', 'car', 'dog', 'cat', 'red', 'blue', 'green', 'door', 'window'];
      const hasCommonKeyword = keywords.some(keyword => commonObjects.includes(keyword));
      const randomConfidence = Math.random();
      const detected = hasCommonKeyword && randomConfidence > 0.7;
      
      return {
        detected,
        confidence: detected ? 0.8 + Math.random() * 0.2 : randomConfidence,
        description: detected 
          ? `Detected: ${prompt} (simulated - ${currentProvider} API failed)` 
          : `No ${prompt} detected in current frame (simulated - ${currentProvider} API failed)`
      };
    } finally {
      setIsProcessing(false);
    }
  }, [hasApiKey, currentProvider]);

  return { analyzeFrame, isProcessing, hasApiKey, setApiKey, currentProvider };
};