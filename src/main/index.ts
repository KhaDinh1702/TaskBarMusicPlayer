import { app, BrowserWindow, ipcMain, globalShortcut } from "electron";

app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
import {
  createMainWindow,
  createTaskbarWidget,
  toggleTaskbarWidgetMode,
  getMainWindow,
  getTaskbarWidgetWindow
} from "./windows";
import { resolveAudioUrl, resolveTrackStreamUrl } from "./resolver";
import { PlaybackState, TrackMetadata } from "../shared/types";

const registerIpcHandlers = () => {
  ipcMain.handle("music:resolve-url", async (_event, url: string) => {
    return await resolveAudioUrl(url);
  });

  ipcMain.handle("music:get-stream-url", async (_event, track: TrackMetadata) => {
    return await resolveTrackStreamUrl(track);
  });

  ipcMain.on("window:minimize", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.minimize();
  });

  ipcMain.on("window:maximize", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.on("window:close", () => {
    app.quit();
  });

  ipcMain.on("window:toggle-widget", () => {
    toggleTaskbarWidgetMode();
  });

  ipcMain.on("playback:sync-state", (_event, state: PlaybackState) => {
    const widgetWin = getTaskbarWidgetWindow();
    if (widgetWin && !widgetWin.isDestroyed()) {
      widgetWin.webContents.send("playback:state-updated", state);
    }
  });

  ipcMain.on("playback:action", (_event, action: string) => {
    const mainWin = getMainWindow();
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.webContents.send("playback:trigger-action", action);
    }
  });
};

const registerShortcuts = () => {
  globalShortcut.register("CommandOrControl+M", () => {
    toggleTaskbarWidgetMode();
  });

  globalShortcut.register("MediaPlayPause", () => {
    const mainWin = getMainWindow();
    mainWin?.webContents.send("playback:trigger-action", "toggle");
  });

  globalShortcut.register("MediaNextTrack", () => {
    const mainWin = getMainWindow();
    mainWin?.webContents.send("playback:trigger-action", "next");
  });

  globalShortcut.register("MediaPreviousTrack", () => {
    const mainWin = getMainWindow();
    mainWin?.webContents.send("playback:trigger-action", "prev");
  });
};

app.whenReady().then(async () => {
  registerIpcHandlers();
  createMainWindow();
  createTaskbarWidget();
  registerShortcuts();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
