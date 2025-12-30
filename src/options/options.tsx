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
import { StorageHandler } from "../background/controllers/storage";
import { uploadToGist, downloadFromGist } from "../utils/gistSync";

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
import Stats from "./Stats";
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

  const [gistToken, setGistToken] = useState("");
  const [gistId, setGistId] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Load saved PAT and Gist ID on mount
  useEffect(() => {
    StorageHandler.getGistPersonalAccessToken().then((token) =>
      setGistToken(token ?? "")
    );
    StorageHandler.getGistId().then((id) => setGistId(id ?? ""));
  }, []);

  // Save PAT
  const saveToken = async () => {
    const trimmedToken = gistToken.trim();
    setGistToken(trimmedToken);
    await StorageHandler.setGistPersonalAccessToken(trimmedToken);
    if (refActive()) toasterRef.current.success("Token saved");
  };
  // Save Gist ID
  const saveGistId = async () => {
    const trimmedGistId = gistId.trim();
    setGistId(trimmedGistId);
    await StorageHandler.setGistId(trimmedGistId);
    if (refActive()) toasterRef.current.success("Gist ID saved");
  };

  // Sync Now handler
  const syncNow = async () => {
    const shouldGoAhead = confirm(
      "Are you sure you want to push up your local changes to the remote gist? This is destructive and will overwrite remote history."
    );
    if (!shouldGoAhead) return;
    setSyncing(true);
    try {
      const journies = await StorageHandler.getJournies();
      await uploadToGist({
        gistId,
        filename: "10000-hours-data.json",
        content: JSON.stringify(journies, null, 2),
        token: gistToken,
      });
      if (refActive()) toasterRef.current.success("Synced to Gist!");
    } catch (e) {
      if (refActive()) toasterRef.current.danger("Sync failed: " + e.message);
    } finally {
      setSyncing(false);
    }
  };

  // Restore from Gist handler
  const restoreFromGist = async () => {
    const shouldRestore = confirm(
      "Are you sure you want to restore from Gist? This will overwrite your current data."
    );
    if (!shouldRestore) return;
    setRestoring(true);
    try {
      const content = await downloadFromGist({
        gistId,
        filename: "10000-hours-data.json",
        token: gistToken,
      });
      const journies = JSON.parse(content);
      await StorageHandler.saveJournies(journies);
      if (refActive()) toasterRef.current.success("Restored from Gist!");
    } catch (e) {
      if (refActive())
        toasterRef.current.danger("Restore failed: " + e.message);
    } finally {
      setRestoring(false);
    }
  };

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
      {/* Gist Sync Section */}
      <div className="space-y-2 p-4 max-w-5xl mx-auto border-t mt-8">
        <h2 className="font-bold text-lg">GitHub Gist Sync</h2>
        <div className="flex items-center space-x-2">
          <Input
            type="password"
            placeholder="GitHub Personal Access Token"
            value={gistToken}
            onChange={(e) => setGistToken(e.target.value)}
            className="w-96"
          />
          <Button onClick={saveToken} disabled={!gistToken.trim()}>
            Save Token
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Gist ID"
            value={gistId}
            onChange={(e) => setGistId(e.target.value)}
            className="w-96"
          />
          <Button onClick={saveGistId} disabled={!gistId.trim()}>
            Save Gist ID
          </Button>
        </div>
        <Button
          onClick={syncNow}
          disabled={!gistToken.trim() || !gistId.trim() || syncing}
        >
          {syncing ? "Syncing..." : "Sync Now"}
        </Button>
        <Button
          onClick={restoreFromGist}
          disabled={!gistToken.trim() || !gistId.trim() || restoring}
          variant="secondary"
          className="ml-2"
        >
          {restoring ? "Restoring..." : "Restore from Gist"}
        </Button>
        <p className="text-slate-500 text-xs max-w-xl">
          Your data will be saved to a file named{" "}
          <code>10000-hours-data.json</code> in the specified Gist. You must
          create the Gist manually and provide a token with <code>gist</code>{" "}
          scope.
        </p>
      </div>
      <Stats />
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
