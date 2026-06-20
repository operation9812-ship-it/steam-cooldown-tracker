const { app, BrowserWindow } = require("electron");
const { autoUpdater } = require("electron-updater");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 3000);
});

autoUpdater.on("update-available", () => {
  console.log("Update available...");
});

autoUpdater.on("update-downloaded", () => {
  console.log("Update downloaded, installing...");
  autoUpdater.quitAndInstall();
});

autoUpdater.on("error", (err) => {
  console.log("Update error:", err);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});