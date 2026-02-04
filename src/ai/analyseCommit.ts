import { initAnthropicClient } from "./client";

export interface CommitSuggestion {
  message: string;
  description: string;
}

export async function analyseCommit(diff: string): Promise<CommitSuggestion[]> {
  try {
    const client = await initAnthropicClient();

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Analyze this git diff and suggest AT LEAST 5 commit messages following Conventional Commits format.

            CRITICAL: Provide multiple options with varying levels of detail and grouping.

            Rules:
            - Use types: feat, fix, chore, refactor, docs, style, test, perf
            - Provide at least 5 different suggestions with varying approaches:
            1. One highly grouped message combining most/all changes
            2. A few moderately grouped messages
            3. Some more specific/atomic suggestions
            - Use "and" or commas to combine related changes
            - Format: type(scope): add/update/fix X and Y
            - Be creative with different scopes and emphasis

            Examples of variety:
            ✅ "feat(dev): add Makefile and improve Docker configuration"
            ✅ "chore(config): update development environment setup"
            ✅ "feat(docker): add Makefile for quick development startup"
            ✅ "chore(deps): add better-auth and update dependencies"
            ✅ "refactor(dev): improve development tooling and naming"

            Return ONLY a JSON array with AT LEAST 5 suggestions:
            [
                {
                    "message": "feat(dev): add development tooling and improve configuration",
                    "description": "Adds Makefile for quick setup and renames Docker services"
                },
                {
                    "message": "chore(config): enhance development environment",
                    "description": "Improves Docker setup and adds convenience scripts"
                }
            ]

            Git diff:
            ${diff}`,
        },
      ],
    });

    const content = response.content[0];

    if (content.type !== "text") {
      throw new Error("Expected text response from API");
    }

    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const suggestions: CommitSuggestion[] = JSON.parse(jsonMatch[0]) as CommitSuggestion[];
    return suggestions;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to analyse commit: ${message}`);
  }
}
