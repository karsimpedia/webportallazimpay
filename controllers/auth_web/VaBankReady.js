const VaBankReady = async (req, res) => {
  try {
    const dataBank = [
      {
        id: 0,
        name: "Bank MANDIRI",
        kodebank: "VAMANDIRI",
        status: "OPEN",
        petunjuk: "",
      },

      {
        id: 1,
        name: "Bank BRI",
        kodebank: "VABRI",
        status: "OPEN",
        petunjuk: "Bayar Melalui BriVA BRI",
      },
      // {
      //   id: 2,
      //   name: "Bank CIMB",
      //   kodebank: "022",
      //   status: "OPEN",
      //   petunjuk: "",
      // },
      {
        id: 3,
        name: "Bank BNI",
        kodebank: "VABNI",
        status: "OPEN",
        petunjuk: "",
      },
      // {
      //   id: 7,
      //   name: "Bank Permata",
      //   kodebank: "013",
      //   status: "OPEN",
      //   petunjuk: "",
      // },
      // {
      //   id: 8,
      //   name: "BANK DANAMON",
      //   kodebank: "011",
      //   status: "OPEN",
      //   petunjuk: "",
      // },
      
      // {
      //   id: 10,
      //   name: "Bank SAHABAT SAMPOERNA",
      //   kodebank: "523",
      //   status: "OPEN",
      //   petunjuk: "",
      // },
      // {
      //   id: 11,
      //   name: "Bank Maybank",
      //   kodebank: "016",
      //   status: "OPEN",
      //   petunjuk: "",
      // },
      {
        id: 12,
        name: "Bank BCA",
        kodebank: "VABCA",
        status: "OPEN",
        petunjuk: "",
      },
    ];

    res.json(dataBank);
  } catch (error) {
    res.json(error);
    console.log(error);
  }
};
module.exports = VaBankReady;
