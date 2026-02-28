const prisma = require("../lib/prisma");
const {
  renderTemplate,
  wrapText,
  formatRp,
} = require("../utils/receiptRenderer");
const api = require("../lib/serverUtamaClient");
// ===============================
// CREATE TEMPLATE
// POST /admin/receipt-template
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
// GET /admin/receipt-template
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
    res.status(500).json({ success: false, msg: "Gagal ambil template" });
  }
};

// ===============================
// GET TEMPLATE BY ID
// GET /admin/receipt-template/:id
// ===============================
exports.getTemplateById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const tpl = await prisma.receiptTemplate.findUnique({
      where: { id },
    });

    if (!tpl)
      return res
        .status(404)
        .json({ success: false, msg: "Template tidak ditemukan" });

    res.json({ success: true, data: tpl });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Error" });
  }
};

// ===============================
// UPDATE TEMPLATE
// PUT /admin/receipt-template/:id
// ===============================
exports.updateTemplate = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { code, title, description, template, isActive } = req.body;

    const existing = await prisma.receiptTemplate.findUnique({ where: { id } });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, msg: "Template tidak ditemukan" });

    const data = {};

    // kalau code diubah, harus unik
    if (code != null) {
      const normalizedCode = String(code).trim().toUpperCase();
      if (normalizedCode !== existing.code) {
        const dup = await prisma.receiptTemplate.findUnique({
          where: { code: normalizedCode },
        });
        if (dup)
          return res
            .status(400)
            .json({ success: false, msg: "code template sudah dipakai" });
      }
      data.code = normalizedCode;
    }

    if (title != null) data.title = String(title).trim();
    if (description !== undefined)
      data.description = description ? String(description) : null;
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
// DELETE /admin/receipt-template/:id
// ===============================
exports.deleteTemplate = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.receiptTemplate.findUnique({ where: { id } });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, msg: "Template tidak ditemukan" });

    await prisma.receiptTemplate.delete({ where: { id } });
    res.json({ success: true, msg: "Template dihapus" });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Delete gagal" });
  }
};

// ===============================
// PREVIEW TEMPLATE (render text)
// POST /admin/receipt-template/:id/preview
// body: { variables: {...}, width?: 32 }
// ===============================
exports.previewTemplate = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const width = Number(req.body.width || 32);
    const variables = req.body.variables || {};

    const tpl = await prisma.receiptTemplate.findUnique({ where: { id } });
    if (!tpl)
      return res
        .status(404)
        .json({ success: false, msg: "Template tidak ditemukan" });

    const receipt = renderTemplate(tpl.template, variables);
    res.json({
      success: true,
      receipt: receipt, // text final
      meta: { width },
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Preview gagal" });
  }
};

// ===============================
// RECEIPT BY TRANSACTION (pakai template code)
// GET /admin/receipt
// (mapping template berdasarkan trx.productId / kodeproduk)
// ===============================

async function getTemplateWithFallback(productCode, categoryCode) {
  // 1️⃣ Exact Product Code (PLN50)
  if (productCode) {
    const tplProduct = await prisma.receiptTemplate.findFirst({
      where: { code: productCode, isActive: true },
    });
    if (tplProduct) return tplProduct;
  }

  // 2️⃣ Category Code (PLN)
  if (categoryCode) {
    const tplCategory = await prisma.receiptTemplate.findFirst({
      where: { code: categoryCode, isActive: true },
    });
    if (tplCategory) return tplCategory;
  }

  // 3️⃣ DEFAULT
  const tplDefault = await prisma.receiptTemplate.findFirst({
    where: { code: "DEFAULT", isActive: true },
  });

  if (tplDefault) return tplDefault;

  // 4️⃣ Hard fallback
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
Terima kasih 🙏
`,
  };
}

exports.getReceiptByTransaction = async (req, res) => {
  try {
    const app = "app:" + req.user.uuid;
    const { idtrx, jasaloket = 3000 } = req.body;
    const response = await api.get(`/api/transactions/${idtrx}`, {
      params: { sender: app },
    });

    let jl = 0;

    if (jasaloket === "2000") {
      jl = 3000;
    } else {
      jl = jasaloket;
    }

    console.log(req.body);
    console.log(response.data);
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

    // ===============================
    // Tentukan template code
    // ===============================

    const productCode = trx.product?.code?.toUpperCase();
    const categoryCode = trx.product?.category?.code?.toUpperCase();

    const tpl = await getTemplateWithFallback(productCode, categoryCode);

    // ===============================
    // Format Helper
    // ===============================
    const formatRp = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

    // ===============================
    // Hitung Total Berdasarkan Jenis
    // ===============================

    const amountDueNum = Number(trx.amountDue || 0);
    const adminFeeNum = Number(trx.adminFee || 0);
    const openAmount = Number(trx.openAmount || 0);
    const jasaLoketNum = Number(jl || 0);

    let totalFinal = 0;

    if (trx.type === "TAGIHAN_PAY") {
      // PPOB
      totalFinal = amountDueNum + adminFeeNum + jasaLoketNum;
    } else if (
      trx.type === "EWALLET_PAY" ||
      trx.type === "TRANSFER_BANK_PAY "
    ) {
      totalFinal = openAmount + jasaLoketNum;
    } else {
      // Non PPOB (TOPUP, dll)
      totalFinal = amountDueNum + jasaLoketNum;
    }

    // ===============================
    // Extract Supplier Result Safe
    // ===============================
    const supplier = trx.supplierResult || {};

    // ===============================
    // Extract PLN Info dari Serial
    // ===============================
    let token = "";
    let customerName = "";
    let tarifDaya = "";
    let kwh = "";
    let periode = "";
    let tagihan = "";

    // Parsing serial PLN: TOKEN/NAMA/TARIF/KWH
    if (trx.serial) {
      const parts = trx.serial.split("/");

      if (parts.length >= 4) {
        token = parts[0] || "";
        customerName = parts[1] || "";
        tarifDaya = parts[2] + "/" + parts[3] || "";
        kwh = parts[4] || "";
      }
    }

    // Override jika supplierResult punya data lebih valid
    customerName = supplier.customerName || customerName;
    periode = supplier.periode || "";
    tagihan = supplier.tagihan ? formatRp(supplier.tagihan) : "";

    // ===============================
    // Tambahan variable pintar
    // ===============================

    const isPPOB = trx.type === "TAGIHAN_PAY";
    const isTopup = trx.type === "TOPUP";
    const isEwallet =
      trx.type === "EWALLET_PAY" || trx.type === "TRANSFER_BANK_PAY";

    // ===============================
    // Mapping Variables FINAL
    // ===============================
    const vars = {
      // Basic
      invoice: trx.invoiceId || "",
      date: trx.createdAt
        ? new Date(trx.createdAt).toLocaleString("id-ID")
        : "",
      product: trx.product?.name || trx.productId || "",
      productCode: trx.product?.code || "",
      categoryCode: trx.product?.category?.code || "",
      customer: trx.msisdn || "",
      sn: trx.serial || "",

      // Financial
      price: formatRp(trx.sellPrice),
      amountDue: formatRp(amountDueNum),
      adminFee: formatRp(adminFeeNum),
      jasaLoket: formatRp(jasaLoketNum),
      total: formatRp(totalFinal),

      // Status
      status: trx.status || "",
      note: trx.note || "",

      // PLN Specific
      token,
      customerName,
      tarifDaya,
      kwh,

      // PDAM Specific
      periode,
      tagihan,

      // Extra Smart Flags
      type: trx.type || "",
      isPPOB,
      isTopup,
      isEwallet,
    };

    // ===============================
    // Render Template
    // ===============================
    const receiptText = renderTemplate(tpl.template, vars);

    res.json({
      success: true,
      code: tpl.code,
      templateId: tpl.id,
      receipt: receiptText,
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
