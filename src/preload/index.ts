import { contextBridge, ipcRenderer, webUtils } from "electron";
import { ElectronAPIBridge, PlaybackState, TrackMetadata } from "../shared/types";

const apiBridge: ElectronAPIBridge = {
  resolveUrl: (url: string) => ipcRenderer.invoke("music:resolve-url", url),
  getAudioStreamUrl: (track: TrackMetadata) => ipcRenderer.invoke("music:get-stream-url", track),
  getPathForFile: (file: File) => {
    try {
      return webUtils.getPathForFile(file);
    } catch {
      return (file as any).path || "";
    }
  },
  minimizeWindow: () => ipcRenderer.send("window:minimize"),
  maximizeWindow: () => ipcRenderer.send("window:maximize"),
  closeWindow: () => ipcRenderer.send("window:close"),
  toggleTaskbarWidget: () => ipcRenderer.send("window:toggle-widget"),
  syncPlaybackState: (state: PlaybackState) => ipcRenderer.send("playback:sync-state", state),
  onPlaybackAction: (callback: (action: string) => void) => {
    const subscription = (_event: any, action: string) => callback(action);
    ipcRenderer.on("playback:trigger-action", subscription);
    return () => {
      ipcRenderer.removeListener("playback:trigger-action", subscription);
    };
  }
};

contextBridge.exposeInMainWorld("electronAPI", apiBridge);

// Listeners specifically for the taskbar widget to receive state
contextBridge.exposeInMainWorld("widgetBridge", {
  onStateUpdate: (callback: (state: PlaybackState) => void) => {
    const handler = (_event: any, state: PlaybackState) => callback(state);
    ipcRenderer.on("playback:state-updated", handler);
    return () => {
      ipcRenderer.removeListener("playback:state-updated", handler);
    };
  },
  sendAction: (action: string) => {
    ipcRenderer.send("playback:action", action);
  },
  toggleWidget: () => {
    ipcRenderer.send("window:toggle-widget");
  }
});
