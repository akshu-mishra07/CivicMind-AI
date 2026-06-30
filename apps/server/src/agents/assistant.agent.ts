import { BaseAgent } from './base-agent';
import { genAI } from '../config/gemini';
import { ICitizenAssistantInput, ICitizenAssistantOutput } from '@civicmind/shared';

export class AssistantAgent extends BaseAgent<ICitizenAssistantInput, ICitizenAssistantOutput> {
  public readonly name = 'assistant';

  protected async execute(input: ICitizenAssistantInput, model: string): Promise<ICitizenAssistantOutput> {
    const { message, conversationHistory, userIssues } = input;

    const systemInstruction = `You are CivicMind AI Assistant, a friendly and knowledgeable AI municipal service agent.
Your goal is to assist citizens in reporting community issues, looking up information about existing issues, and understanding resolution timelines.
You will be provided with:
- The citizen's message
- Prior chat conversation history
- A list of reported issues

Use this information to answer their queries.
- Be polite, helpful, and concise.
- If they ask about nearby issues or status, refer to the list of issues.
- Suggest 2-3 logical follow-up actions (e.g. ['Report new pothole', 'Check status of CVM-123456', 'View community map']).
- If you mention any specific issues from the list, return their database/ticket ID in the relatedIssueIds array.

You MUST respond with a valid JSON object matching this TypeScript interface:
interface ICitizenAssistantOutput {
  response: string; // The markdown response message to show the user
  suggestedActions?: string[]; // 2-3 buttons to suggest
  relatedIssueIds?: string[]; // ticketIds of issues mentioned in response
}`;

    // Format chat history for prompt
    const formattedHistory = conversationHistory && conversationHistory.length > 0
      ? conversationHistory.map((h: any) => `${h.role === 'user' ? 'Citizen' : 'Assistant'}: ${h.content}`).join('\n')
      : 'No chat history.';

    const promptText = `Nearby Active Issues List:
${
  userIssues && userIssues.length > 0
    ? userIssues
        .map(
          (issue: any) => `- Ticket [${issue.ticketId}]: "${issue.title}" (${issue.category}) - Status: ${issue.status}. Created at: ${issue.createdAt}`
        )
        .join('\n')
    : 'No active issues found nearby.'
}

Conversation History:
${formattedHistory}

Citizen message: "${message}"

Respond to the citizen message:`;

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
      throw new Error('Assistant Agent received empty response from Gemini API');
    }

    try {
      const parsedOutput = JSON.parse(text) as ICitizenAssistantOutput;
      return parsedOutput;
    } catch (parseErr) {
      throw new Error(`Assistant Agent failed to parse Gemini JSON output: ${text}`);
    }
  }
}

export const assistantAgent = new AssistantAgent();
export default assistantAgent;
