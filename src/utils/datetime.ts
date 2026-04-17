import dayjs from "dayjs";

export function formatTodoTime(value: string) {
  if (!value) {
    return "未设置时间";
  }

  return dayjs(value).format("MM-DD HH:mm");
}

export function formatFullTime(value: string) {
  if (!value) {
    return "-";
  }

  return dayjs(value).format("YYYY-MM-DD HH:mm");
}

export function toDatetimeLocalValue(value: string) {
  if (!value) {
    return "";
  }

  return dayjs(value).format("YYYY-MM-DDTHH:mm");
}

export function fromDatetimeLocalValue(value: string) {
  if (!value) {
    return "";
  }

  return dayjs(value).second(0).millisecond(0).toISOString();
}

export function isTodoDue(startTime: string, notifyBeforeMinutes: number) {
  const target = dayjs(startTime).subtract(notifyBeforeMinutes, "minute");
  return dayjs().isAfter(target) || dayjs().isSame(target);
}

export function isUpcomingToday(startTime: string) {
  return dayjs(startTime).isSame(dayjs(), "day");
}
