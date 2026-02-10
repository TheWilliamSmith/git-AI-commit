import simpleGit from "simple-git";
import { logger } from "../services/logger.service";

const git = simpleGit();

export async function createCommit(message: string): Promise<void> {
  try {
    await git.commit(message);
    await git.push();
    logger.info("\n✅ Commit created successfully!");
    logger.info(`📝 Message: ${message}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to create commit: ${errorMessage}`);
  }
}

export async function hasUncommittedChanges(): Promise<boolean> {
  const status = await git.status();
  return status.staged.length > 0;
}
