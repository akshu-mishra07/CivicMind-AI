import { BaseAgent } from './base-agent';
import { genAI } from '../config/gemini';
import { IDuplicateAgentInput, IDuplicateAgentOutput } from '@civicmind/shared';
import { haversineDistance } from '../utils/geo';

export class DuplicateAgent extends BaseAgent<IDuplicateAgentInput, IDuplicateAgentOutput> {
  public readonly name = 'duplicate';

  protected async execute(input: IDuplicateAgentInput, model: string): Promise<IDuplicateAgentOutput> {
    const { newIssue, existingIssues } = input;

    // If there are no existing active issues nearby, it's definitely not a duplicate
    if (!existingIssues || existingIssues.length === 0) {
      return {
        isDuplicate: false,
        similarityScore: 0,
        reasoning: 'No nearby active issues in this category found.',
        visualSimilarity: 0,
        descriptionSimilarity: 0,
        locationProximityMeters: 9999,
      };
    }

    // Enrich existing issues with location distance
    const candidateIssues = existingIssues.map((issue) => {
      const distance = haversineDistance(
        newIssue.location.lat,
        newIssue.location.lng,
        issue.location.lat,
        issue.location.lng
      );
      return {
        ...issue,
        distanceMeters: Math.round(distance),
      };
    });

    const systemInstruction = `You are a Smart City Civic Data Audit Specialist.
Your task is to identify if a newly reported issue is a duplicate of an existing nearby issue.
You will receive data for a new issue and a list of existing issues.
Compare their:
1. Category and description details
2. Distance proximity (provided in meters)
3. Any visual indicators described in their descriptions

Determine if it is a duplicate (isDuplicate: true/false). If true, provide the parentIssueId (which is the _id of the matching existing issue).
Calculate a similarityScore (0.0 to 100.0) based on location, description, and category.
Calculate separate visualSimilarity (0 to 100) and descriptionSimilarity (0 to 100).
Return locationProximityMeters as the distance in meters to the matched issue (or 9999 if no match).

You MUST respond with a valid JSON object matching this TypeScript interface:
interface IDuplicateAgentOutput {
  isDuplicate: boolean;
  parentIssueId?: string; // Must match the _id of the matched existing issue
  similarityScore: number; // 0.0 - 100.0
  reasoning: string; // Brief reasoning explanation
  visualSimilarity: number; // 0 - 100
  descriptionSimilarity: number; // 0 - 100
  locationProximityMeters: number;
}`;

    const promptText = `New Issue Details:
- Category: ${newIssue.category}
- Description: "${newIssue.description}"
- Location: lat: ${newIssue.location.lat}, lng: ${newIssue.location.lng}

Candidate Nearby Existing Issues:
${candidateIssues
  .map(
    (issue, i) => `${i + 1}. [ID: ${issue._id}]
   - Category: ${issue.category}
   - Description: "${issue.description}"
   - Distance from new issue: ${issue.distanceMeters} meters
   - Reported at: ${issue.createdAt}`
  )
  .join('\n\n')}

Analyze and determine if the new report is a duplicate of any existing candidate.`;

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
      throw new Error('Duplicate Agent received empty response from Gemini API');
    }

    try {
      const parsedOutput = JSON.parse(text) as IDuplicateAgentOutput;
      return parsedOutput;
    } catch (parseErr) {
      throw new Error(`Duplicate Agent failed to parse Gemini JSON output: ${text}`);
    }
  }
}

export const duplicateAgent = new DuplicateAgent();
export default duplicateAgent;
