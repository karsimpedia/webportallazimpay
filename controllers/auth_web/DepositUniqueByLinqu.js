const LinqkuDepositUniq = async (req, res) => {
  try {
    const dataBank = [
      {
        id: 0,
        name: "Bank MANDIRI",
        kodebank: "MANDIRI",
        status: "OPEN",
        petunjuk: "",
      },
      {
        id: 1,
        name: "Bank BRI",
        kodebank: "BRI",
        status: "OPEN",
        petunjuk: "",
      },      
      {
        id: 7,
        name: "Bank Permata",
        kodebank: "PERMATA",
        status: "OPEN",
        petunjuk: "",
      },
      {
        id: 8,
        name: "BANK DANAMON",
        kodebank: "DANAMON",
        status: "OPEN",
        petunjuk: "",
      },

      {
        id: 10,
        name: "Bank CIMB",
        kodebank: "CIMB",
        status: "OPEN",
        petunjuk: "",
      },
      {
        id: 11,
        name: "Bank BSI",
        kodebank: "BSI",
        status: "OPEN",
        petunjuk: "",
      },
      {
        id: 12,
        name: "BANK BCA",
        kodebank: "TIKETBCA",
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
module.exports = LinqkuDepositUniq;
