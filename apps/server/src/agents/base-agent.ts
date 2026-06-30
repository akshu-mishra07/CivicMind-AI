import { genAI, DEFAULT_MODEL } from '../config/gemini';
import { AgentName, IAgentExecutionLog } from '@civicmind/shared';
import { logger } from '../utils/logger';

export abstract class BaseAgent<TInput, TOutput> {
  public abstract readonly name: AgentName;
  protected readonly defaultModel: string = DEFAULT_MODEL;

  /**
   * Run the AI agent process
   */
  public async run(input: TInput, modelName?: string): Promise<{ output: TOutput; log: IAgentExecutionLog }> {
    const startedAt = new Date().toISOString();
    const startTime = Date.now();
    const model = modelName || this.defaultModel;

    logger.info(`🤖 Starting Agent: [${this.name}] using model: [${model}]`);

    try {
      const output = await this.execute(input, model);
      const durationMs = Date.now() - startTime;
      const completedAt = new Date().toISOString();

      const log: IAgentExecutionLog = {
        agent: this.name,
        startedAt,
        completedAt,
        durationMs,
        success: true,
        model,
      };

      logger.info(`✅ Agent [${this.name}] completed successfully in ${durationMs}ms`);
      return { output, log };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const completedAt = new Date().toISOString();
      const errorMessage = error instanceof Error ? error.message : String(error);

      const log: IAgentExecutionLog = {
        agent: this.name,
        startedAt,
        completedAt,
        durationMs,
        success: false,
        error: errorMessage,
        model,
      };

      logger.error(`❌ Agent [${this.name}] failed in ${durationMs}ms: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Abstract execution method to be implemented by each agent subclasses
   */
  protected abstract execute(input: TInput, model: string): Promise<TOutput>;

  /**
   * Helper to format image data to Gemini inlineData structure
   * Handles both url-like paths and base64 strings
   */
  protected formatImage(image: string): { inlineData: { data: string; mimeType: string } } {
    // If it's already a clean base64 data url
    if (image.startsWith('data:')) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        return {
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        };
      }
    }

    // Default to jpeg if no base64 prefix
    return {
      inlineData: {
        mimeType: 'image/jpeg',
        data: image,
      },
    };
  }
}
