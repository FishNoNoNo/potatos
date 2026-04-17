import bus from "@/lib/utils/eventBus";
import { active } from "@/service/active.service";
import { useAppStore } from "../store/app";

let appStore: ReturnType<typeof useAppStore> | null = null;
interface EventPayload<T = any> {
  type: string;
  data: T;
}

class EventHandler {
  private eventHandlerMap: Record<string, (payload: EventPayload) => void> = {};

  recorLastActiveTime() {
    active();
  }

  async handlerSleep() {
    appStore && (await appStore.collapseShell());
    appStore && (await appStore.moveWindowToSide());
  }

  init() {
    this.eventHandlerMap = {
      "app:active": this.recorLastActiveTime,
      "app:sleep": this.handlerSleep,
    };
    for (const key in this.eventHandlerMap) {
      if (!this.eventHandlerMap[key]) continue;
      bus.on(key, this.eventHandlerMap[key]);
    }
    appStore = useAppStore();
  }

  destroy() {
    for (const key in this.eventHandlerMap) {
      if (!this.eventHandlerMap[key]) continue;
      bus.off(key, this.eventHandlerMap[key]);
    }
  }
}

const eventHandler = new EventHandler();
export default eventHandler;
