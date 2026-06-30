import { GoogleGenAI } from '@google/genai';
import { env } from './env';
import { logger } from '../utils/logger';

const DEFAULT_MODEL = 'gemini-2.5-flash';

const genAI = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

logger.info('🤖 Gemini AI client initialized', {
  defaultModel: DEFAULT_MODEL,
});

/**
 * Generate content using the Gemini API.
 * @param prompt - The text prompt to send
 * @param modelName - The model to use (default: gemini-2.5-flash)
 * @returns The generated text response
 */
export async function generateContent(
  prompt: string,
  modelName: string = DEFAULT_MODEL
): Promise<string> {
  try {
    const response = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    const text = response.text;

    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    return text;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Gemini API error: ${message}`, { modelName });
    throw new Error(`Gemini API error: ${message}`);
  }
}

export { genAI, DEFAULT_MODEL };
