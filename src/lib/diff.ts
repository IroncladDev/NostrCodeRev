import { exec } from "@replit/extensions";
import * as Diff2HTML from "diff2html";

// Use the exec() API to check diffs and diff2html to parse it
export async function checkDiffs() {
  const { output } = await exec.exec(`git diff`);

  const json = Diff2HTML.parse(output);

  return {
    json,
    output,
  };
}
