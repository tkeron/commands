import { stringWidth } from "./stringWidth.js";

export const wrapText = (
  text: string,
  width: number,
  hangingIndent: number = 0,
): string[] => {
  if (text.length === 0) return [];
  if (width <= 0) return [text];

  const words = text.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return [];

  const indent = " ".repeat(Math.max(0, hangingIndent));
  const lines: string[] = [];
  let current = "";
  let currentIndent = "";

  const pushBrokenWord = (word: string, maxWidth: number, pad: string) => {
    let remaining = word;
    const available = Math.max(1, maxWidth - pad.length);
    while (stringWidth(remaining) > available) {
      let take = "";
      for (const ch of remaining) {
        if (stringWidth(take + ch) > available) break;
        take += ch;
      }
      if (take.length === 0) take = remaining.slice(0, 1);
      lines.push(pad + take);
      remaining = remaining.slice(take.length);
    }
    return remaining;
  };

  for (const word of words) {
    const pad = lines.length === 0 && current === "" ? "" : currentIndent;
    if (current === "") {
      let w = word;
      if (stringWidth(pad + w) > width) {
        w = pushBrokenWord(w, width, pad);
        current = pad + w;
        currentIndent = indent;
      } else {
        current = pad + w;
        currentIndent = indent;
      }
      continue;
    }
    const candidate = current + " " + word;
    if (stringWidth(candidate) <= width) {
      current = candidate;
      continue;
    }
    lines.push(current);
    let w = word;
    if (stringWidth(indent + w) > width) {
      w = pushBrokenWord(w, width, indent);
    }
    current = indent + w;
  }

  if (current !== "") lines.push(current);
  return lines;
};
