import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogFormData } from "../types/journey";
import Action from "../chrome-api/action";
import { uploadToGist } from "../utils/gistSync";
import { StorageHandler } from "../background/controllers/storage";

const Loader = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-gray-200/50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-8 border-red-500"></div>
    </div>
  );
};

interface LogFormProps {
  onSubmit: (data: LogFormData) => Promise<void>;
  onCancel: () => void;
  maxHoursPerDay?: number;
}

export const LogForm: React.FC<LogFormProps> = ({
  onSubmit,
  onCancel,
  maxHoursPerDay,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    hoursWorked: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert("Please enter a title");
      return;
    }
    if (formData.hoursWorked <= 0) {
      alert("Please enter valid hours worked");
      return;
    }
    if (maxHoursPerDay && formData.hoursWorked > maxHoursPerDay) {
      alert(
        `Hours worked cannot exceed the daily limit of ${maxHoursPerDay} hours`
      );
      return;
    }
    setLoading(true);
    try {
      await Action.resetActionBadge();
      await onSubmit(formData);
      // sync to gist
      const [gistId, gistToken, journies] = await Promise.all([
        StorageHandler.getGistId(),
        StorageHandler.getGistPersonalAccessToken(),
        StorageHandler.getJournies(),
      ]);
      if (gistId && gistToken && journies) {
        await uploadToGist({
          gistId: gistId,
          filename: "10000-hours-data.json",
          content: JSON.stringify(journies),
          token: gistToken,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 bg-gray-200 relative">
      {loading && <Loader />}
      <h2 className="text-lg font-semibold mb-3 text-black">Add New Log</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex space-x-2 items-center">
          <label htmlFor="title" className="flex-1 text-sm">
            Title
          </label>
          <input
            id="title"
            type="text"
            required
            className="flex-[2_1_0%] p-1 text-base border border-gray-300 rounded-md"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="What did you work on?"
            maxLength={70}
          />
        </div>
        <div className="flex space-x-2 items-start">
          <label htmlFor="description" className="flex-1 text-sm">
            Description (Optional)
          </label>
          <textarea
            id="description"
            className="flex-[2_1_0%] p-1 text-base border border-gray-300 rounded-md min-h-[80px]"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Add any notes or reflections..."
            maxLength={500}
            rows={10}
          />
        </div>
        <div className="flex space-x-2 items-start">
          <label htmlFor="hoursWorked" className="flex-1 text-sm">
            Hours Worked
          </label>
          <div className="flex-[2_1_0%]">
            <input
              id="hoursWorked"
              min="0"
              max={maxHoursPerDay}
              type="number"
              step="0.5"
              required
              className="w-full p-1 text-base border border-gray-300 rounded-md"
              value={formData.hoursWorked}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hoursWorked: Number(e.target.value),
                })
              }
            />
            {maxHoursPerDay && (
              <p className="text-sm text-gray-500 mt-1">
                Max hours per day: {maxHoursPerDay}
              </p>
            )}
          </div>
        </div>
        <div className="flex space-x-2 justify-center">
          <Button type="submit" className="rounded-md" disabled={loading}>
            Add Log
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};
