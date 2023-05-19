const axios = require("axios");
const FormData = require("form-data");
let heso = 3;
let currentBalance = 0;
let currentOTP = 0;
let betAmount = 0;
let interval = 0;
let flag = true;
let match_count = 1;
function generateOTP() {
  // Declare a digits variable
  // which stores all digits
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 5; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  console.log(`OTP : ${OTP}`);
  currentOTP = OTP;
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
  formData.append("uid", 638248);
  formData.append(
    "sign",
    "21EE754BC66501934222C68FE0105806C3E71E04403B19DAB37E015C28BC2CD9"
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
  console.log(
    "Số tiền hiện tại : " +
      result.data?.data?.Amount +
      " " +
      `~ ${Number(result.data?.data?.Amount / 23500).toFixed(2)}$`
  );
  return result.data?.data?.Amount;
};

let issuenumberEntry = 20230511130311;
const main = async (issueNum, num) => {
  console.log(` Phiên ${issuenumberEntry} ===========X============`);
  try {
    var formData = new FormData();
    formData.append("uid", 638248);
    formData.append(
      "sign",
      "21EE754BC66501934222C68FE0105806C3E71E04403B19DAB37E015C28BC2CD9"
    );
    formData.append("amount", `1000`);
    formData.append("betcount", `${heso}`);
    formData.append("gametype", "2");
    formData.append("selecttype", num || "small");
    formData.append("issuenumber", issueNum);
    formData.append("language", "vi");
    formData.append("typeid", 13);
    console.log(` Số tiền đặt cược là ${1000 * heso} `);
    betAmount = 1000 * heso;

    const result = await axios.post(
      "https://92lotteryapi.com/api/webapi/GameTRXBetting",
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
  interval = setInterval(() => {
    issuenumberEntry = issuenumberEntry + 2;
    console.log(issuenumberEntry.toString().slice());
    console.log("go - " + issuenumberEntry);
    getBalance().then((b) => {
      console.log(
        `CurrentBalance : ${currentBalance} ~ ${Number(
          currentBalance / 23500
        ).toFixed(2)}$`
      );
      console.log(`BalanceAfter : ${b} ~ ${Number(b / 23500).toFixed(2)}$`);
      let txt = "win";
      if (b < currentBalance) {
        txt = "lose";
        heso *= 2;
      } else {
        heso = 4;
      }
      currentBalance = b;
      sendToTelegram2(currentBalance, issuenumberEntry, txt);
      const OTP = predict();


      main(issuenumberEntry, OTP);
    });
  }, 1000 * 120);
});

const sendToTelegram = async (balance, phien, OTP) => {
  var message = ` <h1>Phiên : </h1>${phien} <br>
                  Số dư hiện tại ${balance} <br>
                  Chọn : ${OTP} <br>
                  Đã cược : ${betAmount} <br>
  `;

  var token = "6173439504:AAGO2UC3DI_wxvt6CGDJqV_pIEqiFLdGpOs";
  var chat_id = -1001886912905;
  var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${message}&parse_mode=html`; //&parse_mode=html

  const res = await axios.get(url);
};

const sendToTelegram2 = async (balance, phien, txt) => {
  var message = `
                  🍀 Vốn : 500.000  \n

                  🔥 Số dư hiện tại ${balance} \n

                  🚀 Biến động : ${balance > 500000 ? "+" : "-"} ${Number(
    (Math.abs(500000 - balance) / 500000) * 100
  ).toFixed(2)} %

  `;

  var token = "6173439504:AAGO2UC3DI_wxvt6CGDJqV_pIEqiFLdGpOs";
  var chat_id = -1001886912905;
  var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${message}`; //&parse_mode=html

  const res = await axios.get(url);
  // if (balance >= 500000 + 100000) {
  //   process.exit(0);
  // }

  // if (balance < 450000) {
  //   process.exit(0);
  // }
};

const setupTelebotCommand = async () => {
  const { Telegraf } = require("telegraf");
  const exec = require("child_process").exec;

  const bot = new Telegraf("6173439504:AAGO2UC3DI_wxvt6CGDJqV_pIEqiFLdGpOs");
  bot.hears("hi", (ctx) => ctx.reply("Hey there"));
  bot.command("stop", (ctx) => {
    clearInterval(interval);
    console.log("Bạn đã dừng lệnh. Số tiền hiện tại là : " + currentBalance);
    ctx.reply("Bạn đã dừng lệnh. Số tiền hiện tại là : " + currentBalance);
    const msg = "Bạn đã dừng lệnh. Số tiền hiện tại là : " + currentBalance;
    var token = "6173439504:AAGO2UC3DI_wxvt6CGDJqV_pIEqiFLdGpOs";
    var chat_id = -1001886912905;
    var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${msg}`; //&parse_mode=html

    axios.get(url).then((r) => {
      process.exit(0);
    });
  });

  // bot.command("run", (ctx) => {
  //   exec("node wingo", function (error, stdout, stderr) {
  //     console.log("stdout: " + stdout);
  //     console.log("stderr: " + stderr);
  //     if (error !== null) {
  //       console.log("exec error: " + error);
  //     }
  //   });
  // });
  bot.launch();
};

setupTelebotCommand();
