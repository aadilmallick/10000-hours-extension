import { LocalStorage, SyncStorage } from "../../chrome-api/storage";
import { Journey, Log } from "../../types/journey";

export const appStorage = new LocalStorage({
  journies: [] as Journey[],
  mostRecentLog: null as Log | null,
});
export const appSettingsStorage = new SyncStorage({
  lastStoredDate: new Date().toDateString(),
  alarmTriggerTime: "20:00",
  notificationsEnabled: false,
});

// define static methods here
export class StorageHandler {
  static async getJournies() {
    return appStorage.get("journies");
  }

  static async saveJourney(journey: Journey) {
    const journies = await this.getJournies();
    journies.push(journey);
    await appStorage.set("journies", journies);
    return journies;
  }

  static async deleteJourney(journeyId: string) {
    const journies = await this.getJournies();
    const updatedJournies = journies.filter((j) => j.id !== journeyId);
    await appStorage.set("journies", updatedJournies);
    return updatedJournies;
  }

  static async addLog(journeyId: string, log: Log) {
    const journies = await this.getJournies();
    const updatedJournies = journies.map((j) => {
      if (j.id === journeyId) {
        j.logs.push(log);
        j.totalHoursLogged += log.hoursWorked;
      }
      return j;
    });
    await appStorage.set("journies", updatedJournies);
    return updatedJournies;
  }

  static async setMostRecentLog(log: Log) {
    await appStorage.set("mostRecentLog", log);
    return log;
  }

  static async getMostRecentLog() {
    return appStorage.get("mostRecentLog");
  }

  static async deleteLog(journeyId: string, logId: string) {
    const journies = await this.getJournies();
    const updatedJournies = journies.map((j) => {
      if (j.id === journeyId) {
        const foundLog = j.logs.find((l) => l.id === logId);
        j.logs = j.logs.filter((l) => l.id !== logId);
        if (foundLog) {
          j.totalHoursLogged -= foundLog.hoursWorked;
        }
      }
      return j;
    });
    await appStorage.set("journies", updatedJournies);
    return updatedJournies;
  }
}
