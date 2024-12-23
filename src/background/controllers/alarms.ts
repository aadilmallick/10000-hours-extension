import { ChromeAlarm } from "../../chrome-api/alarms";
import { DateModel } from "../../utils/Dom";

export const reminderAlarm = new ChromeAlarm("reminder");
export const badgeAlarm = new ChromeAlarm("badge");

export async function instantiateAlarm(alarmTriggerTime: string) {
  await reminderAlarm.upsertAlarm({
    when: DateModel.convertTimeToDate(alarmTriggerTime).getTime(),
    periodInMinutes: 24 * 60,
  });
}

export async function createBadgeAlarm() {
  await badgeAlarm.upsertAlarm({
    when: Date.now(),
    periodInMinutes: 24 * 60,
  });
}
