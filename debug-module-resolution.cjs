const endpoint = "http://127.0.0.1:7902/ingest/0cba2dbb-4fbd-4813-92b0-89776037cf18";
const sessionId = "e7ea9c";
const runId = process.env.DEBUG_RUN_ID || "pre-fix";
const pendingLogs = [];

function sendLog(hypothesisId, location, message, data) {
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
  pendingLogs.push(req);
}

function safeResolve(moduleName) {
  try {
    return { ok: true, value: require.resolve(moduleName) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// #region agent log
sendLog("H1", "debug-module-resolution.cjs:32", "process environment snapshot", {
  cwd: process.cwd(),
  nodePath: process.env.NODE_PATH || null,
  initCwd: process.env.INIT_CWD || null,
});
// #endregion

// #region agent log
sendLog("H2", "debug-module-resolution.cjs:40", "module.paths for current script", {
  modulePaths: module.paths,
});
// #endregion

// #region agent log
sendLog("H3", "debug-module-resolution.cjs:46", "direct package resolves", {
  reactScriptsPkg: safeResolve("react-scripts/package.json"),
  reactDevUtilsPkg: safeResolve("react-dev-utils/package.json"),
  forkCheckerPkg: safeResolve("fork-ts-checker-webpack-plugin/package.json"),
});
// #endregion

// #region agent log
sendLog("H4", "debug-module-resolution.cjs:54", "fork checker bridge resolve", {
  bridgeFile: safeResolve("react-dev-utils/ForkTsCheckerWebpackPlugin"),
});
// #endregion

try {
  require("react-dev-utils/ForkTsCheckerWebpackPlugin");
  // #region agent log
  sendLog("H4", "debug-module-resolution.cjs:62", "bridge require succeeded", {
    status: "ok",
  });
  // #endregion
} catch (error) {
  // #region agent log
  sendLog("H4", "debug-module-resolution.cjs:68", "bridge require failed", {
    errorMessage: error.message,
    code: error.code || null,
    requestPath: error.requestPath || null,
    path: error.path || null,
  });
  // #endregion
}

process.on("beforeExit", async () => {
  await Promise.allSettled(pendingLogs);
});
