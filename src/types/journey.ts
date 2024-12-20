export interface Log {
    id: string;
    title: string;
    description: string;
    date: string;
    hoursWorked: number;
}

export interface Journey {
    id: string;
    name: string;
    initialHours: number;
    targetHours: number;
    totalHoursLogged: number;
    createdAt: string;
    logs: Log[];
}

export interface JourneyFormData {
    name: string;
    initialHours: number;
    targetHours: number;
}

export interface LogFormData {
    title: string;
    description: string;
    hoursWorked: number;
}
