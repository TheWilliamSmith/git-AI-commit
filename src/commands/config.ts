import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../constant/message.constant";
import { logger } from "../services/logger.service";

const CONFIG_DIR = join(homedir(), ".config", "git-panda");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

interface Config {
  anthropicApiKey?: string;
  model?: string;
}

export function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    try {
      mkdirSync(CONFIG_DIR, { recursive: true });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to create config directory: ${errorMessage}`);
    }
  }
}

export function getConfig(): Config {
  try {
    ensureConfigDir();

    if (!existsSync(CONFIG_FILE)) {
      return {};
    }
    return JSON.parse(readFileSync(CONFIG_FILE, "utf-8")) as Config;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to read config: ${errorMessage}`);
    return {};
  }
}

export function setConfig(key: string, value: string): void {
  try {
    ensureConfigDir();
    const config = getConfig();
    config[key as keyof Config] = value;
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to set config: ${errorMessage}`);
  }
}

export function showConfig(): void {
  try {
    const config = getConfig();
    logger.info("\nCurrent Configuration:\n");
    logger.info(
      `API Key: ${config.anthropicApiKey !== undefined && config.anthropicApiKey !== "" ? SUCCESS_MESSAGES.CONFIG_SET : ERROR_MESSAGES.CONFIG_SET}`
    );
    logger.info(`Model: ${config.model ?? ERROR_MESSAGES.CONFIG_SET}`);
    logger.info(`Config File: ${CONFIG_FILE}`);
    logger.info("\nUse 'git-panda config set <key> <value>' to update configuration.\n");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to show config: ${errorMessage}`);
  }
}
