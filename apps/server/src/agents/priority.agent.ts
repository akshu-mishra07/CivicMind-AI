import { BaseAgent } from './base-agent';
import { genAI } from '../config/gemini';
import { IPriorityAgentInput, IPriorityAgentOutput } from '@civicmind/shared';

export class PriorityAgent extends BaseAgent<IPriorityAgentInput, IPriorityAgentOutput> {
  public readonly name = 'priority';

  protected async execute(input: IPriorityAgentInput, model: string): Promise<IPriorityAgentOutput> {
    const {
      category,
      severity,
      description,
      location,
      upvotes,
      createdAt,
      nearbyPOIs,
      previousComplaintsInArea,
      trafficDensity,
      populationDensity,
    } = input;

    const systemInstruction = `You are a Municipal Operations Priority Dispatcher.
Your task is to compute a priority score (0 to 100) and response tier ('critical', 'high', 'medium', 'low') for reported civic issues.
Evaluate the issue using these input factors:
1. Severity (critical, high, medium, low)
2. Proximity/Number of Hospitals (count)
3. Proximity/Number of Schools (count)
4. Traffic Density (0 to 10 score)
5. Population Density (0 to 10 score)
6. Historical/Previous Complaints in Area (count)
7. Age of Issue (days since submission)
8. Community Votes/Upvotes (interest level)

Your output must contain:
- score: Calculated priority score (0-100), where 100 is most urgent.
- level: One of 'critical' (score >= 80), 'high' (score 50-79), 'medium' (score 25-49), or 'low' (score < 25).
- factors: A key-value object repeating or normalizing the factors.
- reasoning: Detailed explanation of how the score was calculated.
- recommendedResponseTime: Target duration string (e.g. "4 hours", "24 hours", "72 hours") in which this issue must be addressed.

You MUST respond with a valid JSON object matching this TypeScript interface:
interface IPriorityAgentOutput {
  score: number; // 0 - 100
  level: 'critical' | 'high' | 'medium' | 'low';
  factors: {
    severity: number; // 1-4 scale
    nearHospital: boolean;
    nearSchool: boolean;
    trafficDensity: number; // 0-10
    populationDensity: number; // 0-10
    previousComplaints: number;
    weatherImpact: number; // 0-10
    ageOfIssue: number; // days
    communityVotes: number;
  };
  reasoning: string;
  recommendedResponseTime: string;
}`;

    const promptText = `Calculate the priority for this issue:
- Category: ${category}
- Initial Severity: ${severity}
- Description: "${description}"
- Location: lat ${location.lat}, lng ${location.lng}
- Community Upvotes: ${upvotes}
- Created At: ${createdAt}

Context Data:
- Nearby Hospitals: ${nearbyPOIs.hospitals}
- Nearby Schools: ${nearbyPOIs.schools}
- Traffic Density: ${trafficDensity !== undefined ? `${trafficDensity}/10` : 'Unknown'}
- Population Density: ${populationDensity !== undefined ? `${populationDensity}/10` : 'Unknown'}
- Previous Complaints in Area: ${previousComplaintsInArea}

Execute priority analysis.`;

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
      throw new Error('Priority Agent received empty response from Gemini API');
    }

    try {
      const parsedOutput = JSON.parse(text) as IPriorityAgentOutput;
      return parsedOutput;
    } catch (parseErr) {
      throw new Error(`Priority Agent failed to parse Gemini JSON output: ${text}`);
    }
  }
}

export const priorityAgent = new PriorityAgent();
export default priorityAgent;
