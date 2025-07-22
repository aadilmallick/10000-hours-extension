import React, { useEffect, useState } from "react";
import { Journey } from "../types/journey";
import { StorageHandler } from "../background/controllers/storage";

export const Stats: React.FC = () => {
  const [journeys, setJourneys] = useState<Journey[]>([]);

  useEffect(() => {
    StorageHandler.getJournies().then(setJourneys);
  }, []);

  const totalHours = journeys.reduce(
    (sum, j) => sum + j.totalHoursLogged,
    0
  );
  const totalLogs = journeys.reduce((sum, j) => sum + j.logs.length, 0);
  const lineData = React.useMemo(() => {
    const logs = journeys.flatMap((j) =>
      j.logs.map((l) => ({ date: new Date(l.date), hours: l.hoursWorked }))
    );
    logs.sort((a, b) => a.date.getTime() - b.date.getTime());
    let cumulative = 0;
    return logs.map((log) => {
      cumulative += log.hours;
      return { date: log.date, value: cumulative };
    });
  }, [journeys]);

  const maxLineValue = lineData.reduce((max, l) => Math.max(max, l.value), 0) || 1;
  const linePoints = lineData
    .map((p, i) => {
      const x = lineData.length > 1 ? (i / (lineData.length - 1)) * 100 : 50;
      const y = 100 - (p.value / maxLineValue) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const maxHoursPerJourney =
    journeys.reduce((max, j) => Math.max(max, j.totalHoursLogged), 0) || 1;

  if (journeys.length === 0) {
    return (
      <p className="text-center text-gray-400">No journey data found.</p>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-5xl mx-auto">
      <div className="grid grid-cols-3 text-center gap-4">
        <div>
          <p className="text-sm text-gray-500">Journeys</p>
          <p className="text-lg font-bold">{journeys.length}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Logs</p>
          <p className="text-lg font-bold">{totalLogs}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Hours Logged</p>
          <p className="text-lg font-bold">{totalHours.toFixed(1)}</p>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Hours Logged per Journey</h3>
        <div className="space-y-2">
          {journeys.map((j) => (
            <div key={j.id}>
              <p className="text-sm mb-1">{j.name}</p>
              <div className="w-full bg-gray-200 h-3 rounded">
                <div
                  className="bg-blue-600 h-3 rounded"
                  style={{
                    width: `${(j.totalHoursLogged / maxHoursPerJourney) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {lineData.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Cumulative Hours Over Time</h3>
          <svg
            viewBox="0 0 100 100"
            className="w-full h-40 bg-gray-100 rounded"
            preserveAspectRatio="none"
          >
            <polyline
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2"
              points={linePoints}
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default Stats;
