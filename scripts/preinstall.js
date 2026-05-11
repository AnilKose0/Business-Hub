import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "..");
const removeFile = (relativePath) => {
  const filePath = path.resolve(process.cwd(), relativePath);
  try {
    fs.unlinkSync(filePath);
  } catch {
    // ignore if missing
  }
};

removeFile("package-lock.json");
removeFile("yarn.lock");

const userAgent = process.env.npm_config_user_agent ?? "";
if (!userAgent.startsWith("pnpm/")) {
  console.error("Use pnpm instead");
  process.exit(1);
}
