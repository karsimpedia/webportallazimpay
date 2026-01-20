const ContackApk = async (req, res) => {
  try {
    const data = {
      wa: "6285695662466",
      telegram: "lazimpay",
    };

    res.json(data);
  } catch (error) {
    res.json(error);
    console.log(error);
  }
};
module.exports = ContackApk;
