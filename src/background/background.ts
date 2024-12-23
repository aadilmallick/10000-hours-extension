import Action from "../chrome-api/action";
import NotificationModel from "../chrome-api/notifications";
import { Runtime } from "../chrome-api/runtime";
import { DateModel } from "../utils/Dom";
import {
  badgeAlarm,
  createBadgeAlarm,
  instantiateAlarm,
  reminderAlarm,
} from "./controllers/alarms";
import {
  appSettingsStorage,
  appStorage,
  StorageHandler,
} from "./controllers/storage";

Runtime.onInstall({
  onAll: async () => {
    await appStorage.setup();
    await appSettingsStorage.setup();
    console.log(await appStorage.get("journies"));
    const alarmTriggerTime = await appSettingsStorage.get("alarmTriggerTime");
    await instantiateAlarm(alarmTriggerTime);
    await createBadgeAlarm();
    console.log(await chrome.alarms.getAll());
  },
});

reminderAlarm.onTriggered(async () => {
  if (NotificationModel.apiAvailable) {
    NotificationModel.showBasicNotification({
      title: "Reminder",
      message: "Don't forget to log your hours",
      iconPath: "icon.png",
    });
  } else {
    console.log("Notification API not available");
  }
});

badgeAlarm.onTriggered(async () => {
  const lastLoggedDate = (await StorageHandler.getMostRecentLog())?.date;
  console.log("lastloggeddate", lastLoggedDate);
  if (!lastLoggedDate || lastLoggedDate !== new Date().toDateString()) {
    await Action.setActionBadge({
      text: "!",
      bgcolor: "#FF0000",
      textcolor: "#FFFFFF",
    });
  }
});
