export const getTerminalWidth = (
  fallback: number = 80,
  stdout: { columns?: number } = process.stdout,
): number => {
  const cols = stdout?.columns;
  if (typeof cols === "number" && cols > 0) return cols;
  return fallback;
};
