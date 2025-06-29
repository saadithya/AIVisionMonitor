interface VisionDetection {
  detected: boolean;
  confidence: number;
  description: string;
  objects: Array<{
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

class VisionService {
  private apiKey: string | null = null;
  private baseUrl = 'https://vision.googleapis.com/v1/images:annotate';

  constructor() {
    // API key should be set via environment variable or user input
    this.apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY || null;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeImage(imageData: string, prompt: string): Promise<VisionDetection> {
    if (!this.apiKey) {
      throw new Error('Google Cloud Vision API key not configured');
    }

    try {
      // Remove data URL prefix to get base64 image data
      const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

      const requestBody = {
        requests: [
          {
            image: {
              content: base64Image
            },
            features: [
              {
                type: 'OBJECT_LOCALIZATION',
                maxResults: 20
              },
              {
                type: 'LABEL_DETECTION',
                maxResults: 20
              }
            ]
          }
        ]
      };

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Vision API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const annotations = data.responses[0];

      if (annotations.error) {
        throw new Error(`Vision API error: ${annotations.error.message}`);
      }

      return this.processVisionResults(annotations, prompt);
    } catch (error) {
      console.error('Vision API error:', error);
      throw error;
    }
  }

  private processVisionResults(annotations: any, prompt: string): VisionDetection {
    const objects: Array<{
      name: string;
      confidence: number;
      boundingBox?: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }> = [];

    // Process object localization results
    if (annotations.localizedObjectAnnotations) {
      annotations.localizedObjectAnnotations.forEach((obj: any) => {
        const boundingPoly = obj.boundingPoly?.normalizedVertices;
        let boundingBox;
        
        if (boundingPoly && boundingPoly.length >= 2) {
          const minX = Math.min(...boundingPoly.map((v: any) => v.x || 0));
          const minY = Math.min(...boundingPoly.map((v: any) => v.y || 0));
          const maxX = Math.max(...boundingPoly.map((v: any) => v.x || 0));
          const maxY = Math.max(...boundingPoly.map((v: any) => v.y || 0));
          
          boundingBox = {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
          };
        }

        objects.push({
          name: obj.name.toLowerCase(),
          confidence: obj.score,
          boundingBox
        });
      });
    }

    // Process label detection results
    if (annotations.labelAnnotations) {
      annotations.labelAnnotations.forEach((label: any) => {
        objects.push({
          name: label.description.toLowerCase(),
          confidence: label.score
        });
      });
    }

    // Check if prompt matches detected objects
    const promptLower = prompt.toLowerCase();
    const promptWords = promptLower.split(/\s+/).filter(word => word.length > 2);
    
    let bestMatch = null;
    let bestConfidence = 0;

    for (const obj of objects) {
      // Check for exact matches or partial matches
      const objectWords = obj.name.split(/\s+/);
      
      for (const promptWord of promptWords) {
        for (const objectWord of objectWords) {
          if (objectWord.includes(promptWord) || promptWord.includes(objectWord)) {
            if (obj.confidence > bestConfidence) {
              bestMatch = obj;
              bestConfidence = obj.confidence;
            }
          }
        }
      }
      
      // Check for direct name match
      if (obj.name.includes(promptLower) || promptLower.includes(obj.name)) {
        if (obj.confidence > bestConfidence) {
          bestMatch = obj;
          bestConfidence = obj.confidence;
        }
      }
    }

    const detected = bestMatch !== null && bestConfidence > 0.3;

    return {
      detected,
      confidence: bestConfidence,
      description: detected 
        ? `Detected: ${bestMatch!.name} (${Math.round(bestConfidence * 100)}% confidence)`
        : `No "${prompt}" detected in current frame`,
      objects
    };
  }
}

export const visionService = new VisionService();
export type { VisionDetection };