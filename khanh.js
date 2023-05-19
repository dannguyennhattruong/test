const axios = require("axios");
const FormData = require("form-data");
let heso = 3;
let currentBalance = 0;


function generateOTP() {
  // Declare a digits variable
  // which stores all digits
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 5; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  console.log(`OTP : ${OTP}`);
  return OTP.at(-1);
}

const predict = () => {
  const random = Number(generateOTP());
  // // console.log(random);
  if (random > 4) {
    return "big";
  }
  return "small";
};

const getBalance = async () => {
  var formData = new FormData();
  formData.append("uid", 1005280);
  formData.append(
    "sign",
    "42BBBB760E868AFACF71C158B55438B8529C196E23BAA768CF0A4AB5A16BB812"
  );
  formData.append("language", "vi");
  const result = await axios.post(
    `https://92lotteryapi.com/api/webapi/GetWinsUserAmount`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  console.log("Số tiền hiện tại : " + result.data?.data?.Amount);
  return result.data?.data?.Amount;
};

let issuenumberEntry = 2023050510030;
const main = async (issueNum, num) => {
  console.log(` Phiên ${issuenumberEntry} ===========X============`);
  try {
    var formData = new FormData();
    formData.append("uid", 1005280);
    formData.append(
      "sign",
      "42BBBB760E868AFACF71C158B55438B8529C196E23BAA768CF0A4AB5A16BB812"
    );
    formData.append("amount", `1000`);
    formData.append("betcount", `${heso}`);
    formData.append("gametype", "2");
    formData.append("selecttype", num || "small");
    formData.append("issuenumber", issueNum);
    formData.append("language", "vi");
    formData.append("typeid", 1);
    console.log(` Số tiền đặt cược là ${1000 * heso} `);

    const result = await axios.post(
      "https://92lotteryapi.com/api/webapi/GameBetting",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log(result.data?.msg);

    console.log(
      `${Date.now()} - Typeid ${1} - ${issueNum} - Đăt số ${num || "small"}`
    );
    console.log(
      `=====================================================================`
    );
  } catch (error) {
    console.log(error);
  }
};
main(issuenumberEntry, predict());

getBalance().then((r) => {
  currentBalance = r;
  setInterval(() => {
    issuenumberEntry = issuenumberEntry + 1;
    console.log(issuenumberEntry.toString().slice());
    console.log("go - " + issuenumberEntry);
    getBalance().then((b) => {
      console.log(`CurrentBalance : ${currentBalance}`);
      console.log(`BalanceAfter : ${b}`);
      if (b < currentBalance) {
        heso *= 2;
      } else {
        heso = 3;
      }
      currentBalance = b;

      main(issuenumberEntry, predict());
    });
  }, 1000 * 60);
});
