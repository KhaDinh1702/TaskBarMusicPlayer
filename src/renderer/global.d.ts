import { ElectronAPIBridge, PlaybackState } from "../shared/types";

export interface WidgetBridge {
  onStateUpdate: (callback: (state: PlaybackState) => void) => () => void;
  sendAction: (action: string) => void;
  toggleWidget: () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPIBridge;
    widgetBridge?: WidgetBridge;
  }
}
