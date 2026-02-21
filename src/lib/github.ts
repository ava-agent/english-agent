import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = process.env.GITHUB_REPO_OWNER!;
const repo = process.env.GITHUB_REPO_NAME!;

export async function commitDailyReport(date: string, content: string) {
  const path = `reports/${date.slice(0, 4)}/${date.slice(5, 7)}/${date}.md`;

  // Check if file already exists
  let existingSha: string | undefined;
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path });
    if (!Array.isArray(data) && data.type === "file") {
      existingSha = data.sha;
    }
  } catch {
    // File doesn't exist yet
  }

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: `feat: daily learning report for ${date}`,
    content: Buffer.from(content).toString("base64"),
    sha: existingSha,
    committer: {
      name: process.env.GITHUB_COMMITTER_NAME ?? "English Learning Bot",
      email: process.env.GITHUB_COMMITTER_EMAIL ?? "bot@english-learning.app",
    },
  });
}
