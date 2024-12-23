import React, { useState } from "react";
import { Log } from "../types/journey";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Toaster from "../utils/web-components/Toaster";
import { useWebComponentRef } from "../utils/ReactUtils";
if (!Toaster.isAlreadyRegistered()) {
  Toaster.registerSelf();
}
interface LogSearchProps {
  logs: Log[];
  onFilteredLogsChange: (filteredLogs: Log[]) => void;
}

export const LogSearch: React.FC<LogSearchProps> = ({
  logs,
  onFilteredLogsChange,
}) => {
  const [searchTitle, setSearchTitle] = useState("");
  const [searchDescription, setSearchDescription] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loadingOpen, setLoadingOpen] = useState(false);
  const { ref, refActive } = useWebComponentRef<Toaster>();

  // Generate month options dynamically from existing logs
  const monthOptions = React.useMemo(() => {
    const months = new Set(
      logs.map((log) => {
        const date = new Date(log.date);
        return date.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
      })
    );
    return Array.from(months).sort((a, b) => {
      const [monthA, yearA] = a.split(" ");
      const [monthB, yearB] = b.split(" ");
      const dateA = new Date(`${monthA} 1, ${yearA}`);
      const dateB = new Date(`${monthB} 1, ${yearB}`);
      return dateB.getTime() - dateA.getTime();
    });
  }, [logs]);
  console.log("month options", monthOptions);

  const handleSearch = () => {
    const filteredLogs = logs.filter((log) => {
      const logDate = new Date(log.date);
      const logMonthYear = logDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      const titleMatch = searchTitle
        ? log.title.toLowerCase().includes(searchTitle.toLowerCase())
        : true;

      const descriptionMatch = searchDescription
        ? log.description
            .toLowerCase()
            .includes(searchDescription.toLowerCase())
        : true;

      const monthMatch = selectedMonth ? logMonthYear === selectedMonth : true;

      return titleMatch && descriptionMatch && monthMatch;
    });
    console.log("filtered logs", filteredLogs);

    onFilteredLogsChange(filteredLogs);
  };

  const handleReset = () => {
    setSearchTitle("");
    setSearchDescription("");
    setSelectedMonth("");
    onFilteredLogsChange(logs);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4 p-2 relative">
        <Input
          placeholder="Search by title"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="Search by description"
          value={searchDescription}
          onChange={(e) => setSearchDescription(e.target.value)}
          className="flex-1"
        />
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="p-1 border-gray-300 border-2 rounded-md text-base"
        >
          <option value="">All Months</option>
          {monthOptions.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
        <div className="flex space-x-2">
          <Button
            disabled={
              (!searchTitle && !searchDescription && !selectedMonth) ||
              loadingOpen
            }
            onClick={() => {
              setLoadingOpen(true);
              handleSearch();
              setTimeout(() => {
                setLoadingOpen(false);
              }, 500);
              if (refActive()) {
                ref.current.toast("Search applied");
              }
            }}
          >
            Search
          </Button>
          <Button
            disabled={
              (!searchTitle && !searchDescription && !selectedMonth) ||
              loadingOpen
            }
            variant="outline"
            onClick={() => {
              handleReset();
              if (refActive()) {
                ref.current.toast("Search cleared");
              }
            }}
          >
            Reset
          </Button>
        </div>
        {loadingOpen && (
          <div className="absolute top-0 left-0 w-full h-full bg-gray-200/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-8 border-red-500"></div>
          </div>
        )}
      </div>
      <toaster-element
        data-position="top-left"
        data-timeout={1000}
        ref={ref}
      ></toaster-element>
    </>
  );
};
