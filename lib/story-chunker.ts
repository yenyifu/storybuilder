export function chunkStory(text: string, maxCharsPerPage = 500): string[] {
  const clean = text.replace(/\r/g, "").trim();
  if (!clean) return [""];
  const sentences = clean.split(/(?<=[\.\!\?])\s+/);

  const pages: string[] = [];
  let current = "";

  for (const s of sentences) {
    if ((current + " " + s).trim().length > maxCharsPerPage) {
      if (current) pages.push(current.trim());
      current = s;
    } else {
      current = (current ? current + " " : "") + s;
    }
  }
  if (current.trim().length) pages.push(current.trim());

  return pages.length ? pages : [clean];
}

export function deriveTitleFromText(text: string): string | null {
  const m = /title\s*:\s*(.+)$/im.exec(text);
  if (m?.[1]) return m[1].trim().replace(/\.$/, "");
  const firstLine = (text || "").split("\n").map((l) => l.trim()).find(Boolean);
  if (!firstLine) return null;
  const candidate = firstLine.slice(0, 40);
  return candidate.length > 6 ? candidate : null;
}
