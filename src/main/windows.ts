import { BrowserWindow, screen } from "electron";
import path from "node:path";

let mainWindow: BrowserWindow | null = null;
let taskbarWidgetWindow: BrowserWindow | null = null;

const IS_DEV = process.env.NODE_ENV !== "production" && !process.env.ELECTRON_IS_PACKAGED;

export const createMainWindow = (): BrowserWindow => {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    backgroundColor: "#F2EFE9",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (IS_DEV) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  return mainWindow;
};

export const createTaskbarWidget = (): BrowserWindow => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const widgetWidth = 380;
  const widgetHeight = 72;

  taskbarWidgetWindow = new BrowserWindow({
    width: widgetWidth,
    height: widgetHeight,
    x: width - widgetWidth - 20,
    y: height - widgetHeight - 10,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (IS_DEV) {
    taskbarWidgetWindow.loadURL("http://localhost:5173#widget");
  } else {
    taskbarWidgetWindow.loadFile(path.join(__dirname, "../../dist/index.html"), {
      hash: "widget"
    });
  }

  taskbarWidgetWindow.on("closed", () => {
    taskbarWidgetWindow = null;
  });

  return taskbarWidgetWindow;
};

export const toggleTaskbarWidgetMode = () => {
  if (!mainWindow || !taskbarWidgetWindow) return;

  if (mainWindow.isVisible()) {
    mainWindow.hide();
    taskbarWidgetWindow.show();
  } else {
    taskbarWidgetWindow.hide();
    mainWindow.show();
    mainWindow.focus();
  }
};

export const getMainWindow = () => mainWindow;
export const getTaskbarWidgetWindow = () => taskbarWidgetWindow;
