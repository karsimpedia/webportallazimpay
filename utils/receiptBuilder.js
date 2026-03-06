const {
  divider,
  center,
  keyValue,
  moneyLine,
  splitToken,
  cleanEscposText,
  cleanText,
} = require("./receiptFormatter");

const {
  textBytes,
  lf,
  initialize,
  alignLeft,
  alignCenter,
  boldOn,
  boldOff,
  normalSize,
  doubleSize,
  cutPartial,
  joinBuffers,
} = require("./escpos");

function buildPlnPrepaidText(vars, options = {}) {
  const preview = !!options.preview;
  const lines = [];

  lines.push(center("STRUK TOKEN PLN"));
  lines.push(center("PRABAYAR"));
  lines.push(divider());

  lines.push(...keyValue("Invoice", vars.invoice));
  lines.push(...keyValue("Tanggal", vars.date));
  lines.push(...keyValue("Status", vars.status));
  lines.push(divider());

  lines.push(...keyValue("Produk", vars.product));
  lines.push(...keyValue("Tujuan", vars.customer));
  lines.push(...keyValue("Nama", vars.customerName));
  lines.push(...keyValue("Tarif", vars.tarifDaya));
  lines.push(...keyValue("KWH", vars.kwh));
  lines.push(divider());

  lines.push(moneyLine("Nominal", vars.amountDue));
  lines.push(moneyLine("Admin", vars.jasaLoket || "Rp 0"));
  lines.push(moneyLine("Total", vars.total));
  lines.push(divider());

  if (vars.token) {
    lines.push("Token PLN:");
    const tokenLines = splitToken(vars.token);

    for (const t of tokenLines) {
      lines.push(preview ? `**${t}**` : t);
    }

    lines.push(divider());
  }

  lines.push(center("Terima kasih"));

  return preview
    ? cleanText(lines.join("\n")) + "\n\n\n"
    : cleanEscposText(lines.join("\n"));
}

function buildPlnPrepaidRawBase64(vars) {
  const tokenLines = splitToken(vars.token);
  const parts = [];

  parts.push(initialize());
  parts.push(alignCenter());
  parts.push(normalSize());
  parts.push(textBytes("STRUK TOKEN PLN"));
  parts.push(lf());
  parts.push(textBytes("PRABAYAR"));
  parts.push(lf());

  parts.push(alignLeft());
  parts.push(textBytes(divider()));
  parts.push(lf());

  const headerLines = [
    ...keyValue("Invoice", vars.invoice),
    ...keyValue("Tanggal", vars.date),
    ...keyValue("Status", vars.status),
    divider(),
    ...keyValue("Produk", vars.product),
    ...keyValue("Tujuan", vars.customer),
    ...keyValue("Nama", vars.customerName),
    ...keyValue("Tarif", vars.tarifDaya),
    ...keyValue("KWH", vars.kwh),
    divider(),
    moneyLine("Nominal", vars.amountDue),
    moneyLine("Admin", vars.jasaLoket || "Rp 0"),
    moneyLine("Total", vars.total),
    divider(),
    "Token PLN:",
  ];

  for (const line of headerLines) {
    parts.push(textBytes(line));
    parts.push(lf());
  }

  if (tokenLines.length) {
    parts.push(alignCenter());
    parts.push(boldOn());
    parts.push(doubleSize());

    for (const line of tokenLines) {
      parts.push(textBytes(line));
      parts.push(lf());
    }

    parts.push(normalSize());
    parts.push(boldOff());
    parts.push(alignLeft());
    parts.push(textBytes(divider()));
    parts.push(lf());
  }

  parts.push(alignCenter());
  parts.push(textBytes("Terima kasih"));
  parts.push(lf(3));
  parts.push(cutPartial());

  return joinBuffers(parts).toString("base64");
}

function buildPlnPrepaidReceipt(vars) {
  return {
    previewText: buildPlnPrepaidText(vars, { preview: true }),
    plainText: buildPlnPrepaidText(vars, { preview: false }),
    rawBase64: buildPlnPrepaidRawBase64(vars),
    mode: "RAW_ESC_POS",
  };
}

module.exports = {
  buildPlnPrepaidReceipt,
};