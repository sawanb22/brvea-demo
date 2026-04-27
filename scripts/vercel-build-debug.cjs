const { spawn } = require("node:child_process");

const endpoint = "http://127.0.0.1:7902/ingest/0cba2dbb-4fbd-4813-92b0-89776037cf18";
const sessionId = "e7ea9c";
const runId = process.env.DEBUG_RUN_ID || "pre-fix-build";
const pendingLogs = [];

function sendLog(hypothesisId, location, message, data) {
  // #region agent log
  const req = fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": sessionId,
    },
    body: JSON.stringify({
      sessionId,
      runId,
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  pendingLogs.push(req);
}

function safeResolve(moduleName) {
  try {
    return { ok: true, path: require.resolve(moduleName) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// #region agent log
sendLog("H1", "scripts/vercel-build-debug.cjs:39", "build runtime env snapshot", {
  nodeVersion: process.version,
  platform: process.platform,
  cwd: process.cwd(),
  ci: process.env.CI || null,
  vercel: process.env.VERCEL || null,
  vercelEnv: process.env.VERCEL_ENV || null,
  npmConfigProduction: process.env.NPM_CONFIG_PRODUCTION || null,
  nodeEnv: process.env.NODE_ENV || null,
});
// #endregion

// #region agent log
sendLog("H2", "scripts/vercel-build-debug.cjs:51", "resolver snapshot", {
  reactScriptsPkg: safeResolve("react-scripts/package.json"),
  typescriptPkg: safeResolve("typescript/package.json"),
  forkCheckerPkg: safeResolve("fork-ts-checker-webpack-plugin/package.json"),
});
// #endregion

const childEnv = {
  ...process.env,
  CI: "false",
};

// #region agent log
sendLog("H5", "scripts/vercel-build-debug.cjs:64", "build env override", {
  ciBefore: process.env.CI || null,
  ciChild: childEnv.CI,
});
// #endregion

const child = spawn("npx", ["react-scripts", "build"], {
  stdio: "inherit",
  shell: true,
  env: childEnv,
});

child.on("exit", async (code, signal) => {
  // #region agent log
  sendLog("H3", "scripts/vercel-build-debug.cjs:66", "react-scripts build finished", {
    exitCode: code,
    signal: signal || null,
  });
  // #endregion
  await Promise.allSettled(pendingLogs);
  process.exit(code ?? 1);
});

child.on("error", async (error) => {
  // #region agent log
  sendLog("H4", "scripts/vercel-build-debug.cjs:75", "react-scripts build spawn error", {
    message: error.message,
  });
  // #endregion
  await Promise.allSettled(pendingLogs);
  process.exit(1);
});
