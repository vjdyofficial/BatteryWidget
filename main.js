const { app, BrowserWindow, ipcMain, Tray, Menu } = require("electron");
const { exec } = require("child_process");
const path = require("path");

let mainWindow;
let tray;

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on("second-instance", () => {
        showWidget();
    });

    app.whenReady().then(() => {
        createTray();
    });
}

// NEVER quit automatically; app always runs in background
app.on("window-all-closed", (e) => {
    e.preventDefault();
});

// Function to create the widget window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 300,
        height: 400,
        frame: false,
        alwaysOnTop: true,
        resizable: false,
        transparent: true,
        skipTaskbar: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            devTools: false
        }
    });

    mainWindow.loadFile("index.html");
    mainWindow.setAlwaysOnTop(true, "screen-saver");

    // Destroy window on blur
    mainWindow.on("blur", () => {
        if (!mainWindow.isDestroyed()) mainWindow.destroy();
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

// Show or recreate widget
function showWidget() {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
        mainWindow.focus();
    } else {
        createWindow();
    }
}

// Tray setup
function createTray() {
    tray = new Tray(path.join(__dirname, "icon.png"));
    const contextMenu = Menu.buildFromTemplate([
        { label: "Quit", click: () => app.quit() }
    ]);
    tray.setToolTip("Battery Modes Widget");

    tray.on("click", () => {
        showWidget();
    });

    tray.setContextMenu(contextMenu);
}

// IPC for battery modes
ipcMain.handle("set-power-mode", async (_, mode) => {
    const plans = {
        balanced: "381b4222-f694-41f0-9685-ff5bb260df2e",
        high: "8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c",
        saving: "a1841308-3541-4fab-bc81-f71556f20b4a",
        ultimate: "82d65b99-82b5-407c-b137-56fb07cd7c7d"
    };
    const guid = plans[mode];
    if (!guid) return { success: false, message: "Invalid mode" };

    return new Promise((resolve) => {
        exec(`powercfg /s ${guid}`, (error) => {
            if (error) resolve({ success: false, message: error.message });
            else resolve({ success: true, message: `${mode} mode enabled` });
        });
    });
});