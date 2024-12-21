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

export       const isValidJourney = (journey: any): journey is Journey => {
    return (
      typeof journey.id === 'string' &&
      typeof journey.name === 'string' &&
      typeof journey.initialHours === 'number' &&
      typeof journey.targetHours === 'number' &&
      typeof journey.totalHoursLogged === 'number' &&
      typeof journey.createdAt === 'string' &&
      Array.isArray(journey.logs) &&
      journey.logs.every((log: any) =>
        typeof log.id === 'string' &&
        typeof log.title === 'string' &&
        typeof log.description === 'string' &&
        typeof log.date === 'string' &&
        typeof log.hoursWorked === 'number' &&
        log.hoursWorked >= 0 &&
        log.initialHours >= 0 &&
        log.initialHours <= log.hoursWorked
      )
    );
  };
