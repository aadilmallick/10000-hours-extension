import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogFormData } from "../types/journey";

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
      alert(`Hours worked cannot exceed the daily limit of ${maxHoursPerDay} hours`);
      return;
    }
    await onSubmit(formData);
  };

  return (
    <Card className="p-4 bg-gray-200">
      <h2 className="text-lg font-semibold mb-3 text-black">Add New Log</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex space-x-2 items-center">
          <label htmlFor="title" className="flex-1 text-sm">Title</label>
          <input
            id="title"
            type="text"
            required
            className="flex-[2_1_0%] p-1 text-base border border-gray-300 rounded-md"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="What did you work on?"
          />
        </div>
        <div className="flex space-x-2 items-start">
          <label htmlFor="description" className="flex-1 text-sm">Description (Optional)</label>
          <textarea
            id="description"
            className="flex-[2_1_0%] p-1 text-base border border-gray-300 rounded-md min-h-[80px]"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add any notes or reflections..."
            maxLength={500}
            rows={10}
          />
        </div>
        <div className="flex space-x-2 items-start">
          <label htmlFor="hoursWorked" className="flex-1 text-sm">Hours Worked</label>
          <div className="flex-[2_1_0%]">
            <input
              id="hoursWorked"
              type="number"
              step="0.5"
              required
              className="w-full p-1 text-base border border-gray-300 rounded-md"
              value={formData.hoursWorked}
              onChange={(e) =>
                setFormData({ ...formData, hoursWorked: Number(e.target.value) })
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
          <Button type="submit" className="rounded-md">Add Log</Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};
