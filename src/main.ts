import { getStagedDiff } from "./git/gitStagedDiff";
import { analyseCommit } from "./ai/analyseCommit";
import { selectCommitMessage } from "./ui/interactive";
import { createCommit } from "./git/commit";
import { setConfig, showConfig } from "./commands/config";
import { logger } from "./services/logger.service";

async function main(): Promise<void> {
  try {
    logger.info("Using Git Ai Commit");

    const args = process.argv.slice(2);

    if (args[0] === "config") {
      if (args[1] === "set-key" && args[2]) {
        setConfig("anthropicApiKey", args[2]);
        process.exit(0);
      }
      if (args[1] === "show") {
        showConfig();
        return;
      }
    }

    const diff = await getStagedDiff();
    const suggestions = await analyseCommit(diff);

    const selectedMessage = await selectCommitMessage(suggestions);

    await createCommit(selectedMessage);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Error: ${message}`);
  }
}

void main();
