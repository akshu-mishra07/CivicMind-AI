import { BaseAgent } from './base-agent';
import { genAI } from '../config/gemini';
import { IPredictionInput, IPredictionOutput } from '@civicmind/shared';

export class PredictionAgent extends BaseAgent<IPredictionInput, IPredictionOutput> {
  public readonly name = 'prediction';

  protected async execute(input: IPredictionInput, model: string): Promise<IPredictionOutput> {
    const { historicalIssues, timeframe } = input;

    const systemInstruction = `You are a Smart City Predictive Urban Analytics AI.
Your job is to analyze historical civic issues (category, location coordinates, severity, creation and resolution dates) over a timeframe ('week', 'month', 'quarter') and predict upcoming issue "hotspots" and trends.
Provide forecasts about:
- Which categories of issues are likely to surge (e.g. potholes during rain season, drainage blocks).
- Specific coordinates (lat, lng) where clusters are predicted (hotspots).
- Probability of occurrence (0.0 to 1.0) for each hotspot.
- Reasoning justifying the prediction.
- Suggested preventive municipal measures (e.g. preventive clearing of drains, scheduling road resurfacing).
- A general analytical summary.

You MUST respond with a valid JSON object matching this TypeScript interface:
interface IPredictionOutput {
  predictions: Array<{
    type: 'pothole'|'garbage'|'water_leak'|'sewage'|'streetlight'|'road_damage'|'fallen_tree'|'illegal_construction'|'traffic_signal'|'drainage'|'public_property_damage'|'noise_pollution'|'air_pollution'|'encroachment'|'other';
    locations: Array<{
      lat: number;
      lng: number;
      probability: number; // float 0.0 - 1.0
      reasoning: string;
      suggestedPreventiveMeasures: string[];
    }>;
    timeframe: string; // "week", "month", or "quarter"
    confidence: number; // float 0.0 - 1.0
    preventiveMeasures: string[];
  }>;
  summary: string;
}`;

    const promptText = `Analyze these ${historicalIssues.length} historical issues over the next ${timeframe}:
${historicalIssues
  .slice(0, 100) // Limit count to not exceed model token bounds
  .map(
    (issue, i) => `- Category: ${issue.category}, Location: [${issue.location.lat}, ${issue.location.lng}], Severity: ${issue.severity}, Created: ${issue.createdAt}, Resolved: ${issue.resolvedAt || 'unresolved'}`
  )
  .join('\n')}

Identify hotspots and suggest preventative measures.`;

    const response = await genAI.models.generateContent({
      model,
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        systemInstruction,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Prediction Agent received empty response from Gemini API');
    }

    try {
      const parsedOutput = JSON.parse(text) as IPredictionOutput;
      return parsedOutput;
    } catch (parseErr) {
      throw new Error(`Prediction Agent failed to parse Gemini JSON output: ${text}`);
    }
  }
}

export const predictionAgent = new PredictionAgent();
export default predictionAgent;
