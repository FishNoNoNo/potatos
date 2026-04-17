import bus from "@/lib/utils/eventBus";

let lastActiveTime: number = Date.now();
let timer: number | undefined = undefined;

const ACTIVE_THRESHOLD = 1000 * 60 * 1;

function checkActive() {
  const now = Date.now();
  if (now - lastActiveTime > ACTIVE_THRESHOLD) {
    console.log("休眠");
    bus.emit("app:sleep");
    lastActiveTime = now;
  }
}

function checkLoop() {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
  }
  timer = window.setInterval(() => {
    checkActive();
  }, 1000);
}

export function active() {
  console.log("active");
  lastActiveTime = Date.now();
}

export function startCheckActive() {
  checkLoop();
}
