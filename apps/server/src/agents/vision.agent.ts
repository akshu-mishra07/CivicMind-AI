import { BaseAgent } from './base-agent';
import { genAI } from '../config/gemini';
import { IVisionAgentInput, IVisionAgentOutput } from '@civicmind/shared';

export class VisionAgent extends BaseAgent<IVisionAgentInput, IVisionAgentOutput> {
  public readonly name = 'vision';

  protected async execute(input: IVisionAgentInput, model: string): Promise<IVisionAgentOutput> {
    const { images, userDescription } = input;

    if (!images || images.length === 0) {
      throw new Error('Vision Agent requires at least one image.');
    }

    const imageParts = images.map((img) => this.formatImage(img));

    const systemInstruction = `You are a Municipal Civil Engineer and AI Computer Vision Inspector.
Analyze the user's community report issue from the provided images and description.
Categorize the issue exactly into one of the following allowed categories:
'pothole', 'garbage', 'water_leak', 'sewage', 'streetlight', 'road_damage', 'fallen_tree', 'illegal_construction', 'traffic_signal', 'drainage', 'public_property_damage', 'noise_pollution', 'air_pollution', 'encroachment', 'other'.

Determine the severity levels:
- 'critical': Immediate danger to human life, safety, or infrastructure failure.
- 'high': Severe property damage, heavy blockage of primary roads, or high hazard.
- 'medium': Mild risk, moderate damage, localized issue.
- 'low': Minor cosmetic or nuisance issue with no safety risk.

Determine confidence score (0.0 to 1.0).
Generate a concise description of the issue.
Detect objects present in the scene (e.g. ['trash piles', 'cracked asphalt', 'broken pipe']).
Assess safety hazards (e.g. "Water leak causing slippery road conditions near pedestrian crossing").
Estimate physical dimensions/size if visible.
List 3-5 action suggestions for resolution.
Generate 3-5 tags.

You MUST respond with a valid JSON object matching this TypeScript interface:
interface IVisionAgentOutput {
  category: 'pothole'|'garbage'|'water_leak'|'sewage'|'streetlight'|'road_damage'|'fallen_tree'|'illegal_construction'|'traffic_signal'|'drainage'|'public_property_damage'|'noise_pollution'|'air_pollution'|'encroachment'|'other';
  subCategory?: string;
  severity: 'critical'|'high'|'medium'|'low';
  confidence: number; // float 0.0 - 1.0
  description: string;
  detectedObjects: string[];
  safetyAssessment: string;
  estimatedSize?: string;
  suggestions: string[];
  tags: string[];
}`;

    const promptText = `Analyze the uploaded images. 
${userDescription ? `User reported description: "${userDescription}"` : 'No description provided by user.'}
Respond with a strict JSON format matching the instructions.`;

    const contents = [...imageParts, promptText];

    const response = await genAI.models.generateContent({
      model,
      contents,
      config: {
        responseMimeType: 'application/json',
        systemInstruction,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Vision Agent received empty response from Gemini API');
    }

    try {
      const parsedOutput = JSON.parse(text) as IVisionAgentOutput;
      return parsedOutput;
    } catch (parseErr) {
      throw new Error(`Vision Agent failed to parse Gemini JSON output: ${text}`);
    }
  }
}

export const visionAgent = new VisionAgent();
export default visionAgent;
