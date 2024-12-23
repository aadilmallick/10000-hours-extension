import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"

export function SwitchDemo() {
  const [time, setTime] = useState("12:00")

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="notifications" />
        <Label htmlFor="notifications">Notifications</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-32"
        />
        <Label htmlFor="time-input">Set Time</Label>
      </div>
    </div>
  )
}

