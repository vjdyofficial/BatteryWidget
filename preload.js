const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("batteryAPI", {
  setMode: (mode) => ipcRenderer.invoke("set-power-mode", mode)
});