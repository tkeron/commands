export const stringWidth = (input: string): number => {
  if (!input) return 0;
  return Bun.stringWidth(input, { countAnsiEscapeCodes: false });
};
