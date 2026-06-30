import { BaseAgent } from './base-agent';
import { genAI } from '../config/gemini';
import { IPlanningAgentInput, IPlanningAgentOutput } from '@civicmind/shared';

export class PlanningAgent extends BaseAgent<IPlanningAgentInput, IPlanningAgentOutput> {
  public readonly name = 'planning';

  protected async execute(input: IPlanningAgentInput, model: string): Promise<IPlanningAgentOutput> {
    const { category, severity, description, address, imageAnalysis, priorityScore } = input;

    const systemInstruction = `You are a Smart City Public Works Planner.
Your job is to generate a comprehensive, highly realistic Repair Action Plan for a reported civic issue.
Based on the category, severity, description, address, priority score, and image analysis, you must formulate:
1. A summary of the repair strategy.
2. Step-by-step action sequence (order, description, duration per step, materials/resources needed). Status for each step should be 'pending'.
3. Budget cost estimations (min, max cost range, currency, and itemized breakdown).
4. Time estimate in days to complete the work.
5. List of required equipment/resources (e.g. ['asphalt mix', 'compactor truck']).
6. List of required labor/personnel roles (e.g. ['2 asphalt crew workers', '1 safety inspector']).
7. The code of the responsible municipal department. Map the category to one of these codes:
   - 'ROADS' (for pothole, road_damage)
   - 'SANITATION' (for garbage)
   - 'WATER' (for water_leak, sewage, drainage)
   - 'ELECTRICAL' (for streetlight, traffic_signal)
   - 'PLANNING' (for illegal_construction, encroachment)
   - 'ENVIRONMENT' (for noise_pollution, air_pollution)
   - 'GENERAL' (for public_property_damage, other)
8. Safety protocols.
9. Environmental considerations (e.g., proper disposal of waste, low-emissions machinery).

You MUST respond with a valid JSON object matching this TypeScript interface:
interface IPlanningAgentOutput {
  summary: string;
  steps: Array<{
    order: number;
    description: string;
    estimatedDuration: string; // e.g. "2 hours", "1 day"
    resources: string[];
    status: 'pending' | 'in_progress' | 'completed';
  }>;
  estimatedCost: {
    min: number;
    max: number;
    currency: string; // e.g. "USD", "INR"
    breakdown: Array<{ item: string; cost: number }>;
  };
  estimatedCompletionDays: number;
  requiredResources: string[];
  requiredPersonnel: string[];
  responsibleDepartment: 'ROADS' | 'SANITATION' | 'WATER' | 'ELECTRICAL' | 'PLANNING' | 'ENVIRONMENT' | 'GENERAL';
  safetyPrecautions?: string[];
  environmentalConsiderations?: string;
}`;

    const promptText = `Generate a detailed public works repair plan for:
- Category: ${category}
- Severity: ${severity}
- Description: "${description}"
- Address Location: "${address}"
- Calculated Priority Score: ${priorityScore}/100
- Detected Objects from image: [${imageAnalysis.detectedObjects.join(', ')}]
${imageAnalysis.estimatedSize ? `- Estimated physical size: "${imageAnalysis.estimatedSize}"` : ''}

Plan the repair process.`;

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
      throw new Error('Planning Agent received empty response from Gemini API');
    }

    try {
      const parsedOutput = JSON.parse(text) as IPlanningAgentOutput;
      return parsedOutput;
    } catch (parseErr) {
      throw new Error(`Planning Agent failed to parse Gemini JSON output: ${text}`);
    }
  }
}

export const planningAgent = new PlanningAgent();
export default planningAgent;
