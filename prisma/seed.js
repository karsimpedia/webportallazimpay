const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 START SEEDING...");

  // ==============================
  // 1. OPERATOR
  // ==============================
  const operators = [
    "INDREG","XLAXIS","TRIREG","SMREG","BYU","TSELREG",
    "PDBYU","XBP3K","XBP5K","XBP2K","SMARTUN","XCFLX","AONTRI",
    "PLN","FFDM","MLDM","VGPL","PTDST",
    "DANA","OVO","MAXD","LINKAJA","SGC","SDG","SHOPEE",
    "EMONEYBE","MULFIN","PDAM","BPJSKS","HPPASCA","TFB",
    "AVA","ACTTRI"
  ];

  for (const code of operators) {
    await prisma.operator.upsert({
      where: { code },
      update: {},
      create: { code },
    });
  }

  // ==============================
  // 2. MENU APK
  // ==============================
  const pulsaMenu = await prisma.menu.create({
    data: {
      name: "Pulsa",
      jenis: "ELEKTRIK",
      icon: "https://api.lazimpay.com:7000/assetsapk/icon/pulsa.png",
      filter: true,
      sortOrder: 1,
      operators: {
        create: operators
          .filter(o => ["INDREG","XLAXIS","TRIREG","SMREG","BYU","TSELREG"].includes(o))
          .map(code => ({ operator: { connect: { code } } }))
      }
    }
  });

  await prisma.menu.create({
    data: {
      name: "PLN",
      jenis: "SPESIAL_PLN",
      icon: "https://api.lazimpay.com:7000/assetsapk/icon/token-pln.png",
      kodeProduk: "PLN",
      openDenom: true,
      sortOrder: 3,
      operators: {
        create: [{ operator: { connect: { code: "PLN" } } }]
      }
    }
  });

  // ==============================
  // 3. BANNER
  // ==============================
  await prisma.banner.createMany({
    data: [
      {
        title: "XL Data Murah",
        imgUrl: "https://fazz.com/id/wp-content/uploads/sites/3/2022/10/BLOG-FazzAgen_XLDANAXIS.jpg",
        sortOrder: 1,
      },
      {
        title: "Promo Paket Data Indosat",
        imgUrl: "https://blog.unitedtronik.co.id/wp-content/uploads/2019/08/050819_V_FISIK_ISAT.jpg",
        sortOrder: 2,
      },
    ],
  });

  // ==============================
  // 4. RUNNING TEXT
  // ==============================
  await prisma.runningText.create({
    data: {
      text: "Selamat datang, customer service hanya di 085695662466",
    },
  });

  // ==============================
  // 5. CONTACT APK
  // ==============================
  await prisma.contactApk.create({
    data: {
      whatsapp: "6285695662466",
      telegram: "lazimpay",
    },
  });

  // ==============================
  // 6. DEPOSIT METHOD
  // ==============================
  const vaMethod = await prisma.depositMethod.create({
    data: {
      name: "Virtual Account",
      code: "deposit-via-virtual-account",
      category: "VIRTUAL_ACCOUNT",
      gateway: "NICEPAY",
      icon: "https://blog.nicepay.co.id/wp-content/uploads/2021/05/Mengenal-Virtual-Account-Lebih-Jauh.png",
      sortOrder: 1,
    },
  });

  const linkquMethod = await prisma.depositMethod.create({
    data: {
      name: "Transfer Bank By LinkQu",
      code: "deposit-via-bank-linkqu",
      category: "UNIQUE_TRANSFER",
      gateway: "LINKQU",
      icon: "https://www.linkqu.id/wp-content/uploads/2021/07/Logo-linkQu.jpg",
      sortOrder: 2,
    },
  });

  // ==============================
  // 7. BANK VA
  // ==============================
  await prisma.depositBank.createMany({
    data: [
      {
        methodId: vaMethod.id,
        name: "Bank BRI",
        bankCode: "VABRI",
        instruction: "Bayar Melalui BriVA BRI",
        sortOrder: 1,
      },
      {
        methodId: vaMethod.id,
        name: "Bank BCA",
        bankCode: "VABCA",
        sortOrder: 2,
      },
      {
        methodId: vaMethod.id,
        name: "Bank BNI",
        bankCode: "VABNI",
        sortOrder: 3,
      },
      {
        methodId: vaMethod.id,
        name: "Bank Mandiri",
        bankCode: "VAMANDIRI",
        sortOrder: 4,
      },
    ],
  });

  // ==============================
  // 8. BANK LINKQU
  // ==============================
  await prisma.depositBank.createMany({
    data: [
      { methodId: linkquMethod.id, name: "Bank BRI", bankCode: "BRI", sortOrder: 1 },
      { methodId: linkquMethod.id, name: "Bank Mandiri", bankCode: "MANDIRI", sortOrder: 2 },
      { methodId: linkquMethod.id, name: "Bank BCA", bankCode: "TIKETBCA", sortOrder: 3 },
      { methodId: linkquMethod.id, name: "Bank BSI", bankCode: "BSI", sortOrder: 4 },
      { methodId: linkquMethod.id, name: "Bank Permata", bankCode: "PERMATA", sortOrder: 5 },
      { methodId: linkquMethod.id, name: "Bank Danamon", bankCode: "DANAMON", sortOrder: 6 },
      { methodId: linkquMethod.id, name: "Bank CIMB", bankCode: "CIMB", sortOrder: 7 },
    ],
  });

  console.log("✅ SEEDING SELESAI");
}

main()
  .catch((e) => {
    console.error("❌ SEED ERROR", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
