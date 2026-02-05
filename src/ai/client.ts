import { Anthropic } from "@anthropic-ai/sdk/client.js";
import * as dotenv from "dotenv";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { getConfig } from "../commands/config";

dotenv.config();
const config = getConfig();

function getApiKey(): string {
  const apiKey = config.anthropicApiKey;

  if (apiKey) {
    return apiKey;
  }

  throw new Error("No API key found. Run: git-panda config set anthropicApiKey <your_api_key>");
}

export async function initAnthropicClient(): Promise<Anthropic> {
  const apiKey = getApiKey();

  const client = new Anthropic({
    apiKey,
  });

  return client;
}

export async function testAnthropicClient(): Promise<boolean> {
  try {
    const client = await initAnthropicClient();

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

    if (!message || message.content.length === 0) {
      throw new Error("No response from Anthropic API");
    }

    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error initializing Anthropic client: ${message}`);
    return false;
  }
}
