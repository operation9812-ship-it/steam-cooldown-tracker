const { app, BrowserWindow } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
  });

  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on("update-available", () => {
  console.log("Update available...");
});

autoUpdater.on("update-downloaded", () => {
  console.log("Update downloaded, will install on restart.");
});

autoUpdater.on("error", (err) => {
  console.log("Update error:", err);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});