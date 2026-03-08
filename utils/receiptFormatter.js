const WIDTH = 32;

function safe(val) {
  return String(val ?? "").trim();
}

function repeat(char, len) {
  return char.repeat(Math.max(0, len));
}

function divider(char = "-", width = WIDTH) {
  return repeat(char, width);
}

function center(text, width = WIDTH) {
  const t = safe(text);
  if (!t) return "";
  if (t.length >= width) return t.slice(0, width);

  const left = Math.floor((width - t.length) / 2);
  const right = width - t.length - left;
  return repeat(" ", left) + t + repeat(" ", right);
}

function wrapText(text, width = WIDTH) {
  const raw = String(text ?? "")
    .replace(/\r/g, "")
    .replace(/\t/g, "    ");

  const paragraphs = raw.split("\n");
  const lines = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }

    const words = paragraph.split(" ");
    let line = "";

    for (const word of words) {
      if (!line) {
        if (word.length <= width) {
          line = word;
        } else {
          for (let i = 0; i < word.length; i += width) {
            lines.push(word.slice(i, i + width));
          }
          line = "";
        }
        continue;
      }

      if ((line + " " + word).length <= width) {
        line += " " + word;
      } else {
        lines.push(line);

        if (word.length <= width) {
          line = word;
        } else {
          for (let i = 0; i < word.length; i += width) {
            const chunk = word.slice(i, i + width);
            if (chunk.length === width) {
              lines.push(chunk);
              line = "";
            } else {
              line = chunk;
            }
          }
        }
      }
    }

    if (line) lines.push(line);
  }

  return lines;
}

function keyValue(label, value, width = WIDTH, labelWidth = 8) {
  const key = safe(label).padEnd(labelWidth, " ");
  const val = safe(value);
  const prefix = `${key} : `;

  if (!val) return [prefix.trimEnd()];

  if ((prefix + val).length <= width) {
    return [prefix + val];
  }

  const lines = [];
  const firstWidth = Math.max(1, width - prefix.length);

  lines.push(prefix + val.slice(0, firstWidth));

  let rest = val.slice(firstWidth);
  while (rest.length > 0) {
    lines.push(repeat(" ", prefix.length) + rest.slice(0, width - prefix.length));
    rest = rest.slice(width - prefix.length);
  }

  return lines;
}

function leftRight(left, right, width = WIDTH) {
  const l = safe(left);
  const r = safe(right);

  if (l.length + r.length + 1 <= width) {
    return l + repeat(" ", width - l.length - r.length) + r;
  }

  const maxLeft = Math.max(1, width - r.length - 1);
  const cutLeft = l.slice(0, maxLeft);
  return cutLeft + repeat(" ", width - cutLeft.length - r.length) + r;
}

function moneyLine(label, value, width = WIDTH) {
  return leftRight(label, value, width);
}

function splitToken(token) {
  const t = safe(token);
  if (!t) return [];

  if (t.includes("-")) {
    const parts = t.split("-");
    if (parts.length >= 5) {
      return [
        parts.slice(0, 3).join("-"),
        parts.slice(3).join("-"),
      ];
    }
  }

  if (/^\d{20}$/.test(t)) {
    return [t.slice(0, 12), t.slice(12)];
  }

  return wrapText(t, WIDTH);
}

function cleanText(text, maxLength = 2000) {
  let cleaned = String(text ?? "")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .replace(/\r/g, "")
    .replace(/\t/g, "    ")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();

  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength);
  }

  return cleaned;
}

function cleanEscposText(text, maxLength = 2000) {
  return cleanText(text, maxLength) + "\n";
}

module.exports = {
  WIDTH,
  divider,
  center,
  wrapText,
  keyValue,
  leftRight,
  moneyLine,
  splitToken,
  cleanText,
  cleanEscposText,
};