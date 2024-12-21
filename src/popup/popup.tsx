import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
// import "../index.css";
import "../styles/globals.css";
import "./popup.css";
import Toaster from "../utils/web-components/Toaster";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "../utils/web-components/LoaderElement";
import { PageLoaderElement } from "../utils/web-components/PageLoaderElement";
import { isValidJourney, Journey } from "../types/journey";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { JourneyDetail } from "../components/JourneyDetail";
import { appSettingsStorage, appStorage, StorageHandler } from "../background/controllers/storage";
import { Settings, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";

Toaster.registerSelf()

const App: React.FC<{}> = () => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewJourneyForm, setShowNewJourneyForm] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const toasterRef = React.useRef<InstanceType<typeof Toaster>>(null);
  const [showSettings, setShowSettings] = useState(false);

  const [newJourney, setNewJourney] = useState({
    name: "",
    initialHours: 0,
    targetHours: 10000,
  });

  useEffect(() => {
    loadJourneys();
  }, []);

  const loadJourneys = async () => {
    try {
      const loadedJourneys = await StorageHandler.getJournies();
      console.log(loadedJourneys);
      setJourneys(loadedJourneys);
    } catch (error) {
      toasterRef.current?.danger("Failed to load journeys");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJourney = async () => {
    try {
      if (!newJourney.name) {
        toasterRef.current?.toast("Please enter a journey name");
        return;
      }
      if (newJourney.initialHours > newJourney.targetHours) {
        toasterRef.current?.warning("Initial hours cannot exceed target hours");
        return;
      }

      await StorageHandler.saveJourney({
        ...newJourney,
        id: crypto.randomUUID(),
        createdAt: new Date().toDateString(),
        logs: [],
        totalHoursLogged: newJourney.initialHours,
      });
      await loadJourneys();
      setShowNewJourneyForm(false);
      setNewJourney({
        name: "",
        initialHours: 0,
        targetHours: 10000,
      });
      toasterRef.current?.toast("Journey created successfully!", "success");
    } catch (error) {
      toasterRef.current?.toast("Failed to create journey", "danger");
    }
  };

  const handleDeleteJourney = async (journeyId: string) => {
    if (!confirm("Are you sure you want to delete this journey?")) return;
    try {
      await StorageHandler.deleteJourney(journeyId);
      await loadJourneys();
      toasterRef.current?.success("Journey deleted successfully!");
    } catch (error) {
      toasterRef.current?.danger("Failed to delete journey");
    }
  };

  const handleSelectJourney = (journey: Journey) => {
    setSelectedJourney(journey);
  };

  const handleBackToJourneys = () => {
    setSelectedJourney(null);
  };

  const handleExportData = async () => {
    const dataStr = JSON.stringify(journeys, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const filename = `10000-hours-data-${new Date().toDateString().replaceAll('/', '-').replaceAll(' ', '-')}.json`
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowSettings(false);
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const shouldGoAhead = confirm('Are you sure you want to import this data? This will overwrite your current data.');
    if (!shouldGoAhead) return;

    try {
      setLoading(true)
      const text = await file.text();
      const importedData = JSON.parse(text);

      // Validate the imported data structure
      if (!Array.isArray(importedData)) {
        throw new Error('Invalid format: Data must be an array of journeys');
      }

      // Validate each journey object

      if (!importedData.every(isValidJourney)) {
        throw new Error('Invalid format: One or more journeys have invalid structure');
      }

      // Save to storage and update state
      await appStorage.set('journies', importedData);
      setJourneys(importedData);
      toasterRef.current?.toast('Journeys imported successfully');
      setShowSettings(false);
    } catch (error) {
      toasterRef.current?.toast(error instanceof Error ? error.message : 'Failed to import journeys');
    }
    finally {
      setLoading(false)
      setShowSettings(false);
    }
    
    // Reset the file input
    event.target.value = '';
  };

  if (selectedJourney) {
    return (
      <div className="p-2">
        <JourneyDetail
          journey={selectedJourney}
          onJourneyUpdate={loadJourneys}
          onBack={handleBackToJourneys}
        />
        <toaster-element
          data-position="bottom-left"
          ref={toasterRef}
        ></toaster-element>
      </div>
    );
  }

  return (
    <>
      <div className="p-2">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-bold tracking-tight">10,000 Hours</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              onClick={() => setShowNewJourneyForm(true)}>
              New Journey
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
              <DialogDescription className="text-center">
                Export or Import Journies Data
              </DialogDescription>
                <div className="space-y-4 py-4">
                  <div className="flex flex-col space-y-4">
                    <Button
                      onClick={async () => {
                        await handleExportData()
                      }}
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Journey Data
                    </Button>
                    
                    <div className="space-y-2">
                      <label 
                        htmlFor="import-file" 
                        className="block text-sm font-medium text-gray-700"
                      >
                        Import Journeys
                      </label>
                      <input
                        id="import-file"
                        type="file"
                        accept=".json"
                        onChange={handleImportData}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-gray-50 file:text-gray-700
                          hover:file:bg-gray-100
                          file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {showNewJourneyForm && (
          <Card className="p-4 mb-4 bg-gray-200">
            <h2 className="text-lg font-semibold mb-3 text-black">Create New Journey</h2>
            <div className="space-y-3">
              <div className="flex space-x-2 items-center">
                <label htmlFor="name" className="flex-1 text-sm">Journey Name</label>
                <input
                  type="text"
                  id="name"
                  required
                  className="flex-[2_1_0%] p-1 text-base border border-gray-300 rounded-md"
                  value={newJourney.name}
                  onChange={(e) => setNewJourney({ ...newJourney, name: e.target.value })}
                  placeholder="E.g., Learn Piano"
                />
              </div>
              <div className="flex space-x-2 items-center">
                <label htmlFor="initialHours" className="flex-1 text-sm">Initial Hours</label>
                <input
                  type="number"
                  id="initialHours"
                  required
                  className="flex-[2_1_0%] p-1 text-base border border-gray-300 rounded-md"
                  value={newJourney.initialHours}
                  onChange={(e) => setNewJourney({ ...newJourney, initialHours: Number(e.target.value) })}
                />
              </div>
              <div className="flex space-x-2 items-center">
                <label htmlFor="targetHours" className="flex-1 text-sm">Target Hours</label>
                <input
                  id="targetHours"
                  required
                  type="number"
                  className="flex-[2_1_0%] p-1 text-base border border-gray-300 rounded-md"
                  value={newJourney.targetHours}
                  onChange={(e) => setNewJourney({ ...newJourney, targetHours: Number(e.target.value) })}
                />
              </div>
              <div className="flex space-x-2 justify-center">
                <Button onClick={handleCreateJourney} className="bg-white text-black hover:text-white hover:bg-black rounded-md">Create Journey</Button>
                <Button variant="outline" onClick={() => setShowNewJourneyForm(false)}>Cancel</Button>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <loading-spinner data-size="2rem"></loading-spinner>
        ) : !journeys || journeys.length === 0 ? (
          <div className="text-center text-gray-400">
            No journeys yet. Create one to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {journeys.map((journey) => (
              <Card 
                key={journey.id} 
                className="p-4 bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors"
                onClick={() => handleSelectJourney(journey)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-black">{journey.name}</h3>
                    <p className="text-sm text-gray-400">
                      {journey.totalHoursLogged} / {journey.targetHours} hours
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteJourney(journey.id);
                    }}
                    className=" hover:bg-red-700 transition-colors rounded-md"
                  >
                    Delete
                  </Button>
                </div>
                <Progress
                  value={(journey.totalHoursLogged / journey.targetHours) * 100}
                  className="h-2"
                />
              </Card>
            ))}
          </div>
        )}
      </div>
      <toaster-element
            data-position="bottom-left"
            ref={toasterRef}
      ></toaster-element>
    </>
  );
};

const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container);
root.render(<App />);
document.body.classList.add("fancy-scroll")
