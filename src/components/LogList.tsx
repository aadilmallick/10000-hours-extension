import React from "react";
import { Log } from "../types/journey";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LogListProps {
  logs: Log[];
  onDeleteLog: (logId: string) => Promise<void>;
}

export const LogList: React.FC<LogListProps> = ({ logs, onDeleteLog }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center text-gray-400 py-4">
        No logs yet. Add one to track your progress!
      </div>
    );
  }

  return (
    <>
    <h3 className="font-semibold text-lg border-b border-gray-700 pb-1 mb-3 text-center">Logs</h3>
    <div className="space-y-3 max-h-[400px] overflow-y-auto fancy-scroll">
      {logs.map((log) => (
        <Card key={log.id} className="p-3 bg-gray-800">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-white">{log.title}</h4>
              {log.description && (
                <p className="text-sm text-gray-400 mt-1">{log.description}</p>
              )}
              <div className="flex space-x-3 mt-2 text-sm text-gray-400">
                <span>{(new Date(log.date)).toDateString()}</span>
                <span>•</span>
                <span>{log.hoursWorked} hours</span>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteLog(log.id)}
            >
              Delete
            </Button>
          </div>
        </Card>
      ))}
    </div>
    </>
  );
};
