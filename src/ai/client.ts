import { Anthropic } from "@anthropic-ai/sdk/client.js";
import { getConfig } from "../commands/config";
import { logger } from "../services/logger.service";

interface Config {
  anthropicApiKey?: string;
  model?: string;
}

function getApiKey(): string {
  const config = getConfig() as Config;
  const apiKey = config.anthropicApiKey;

  if (apiKey !== undefined && apiKey !== "") {
    return apiKey;
  }

  throw new Error("No API key found. Run: git-panda config set anthropicApiKey <your_api_key>");
}

export function initAnthropicClient(): Anthropic {
  const apiKey = getApiKey();

  const client = new Anthropic({
    apiKey,
  });

  return client;
}

export async function testAnthropicClient(): Promise<boolean> {
  try {
    const client = initAnthropicClient();

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: "Hello, how are you?",
        },
      ],
    });

    if (message.content.length === 0) {
      throw new Error("No response from Anthropic API");
    }

    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Error initializing Anthropic client: ${message}`);
    return false;
  }
}
