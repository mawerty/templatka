/**
 * Electron main process - wrapper for the web app.
 *
 * This allows running the same React + FastAPI app as a desktop application.
 * In dev mode, it loads from Vite dev server.
 * In production, it loads built static files and starts the backend.
 */

const { app, BrowserWindow, shell } = require("electron");
const { spawn } = require("node:child_process");
const path = require("node:path");

let mainWindow = null;
let backendProcess = null;

const isDev = process.env.NODE_ENV !== "production";
const FRONTEND_DEV_URL = "http://localhost:5173";
const BACKEND_PORT = 8000;

/**
 * Start the FastAPI backend server.
 * In dev mode, backend is started separately via `pnpm dev:be`.
 * In production build, we start it here.
 */
function startBackend() {
  if (isDev) {
    console.log("[Electron] Dev mode - backend should be running via pnpm dev:be");
    return;
  }

  console.log("[Electron] Starting backend server...");
  const backendDir = path.join(__dirname, "..", "backend");

  backendProcess = spawn(
    "uv",
    ["run", "uvicorn", "app.main:app", "--port", String(BACKEND_PORT)],
    {
      cwd: backendDir,
      shell: true,
      stdio: "inherit",
    }
  );

  backendProcess.on("error", (err) => {
    console.error("[Electron] Failed to start backend:", err);
  });

  backendProcess.on("exit", (code) => {
    console.log(`[Electron] Backend exited with code ${code}`);
  });
}

/**
 * Create the main application window.
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    // Modern look
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    // Dev: load from Vite dev server
    mainWindow.loadURL(FRONTEND_DEV_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // Production: load built files
    const indexPath = path.join(__dirname, "..", "frontend", "dist", "index.html");
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

/**
 * Wait for backend to be ready before showing window.
 */
async function waitForBackend(maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`http://localhost:${BACKEND_PORT}/health`);
      if (response.ok) {
        console.log("[Electron] Backend is ready");
        return true;
      }
    } catch {
      // Backend not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  console.error("[Electron] Backend failed to start");
  return false;
}

// App lifecycle
app.whenReady().then(async () => {
  startBackend();

  if (!isDev) {
    await waitForBackend();
  }

  createWindow();

  app.on("activate", () => {
    // macOS: recreate window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  // Kill backend when app closes
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }

  // macOS: keep app running unless explicitly quit
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
});


