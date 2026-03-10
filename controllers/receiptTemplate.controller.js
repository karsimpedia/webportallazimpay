const prisma = require("../lib/prisma");
const { renderTemplate } = require("../utils/receiptRenderer");
const api = require("../lib/serverUtamaClient");
const { buildPlnPrepaidReceipt } = require("../utils/receiptBuilder");
const { cleanEscposText } = require("../utils/receiptFormatter");

// ===============================
// CREATE TEMPLATE
// ===============================
exports.createTemplate = async (req, res) => {
  try {
    const { code, title, description, template, isActive } = req.body;

    if (!code || !title || !template) {
      return res
        .status(400)
        .json({ success: false, msg: "code, title, template wajib diisi" });
    }

    const normalizedCode = String(code).trim().toUpperCase();

    const exist = await prisma.receiptTemplate.findUnique({
      where: { code: normalizedCode },
    });

    if (exist) {
      return res
        .status(400)
        .json({ success: false, msg: "code template sudah ada" });
    }

    const created = await prisma.receiptTemplate.create({
      data: {
        code: normalizedCode,
        title: String(title).trim(),
        description: description ? String(description) : null,
        template: String(template),
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
    });

    res.json({ success: true, data: created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Gagal membuat template" });
  }
};

// ===============================
// LIST TEMPLATES
// ===============================
exports.listTemplates = async (req, res) => {
  try {
    const { q, active } = req.query;
    const where = {};

    if (q) {
      where.OR = [
        { code: { contains: String(q).toUpperCase() } },
        { title: { contains: String(q), mode: "insensitive" } },
      ];
    }

    if (active === "true") where.isActive = true;
    if (active === "false") where.isActive = false;

    const templates = await prisma.receiptTemplate.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      select: {
        id: true,
        code: true,
        title: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ success: true, templates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Gagal ambil template" });
  }
};

// ===============================
// GET TEMPLATE BY ID
// ===============================
exports.getTemplateById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const tpl = await prisma.receiptTemplate.findUnique({
      where: { id },
    });

    if (!tpl) {
      return res
        .status(404)
        .json({ success: false, msg: "Template tidak ditemukan" });
    }

    res.json({ success: true, data: tpl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Error" });
  }
};

// ===============================
// UPDATE TEMPLATE
// ===============================
exports.updateTemplate = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { code, title, description, template, isActive } = req.body;

    const existing = await prisma.receiptTemplate.findUnique({ where: { id } });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, msg: "Template tidak ditemukan" });
    }

    const data = {};

    if (code != null) {
      const normalizedCode = String(code).trim().toUpperCase();

      if (normalizedCode !== existing.code) {
        const dup = await prisma.receiptTemplate.findUnique({
          where: { code: normalizedCode },
        });

        if (dup) {
          return res
            .status(400)
            .json({ success: false, msg: "code template sudah dipakai" });
        }
      }

      data.code = normalizedCode;
    }

    if (title != null) data.title = String(title).trim();
    if (description !== undefined) {
      data.description = description ? String(description) : null;
    }
    if (template != null) data.template = String(template);
    if (typeof isActive === "boolean") data.isActive = isActive;

    const updated = await prisma.receiptTemplate.update({
      where: { id },
      data,
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Update gagal" });
  }
};

// ===============================
// DELETE TEMPLATE
// ===============================
exports.deleteTemplate = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.receiptTemplate.findUnique({ where: { id } });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, msg: "Template tidak ditemukan" });
    }

    await prisma.receiptTemplate.delete({ where: { id } });
    res.json({ success: true, msg: "Template dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Delete gagal" });
  }
};

// ===============================
// PREVIEW TEMPLATE
// ===============================
exports.previewTemplate = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const width = Number(req.body.width || 32);
    const variables = req.body.variables || {};

    const tpl = await prisma.receiptTemplate.findUnique({ where: { id } });

    if (!tpl) {
      return res
        .status(404)
        .json({ success: false, msg: "Template tidak ditemukan" });
    }

    const receipt = renderTemplate(tpl.template, variables);

    res.json({
      success: true,
      receipt,
      meta: { width },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Preview gagal" });
  }
};

async function getTemplateWithFallback(productCode, categoryCode) {
  if (productCode) {
    const tplProduct = await prisma.receiptTemplate.findFirst({
      where: { code: productCode, isActive: true },
    });
    if (tplProduct) return tplProduct;
  }

  if (categoryCode) {
    const tplCategory = await prisma.receiptTemplate.findFirst({
      where: { code: categoryCode, isActive: true },
    });
    if (tplCategory) return tplCategory;
  }

  const tplDefault = await prisma.receiptTemplate.findFirst({
    where: { code: "DEFAULT", isActive: true },
  });

  if (tplDefault) return tplDefault;

  return {
    id: 0,
    code: "HARD_DEFAULT",
    template: `
LAZIMX STORE
--------------------------------
Invoice : {{invoice}}
Tanggal : {{date}}

Produk  : {{product}}
Tujuan  : {{customer}}

Total   : {{total}}
Status  : {{status}}
--------------------------------
Terima kasih
`,
  };
}

function formatRp(n) {
  const num = Number(n || 0);
  return "Rp " + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatDateSafe(date) {
  const d = new Date(date);
  return (
    d.getDate().toString().padStart(2, "0") +
    "/" +
    (d.getMonth() + 1).toString().padStart(2, "0") +
    "/" +
    d.getFullYear() +
    " " +
    d.getHours().toString().padStart(2, "0") +
    ":" +
    d.getMinutes().toString().padStart(2, "0")
  );
}

// ===============================
// RECEIPT BY TRANSACTION
// ===============================
exports.getReceiptByTransaction = async (req, res) => {
  try {
    const app = "app:" + req.user.uuid;

   
    const { idtrx, jasaloket = 3000 } = req.body;

    if (!idtrx) {
      return res.status(400).json({ success: false, msg: "idtrx wajib diisi" });
    }

    const response = await api.get(`/api/transactions/${idtrx}`, {
      params: { sender: app },
    });

    if (!response?.data?.success) {
      return res
        .status(404)
        .json({ success: false, msg: "Transaksi tidak ditemukan" });
    }

    const trx = response.data.data;

    if (!trx) {
      return res
        .status(404)
        .json({ success: false, msg: "Data transaksi kosong" });
    }

    const productCode = trx.product?.code?.toUpperCase();
    const categoryCode = trx.product?.category?.code?.toUpperCase();
    const tpl = await getTemplateWithFallback(productCode, categoryCode);

    let jl = Number(jasaloket || 3000);
    if (Number.isNaN(jl)) jl = 3000;

    const amountDueNum = Number(trx.amountDue || 0);
    const adminFeeNum = Number(trx.adminFee || 0);
    const openAmount = Number(trx.openAmount || 0);
    const jasaLoketNum = Number(jl || 0);

    let totalFinal = 0;

    if (trx.type === "TAGIHAN_PAY") {
      totalFinal = amountDueNum + adminFeeNum + jasaLoketNum;
    } else if (trx.type === "EWALLET_PAY" || trx.type === "TRANSFER_BANK_PAY") {
      totalFinal = openAmount + jasaLoketNum;
    } else {
      totalFinal = amountDueNum + jasaLoketNum;
    }

    const supplier = trx.supplierResult || {};

    let token = "";
    let customerName = "";
    let tarifDaya = "";
    let kwh = "";
    let periode = "";
    let tagihan = "";

    if (trx.serial) {
      const parts = String(trx.serial).split("/");

      token = parts[0] || "";
      customerName = parts[1] || "";

      const tarif = parts[2] || "";
      const daya = parts[3] || "";
      tarifDaya = [tarif, daya].filter(Boolean).join(" / ");

      kwh = parts[4] || "";
    }

    customerName = supplier.customerName || customerName;
    periode = supplier.period || supplier.periode || "";
    tagihan = supplier.tagihan ? formatRp(supplier.tagihan) : "";

    const isPPOB = trx.type === "TAGIHAN_PAY";
    const isTopup = trx.type === "TOPUP";
    const isEwallet =
      trx.type === "EWALLET_PAY" || trx.type === "TRANSFER_BANK_PAY";

    const vars = {
      invoice: trx.invoiceId || "",
      date: formatDateSafe(trx.createdAt),

      product: trx.product?.name || trx.productId || "",
      productCode: trx.product?.code || "",
      categoryCode: trx.product?.category?.code || "",
      customer: trx.msisdn || "",
      sn: trx.serial || "",

      price: formatRp(trx.sellPrice),
      amountDue: formatRp(amountDueNum),
      adminFee: formatRp(adminFeeNum),
      jasaLoket: formatRp(jasaLoketNum),
      total: formatRp(totalFinal),

      status: trx.status || "",
      note: trx.note || "",

      token,
      customerName,
      tarifDaya,
      kwh,

      periode,
      tagihan,

      type: trx.type || "",
      isPPOB,
      isTopup,
      isEwallet,
    };

    let receiptText = "";
    let previewText = "";
    let rawBase64 = null;
    let printMode = "TEXT_ONLY";

    const productNameUpper = String(trx.product?.name || "").toUpperCase();
    const categoryCodeUpper = String(
      trx.product?.category?.code || "",
    ).toUpperCase();

    const isPlnPrepaid =
      categoryCodeUpper === "PLNPREPAID" && productNameUpper.includes("TOKEN");

    if (isPlnPrepaid) {
      const built = buildPlnPrepaidReceipt(vars);
      receiptText = built.plainText;
      previewText = built.previewText;
      rawBase64 = built.rawBase64;
      printMode = built.mode;
    } else {
      receiptText = cleanEscposText(renderTemplate(tpl.template, vars));
      previewText = receiptText;
    }

   

    res.json({
      success: true,
      code: tpl.code,
      templateId: tpl.id,
      receipt: receiptText,
      preview: previewText,
      rawBase64,
      printMode,
      variablesUsed: vars,
      msg: receiptText,
    });
  } catch (err) {
    console.error("Receipt Error:", err);
    res.status(500).json({
      success: false,
      msg: "Gagal generate receipt",
    });
  }
};
