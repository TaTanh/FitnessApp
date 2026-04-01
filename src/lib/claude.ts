// Google Gemini Vision API utilities for food analysis

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

export interface FoodAnalysisResult {
  foodName: string;
  estimatedKcal: number;
  protein: number;
  carbs: number;
  fat: number;
  portionDescription: string;
  confidence: 'high' | 'medium' | 'low';
  notes: string;
  ingredients: string[];
}

export interface ClaudeAnalysisResponse {
  success: boolean;
  data?: FoodAnalysisResult;
  error?: string;
}

/**
 * Convert an image file to base64 string
 */
export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert a canvas to base64 string
 */
export function canvasToBase64(canvas: HTMLCanvasElement): string {
  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
  return dataUrl.split(',')[1];
}

/**
 * Get MIME type from base64 or default to jpeg
 */
export function getMediaType(file: File): string {
  if (file.type.startsWith('image/')) {
    return file.type;
  }
  return 'image/jpeg';
}

/**
 * Analyze food image using Google Gemini Vision API
 */
export async function analyzeFoodImage(
  base64Image: string,
  mediaType: string = 'image/jpeg'
): Promise<ClaudeAnalysisResponse> {
  if (!GOOGLE_API_KEY) {
    return {
      success: false,
      error: 'Google API key not configured. Please set VITE_GOOGLE_API_KEY.',
    };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Bạn là chuyên gia dinh dưỡng. Phân tích món ăn trong ảnh và trả về JSON với cấu trúc sau (chỉ trả JSON, không markdown, không backtick):
{
  "foodName": "tên món ăn (tiếng Việt)",
  "estimatedKcal": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "portionDescription": "mô tả khẩu phần, ví dụ: 1 tô vừa ~300g",
  "confidence": "high" | "medium" | "low",
  "notes": "ghi chú nếu khó ước tính",
  "ingredients": ["nguyên liệu 1", "nguyên liệu 2"]
}`,
                },
                {
                  inline_data: {
                    mime_type: mediaType,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return {
        success: false,
        error: `API error: ${response.status}`,
      };
    }

    const result = await response.json();
    const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      return {
        success: false,
        error: 'No response from Gemini',
      };
    }

    // Parse the JSON response
    try {
      // Remove any markdown formatting if present
      const cleanJson = textContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const foodData: FoodAnalysisResult = JSON.parse(cleanJson);
      
      return {
        success: true,
        data: foodData,
      };
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', textContent);
      return {
        success: false,
        error: 'Failed to parse AI response',
      };
    }
  } catch (error) {
    console.error('Gemini API call failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Check if Google API is configured
 */
export function isClaudeConfigured(): boolean {
  return Boolean(GOOGLE_API_KEY);
}
