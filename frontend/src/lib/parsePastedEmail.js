/**
 * If clipboard text looks like a raw email, split Subject from body.
 * Otherwise treat the whole paste as body.
 *
 * @param {string} text
 * @returns {{ subject: string, body: string }}
 */
export function parsePastedEmail(text) {
  const raw = (text || "").replace(/^\uFEFF/, "");
  if (!raw.trim()) {
    return { subject: "", body: "" };
  }

  const lines = raw.split(/\r?\n/);
  let subject = "";
  let bodyStart = 0;

  // Common header block: Subject: ... then blank line then body
  for (let i = 0; i < Math.min(lines.length, 40); i += 1) {
    const line = lines[i];
    const subjectMatch = line.match(/^Subject:\s*(.*)$/i);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
      // Find blank line after headers, else start after this line
      let j = i + 1;
      while (j < lines.length && lines[j].trim() !== "") {
        // Unfold continued subject lines starting with whitespace
        if (/^\s+\S/.test(lines[j]) && subjectMatch) {
          subject = `${subject} ${lines[j].trim()}`.trim();
          j += 1;
          continue;
        }
        j += 1;
      }
      bodyStart = j < lines.length && lines[j].trim() === "" ? j + 1 : i + 1;
      break;
    }
  }

  if (subject) {
    return {
      subject: subject.slice(0, 300),
      body: lines.slice(bodyStart).join("\n").trim(),
    };
  }

  return { subject: "", body: raw.trim() };
}
