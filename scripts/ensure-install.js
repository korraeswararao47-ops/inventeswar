// Runs automatically before `npm start` (see "prestart" in package.json).
// Installs dependencies on the first run so `npm start` works on its own.
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");

if (!fs.existsSync(path.join(root, "node_modules", "react-scripts"))) {
  console.log("\nFirst run: installing dependencies. This takes a few minutes...\n");
  const result = spawnSync("npm install", { cwd: root, stdio: "inherit", shell: true });
  if (result.status !== 0) {
    console.error("\nnpm install failed. Check your internet connection, then run: npm install --legacy-peer-deps");
    process.exit(result.status || 1);
  }
}

try {
  const env = fs.readFileSync(path.join(root, ".env"), "utf8");
  if (/^OLLAMA_API_KEY=\s*(your_ollama_api_key_here)?\s*$/m.test(env)) {
    console.warn("\nNote: OLLAMA_API_KEY in .env is not set. The app will run, but the Assistant page needs it.\n");
  }
} catch {
  console.warn("\nNote: no .env file found. Copy .env.example to .env and add your OLLAMA_API_KEY.\n");
}
