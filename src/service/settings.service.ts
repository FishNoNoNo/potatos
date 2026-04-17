import * as tauriService from "./tauri.service";
import type { PotatosSettings } from "./models";

export function getBootstrapData() {
  return tauriService.getBootstrapData();
}

export function saveSettings(payload: PotatosSettings) {
  return tauriService.saveSettings(payload);
}
