import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("desktop", {
  minimize: (): void => ipcRenderer.send("window:minimize"),
  maximize: (): void => ipcRenderer.send("window:maximize"),
  close: (): void => ipcRenderer.send("window:close"),
});
