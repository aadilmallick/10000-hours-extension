import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import "../styles/globals.css";
import "./options.css";
import {
  useChromeStorage,
  useGetOptionalPermissions,
  useWebComponentRef,
} from "../utils/ReactUtils";
import { appSettingsStorage } from "../background/controllers/storage";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  instantiateAlarm,
  reminderAlarm,
} from "../background/controllers/alarms";
import PermissionsModel from "../chrome-api/permissions";
import Toaster from "../utils/web-components/Toaster";
Toaster.registerSelf();

const optionalPermissions = new PermissionsModel({
  permissions: ["notifications"],
});

const App: React.FC<{}> = () => {
  const {
    data: alarmTriggerTime,
    loading,
    setValueAndStore: setTriggerTime,
  } = useChromeStorage(appSettingsStorage, "alarmTriggerTime");
  const [time, setTime] = useState(alarmTriggerTime);
  const { permissionsGranted, setPermissionsGranted, onCheckedChange } =
    useGetOptionalPermissions(optionalPermissions);
  const { ref: toasterRef, refActive } = useWebComponentRef<Toaster>();
  console.log(toasterRef);

  useEffect(() => {
    setTime(alarmTriggerTime);
  }, [alarmTriggerTime]);

  return (
    <>
      <div className="space-y-4 p-4 max-w-5xl mx-auto">
        <div className="flex items-center space-x-2">
          <Switch
            id="notifications"
            onCheckedChange={onCheckedChange}
            checked={permissionsGranted}
          />
          <Label htmlFor="notifications">Notifications</Label>
        </div>
        <p className="text-slate-500">
          Will send notifications every day at your desired time to remind you
          to log your hours.
        </p>
        {!loading && time && (
          <div className="flex items-center space-x-2">
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-32"
            />
            <Label htmlFor="time-input">Set Time</Label>
          </div>
        )}
        <Button
          onClick={async () => {
            await setTriggerTime(time);
            await reminderAlarm.clearAlarm();
            await instantiateAlarm(time);
            console.log(await chrome.alarms.getAll());
            if (refActive()) {
              toasterRef.current.success("Time update applied successfully");
            }
          }}
          disabled={time === alarmTriggerTime || loading}
        >
          Apply Time
        </Button>
      </div>
      <toaster-element
        ref={toasterRef}
        data-position="top-right"
      ></toaster-element>
    </>
  );
};

const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container);
root.render(<App />);
