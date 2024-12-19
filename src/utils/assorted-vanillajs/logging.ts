const defaultConsoleStyles = {
  error: "color: red; font-weight: bold;",
  warn: "color: orange; font-weight: bold;",
  info: "color: blue; font-weight: bold;",
  success: "color: green; font-weight: bold;",
};

export const BasicColorLogger = createColorLogger(defaultConsoleStyles);

export function createColorLogger<T extends Record<string, string>>(
  consoleStyles: T
) {
  const temp: Partial<
    Record<keyof typeof consoleStyles, (message: any) => void>
  > = {};
  for (const [key, value] of Object.entries(consoleStyles)) {
    temp[key as keyof typeof consoleStyles] = (message: any) => {
      console.log(`%c${message}`, value);
    };
  }

  const ColorLogger = temp as Record<
    keyof typeof consoleStyles,
    (message: any) => void
  >;
  return ColorLogger;
}
