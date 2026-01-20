const DepositBank = async (req, res) => {
  try {
    const DataBank = [
      {
        id: 1,
        name: "Transfer Personal",
        ket: "Deposit Via Transfer Bank Gratis",
        jenis: "deposit-via-bank",
        img: "https://png.monster/wp-content/uploads/2022/01/png.monster-483-370x370.png",
      },
      {
        id: 2,
        name: "Transfer Bank By Linkqu",
        ket: "Tersedia BRI, BSI, MANDIRI, PERMATA GRATIS",
        jenis: "deposit-via-bank-linkqu",
        img: "https://www.linkqu.id/wp-content/uploads/2021/07/Logo-linkQu.jpg",
      },
      {
        id: 3,
        name: "OVO",
        jenis: "deposit-via-ovo",
        ket: "Deposit Via OVO",
        img: "https://toppng.com/uploads/preview/ovo-logo-ovo-indonesia-115628872397l92yfi1q4.png",
      },
      {
        id: 4,
        name: "Alfamart",
        jenis: "ALFAMART",
        ket: "Deposit Via Alfamart",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/ALFAMART_LOGO_BARU.png/1200px-ALFAMART_LOGO_BARU.png",
      },
      {
        id: 5,
        name: "Indomaret",
        jenis: "INDOMARET",
        ket: "Deposit Via Indomaret",
        img: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Logo_Indomaret.png",
      },
      {
        id: 6,
        name: "Virtual Acount",
        ket: "Deposit Via Transfer Bank",
        jenis: "deposit-via-virtual-account",
        img: "https://blog.nicepay.co.id/wp-content/uploads/2021/05/Mengenal-Virtual-Account-Lebih-Jauh.png",
      },
     // {
     //   id: 7,
     //   name: "QRIS",
     //   ket: "Deposit Via QRIS",
     //   jenis: "deposit-via-qris",
     //   img: "https://seeklogo.com/images/Q/qr-code-logo-27ADB92152-seeklogo.com.png",
     // },
    ];

    res.json(DataBank);
  } catch (error) {
    res.json(error);
    console.log(error);
  }
};
module.exports = DepositBank;
