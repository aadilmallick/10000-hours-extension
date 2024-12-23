import React, { useState } from "react";
import { Log } from "../types/journey";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogSearch } from "./LogSearch";

interface LogListProps {
  logs: Log[];
  onDeleteLog: (logId: string) => Promise<void>;
}

export const LogList: React.FC<LogListProps> = ({ logs, onDeleteLog }) => {
  const [filteredLogs, setFilteredLogs] = useState(logs);
  if (logs.length === 0) {
    return (
      <div className="text-center text-gray-400 py-4">
        No logs yet. Add one to track your progress!
      </div>
    );
  }

  if (logs.length !== 0 && filteredLogs.length === 0) {
    return (
      <div className="text-center text-gray-400 py-4">
        No logs match your search criteria
      </div>
    );
  }

  return (
    <>
    <h3 className="font-semibold text-lg border-b border-gray-700 pb-1 mb-3 text-center">Logs</h3>
    <LogSearch 
        logs={logs} 
        onFilteredLogsChange={setFilteredLogs} 
      />
    <div className="space-y-3 max-h-[400px] overflow-y-auto fancy-scroll">
      {filteredLogs.map((log) => (
        <Card key={log.id} className="p-3 bg-gray-800 hover:bg-gray-950 transition-colors" onClick={(e) => {
          const popover = document.getElementById(`popover-${log.id}`)
          popover.showPopover()
        }}>
          <div className="flex justify-between items-start max-w-full">
            <div className="flex-1">
              <h4 className="font-semibold text-white text-base">{log.title}</h4>
              {log.description && (
                <>
                <p 
                className="text-sm text-gray-400 mt-1 line-clamp-3 max-w-[30ch] break-words" 
                >{log.description}</p>
                <div 
                  popover="auto" 
                  className=" bg-gray-100 p-2 space-y-1 rounded-lg border border-gray-200 w-[90%] max-w-[350px]" 
                  id={`popover-${log.id}`}>
                  <h4 className="font-semibold text-black tracking-tighter text-base">{log.title}</h4>
                  <hr className="border-gray-300" />
                  <p className="text-sm text-gray-600 leading-6 break-words">{log.description}</p>
                </div>
                </>
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
              onClick={(e) => {
                e.stopPropagation()
                onDeleteLog(log.id)
              }}
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
