import OpenAI from 'openai';

interface OpenAIDetection {
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

class OpenAIService {
  private client: OpenAI | null = null;
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
    if (this.apiKey) {
      this.initializeClient();
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.initializeClient();
  }

  private initializeClient() {
    if (this.apiKey) {
      this.client = new OpenAI({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true
      });
    }
  }

  async analyzeImage(imageData: string, prompt: string): Promise<OpenAIDetection> {
    if (!this.client || !this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image and determine if it contains "${prompt}". 
                
Please respond with a JSON object in this exact format:
{
  "detected": boolean,
  "confidence": number (0-1),
  "description": "detailed description of what you see and whether the prompt matches",
  "objects": [
    {
      "name": "object name",
      "confidence": number (0-1)
    }
  ]
}

Be specific about what you detect and provide confidence scores. If you see the requested item "${prompt}", set detected to true with appropriate confidence. If not found, set detected to false.`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from OpenAI');
      }

      const result = JSON.parse(jsonMatch[0]);
      
      return {
        detected: result.detected || false,
        confidence: result.confidence || 0,
        description: result.description || 'No description provided',
        objects: result.objects || []
      };

    } catch (error) {
      console.error('OpenAI Vision API error:', error);
      throw error;
    }
  }
}

export const openaiService = new OpenAIService();
export type { OpenAIDetection };