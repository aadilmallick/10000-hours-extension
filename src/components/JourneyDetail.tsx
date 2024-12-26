import React, { useState } from "react";
import { Journey, LogFormData } from "../types/journey";
import { LogForm } from "./LogForm";
import { LogList } from "./LogList";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@radix-ui/react-progress";
import { StorageHandler } from "../background/controllers/storage";

interface JourneyDetailProps {
  journey: Journey;
  onJourneyUpdate: () => Promise<void>;
  onBack: () => void;
}

export const JourneyDetail: React.FC<JourneyDetailProps> = ({
  journey: initialJourney,
  onJourneyUpdate,
  onBack,
}) => {
  const [showLogForm, setShowLogForm] = useState(false);
  const [journey, setJourney] = useState(initialJourney);

  const handleAddLog = async (logData: LogFormData) => {
    try {
      const newLog = {
        date: new Date().toDateString(),
        description: logData.description,
        hoursWorked: logData.hoursWorked,
        id: crypto.randomUUID(),
        title: logData.title,
      };

      await StorageHandler.addLog(journey.id, newLog);

      // Update local state
      setJourney((prevJourney) => ({
        ...prevJourney,
        logs: [...prevJourney.logs, newLog],
        totalHoursLogged: prevJourney.totalHoursLogged + logData.hoursWorked,
      }));

      await onJourneyUpdate();
      setShowLogForm(false);
    } catch (error) {
      alert("Failed to add log");
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!confirm("Are you sure you want to delete this log?")) return;
    try {
      const logToDelete = journey.logs.find((log) => log.id === logId);
      await StorageHandler.deleteLog(journey.id, logId);

      // Update local state
      setJourney((prevJourney) => ({
        ...prevJourney,
        logs: prevJourney.logs.filter((log) => log.id !== logId),
        totalHoursLogged:
          prevJourney.totalHoursLogged - (logToDelete?.hoursWorked || 0),
      }));

      await onJourneyUpdate();
    } catch (error) {
      alert("Failed to delete log");
    }
  };

  const progress = (journey.totalHoursLogged / journey.targetHours) * 100;
  const remainingHours = journey.targetHours - journey.totalHoursLogged;
  const daysSinceStart =
    (new Date().getTime() - new Date(journey.createdAt).getTime()) /
    (1000 * 60 * 60 * 24);
  console.log("Days since start:", daysSinceStart);
  console.log("Total hours logged:", journey.totalHoursLogged);
  console.log("Initial hours:", journey.initialHours);
  const averageHoursPerDay =
    journey.logs.length > 0
      ? (
          (journey.totalHoursLogged - journey.initialHours) /
          Math.ceil(daysSinceStart)
        ).toFixed(1)
      : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Journeys
        </Button>
        <Button
          className="bg-black text-white shadow-md hover:opacity-75 transition-opacity rounded-md
        focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100"
          onClick={() => setShowLogForm(true)}
        >
          Add Log
        </Button>
      </div>

      <Card className="p-4 bg-gray-800">
        <h2 className="text-xl font-bold text-white mb-2">{journey.name}</h2>
        <Progress value={progress} className="h-2 mb-4" />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Progress</p>
            <p className="text-white font-semibold">
              {journey.totalHoursLogged.toFixed(1)} / {journey.targetHours}{" "}
              hours
            </p>
          </div>
          <div>
            <p className="text-gray-400">Remaining</p>
            <p className="text-white font-semibold">
              {remainingHours.toFixed(1)} hours
            </p>
          </div>
          <div>
            <p className="text-gray-400">Average per Day</p>
            <p className="text-white font-semibold">
              {Number(averageHoursPerDay).toFixed(1)} hours
            </p>
          </div>
        </div>
      </Card>

      {showLogForm && (
        <LogForm
          onSubmit={handleAddLog}
          onCancel={() => setShowLogForm(false)}
          maxHoursPerDay={12}
        />
      )}

      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Activity Log</h3>
        <LogList logs={journey.logs} onDeleteLog={handleDeleteLog} />
      </div>
    </div>
  );
};
