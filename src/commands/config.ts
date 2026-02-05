import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../constant/message.constant";

const CONFIG_DIR = join(homedir(), ".config", "git-panda");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

interface Config {
  anthropicApiKey?: string;
  model?: string;
}

export function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    try {
      mkdirSync(CONFIG_DIR, { recursive: true });
    } catch (error: unknown) {
      console.error("Failed to create config directory:", error);
    }
  }
}

export function getConfig() {
  try {
    ensureConfigDir();

    if (!existsSync(CONFIG_FILE)) {
      return {};
    }
    return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
  } catch (error: unknown) {
    console.error("Failed to read config:", error);
    return {};
  }
}

export function setConfig(key: string, value: string) {
  try {
    ensureConfigDir();
    const config = getConfig();
    config[key as keyof Config] = value;
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (error: unknown) {
    console.error("Failed to set config:", error);
  }
}

export function showConfig() {
  try {
    const config = getConfig();
    console.log("\nCurrent Configuration:\n");
    console.log(
      `API Key: ${config.anthropicApiKey ? SUCCESS_MESSAGES.CONFIG_SET : ERROR_MESSAGES.CONFIG_SET}`
    );
    console.log(`Model: ${config.model || ERROR_MESSAGES.CONFIG_SET}`);
    console.log(`Config File: ${CONFIG_FILE}`);
    console.log("\nUse 'git-panda config set <key> <value>' to update configuration.\n");
  } catch (error: unknown) {
    console.error("Failed to show config:", error);
  }
}
