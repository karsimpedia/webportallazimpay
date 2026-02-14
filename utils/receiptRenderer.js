function renderTemplate(template = "", variables = {}) {
  return String(template).replace(/{{\s*([^}]+)\s*}}/g, (_, rawKey) => {
    const key = String(rawKey || "").trim();
    const val = variables[key];
    return val == null ? "" : String(val);
  });
}

// wrap text panjang agar rapi di struk (opsional)
function wrapText(text, width = 32) {
  const lines = [];
  const words = String(text || "").split(/\s+/);
  let line = "";
  for (const w of words) {
    if ((line + (line ? " " : "") + w).length <= width) {
      line = line ? line + " " + w : w;
    } else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines.join("\n");
}

function formatRp(n) {
  const num = Number(n || 0);
  return "Rp " + num.toLocaleString("id-ID");
}

module.exports = { renderTemplate, wrapText, formatRp };
